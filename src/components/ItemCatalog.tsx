/**
 * ============================================================================
 * FURNITURE ITEM CATALOG & SELECTION COMPONENT
 * ============================================================================
 * Allows users to browse, filter, search, and add furniture items to the room layout.
 *
 * Features:
 * - Category filter tabs (Seating, Tables, Storage, Beds, Workspace, Accents)
 * - Text search filter across item titles and descriptions
 * - Global Quality Tier switcher (Budget, Standard, Luxury/Premium)
 * - Dimension and silhouette badges (Rectangular, L-Corner, Round, Oval)
 * - Quantity steppers (+ / -) for already added items
 * - One-click "Add to Room" button with auto-positioning
 */

import React, { useState } from 'react';
import { Search, Plus, Minus } from 'lucide-react';
import {
  CatalogItem,
  EstimateSettings,
  FurnitureCategory,
  QualityTier,
  RoomDimensions,
  SelectedFurnitureItem,
} from '../types';
import { FURNITURE_CATALOG } from '../data/furnitureCatalog';
import { formatCurrency, formatDim } from '../utils/calculations';

/**
 * Props for the ItemCatalog component.
 */
interface ItemCatalogProps {
  /** Active dimensions and unit preference */
  dimensions: RoomDimensions;
  /** Currently selected/placed furniture items */
  selectedItems: SelectedFurnitureItem[];
  /** Pricing and currency display settings */
  settings: EstimateSettings;
  /** Callback fired when a new catalog item is added to the room */
  onAddItem: (item: CatalogItem, tier: QualityTier) => void;
  /** Callback fired to adjust quantity of an already added item */
  onUpdateQuantity: (instanceId: string, delta: number) => void;
  /** Callback fired to remove an item from the room */
  onRemoveItem: (instanceId: string) => void;
}

/**
 * Catalog category navigation definitions.
 */
const CATEGORIES: { key: FurnitureCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All Items' },
  { key: 'seating', label: 'Seating' },
  { key: 'tables', label: 'Tables' },
  { key: 'storage', label: 'Storage' },
  { key: 'beds', label: 'Beds & Sleep' },
  { key: 'workspace', label: 'Workspace' },
  { key: 'accents', label: 'Rugs & Accents' },
];

/**
 * ItemCatalog component rendering search, filters, quality tier toggles, and item cards.
 */
export const ItemCatalog: React.FC<ItemCatalogProps> = ({
  dimensions,
  selectedItems,
  settings,
  onAddItem,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  // Current active category filter
  const [activeCategory, setActiveCategory] = useState<FurnitureCategory | 'all'>('all');
  // Free-text search query string
  const [searchQuery, setSearchQuery] = useState('');
  // Selected quality tier applied to newly added items
  const [globalTier, setGlobalTier] = useState<QualityTier>('standard');

  // Filter catalog items by active category tab and case-insensitive text search
  const filteredCatalog = FURNITURE_CATALOG.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 space-y-5">
      {/* Header & Tier Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div>
          <h3 className="text-base font-bold text-stone-900 font-serif">
            3. Furniture Selection
          </h3>
          <p className="text-xs text-stone-500">
            Select items to calculate budget and view rectangular placement in the room
          </p>
        </div>

        {/* Global Quality Tier */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium">Quality Tier:</span>
          <div className="flex p-0.5 bg-stone-100 rounded-lg border border-stone-200 text-xs">
            <button
              type="button"
              onClick={() => setGlobalTier('budget')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                globalTier === 'budget'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Budget
            </button>
            <button
              type="button"
              onClick={() => setGlobalTier('standard')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                globalTier === 'standard'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setGlobalTier('luxury')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                globalTier === 'luxury'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Premium
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items (sofa, dining table, bed, desk, rug)..."
            className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-stone-50 border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-800"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeCategory === cat.key
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredCatalog.map((item) => {
          const price = item.prices[globalTier];
          const placedInstances = selectedItems.filter(
            (s) => s.catalogId === item.id
          );
          const totalQty = placedInstances.reduce(
            (acc, curr) => acc + curr.quantity,
            0
          );

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                totalQty > 0
                  ? 'border-stone-800 bg-stone-50 shadow-xs'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-stone-900 font-serif leading-tight">
                    {item.name}
                  </h4>
                  <span className="font-mono text-xs font-bold text-stone-900 shrink-0">
                    {formatCurrency(price, settings)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-500">
                  <span className="capitalize px-1.5 py-0.2 bg-stone-100 rounded text-[10px] font-semibold text-stone-700">
                    {item.shape === 'l_shape'
                      ? 'L-Corner'
                      : item.shape === 'round'
                      ? 'Round'
                      : item.shape === 'oval'
                      ? 'Oval'
                      : 'Rectangular'}
                  </span>
                  <span>·</span>
                  <span>
                    {formatDim(item.widthM, dimensions.unitSystem)} ×{' '}
                    {formatDim(item.depthM, dimensions.unitSystem)}
                  </span>
                </div>

                <p className="text-[11px] text-stone-500 line-clamp-1">
                  {item.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[10px] text-stone-400 capitalize">
                  {globalTier} grade
                </span>

                {totalQty > 0 ? (
                  <div className="flex items-center gap-1.5 bg-stone-900 text-white rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuantity(placedInstances[0].instanceId, -1)
                      }
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-stone-800"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold px-1.5">
                      {totalQty}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuantity(placedInstances[0].instanceId, 1)
                      }
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-stone-800"
                      title="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onAddItem(item, globalTier)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add to Room</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
