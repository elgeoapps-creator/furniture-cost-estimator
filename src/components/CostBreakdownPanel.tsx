/**
 * ============================================================================
 * FINANCIAL ESTIMATION & COST BREAKDOWN PANEL
 * ============================================================================
 * Displays the real-time financial summary for the current room project.
 *
 * Capabilities:
 * - Prominent total box displaying Total Cost (incl. VAT) & cost per m²
 * - Service toggles: White-glove delivery & professional assembly fees
 * - Indicative VAT rate input with quick preset buttons (24%, 20%, 19%, 0% exempt)
 * - Line-item summary: items subtotal, discounts, delivery, assembly, VAT amount
 * - Quick clipboard copy of formatted plain-text estimate
 * - Trigger button to open formal Client Quote Generation modal
 */

import React from 'react';
import {
  Receipt,
  FileText,
  Copy,
  Check,
  ArrowRight,
  Percent,
} from 'lucide-react';
import {
  CostBreakdown,
  EstimateSettings,
  RoomDimensions,
  SelectedFurnitureItem,
} from '../types';
import { formatCurrency } from '../utils/calculations';

/**
 * Props passed to the CostBreakdownPanel component.
 */
interface CostBreakdownPanelProps {
  /** Complete computed financial and spatial metrics */
  breakdown: CostBreakdown;
  /** Active financial settings and toggles */
  settings: EstimateSettings;
  /** Room geometry and name */
  dimensions: RoomDimensions;
  /** Current list of selected furniture items */
  selectedItems: SelectedFurnitureItem[];
  /** State updater callback for modifying settings (delivery, assembly, VAT) */
  onUpdateSettings: (updater: (prev: EstimateSettings) => EstimateSettings) => void;
  /** Callback fired to open the formal client quote modal */
  onOpenQuoteModal: () => void;
}

/**
 * CostBreakdownPanel component rendering real-time financial calculations and quote launcher.
 */
export const CostBreakdownPanel: React.FC<CostBreakdownPanelProps> = ({
  breakdown,
  settings,
  dimensions,
  selectedItems,
  onUpdateSettings,
  onOpenQuoteModal,
}) => {
  // Temporary state for the "Copied" feedback badge
  const [copied, setCopied] = React.useState(false);

  /**
   * Copies a formatted plain-text breakdown of the estimate to the system clipboard.
   */
  const handleCopy = () => {
    const text = `
=== FURNITURE ESTIMATE SUMMARY ===
Room: ${dimensions.roomName} (${breakdown.roomAreaM2} m²)
Items Subtotal: ${formatCurrency(breakdown.itemsSubtotal, settings)}
Delivery: ${formatCurrency(breakdown.deliveryCost, settings)}
Assembly: ${formatCurrency(breakdown.assemblyCost, settings)}
Subtotal (excl. VAT): ${formatCurrency(breakdown.subtotalBeforeVat, settings)}
Indicative VAT (${settings.vatRatePercent}%): ${formatCurrency(breakdown.vatAmount, settings)}
----------------------------------
TOTAL (incl. VAT): ${formatCurrency(breakdown.totalCost, settings)}
Cost per m²: ${formatCurrency(breakdown.costPerM2, settings)}/m²
==================================
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-stone-100 text-stone-800">
            <Receipt className="w-5 h-5 text-stone-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 font-serif">
              4. Cost Estimate
            </h3>
            <p className="text-xs text-stone-500">
              Live pricing summary with indicative VAT rate
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Big Total Box */}
      <div className="bg-stone-900 text-white rounded-xl p-4.5 space-y-2">
        <div className="flex items-baseline justify-between text-xs text-stone-300">
          <span>Total Cost (incl. VAT)</span>
          <span className="font-mono">
            {formatCurrency(breakdown.costPerM2, settings)} / m²
          </span>
        </div>
        <div className="text-3xl font-serif font-bold text-white tracking-tight">
          {formatCurrency(breakdown.totalCost, settings)}
        </div>
        <div className="flex items-center justify-between text-xs text-stone-400 pt-1 border-t border-stone-800">
          <span>{selectedItems.reduce((acc, i) => acc + i.quantity, 0)} furniture pieces</span>
          <span>{breakdown.coveragePercentage}% space covered</span>
        </div>
      </div>

      {/* Logistics & Services */}
      <div className="space-y-3 pt-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
          Logistics & Setup
        </label>

        {/* Delivery Checkbox */}
        <label className="flex items-center justify-between p-3 rounded-lg border border-stone-200 bg-stone-50/60 cursor-pointer hover:bg-stone-50">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={settings.includeDelivery}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  includeDelivery: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded text-stone-900 focus:ring-stone-800"
            />
            <div className="text-xs">
              <span className="font-semibold text-stone-800 block">
                Delivery & Freight
              </span>
              <span className="text-stone-500 text-[11px]">
                Direct transit to your room destination
              </span>
            </div>
          </div>
          <span className="text-xs font-bold font-mono text-stone-900">
            +{formatCurrency(settings.deliveryCost, settings)}
          </span>
        </label>

        {/* Assembly Checkbox */}
        <label className="flex items-center justify-between p-3 rounded-lg border border-stone-200 bg-stone-50/60 cursor-pointer hover:bg-stone-50">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={settings.includeAssembly}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  includeAssembly: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded text-stone-900 focus:ring-stone-800"
            />
            <div className="text-xs">
              <span className="font-semibold text-stone-800 block">
                Assembly & Installation
              </span>
              <span className="text-stone-500 text-[11px]">
                Professional on-site furniture setup
              </span>
            </div>
          </div>
          <span className="text-xs font-bold font-mono text-stone-900">
            +{formatCurrency(settings.assemblyCost, settings)}
          </span>
        </label>
      </div>

      {/* Indicative VAT Rate Setting */}
      <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-amber-900 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-amber-700" />
            Indicative VAT Rate:
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="35"
              step="1"
              value={settings.vatRatePercent}
              onChange={(e) =>
                onUpdateSettings((p) => ({
                  ...p,
                  vatRatePercent: Math.max(0, parseFloat(e.target.value) || 0),
                }))
              }
              className="w-14 px-1.5 py-0.5 text-xs font-bold font-mono text-right bg-white border border-amber-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <span className="font-bold text-amber-900">%</span>
          </div>
        </div>

        {/* Quick Presets for VAT */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-amber-800">Presets:</span>
          {[24, 20, 19, 0].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() =>
                onUpdateSettings((p) => ({ ...p, vatRatePercent: rate }))
              }
              className={`px-2 py-0.5 rounded border transition-colors ${
                settings.vatRatePercent === rate
                  ? 'bg-amber-800 text-white border-amber-800 font-bold'
                  : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
            >
              {rate === 0 ? '0% Exempt' : `${rate}%`}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-amber-700">
          * Indicative rate. You can adjust this percentage anytime once final tax terms are confirmed.
        </p>
      </div>

      {/* Financial Summary Ledger */}
      <div className="pt-2 border-t border-stone-100 space-y-1.5 text-xs">
        <div className="flex justify-between text-stone-600">
          <span>Furniture Subtotal:</span>
          <span className="font-mono font-bold text-stone-900">
            {formatCurrency(breakdown.itemsSubtotal, settings)}
          </span>
        </div>

        {settings.includeDelivery && (
          <div className="flex justify-between text-stone-600">
            <span>Delivery:</span>
            <span className="font-mono text-stone-900">
              +{formatCurrency(breakdown.deliveryCost, settings)}
            </span>
          </div>
        )}

        {settings.includeAssembly && (
          <div className="flex justify-between text-stone-600">
            <span>Assembly:</span>
            <span className="font-mono text-stone-900">
              +{formatCurrency(breakdown.assemblyCost, settings)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-stone-700 font-medium pt-1 border-t border-stone-100">
          <span>Subtotal (excl. VAT):</span>
          <span className="font-mono font-bold text-stone-900">
            {formatCurrency(breakdown.subtotalBeforeVat, settings)}
          </span>
        </div>

        <div className="flex justify-between text-stone-600">
          <span>Indicative VAT ({settings.vatRatePercent}%):</span>
          <span className="font-mono font-bold text-stone-900">
            +{formatCurrency(breakdown.vatAmount, settings)}
          </span>
        </div>

        <div className="flex justify-between text-stone-900 font-bold pt-2 border-t border-stone-200 text-sm">
          <span>Total (incl. VAT):</span>
          <span className="font-mono text-base font-serif">
            {formatCurrency(breakdown.totalCost, settings)}
          </span>
        </div>
      </div>

      {/* Action CTA */}
      <button
        type="button"
        onClick={onOpenQuoteModal}
        disabled={selectedItems.length === 0}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
      >
        <FileText className="w-4 h-4 text-stone-300" />
        <span>Generate Formal Quote</span>
        <ArrowRight className="w-4 h-4 text-stone-400" />
      </button>
    </div>
  );
};
