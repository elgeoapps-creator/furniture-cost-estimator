/**
 * ============================================================================
 * FORMAL CLIENT QUOTE MODAL COMPONENT
 * ============================================================================
 * Generates an official printable PDF / print quote document featuring:
 * - Unique quotation identifier (e.g. QUO-8472) and date
 * - Editable client name and contact email/phone
 * - Room specifications, area, and architectural shape
 * - Itemized furniture table with dimensions, shape silhouettes, quantities, unit prices
 * - Logistics summary (delivery, assembly, discount)
 * - Subtotal, indicative VAT tax amount, and grand total
 * - Client-facing terms & conditions notes
 * - One-click Print/PDF dialog trigger and local storage persistence
 */

import React, { useState } from 'react';
import {
  Printer,
  Copy,
  Check,
  Save,
  X,
} from 'lucide-react';
import {
  CostBreakdown,
  EstimateSettings,
  QuoteRecord,
  RoomDimensions,
  SelectedFurnitureItem,
} from '../types';
import { formatCurrency, formatDim } from '../utils/calculations';

/**
 * Props for the QuoteModal component.
 */
interface QuoteModalProps {
  /** Whether the quote modal is currently visible */
  isOpen: boolean;
  /** Callback fired to close the modal */
  onClose: () => void;
  /** Active room geometry and measurements */
  dimensions: RoomDimensions;
  /** Array of furniture items placed in the room */
  selectedItems: SelectedFurnitureItem[];
  /** Active financial settings */
  settings: EstimateSettings;
  /** Calculated cost breakdown */
  breakdown: CostBreakdown;
  /** Callback fired to save the quote record to local storage */
  onSaveQuote: (quote: QuoteRecord) => void;
}

/**
 * Formal Quote Modal rendering printable quote proposal and client information fields.
 */
export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  dimensions,
  selectedItems,
  settings,
  breakdown,
  onSaveQuote,
}) => {
  if (!isOpen) return null;

  // Formatted date string for the quote creation date
  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Random unique quote reference number
  const [quoteNumber] = useState(
    () => `QUO-${Math.floor(1000 + Math.random() * 9000)}`
  );
  // Client details
  const [clientName, setClientName] = useState('Alexander Reed');
  const [clientContact, setClientContact] = useState('a.reed@example.com');
  // Customizable quote terms & disclaimer notes
  const [notes, setNotes] = useState(
    `This estimate includes all selected furniture items in specified geometries and dimensions. An indicative VAT rate of ${settings.vatRatePercent}% is included, which can be adjusted upon final contract confirmation. Quote valid for 30 calendar days.`
  );

  // User feedback toast states
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  /**
   * Triggers the browser's native print / save as PDF dialog.
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * Bundles the current quote state into a persistent QuoteRecord and saves it.
   */
  const handleSave = () => {
    const record: QuoteRecord = {
      id: `quote-${Date.now()}`,
      quoteNumber,
      createdAt: todayStr,
      clientName,
      clientContact,
      roomName: dimensions.roomName,
      notes,
      dimensions,
      items: selectedItems,
      settings,
      breakdown,
    };
    onSaveQuote(record);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  /**
   * Copies formatted proposal summary text to the clipboard.
   */
  const handleCopy = () => {
    const lines = [
      `FURNITURE ESTIMATE PROPOSAL: ${quoteNumber}`,
      `Client: ${clientName} (${clientContact})`,
      `Room: ${dimensions.roomName} (${breakdown.roomAreaM2} m² - ${dimensions.shape === 'l_shape' ? 'L-Shaped' : 'Rectangular'})`,
      `Items: ${selectedItems.length} lines`,
      `Furniture Subtotal: ${formatCurrency(breakdown.itemsSubtotal, settings)}`,
      `Delivery: ${formatCurrency(breakdown.deliveryCost, settings)}`,
      `Assembly: ${formatCurrency(breakdown.assemblyCost, settings)}`,
      `Subtotal (excl. VAT): ${formatCurrency(breakdown.subtotalBeforeVat, settings)}`,
      `Indicative VAT (${settings.vatRatePercent}%): ${formatCurrency(breakdown.vatAmount, settings)}`,
      `FINAL TOTAL (incl. VAT): ${formatCurrency(breakdown.totalCost, settings)}`,
    ].join('\n');

    navigator.clipboard.writeText(lines);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-xs flex justify-center p-3 sm:p-6 print:static print:inset-auto print:z-auto print:p-0 print:bg-white print:overflow-visible print:block">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-3xl w-full my-auto flex flex-col overflow-hidden print:static print:max-w-none print:w-full print:border-none print:shadow-none print:rounded-none print:m-0 print:p-0">
        {/* Top Actions (Hidden in Print) */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-900 text-base">
              Formal Quote Document
            </span>
            <span className="font-mono text-xs bg-stone-200 text-stone-800 px-2 py-0.5 rounded">
              {quoteNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 shadow-xs"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-stone-500" />
                  <span>Save Quote</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg border border-stone-300 bg-white text-stone-600 hover:bg-stone-50"
              title="Copy text summary"
            >
              {copiedSuccess ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-6 sm:p-8 space-y-5 bg-white print:p-2 print:space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-stone-300 print:pb-3">
            <div>
              <h1 className="text-2xl font-serif font-bold text-stone-900 print:text-xl">
                Atelier Furniture Quote
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Room Dimension & Furniture Cost Estimation
              </p>
            </div>
            <div className="text-left sm:text-right text-xs text-stone-500 space-y-0.5">
              <div className="font-mono font-bold text-stone-900 text-sm print:text-xs">
                #{quoteNumber}
              </div>
              <div>Date: {todayStr}</div>
            </div>
          </div>

          {/* Customer & Room Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs print:grid-cols-2 print:bg-stone-50/70 print:p-3 print:gap-3">
            <div className="space-y-1">
              <span className="font-semibold text-stone-500 uppercase tracking-wider block text-[10px]">
                Client Information
              </span>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="font-bold text-stone-900 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-stone-800 focus:outline-none w-full print:hidden"
                placeholder="Client Name"
              />
              <div className="hidden print:block font-bold text-stone-900">
                {clientName || 'Valued Client'}
              </div>
              <input
                type="text"
                value={clientContact}
                onChange={(e) => setClientContact(e.target.value)}
                className="text-stone-600 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-stone-800 focus:outline-none w-full print:hidden"
                placeholder="Email or Phone"
              />
              <div className="hidden print:block text-stone-600">
                {clientContact || '—'}
              </div>
            </div>

            <div className="space-y-1 sm:text-right print:text-right">
              <span className="font-semibold text-stone-500 uppercase tracking-wider block text-[10px]">
                Room Specifications & Openings
              </span>
              <div className="font-bold text-stone-900">
                {dimensions.roomName} ({dimensions.shape === 'l_shape' ? 'L-Shaped' : 'Rectangular'})
              </div>
              <div className="text-stone-600 font-mono">
                {formatDim(dimensions.lengthM, dimensions.unitSystem)} ×{' '}
                {formatDim(dimensions.widthM, dimensions.unitSystem)} ({breakdown.roomAreaM2} m²)
              </div>
              <div className="text-stone-500 text-[11px]">
                {dimensions.openings.filter((o) => o.type === 'door').length} Door
                {dimensions.openings.filter((o) => o.type === 'door').length !== 1 ? 's' : ''} ·{' '}
                {dimensions.openings.filter((o) => o.type === 'window').length} Window
                {dimensions.openings.filter((o) => o.type === 'window').length !== 1 ? 's' : ''}
                {dimensions.openings.filter((o) => o.type === 'balcony_door').length > 0 &&
                  ` · ${dimensions.openings.filter((o) => o.type === 'balcony_door').length} Balcony Door${dimensions.openings.filter((o) => o.type === 'balcony_door').length > 1 ? 's' : ''}`}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-stone-200 text-stone-600 font-semibold print:text-[11px]">
                  <th className="py-2 pr-3 print:py-1.5">Item Description</th>
                  <th className="py-2 px-3 text-center print:py-1.5">Shape & Geometry</th>
                  <th className="py-2 px-3 text-center print:py-1.5">Dimensions</th>
                  <th className="py-2 px-3 text-right print:py-1.5">Unit Price</th>
                  <th className="py-2 px-3 text-center print:py-1.5">Qty</th>
                  <th className="py-2 pl-3 text-right print:py-1.5">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800 print:text-[11px]">
                {selectedItems.map((item) => (
                  <tr key={item.instanceId}>
                    <td className="py-2.5 pr-3 font-semibold text-stone-900 print:py-1.5">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3 text-center capitalize text-stone-600 print:py-1.5">
                      {item.shape === 'l_shape'
                        ? 'L-Corner'
                        : item.shape === 'round'
                        ? 'Round'
                        : item.shape === 'oval'
                        ? 'Oval'
                        : 'Rectangular'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-stone-500 print:py-1.5">
                      {formatDim(item.widthM, dimensions.unitSystem)} ×{' '}
                      {formatDim(item.depthM, dimensions.unitSystem)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono print:py-1.5">
                      {formatCurrency(item.unitPrice, settings)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold print:py-1.5">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 pl-3 text-right font-mono font-bold text-stone-900 print:py-1.5">
                      {formatCurrency(item.unitPrice * item.quantity, settings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-stone-200 text-xs print:flex-row print:pt-3 print:gap-4">
            <div className="max-w-xs space-y-1 print:max-w-xs">
              <span className="font-semibold text-stone-500 uppercase tracking-wider block text-[10px]">
                Terms & Notes
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full text-xs text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200 focus:outline-none print:hidden"
              />
              <div className="hidden print:block text-[11px] text-stone-600 leading-relaxed bg-stone-50/70 p-2.5 rounded-lg border border-stone-200">
                {notes}
              </div>
            </div>

            <div className="w-full sm:w-72 space-y-1.5 print:w-72 print:space-y-1">
              <div className="flex justify-between text-stone-600">
                <span>Furniture Subtotal:</span>
                <span className="font-mono font-bold text-stone-900">
                  {formatCurrency(breakdown.itemsSubtotal, settings)}
                </span>
              </div>
              {settings.includeDelivery && (
                <div className="flex justify-between text-stone-600">
                  <span>Delivery & Freight:</span>
                  <span className="font-mono text-stone-900">
                    +{formatCurrency(breakdown.deliveryCost, settings)}
                  </span>
                </div>
              )}
              {settings.includeAssembly && (
                <div className="flex justify-between text-stone-600">
                  <span>Assembly & Setup:</span>
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
                <span className="font-mono text-stone-900">
                  +{formatCurrency(breakdown.vatAmount, settings)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t-2 border-stone-900 text-sm font-bold text-stone-900 print:pt-1.5">
                <span>Total (incl. VAT):</span>
                <span className="font-mono text-base font-serif">
                  {formatCurrency(breakdown.totalCost, settings)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
