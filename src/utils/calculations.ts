/**
 * ============================================================================
 * SPATIAL & COST ESTIMATION CALCULATION UTILITIES
 * ============================================================================
 * This module provides mathematical conversion constants and pure helper
 * functions for formatting currencies, converting dimension units, and
 * computing complete financial and room spatial coverage breakdowns.
 */

import {
  CostBreakdown,
  EstimateSettings,
  RoomDimensions,
  SelectedFurnitureItem,
} from '../types';

/** Multiplier conversion constant: 1 meter = 3.28084 feet */
export const METERS_TO_FT = 3.28084;

/** Multiplier conversion constant: 1 foot = 0.3048 meters */
export const FT_TO_METERS = 0.3048;

/** Multiplier conversion constant: 1 square meter = 10.7639 square feet */
export const M2_TO_SQFT = 10.7639;

/**
 * Formats a monetary number into a localized string prefixed with the currency symbol.
 *
 * @param amount - The numeric monetary value to format (e.g., 1450.5)
 * @param settings - The active EstimateSettings object containing currencySymbol
 * @returns Formatted currency string with thousands separators (e.g. "€1,451")
 */
export function formatCurrency(amount: number, settings: EstimateSettings): string {
  const sym = settings.currencySymbol || '€';
  return `${sym}${Math.round(amount).toLocaleString('en-US')}`;
}

/**
 * Formats a distance in meters into the user's preferred unit system (metric or imperial).
 *
 * @param meters - Distance in meters
 * @param unitSystem - Either 'metric' (meters) or 'imperial' (feet)
 * @returns Human-readable string with unit suffix (e.g. "4.50 m" or "14.8 ft")
 */
export function formatDim(meters: number, unitSystem: 'metric' | 'imperial'): string {
  if (unitSystem === 'imperial') {
    const ft = meters * METERS_TO_FT;
    return `${ft.toFixed(1)} ft`;
  }
  return `${meters.toFixed(2)} m`;
}

/**
 * Computes a comprehensive spatial and financial breakdown for a room estimate.
 *
 * Calculations performed:
 * 1. Room Floor Area:
 *    - Rectangle: length × width
 *    - L-Shape: (length × width) minus cutout area
 * 2. Furniture Footprint & Coverage:
 *    - Rectangular furniture: width × depth
 *    - Circular / Round furniture: π × (width / 2)²
 *    - Oval furniture: π × (width / 2) × (depth / 2)
 *    - L-Shape furniture: 65% of bounding box (discounting open leg corner)
 *    - Coverage percentage: (occupiedArea / roomArea) × 100
 * 3. Cost Breakdown:
 *    - Items Subtotal: sum(unitPrice × quantity)
 *    - Discount deduction: subtotal × (discountPercent / 100)
 *    - Delivery & Assembly service fees
 *    - Net subtotal before tax
 *    - Indicative VAT: subtotalBeforeVat × (vatRatePercent / 100)
 *    - Grand Total: subtotalBeforeVat + vatAmount
 *
 * @param items - Array of currently placed furniture items
 * @param dimensions - Geometric configuration and dimensions of the room
 * @param settings - Pricing toggles, delivery/assembly options, and VAT rates
 * @returns Complete CostBreakdown object
 */
export function calculateCostBreakdown(
  items: SelectedFurnitureItem[],
  dimensions: RoomDimensions,
  settings: EstimateSettings
): CostBreakdown {
  // Step 1: Compute room floor area in square meters
  let roomAreaM2 = Math.max(1, dimensions.lengthM * dimensions.widthM);

  // If room is L-shaped, subtract the alcove corner cutout area
  if (dimensions.shape === 'l_shape') {
    const cutW = dimensions.lCutoutWidthM || Math.max(1.2, dimensions.widthM * 0.35);
    const cutL = dimensions.lCutoutLengthM || Math.max(1.5, dimensions.lengthM * 0.35);
    roomAreaM2 = Math.max(3, roomAreaM2 - cutW * cutL);
  }

  // Convert floor area to square feet for imperial users
  const roomAreaSqFt = roomAreaM2 * M2_TO_SQFT;

  // Step 2: Calculate furniture subtotal and geometric footprint area
  let itemsSubtotal = 0;
  let occupiedAreaM2 = 0;

  items.forEach((item) => {
    // Financial contribution
    itemsSubtotal += item.unitPrice * item.quantity;

    // Geometric footprint based on item shape
    let unitArea = item.widthM * item.depthM;
    if (item.shape === 'round') {
      // Area of circle = π * r²
      unitArea = Math.PI * Math.pow(item.widthM / 2, 2);
    } else if (item.shape === 'oval') {
      // Area of ellipse = π * a * b
      unitArea = Math.PI * (item.widthM / 2) * (item.depthM / 2);
    } else if (item.shape === 'l_shape') {
      // L-shape sofa/desk: approximately 65% of the bounding box area
      unitArea = item.widthM * item.depthM * 0.65;
    }

    occupiedAreaM2 += unitArea * item.quantity;
  });

  // Step 3: Compute discounts and additional service fees
  const discountAmount = Math.round(
    itemsSubtotal * (Math.max(0, settings.discountPercent) / 100)
  );

  const deliveryCost = settings.includeDelivery ? settings.deliveryCost : 0;
  const assemblyCost = settings.includeAssembly ? settings.assemblyCost : 0;

  // Net subtotal before tax
  const subtotalBeforeVat = Math.max(
    0,
    itemsSubtotal - discountAmount + deliveryCost + assemblyCost
  );

  // Step 4: Indicative VAT calculation (e.g. 24% standard rate)
  const vatRate = Math.max(0, settings.vatRatePercent || 0);
  const vatAmount = Math.round(subtotalBeforeVat * (vatRate / 100));
  const totalCost = subtotalBeforeVat + vatAmount;

  // Step 5: Floor coverage metrics and cost per square meter
  const coveragePercentage = Math.min(
    100,
    Math.round((occupiedAreaM2 / roomAreaM2) * 100)
  );
  const costPerM2 = Math.round((totalCost / roomAreaM2) * 10) / 10;

  return {
    itemsSubtotal: Math.round(itemsSubtotal),
    deliveryCost: Math.round(deliveryCost),
    assemblyCost: Math.round(assemblyCost),
    discountAmount,
    subtotalBeforeVat: Math.round(subtotalBeforeVat),
    vatAmount: Math.round(vatAmount),
    totalCost: Math.round(totalCost),
    roomAreaM2: Math.round(roomAreaM2 * 10) / 10,
    roomAreaSqFt: Math.round(roomAreaSqFt * 10) / 10,
    occupiedAreaM2: Math.round(occupiedAreaM2 * 10) / 10,
    coveragePercentage,
    costPerM2,
  };
}
