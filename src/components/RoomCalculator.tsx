/**
 * ============================================================================
 * ROOM CALCULATOR & ARCHITECTURAL BOUNDARY CONTROLS
 * ============================================================================
 * Handles room configuration including:
 * - Room presets (Living Room, Bedroom, Dining, Office, Studio)
 * - Room geometry shapes (Rectangular vs L-Shaped with alcove cutout)
 * - Numeric and slider inputs for room length and width (metric & imperial)
 * - Real-time floor surface area calculation (m² and sq ft)
 * - Wall opening manager (adding, removing, repositioning doors, windows, balcony doors)
 */

import React from 'react';
import {
  Maximize2,
  DoorOpen,
  Sun,
  Plus,
  Trash2,
  Sliders,
  MoveHorizontal,
} from 'lucide-react';
import {
  OpeningType,
  RoomDimensions,
  RoomShape,
  RoomType,
  WallOpening,
  WallSide,
} from '../types';
import { ROOM_PRESETS } from '../data/furnitureCatalog';
import { formatDim, M2_TO_SQFT, METERS_TO_FT, FT_TO_METERS } from '../utils/calculations';

/**
 * Props passed to the RoomCalculator component.
 */
interface RoomCalculatorProps {
  /** The current active room dimensions and openings */
  dimensions: RoomDimensions;
  /** State updater callback for changing room dimensions */
  onChange: (updater: (prev: RoomDimensions) => RoomDimensions) => void;
  /** Callback triggered when a room preset button is clicked */
  onApplyPreset: (presetType: RoomType) => void;
}

/**
 * RoomCalculator component renders shape choices, dimensions sliders, and wall opening controls.
 */
export const RoomCalculator: React.FC<RoomCalculatorProps> = ({
  dimensions,
  onChange,
  onApplyPreset,
}) => {
  const isMetric = dimensions.unitSystem === 'metric';

  // Area calculation: length × width minus alcove cutout for L-shape
  let areaM2 = dimensions.lengthM * dimensions.widthM;
  if (dimensions.shape === 'l_shape') {
    const cutW = dimensions.lCutoutWidthM || Math.max(1.2, dimensions.widthM * 0.35);
    const cutL = dimensions.lCutoutLengthM || Math.max(1.5, dimensions.lengthM * 0.35);
    areaM2 = Math.max(3, areaM2 - cutW * cutL);
  }
  areaM2 = Math.round(areaM2 * 10) / 10;
  const areaSqFt = Math.round(areaM2 * M2_TO_SQFT * 10) / 10;

  // Display values converted to metric or imperial based on user preference
  const displayLength = isMetric
    ? dimensions.lengthM
    : Math.round(dimensions.lengthM * METERS_TO_FT * 10) / 10;
  const displayWidth = isMetric
    ? dimensions.widthM
    : Math.round(dimensions.widthM * METERS_TO_FT * 10) / 10;

  /**
   * Handles user change to room length input or slider.
   * Converts feet to meters if imperial mode is active, and clamps between 1.5m and 25m.
   */
  const handleLengthChange = (val: number) => {
    const valMeters = isMetric ? val : val * FT_TO_METERS;
    onChange((prev) => ({
      ...prev,
      lengthM: Math.max(1.5, Math.min(25, Math.round(valMeters * 10) / 10)),
    }));
  };

  /**
   * Handles user change to room width input or slider.
   * Converts feet to meters if imperial mode is active, and clamps between 1.5m and 25m.
   */
  const handleWidthChange = (val: number) => {
    const valMeters = isMetric ? val : val * FT_TO_METERS;
    onChange((prev) => ({
      ...prev,
      widthM: Math.max(1.5, Math.min(25, Math.round(valMeters * 10) / 10)),
    }));
  };

  /**
   * Creates and attaches a new wall opening (door, window, balcony door).
   * Calculates sensible default wall side, standard width, and staggered position.
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
      flipSwing: false,
    };

    onChange((prev) => ({
      ...prev,
      openings: [...prev.openings, newOpening],
    }));
  };

  /**
   * Deletes a wall opening by its unique ID.
   */
  const handleRemoveOpening = (id: string) => {
    onChange((prev) => ({
      ...prev,
      openings: prev.openings.filter((o) => o.id !== id),
    }));
  };

  /**
   * Moves an opening to a different wall side ('north', 'south', 'east', 'west'),
   * automatically re-clamping its position within the new wall's length.
   */
  const handleUpdateOpeningWall = (id: string, wall: WallSide) => {
    onChange((prev) => ({
      ...prev,
      openings: prev.openings.map((o) => {
        if (o.id !== id) return o;
        const maxSpan =
          wall === 'north' || wall === 'south' ? prev.lengthM : prev.widthM;
        const safePos = Math.min(maxSpan - o.widthM - 0.1, Math.max(0.2, o.positionM));
        return { ...o, wall, positionM: Math.round(safePos * 10) / 10 };
      }),
    }));
  };

  /**
   * Updates an opening's offset in meters along its current wall.
   */
  const handleUpdateOpeningPos = (id: string, pos: number) => {
    onChange((prev) => ({
      ...prev,
      openings: prev.openings.map((o) => {
        if (o.id !== id) return o;
        const maxSpan =
          o.wall === 'north' || o.wall === 'south' ? prev.lengthM : prev.widthM;
        const safePos = Math.min(maxSpan - o.widthM - 0.1, Math.max(0.1, pos));
        return { ...o, positionM: Math.round(safePos * 100) / 100 };
      }),
    }));
  };

  const doorsCount = dimensions.openings.filter((o) => o.type === 'door').length;
  const windowsCount = dimensions.openings.filter((o) => o.type === 'window').length;
  const balconyDoorsCount = dimensions.openings.filter((o) => o.type === 'balcony_door').length;

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-stone-100 text-stone-800">
            <Maximize2 className="w-5 h-5 text-stone-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 font-serif">
              1. Room Dimensions & Movable Openings
            </h2>
            <p className="text-xs text-stone-500">
              Set shape, dimensions, and place doors & windows on any wall
            </p>
          </div>
        </div>

        {/* Room Area Badge */}
        <div className="bg-stone-50 border border-stone-200 px-3.5 py-1.5 rounded-lg flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-stone-500 font-medium">Floor Area:</span>
          <span className="text-sm font-bold font-serif text-stone-900">
            {isMetric ? `${areaM2} m²` : `${areaSqFt} sq ft`}
          </span>
          <span className="text-[11px] text-stone-400">
            ({isMetric ? `${areaSqFt} sq ft` : `${areaM2} m²`})
          </span>
        </div>
      </div>

      {/* Room Presets */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
          Room Presets
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ROOM_PRESETS.map((preset) => {
            const isActive = dimensions.roomType === preset.type;
            return (
              <button
                key={preset.type}
                type="button"
                onClick={() => onApplyPreset(preset.type)}
                className={`shrink-0 px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                  isActive
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Room Shape Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
          Room Geometry Shape
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-visible">
          <button
            type="button"
            onClick={() => onChange((p) => ({ ...p, shape: 'rectangle' }))}
            className={`px-4 py-3 rounded-xl border text-left transition-colors flex items-center justify-between gap-3 overflow-visible ${
              dimensions.shape === 'rectangle'
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <div className="min-w-0 pr-1">
              <span className="text-xs font-bold block">Rectangular Room</span>
              <span
                className={`text-[11px] ${
                  dimensions.shape === 'rectangle'
                    ? 'text-stone-300'
                    : 'text-stone-500'
                }`}
              >
                Standard 4-wall rectangle
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2 mr-1">
              <svg
                className={`w-5 h-5 shrink-0 ${
                  dimensions.shape === 'rectangle'
                    ? 'text-white'
                    : 'text-stone-400'
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
              </svg>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  dimensions.shape === 'rectangle'
                    ? 'border-white bg-white/20'
                    : 'border-stone-300 bg-white'
                }`}
              >
                {dimensions.shape === 'rectangle' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChange((p) => ({ ...p, shape: 'l_shape' }))}
            className={`px-4 py-3 rounded-xl border text-left transition-colors flex items-center justify-between gap-3 overflow-visible ${
              dimensions.shape === 'l_shape'
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <div className="min-w-0 pr-1">
              <span className="text-xs font-bold block">L-Shaped Room</span>
              <span
                className={`text-[11px] ${
                  dimensions.shape === 'l_shape'
                    ? 'text-stone-300'
                    : 'text-stone-500'
                }`}
              >
                With alcove corner
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2 mr-1">
              <svg
                className={`w-5 h-5 shrink-0 ${
                  dimensions.shape === 'l_shape'
                    ? 'text-white'
                    : 'text-stone-400'
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              >
                <path d="M 3 4 H 14 V 11 H 21 V 20 H 3 Z" />
              </svg>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  dimensions.shape === 'l_shape'
                    ? 'border-white bg-white/20'
                    : 'border-stone-300 bg-white'
                }`}
              >
                {dimensions.shape === 'l_shape' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Dimension Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Length */}
        <div className="bg-stone-50 border border-stone-200/90 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700">Length</span>
            <span className="font-mono font-bold text-stone-900">
              {formatDim(dimensions.lengthM, dimensions.unitSystem)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step={isMetric ? 0.1 : 0.5}
              min={isMetric ? 2 : 6}
              max={isMetric ? 20 : 65}
              value={displayLength}
              aria-label="Room Length"
              onChange={(e) => handleLengthChange(parseFloat(e.target.value) || 2)}
              className="w-24 px-2.5 py-1.5 text-sm font-semibold bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-800"
            />
            <span className="text-xs text-stone-500 font-medium">
              {isMetric ? 'meters (m)' : 'feet (ft)'}
            </span>
          </div>
          <input
            type="range"
            min={isMetric ? 2 : 6}
            max={isMetric ? 15 : 50}
            step={isMetric ? 0.1 : 0.5}
            value={displayLength}
            aria-label="Room Length Slider"
            onChange={(e) => handleLengthChange(parseFloat(e.target.value))}
            className="w-full accent-stone-800 cursor-pointer"
          />
        </div>

        {/* Width */}
        <div className="bg-stone-50 border border-stone-200/90 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700">Width</span>
            <span className="font-mono font-bold text-stone-900">
              {formatDim(dimensions.widthM, dimensions.unitSystem)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step={isMetric ? 0.1 : 0.5}
              min={isMetric ? 1.5 : 5}
              max={isMetric ? 20 : 65}
              value={displayWidth}
              aria-label="Room Width"
              onChange={(e) => handleWidthChange(parseFloat(e.target.value) || 2)}
              className="w-24 px-2.5 py-1.5 text-sm font-semibold bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-800"
            />
            <span className="text-xs text-stone-500 font-medium">
              {isMetric ? 'meters (m)' : 'feet (ft)'}
            </span>
          </div>
          <input
            type="range"
            min={isMetric ? 1.5 : 5}
            max={isMetric ? 12 : 40}
            step={isMetric ? 0.1 : 0.5}
            value={displayWidth}
            aria-label="Room Width Slider"
            onChange={(e) => handleWidthChange(parseFloat(e.target.value))}
            className="w-full accent-stone-800 cursor-pointer"
          />
        </div>
      </div>

      {/* Wall Openings: Doors, Windows, Balcony Doors with Wall Assignment */}
      <div className="pt-2 border-t border-stone-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 block">
              Doors, Windows & Balcony Openings ({dimensions.openings.length})
            </label>
            <p className="text-[11px] text-stone-500">
              Select wall or drag directly on the 2D floor plan to position anywhere
            </p>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleAddOpening('door')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-200 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>+ Door</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddOpening('window')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>+ Window</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddOpening('balcony_door')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>+ Balcony</span>
            </button>
          </div>
        </div>

        {/* Openings List */}
        {dimensions.openings.length > 0 ? (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {dimensions.openings.map((opening, idx) => {
              const wallMax =
                opening.wall === 'north' || opening.wall === 'south'
                  ? dimensions.lengthM
                  : dimensions.widthM;

              return (
                <div
                  key={opening.id}
                  className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        opening.type === 'door'
                          ? 'bg-stone-200 text-stone-800'
                          : opening.type === 'window'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {opening.type === 'door'
                        ? 'Door'
                        : opening.type === 'window'
                        ? 'Window'
                        : 'Balcony Door'}
                    </span>

                    {/* Wall Selector */}
                    <div className="flex items-center gap-1 text-stone-600">
                      <span className="text-[11px] text-stone-400">Wall:</span>
                      <select
                        value={opening.wall}
                        aria-label="Wall Side"
                        onChange={(e) =>
                          handleUpdateOpeningWall(
                            opening.id,
                            e.target.value as WallSide
                          )
                        }
                        className="font-semibold text-stone-900 bg-white border border-stone-300 rounded px-1.5 py-0.5 text-xs focus:outline-none"
                      >
                        <option value="north">North (Top Wall)</option>
                        <option value="south">South (Bottom Wall)</option>
                        <option value="west">West (Left Wall)</option>
                        <option value="east">East (Right Wall)</option>
                      </select>
                    </div>
                  </div>

                  {/* Position Slider */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-500 font-mono">
                      {formatDim(opening.positionM, dimensions.unitSystem)}
                    </span>
                    <input
                      type="range"
                      min="0.1"
                      max={Math.max(0.2, wallMax - opening.widthM - 0.1)}
                      step="0.05"
                      value={opening.positionM}
                      aria-label="Opening Position Along Wall"
                      onChange={(e) =>
                        handleUpdateOpeningPos(
                          opening.id,
                          parseFloat(e.target.value) || 0.1
                        )
                      }
                      className="w-24 sm:w-32 accent-stone-800 cursor-pointer"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveOpening(opening.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
                      title="Remove opening"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3 bg-stone-50 rounded-lg text-center text-xs text-stone-400">
            No doors or windows placed. Click buttons above to add them to any wall.
          </div>
        )}
      </div>
    </div>
  );
};
