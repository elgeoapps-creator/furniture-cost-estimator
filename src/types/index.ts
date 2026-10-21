/**
 * ============================================================================
 * TYPE DEFINITIONS FOR ATELIER FURNITURE & ROOM COST ESTIMATOR
 * ============================================================================
 * This file defines the core data structures, union types, and interfaces
 * utilized across the entire application for 2D spatial layouts, furniture
 * cataloging, estimation calculations, and saved client quote management.
 */

/**
 * Supported measurement unit systems:
 * - 'metric': Distances in meters (m) and areas in square meters (m²).
 * - 'imperial': Distances in feet (ft) and areas in square feet (sq ft).
 */
export type UnitSystem = 'metric' | 'imperial';

/**
 * Standard room types available in the configuration presets.
 * Each room type comes with default recommended dimensions and tailored catalog filters.
 */
export type RoomType =
  | 'living_room'
  | 'bedroom'
  | 'dining_room'
  | 'office'
  | 'studio';

/**
 * Architectural room floor plan shapes:
 * - 'rectangle': Standard rectangular room with uniform length and width.
 * - 'l_shape': L-shaped architectural room featuring an open corner cutout/alcove.
 */
export type RoomShape = 'rectangle' | 'l_shape';

/**
 * Material and craftsmanship quality tiers for furniture items:
 * - 'budget': Cost-effective particle board / laminate / entry-level fabric.
 * - 'standard': Mid-range solid wood veneer / high-resilience foam / durable textiles.
 * - 'luxury': Premium solid hardwoods / top-grain leather / artisanal finishes.
 */
export type QualityTier = 'budget' | 'standard' | 'luxury';

/**
 * Functional category classification for furniture pieces in the catalog.
 */
export type FurnitureCategory =
  | 'seating'
  | 'tables'
  | 'storage'
  | 'beds'
  | 'workspace'
  | 'accents';

/**
 * Geometric shape archetype for furniture pieces:
 * - 'rect': Traditional rectangular or square furniture piece.
 * - 'l_shape': L-shaped sectional couch, corner workstation, etc.
 * - 'round': Circular furniture piece (e.g., round dining table, circular pouf).
 * - 'oval': Elliptical furniture piece (e.g., oval coffee table).
 */
export type FurnitureShape = 'rect' | 'l_shape' | 'round' | 'oval';

/**
 * Definition of an item available in the master furniture catalog.
 */
export interface CatalogItem {
  /** Unique catalog identifier (e.g. 'sofa-sectional') */
  id: string;
  /** Human-readable display name */
  name: string;
  /** Primary furniture category */
  category: FurnitureCategory;
  /** Geometric 2D silhouette shape */
  shape: FurnitureShape;
  /** Array of room types where this item is recommended */
  roomTypes: RoomType[];
  /** Bounding box width in meters */
  widthM: number;
  /** Bounding box depth/height in meters */
  depthM: number;
  /** Descriptive summary of features and materials */
  description: string;
  /** Unit price breakdown per quality tier */
  prices: {
    budget: number;
    standard: number;
    luxury: number;
  };
  /** Pre-selected default quality tier when added */
  defaultTier: QualityTier;
}

/**
 * Represents an individual furniture item that has been added to a room layout.
 * Tracks spatial location, rotation angle, selected tier, and quantity.
 */
export interface SelectedFurnitureItem {
  /** Unique instance identifier in the current floor plan (e.g., 'item-sofa-l') */
  instanceId: string;
  /** Reference back to the CatalogItem id */
  catalogId: string;
  /** Display name of the item */
  name: string;
  /** Category classification */
  category: FurnitureCategory;
  /** Geometric silhouette shape (rect, l_shape, round, oval) */
  shape: FurnitureShape;
  /** Selected quality tier */
  tier: QualityTier;
  /** Resolved unit price based on selected tier */
  unitPrice: number;
  /** Quantity of this item in the room */
  quantity: number;
  /** Width dimension in meters */
  widthM: number;
  /** Depth dimension in meters */
  depthM: number;
  /** X coordinate in meters from the room's top-left corner (0.00m = West wall) */
  x: number;
  /** Y coordinate in meters from the room's top-left corner (0.00m = North wall) */
  y: number;
  /** Clockwise rotation angle in degrees: 0, 90, 180, or 270 */
  rotation: number;
}

/**
 * Compass orientation walls of the room bounding box.
 * - 'north': Top / Back wall
 * - 'south': Bottom / Front wall
 * - 'west': Left wall
 * - 'east': Right wall
 */
export type WallSide = 'north' | 'south' | 'east' | 'west';

/**
 * Architectural opening type installed on a wall.
 * - 'door': Standard hinged interior door with swing arc.
 * - 'window': Glazed window with sill lines.
 * - 'balcony_door': Double French or sliding balcony door.
 */
export type OpeningType = 'door' | 'window' | 'balcony_door';

/**
 * A movable wall opening (door, window, balcony door) placed on a room wall.
 */
export interface WallOpening {
  /** Unique opening identifier */
  id: string;
  /** Type of opening (door, window, balcony) */
  type: OpeningType;
  /** Wall side where this opening is mounted */
  wall: WallSide;
  /** Position offset along the wall in meters from the wall's start coordinate */
  positionM: number;
  /** Width of the opening in meters */
  widthM: number;
  /** Optional flag to flip the door swing arc direction */
  flipSwing?: boolean;
}

/**
 * Spatial boundaries, geometry, and openings describing a room.
 */
export interface RoomDimensions {
  /** Room type identifier */
  roomType: RoomType;
  /** Custom client or project room label */
  roomName: string;
  /** Overall room boundary shape */
  shape: RoomShape;
  /** Total room length (horizontal dimension) in meters */
  lengthM: number;
  /** Total room width (vertical dimension) in meters */
  widthM: number;
  /** Cutout width in meters if shape is 'l_shape' (alcove cut from top-right corner) */
  lCutoutWidthM?: number;
  /** Cutout length in meters if shape is 'l_shape' */
  lCutoutLengthM?: number;
  /** List of movable doors, windows, and balcony doors */
  openings: WallOpening[];
  /** Preferred display unit system (metric or imperial) */
  unitSystem: UnitSystem;
}

/**
 * Financial parameters and toggles for estimating overall quote totals.
 */
export interface EstimateSettings {
  /**
   * Selected currency code:
   * - 'EUR': Euro (€)
   * - 'USD': United States Dollar ($)
   * - 'GBP': British Pound Sterling (£)
   * - 'AUD': Australian Dollar (A$)
   */
  currency: 'EUR' | 'USD' | 'GBP' | 'AUD';
  /** Display symbol for currency (e.g. '€', '$', '£', 'A$') */
  currencySymbol: string;
  /** Whether white-glove delivery fee is included */
  includeDelivery: boolean;
  /** Flat delivery fee in the selected currency */
  deliveryCost: number;
  /** Whether professional on-site assembly fee is included */
  includeAssembly: boolean;
  /** Flat assembly fee in the selected currency */
  assemblyCost: number;
  /** Percentage discount applied to items subtotal (0 - 100) */
  discountPercent: number;
  /** Indicative VAT (sales tax) percentage rate (e.g. 24%) */
  vatRatePercent: number;
}

/**
 * Comprehensive cost and spatial breakdown calculated for a quote.
 */
export interface CostBreakdown {
  /** Gross sum of all items (unitPrice * quantity) */
  itemsSubtotal: number;
  /** Delivery charge if active */
  deliveryCost: number;
  /** Assembly charge if active */
  assemblyCost: number;
  /** Calculated discount deduction amount */
  discountAmount: number;
  /** Net subtotal after discounts, before tax */
  subtotalBeforeVat: number;
  /** Indicative VAT (tax) amount calculated on subtotal */
  vatAmount: number;
  /** Final grand total including VAT */
  totalCost: number;
  /** Usable floor area in square meters */
  roomAreaM2: number;
  /** Usable floor area in square feet */
  roomAreaSqFt: number;
  /** Total footprint area occupied by furniture in square meters */
  occupiedAreaM2: number;
  /** Percentage of room floor area occupied (0 - 100) */
  coveragePercentage: number;
  /** Average furniture investment per square meter of room area */
  costPerM2: number;
}

/**
 * Persistent snapshot of a saved quote record that can be loaded or exported.
 */
export interface QuoteRecord {
  /** Unique ID of the saved quote */
  id: string;
  /** Formatted quote reference number (e.g. 'AT-2026-0042') */
  quoteNumber: string;
  /** ISO date string when quote was generated */
  createdAt: string;
  /** Name of the client or recipient */
  clientName: string;
  /** Client email or telephone contact */
  clientContact: string;
  /** Label of the room */
  roomName: string;
  /** Additional notes or custom specifications */
  notes: string;
  /** Room dimensions and geometry at the time of quote creation */
  dimensions: RoomDimensions;
  /** Furniture items included in the quote */
  items: SelectedFurnitureItem[];
  /** Financial settings and toggles active during calculation */
  settings: EstimateSettings;
  /** Final calculated cost and area breakdown */
  breakdown: CostBreakdown;
}

/**
 * Development roadmap phase specification for timeline and project cost modal.
 */
export interface TimelinePhase {
  /** Identifier label (e.g. 'Phase 1') */
  phase: string;
  /** Descriptive milestone title */
  title: string;
  /** Estimated duration in weeks or days */
  duration: string;
  /** Key feature deliverables for this phase */
  deliverables: string[];
  /** Development cost in the base currency */
  cost: number;
}

/**
 * Commercial project package tier specification for client proposal negotiation.
 */
export interface ProposalPackage {
  /** Unique key for the package tier (e.g. 'starter', 'interactive', 'enterprise') */
  id: 'starter' | 'interactive' | 'enterprise';
  /** Display title for the package */
  name: string;
  /** Subtitle or target audience description */
  tagline: string;
  /** Fixed-price cost in the base currency */
  price: number;
  /** Estimated turnaround delivery duration */
  duration: string;
  /** Badge label if recommended (e.g. 'Recommended', 'Best Value') */
  badge?: string;
  /** List of included key features and capabilities */
  features: string[];
  /** Excluded or restricted features in lower tiers */
  excluded?: string[];
  /** Ideal use case description */
  recommendedFor: string;
}
