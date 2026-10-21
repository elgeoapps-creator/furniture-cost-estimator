/**
 * ============================================================================
 * ATELIER FURNITURE & ROOM COST ESTIMATOR - MAIN APPLICATION
 * ============================================================================
 * Root application component coordinating:
 * - Room dimensions, geometry shapes, and movable wall openings
 * - Interactive 2D floor plan rendering with rectangular, L-shape, round, and oval pieces
 * - Curated furniture catalog browsing, searching, and adding
 * - Live real-time cost breakdown calculation (subtotals, delivery, assembly, indicative VAT)
 * - Formal client quote generation (Print / PDF export)
 * - Local storage persistence for saving, loading, and deleting client quotes
 * - Phased development timeline and engineering cost modal
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RoomCalculator } from './components/RoomCalculator';
import { FloorPlanView } from './components/FloorPlanView';
import { ItemCatalog } from './components/ItemCatalog';
import { CostBreakdownPanel } from './components/CostBreakdownPanel';
import { QuoteModal } from './components/QuoteModal';
import { DevelopmentRoadmapModal } from './components/DevelopmentRoadmapModal';
import { SavedQuotesDrawer } from './components/SavedQuotesDrawer';
import {
  CatalogItem,
  CostBreakdown,
  EstimateSettings,
  OpeningType,
  QualityTier,
  QuoteRecord,
  RoomDimensions,
  RoomType,
  SelectedFurnitureItem,
  UnitSystem,
  WallOpening,
  WallSide,
} from './types';
import { ROOM_PRESETS } from './data/furnitureCatalog';
import { calculateCostBreakdown } from './utils/calculations';
import { Calendar, ArrowRight } from 'lucide-react';

/**
 * Main App Component.
 */
export default function App() {
  /**
   * Room geometry and boundaries state.
   * Tracks room shape (rectangle / L-shape), dimensions in meters,
   * unit preference, and all movable doors, windows, and balcony doors.
   */
  const [dimensions, setDimensions] = useState<RoomDimensions>({
    roomType: 'living_room',
    roomName: 'Living Room',
    shape: 'rectangle',
    lengthM: 5.5,
    widthM: 4.2,
    openings: [
      {
        id: 'door-south',
        type: 'door',
        wall: 'south',
        positionM: 2.2,
        widthM: 0.9,
      },
      {
        id: 'win-north-1',
        type: 'window',
        wall: 'north',
        positionM: 0.8,
        widthM: 1.2,
      },
      {
        id: 'win-north-2',
        type: 'window',
        wall: 'north',
        positionM: 3.5,
        widthM: 1.2,
      },
      {
        id: 'balcony-east',
        type: 'balcony_door',
        wall: 'east',
        positionM: 1.3,
        widthM: 1.6,
      },
    ],
    unitSystem: 'metric',
  });

  /**
   * Selected and placed furniture items in the active floor plan.
   * Initial layout pre-populates a realistic living room arrangement:
   * - Corner L-sectional sofa
   * - Round coffee table
   * - TV console flush against the back wall (y = 0.00m)
   * - Round accent pouf
   * - Oval floor rug
   */
  const [selectedItems, setSelectedItems] = useState<SelectedFurnitureItem[]>([
    {
      instanceId: 'item-sofa-l',
      catalogId: 'sofa-sectional',
      name: 'Corner Sectional Sofa (L-Shape)',
      category: 'seating',
      shape: 'l_shape',
      tier: 'standard',
      unitPrice: 1480,
      quantity: 1,
      widthM: 2.8,
      depthM: 2.0,
      x: 1.2,
      y: 1.5,
      rotation: 0,
    },
    {
      instanceId: 'item-table-round',
      catalogId: 'coffee-table-round',
      name: 'Round Coffee Table',
      category: 'tables',
      shape: 'round',
      tier: 'standard',
      unitPrice: 260,
      quantity: 1,
      widthM: 0.95,
      depthM: 0.95,
      x: 2.3,
      y: 2.7,
      rotation: 0,
    },
    {
      instanceId: 'item-tv',
      catalogId: 'tv-unit',
      name: 'TV Media Console',
      category: 'storage',
      shape: 'rect',
      tier: 'standard',
      unitPrice: 390,
      quantity: 1,
      widthM: 1.8,
      depthM: 0.45,
      x: 1.7,
      y: 0.0, // Flush against top back wall
      rotation: 0,
    },
    {
      instanceId: 'item-pouf',
      catalogId: 'pouf-round',
      name: 'Round Ottoman Pouf',
      category: 'seating',
      shape: 'round',
      tier: 'standard',
      unitPrice: 145,
      quantity: 1,
      widthM: 0.65,
      depthM: 0.65,
      x: 4.2,
      y: 2.2,
      rotation: 0,
    },
    {
      instanceId: 'item-rug-oval',
      catalogId: 'rug-oval',
      name: 'Oval Accent Rug (170×260 cm)',
      category: 'accents',
      shape: 'oval',
      tier: 'standard',
      unitPrice: 310,
      quantity: 1,
      widthM: 2.6,
      depthM: 1.7,
      x: 1.4,
      y: 1.4,
      rotation: 0,
    },
  ]);

  /**
   * Financial estimation preferences, currency, shipping/assembly toggles,
   * and indicative VAT rate (default 24%).
   */
  const [settings, setSettings] = useState<EstimateSettings>({
    currency: 'EUR',
    currencySymbol: '€',
    includeDelivery: true,
    deliveryCost: 50,
    includeAssembly: false,
    assemblyCost: 80,
    discountPercent: 0,
    vatRatePercent: 24, // Indicative VAT rate
  });

  // Modal and drawer visibility toggles
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [isSavedQuotesOpen, setIsSavedQuotesOpen] = useState(false);

  /**
   * Saved client quote records stored in the browser's localStorage.
   */
  const [savedQuotes, setSavedQuotes] = useState<QuoteRecord[]>(() => {
    try {
      const stored = localStorage.getItem('atelier_saved_quotes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Synchronize saved quotes state to localStorage on modification
  useEffect(() => {
    try {
      localStorage.setItem('atelier_saved_quotes', JSON.stringify(savedQuotes));
    } catch (e) {
      console.error(e);
    }
  }, [savedQuotes]);

  /**
   * Real-time calculation of complete cost, space coverage, and indicative VAT.
   */
  const breakdown: CostBreakdown = calculateCostBreakdown(
    selectedItems,
    dimensions,
    settings
  );

  /**
   * Switches the global unit system between Metric (meters) and Imperial (feet).
   */
  const handleToggleUnit = (unit: UnitSystem) => {
    setDimensions((prev) => ({ ...prev, unitSystem: unit }));
  };

  /**
   * Applies an architectural room preset (e.g. Living Room, Bedroom, Studio)
   * updating default room dimensions and label.
   */
  const handleApplyPreset = (presetType: RoomType) => {
    const preset = ROOM_PRESETS.find((p) => p.type === presetType);
    if (!preset) return;

    setDimensions((prev) => ({
      ...prev,
      roomType: presetType,
      roomName: preset.label,
      lengthM: preset.defaultLengthM,
      widthM: preset.defaultWidthM,
    }));
  };

  /**
   * Adds a furniture piece from the catalog to the room.
   * If the exact item with the same tier already exists, increments quantity.
   * Otherwise, calculates a non-overlapping starting position and appends it.
   */
  const handleAddItem = (catalogItem: CatalogItem, tier: QualityTier) => {
    const existing = selectedItems.find(
      (it) => it.catalogId === catalogItem.id && it.tier === tier
    );

    if (existing) {
      handleUpdateQuantity(existing.instanceId, 1);
      return;
    }

    const count = selectedItems.length;
    const initialX = Math.min(
      dimensions.lengthM - catalogItem.widthM - 0.2,
      Math.max(0.2, 0.4 + (count % 3) * 1.2)
    );
    const initialY = Math.min(
      dimensions.widthM - catalogItem.depthM - 0.2,
      Math.max(0.2, 0.4 + Math.floor(count / 3) * 1.0)
    );

    const newItem: SelectedFurnitureItem = {
      instanceId: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      catalogId: catalogItem.id,
      name: catalogItem.name,
      category: catalogItem.category,
      shape: catalogItem.shape,
      tier,
      unitPrice: catalogItem.prices[tier],
      quantity: 1,
      widthM: catalogItem.widthM,
      depthM: catalogItem.depthM,
      x: Math.round(initialX * 10) / 10,
      y: Math.round(initialY * 10) / 10,
      rotation: 0,
    };

    setSelectedItems((prev) => [...prev, newItem]);
  };

  /**
   * Increases or decreases the quantity of a placed furniture piece.
   * Removes the item if quantity drops to 0.
   */
  const handleUpdateQuantity = (instanceId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((it) => {
          if (it.instanceId === instanceId) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter(Boolean) as SelectedFurnitureItem[]
    );
  };

  /**
   * Deletes a placed furniture item from the room layout.
   */
  const handleRemoveItem = (instanceId: string) => {
    setSelectedItems((prev) => prev.filter((it) => it.instanceId !== instanceId));
  };

  /**
   * Updates coordinates (x, y) and rotation angle for an item.
   */
  const handleUpdateItemPosition = (
    instanceId: string,
    x: number,
    y: number,
    rotation: number
  ) => {
    setSelectedItems((prev) =>
      prev.map((it) =>
        it.instanceId === instanceId ? { ...it, x, y, rotation } : it
      )
    );
  };

  /**
   * Repositions a wall opening (door, window, balcony) along a specified wall side.
   */
  const handleUpdateOpeningPosition = (
    openingId: string,
    wall: WallSide,
    positionM: number
  ) => {
    setDimensions((prev) => ({
      ...prev,
      openings: prev.openings.map((o) =>
        o.id === openingId ? { ...o, wall, positionM } : o
      ),
    }));
  };

  /**
   * Removes a wall opening from the room boundaries.
   */
  const handleRemoveOpening = (openingId: string) => {
    setDimensions((prev) => ({
      ...prev,
      openings: prev.openings.filter((o) => o.id !== openingId),
    }));
  };

  /**
   * Adds a new door, window, or balcony door to the room boundaries.
   */
  const handleAddOpening = (type: OpeningType) => {
    const defaultWall: WallSide =
      type === 'door' ? 'south' : type === 'window' ? 'north' : 'east';
    const defaultWidth = type === 'door' ? 0.9 : type === 'window' ? 1.2 : 1.6;
    const wallLength =
      defaultWall === 'north' || defaultWall === 'south'
        ? dimensions.lengthM
        : dimensions.widthM;

    const count = dimensions.openings.filter((o) => o.type === type).length;
    const initialPos = Math.min(
      wallLength - defaultWidth - 0.2,
      Math.max(0.3, 0.5 + count * 1.5)
    );

    const newOpening: WallOpening = {
      id: `open-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      wall: defaultWall,
      positionM: Math.round(initialPos * 10) / 10,
      widthM: defaultWidth,
    };

    setDimensions((prev) => ({
      ...prev,
      openings: [...prev.openings, newOpening],
    }));
  };

  /**
   * Intelligently auto-arranges all currently placed furniture items:
   * - TV console & credenzas touch the top back wall flush (y = 0.00m)
   * - Beds touch the top back wall flush (y = 0.00m)
   * - Rugs are centered in the floor space
   * - Sectionals and linear sofas are placed in the central living zone
   * - Coffee tables align in front of seating
   */
  const handleAutoArrange = () => {
    const len = dimensions.lengthM;
    const wid = dimensions.widthM;

    setSelectedItems((prev) =>
      prev.map((item) => {
        let x = item.x;
        let y = item.y;
        let rotation = 0;

        if (item.category === 'accents') {
          // Rug centered
          x = Math.max(0.2, (len - item.widthM) / 2);
          y = Math.max(0.2, (wid - item.depthM) / 2);
        } else if (item.category === 'storage') {
          // TV / Credenza flush against top back wall
          x = Math.max(0, (len - item.widthM) / 2);
          y = 0.0;
        } else if (item.category === 'beds') {
          // Bed flush against top back wall
          x = Math.max(0, (len - item.widthM) / 2);
          y = 0.0;
        } else if (item.category === 'seating') {
          if (item.shape === 'l_shape') {
            // Corner sofa positioned comfortably in main area
            x = 1.0;
            y = 1.4;
          } else if (item.shape === 'round') {
            // Pouf near side
            x = Math.min(len - item.widthM - 0.4, 3.8);
            y = 2.4;
          } else {
            // Linear sofa
            x = Math.max(0.2, (len - item.widthM) / 2);
            y = Math.min(wid - item.depthM - 0.4, 1.8);
          }
        } else if (item.category === 'tables') {
          // Coffee table in front of sofa
          x = Math.max(0.2, (len - item.widthM) / 2);
          y = Math.min(wid - item.depthM - 0.4, 2.6);
        }

        return {
          ...item,
          x: Math.round(x * 10) / 10,
          y: Math.round(y * 10) / 10,
          rotation,
        };
      })
    );
  };

  /**
   * Resets all placed furniture items back to an empty floor plan.
   */
  const handleResetProject = () => {
    setSelectedItems([]);
  };

  /**
   * Saves a newly created quote to the local quotes list and localStorage.
   */
  const handleSaveQuote = (quote: QuoteRecord) => {
    setSavedQuotes((prev) => [quote, ...prev.filter((q) => q.id !== quote.id)]);
  };

  /**
   * Restores a previously saved quote's dimensions, items, and settings into the active workspace.
   */
  const handleLoadQuote = (quote: QuoteRecord) => {
    setDimensions(quote.dimensions);
    setSelectedItems(quote.items);
    setSettings(quote.settings);
  };

  /**
   * Deletes a saved quote record from localStorage.
   */
  const handleDeleteQuote = (id: string) => {
    setSavedQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col font-sans">
      {/* Top Navigation & Brand Header */}
      <Header
        settings={settings}
        onUpdateSettings={setSettings}
        unitSystem={dimensions.unitSystem}
        onToggleUnit={handleToggleUnit}
        savedQuotesCount={savedQuotes.length}
        onOpenSavedQuotes={() => setIsSavedQuotesOpen(true)}
        onOpenRoadmap={() => setIsRoadmapModalOpen(true)}
        onResetProject={handleResetProject}
        itemCount={selectedItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Project Timeline & Engineering Budget Banner */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Interactive 2D Floor Plan – Delivery Roadmap & Estimates
              </h3>
              <p className="text-xs text-stone-500">
                1.5 - 2 week turn-key delivery timeline and transparent $490 USD fixed-price estimate (or $190 Starter MVP).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsRoadmapModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors shrink-0"
          >
            <span>View Timeline & Estimates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2-Column Responsive Spatial & Financial Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Room Dimensions, Movable Openings & 2D Floor Plan */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Room Dimensions, Shape & Openings */}
            <RoomCalculator
              dimensions={dimensions}
              onChange={setDimensions}
              onApplyPreset={handleApplyPreset}
            />

            {/* Step 2: Interactive Scaled 2D Floor Plan Canvas */}
            <FloorPlanView
              dimensions={dimensions}
              items={selectedItems}
              onUpdateItemPosition={handleUpdateItemPosition}
              onRemoveItem={handleRemoveItem}
              onAutoArrange={handleAutoArrange}
              onUpdateOpeningPosition={handleUpdateOpeningPosition}
              onRemoveOpening={handleRemoveOpening}
              onAddOpening={handleAddOpening}
            />
          </div>

          {/* Right Column (5 cols): Cost Breakdown Panel with Indicative VAT */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
            {/* Step 4: Cost Breakdown & Estimate Summary */}
            <CostBreakdownPanel
              breakdown={breakdown}
              settings={settings}
              dimensions={dimensions}
              selectedItems={selectedItems}
              onUpdateSettings={setSettings}
              onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
            />
          </div>
        </div>

        {/* Step 3: Curated Furniture Catalog Section */}
        <section>
          <ItemCatalog
            dimensions={dimensions}
            selectedItems={selectedItems}
            settings={settings}
            onAddItem={handleAddItem}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        </section>
      </main>

      {/* Application Footer */}
      <footer className="mt-12 border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-serif font-bold text-stone-800">
            Atelier Furniture Cost Estimator
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Architectural floor plan generator with movable doors, windows, balcony doors & custom furniture shapes
          </p>
        </div>
      </footer>

      {/* Modal Dialogs & Drawers */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        dimensions={dimensions}
        selectedItems={selectedItems}
        settings={settings}
        breakdown={breakdown}
        onSaveQuote={handleSaveQuote}
      />

      {/* Development Roadmap, Project Packages & Dev Cost Proposal Modal */}
      <DevelopmentRoadmapModal
        isOpen={isRoadmapModalOpen}
        onClose={() => setIsRoadmapModalOpen(false)}
        settings={settings}
      />

      <SavedQuotesDrawer
        isOpen={isSavedQuotesOpen}
        onClose={() => setIsSavedQuotesOpen(false)}
        quotes={savedQuotes}
        onLoadQuote={handleLoadQuote}
        onDeleteQuote={handleDeleteQuote}
      />
    </div>
  );
}

