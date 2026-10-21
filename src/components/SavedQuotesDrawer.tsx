/**
 * ============================================================================
 * SAVED CLIENT QUOTES DRAWER COMPONENT
 * ============================================================================
 * Slide-out sidebar that lists all previously saved client estimates stored
 * in browser localStorage.
 *
 * Features:
 * - List view of quotation reference numbers, client names, dates, item counts
 * - Total cost (incl. VAT) summary per saved record
 * - "Load" action to restore a saved quote directly into the active layout
 * - "Delete" action to remove a quote from local storage
 * - Empty state with friendly placeholder guidance
 */

import React from 'react';
import {
  FolderOpen,
  Trash2,
  ArrowRight,
  X,
  FileText,
} from 'lucide-react';
import { QuoteRecord } from '../types';

/**
 * Props passed to the SavedQuotesDrawer component.
 */
interface SavedQuotesDrawerProps {
  /** Whether the slide-out drawer is open */
  isOpen: boolean;
  /** Callback fired to close the drawer */
  onClose: () => void;
  /** Array of saved QuoteRecord objects */
  quotes: QuoteRecord[];
  /** Callback fired when the user selects a quote to restore into the app */
  onLoadQuote: (quote: QuoteRecord) => void;
  /** Callback fired to remove a saved quote from storage */
  onDeleteQuote: (id: string) => void;
}

/**
 * Slide-out drawer component for reviewing, loading, and deleting saved estimates.
 */
export const SavedQuotesDrawer: React.FC<SavedQuotesDrawerProps> = ({
  isOpen,
  onClose,
  quotes,
  onLoadQuote,
  onDeleteQuote,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white max-w-md w-full h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-stone-700" />
            <h3 className="font-serif font-bold text-base text-stone-900">
              Saved Quotes ({quotes.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {quotes.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-stone-400">
              <FileText className="w-10 h-10 mb-2 stroke-1" />
              <p className="text-sm font-semibold text-stone-600">
                No saved quotes yet
              </p>
              <p className="text-xs text-stone-400 mt-1 max-w-xs">
                When you generate and save an estimate, it will appear here for immediate access.
              </p>
            </div>
          ) : (
            quotes.map((quote) => (
              <div
                key={quote.id}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 hover:border-stone-300 transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-stone-800">
                      {quote.quoteNumber}
                    </span>
                    <h4 className="text-sm font-bold text-stone-900 font-serif">
                      {quote.clientName || 'Untitled Project'}
                    </h4>
                    <p className="text-xs text-stone-500">
                      Room: {quote.roomName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteQuote(quote.id);
                    }}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete quote"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                  <span className="font-mono font-bold text-stone-900">
                    {quote.settings.currencySymbol}
                    {quote.breakdown.totalCost.toLocaleString()}{' '}
                    <span className="text-[10px] font-normal text-stone-500">
                      ({quote.items.length} items)
                    </span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      onLoadQuote(quote);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-stone-900 text-white hover:bg-stone-800"
                  >
                    <span>Load</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
