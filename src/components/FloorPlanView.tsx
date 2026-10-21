/**
 * ============================================================================
 * 2D ARCHITECTURAL FLOOR PLAN VIEW COMPONENT
 * ============================================================================
 * Renders an interactive, scaled vector SVG canvas of the room floor plan.
 *
 * Core Capabilities:
 * 1. Room Geometry:
 *    - Standard 4-wall rectangle or L-shaped room with corner alcove cutout.
 *    - Compass labels (North/Top, South/Bottom, West/Left, East/Right).
 *    - Dimension guides with live metric/imperial tick labels.
 * 2. Movable Wall Openings:
 *    - Doors (with realistic swing arcs), windows (with glazed double sills),
 *      and balcony sliding doors.
 *    - Free interactive dragging along any wall side with automatic boundary clamping.
 * 3. Placed Furniture Items:
 *    - Multi-shape silhouettes: Rectangles, L-shaped sectionals, round, and oval.
 *    - Simple left click selects item and activates its edit toolbar.
 *    - Sustained drag (threshold >= 5px) moves item across the floor plan.
 *    - Magnetic wall snapping (within 12cm) ensures furniture touches any wall flush (0.00m).
 *    - 90° clockwise rotation about the geometric center with bounding box re-clamping.
 *    - Live position feedback (X, Y in meters) and wall contact verification badges.
 */

import React, { useState, useRef } from 'react';
import {
  RotateCw,
  Trash2,
  Sparkles,
  LayoutGrid,
  Move,
  DoorOpen,
  Sun,
  Plus,
} from 'lucide-react';
import {
  OpeningType,
  RoomDimensions,
  SelectedFurnitureItem,
  WallOpening,
  WallSide,
} from '../types';
import { formatDim } from '../utils/calculations';

/**
 * Props for the FloorPlanView component.
 */
interface FloorPlanViewProps {
  /** Active dimensions, geometry shape, and wall openings of the room */
  dimensions: RoomDimensions;
  /** Furniture pieces placed in this room */
  items: SelectedFurnitureItem[];
  /** Callback fired when a furniture piece is repositioned or rotated */
  onUpdateItemPosition: (
    instanceId: string,
    x: number,
    y: number,
    rotation: number
  ) => void;
  /** Callback fired when a furniture piece is deleted from the room */
  onRemoveItem: (instanceId: string) => void;
  /** Callback fired to trigger automated furniture layout arrangement */
  onAutoArrange: () => void;
  /** Callback fired when a door or window is dragged to a new position or wall */
  onUpdateOpeningPosition: (
    openingId: string,
    wall: WallSide,
    positionM: number
  ) => void;
  /** Callback fired when a wall opening is removed */
  onRemoveOpening: (openingId: string) => void;
  /** Callback fired when adding a new door, window, or balcony door */
  onAddOpening: (type: OpeningType) => void;
}

/**
 * Interactive 2D SVG Floor Plan View.
 */
export const FloorPlanView: React.FC<FloorPlanViewProps> = ({
  dimensions,
  items,
  onUpdateItemPosition,
  onRemoveItem,
  onAutoArrange,
  onUpdateOpeningPosition,
  onRemoveOpening,
  onAddOpening,
}) => {
  // Currently selected furniture piece instance ID (null if none selected)
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null
  );
  // Currently selected wall opening ID (door, window, balcony door)
  const [selectedOpeningId, setSelectedOpeningId] = useState<string | null>(
    null
  );

  // Dragging interaction state flags
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const [isDraggingOpening, setIsDraggingOpening] = useState(false);
  // Drag offset in meters between pointer and top-left origin of active item
  const [dragItemOffset, setDragItemOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Distinction between a single left click (select) and a sustained drag (move)
  const dragStartPosRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const pendingItemRef = useRef<SelectedFurnitureItem | null>(null);
  const isDraggingItemRef = useRef(false);

  // SVG DOM container reference for pointer coordinate projections
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Room spatial metrics in meters
  const roomLength = dimensions.lengthM;
  const roomWidth = dimensions.widthM;
  const isLShape = dimensions.shape === 'l_shape';

  // L-shape cutout geometry in meters (top-right alcove)
  const cutW = dimensions.lCutoutWidthM || Math.max(1.2, roomWidth * 0.35);
  const cutL = dimensions.lCutoutLengthM || Math.max(1.5, roomLength * 0.35);

  // SVG Projection Scale: 75 pixels per meter
  const baseScale = 75; // 75px per meter
  const paddingM = 1.0; // Margin in meters around room for dimension lines & door swings
  const viewWidth = (roomLength + paddingM * 2) * baseScale;
  const viewHeight = (roomWidth + paddingM * 2) * baseScale;

  // Origin coordinates of room top-left corner in SVG pixel space
  const roomOriginX = paddingM * baseScale;
  const roomOriginY = paddingM * baseScale;
  const roomPixW = roomLength * baseScale;
  const roomPixH = roomWidth * baseScale;

  // Cutout dimensions in SVG pixel space
  const cutPixW = cutL * baseScale;
  const cutPixH = cutW * baseScale;

  // Space coverage calculations: floor area vs total furniture footprint
  let roomAreaM2 = roomLength * roomWidth;
  if (isLShape) {
    roomAreaM2 -= cutW * cutL;
  }

  let occupiedM2 = 0;
  items.forEach((it) => {
    let unitArea = it.widthM * it.depthM;
    if (it.shape === 'round') {
      unitArea = Math.PI * Math.pow(it.widthM / 2, 2);
    } else if (it.shape === 'oval') {
      unitArea = Math.PI * (it.widthM / 2) * (it.depthM / 2);
    } else if (it.shape === 'l_shape') {
      unitArea = it.widthM * it.depthM * 0.65;
    }
    occupiedM2 += unitArea * it.quantity;
  });
  const coveragePercent = Math.min(
    100,
    Math.round((occupiedM2 / Math.max(1, roomAreaM2)) * 100)
  );

  /**
   * Pointer down handler on a furniture SVG group.
   * Immediately selects the item (displaying its edit menu) on simple left click.
   * Prepares the drag tracker without displacing the item until sustained movement occurs.
   */
  const handleItemPointerDown = (
    e: React.PointerEvent<SVGElement>,
    item: SelectedFurnitureItem
  ) => {
    // Only respond to primary left mouse button
    if (e.button !== 0) return;
    e.stopPropagation();

    // 1. Simple left click immediately selects item and shows toolbar
    setSelectedOpeningId(null);
    setSelectedInstanceId(item.instanceId);

    // 2. Prepare drag state, but dragging only activates on sustained press & move
    pendingItemRef.current = item;
    dragStartPosRef.current = { clientX: e.clientX, clientY: e.clientY };
    isDraggingItemRef.current = false;
    setIsDraggingItem(false);

    // Compute pointer coordinates in meters relative to room origin
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const pointerSvgX = (e.clientX - rect.left) / (rect.width / viewWidth);
      const pointerSvgY = (e.clientY - rect.top) / (rect.height / viewHeight);

      const pointerM_X = (pointerSvgX - roomOriginX) / baseScale;
      const pointerM_Y = (pointerSvgY - roomOriginY) / baseScale;

      // Store initial offset between pointer and item origin
      setDragItemOffset({
        x: pointerM_X - item.x,
        y: pointerM_Y - item.y,
      });
    }
  };

  /**
   * Pointer down handler on a door or window opening.
   * Enables dragging mode to slide the opening along walls.
   */
  const handleOpeningPointerDown = (
    e: React.PointerEvent<SVGElement>,
    opening: WallOpening
  ) => {
    e.stopPropagation();
    setSelectedInstanceId(null);
    setSelectedOpeningId(opening.id);
    setIsDraggingOpening(true);
  };

  /**
   * Global pointer move handler on the main SVG canvas.
   * Handles:
   * 1. Sliding movable doors and windows along the closest wall boundary.
   * 2. Moving furniture items after a sustained drag threshold (>= 5px) is crossed.
   * 3. Magnetic wall snapping: within 12cm (0.12m) from any wall, furniture snaps flush (0.00m).
   * 4. Enforces hard wall collision boundaries so furniture can never leave the room.
   */
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    // Convert screen client coordinates to SVG viewbox pixels
    const rect = svgRef.current.getBoundingClientRect();
    const pointerSvgX = (e.clientX - rect.left) / (rect.width / viewWidth);
    const pointerSvgY = (e.clientY - rect.top) / (rect.height / viewHeight);

    // 1. Moving a Door or Window along walls
    if (isDraggingOpening && selectedOpeningId) {
      const activeOpening = dimensions.openings.find(
        (o) => o.id === selectedOpeningId
      );
      if (!activeOpening) return;

      // Find nearest wall boundary to pointer position
      const distNorth = Math.abs(pointerSvgY - roomOriginY);
      const distSouth = Math.abs(pointerSvgY - (roomOriginY + roomPixH));
      const distWest = Math.abs(pointerSvgX - roomOriginX);
      const distEast = Math.abs(pointerSvgX - (roomOriginX + roomPixW));

      const minDist = Math.min(distNorth, distSouth, distWest, distEast);
      let targetWall: WallSide = 'north';
      if (minDist === distSouth) targetWall = 'south';
      else if (minDist === distWest) targetWall = 'west';
      else if (minDist === distEast) targetWall = 'east';

      // Compute position offset along target wall in meters
      const openingPixW = activeOpening.widthM * baseScale;
      let newPosM = 0;

      if (targetWall === 'north' || targetWall === 'south') {
        const offsetPx = pointerSvgX - roomOriginX - openingPixW / 2;
        newPosM = offsetPx / baseScale;
        newPosM = Math.max(0.1, Math.min(roomLength - activeOpening.widthM - 0.1, newPosM));
      } else {
        const offsetPx = pointerSvgY - roomOriginY - openingPixW / 2;
        newPosM = offsetPx / baseScale;
        newPosM = Math.max(0.1, Math.min(roomWidth - activeOpening.widthM - 0.1, newPosM));
      }

      onUpdateOpeningPosition(
        activeOpening.id,
        targetWall,
        Math.round(newPosM * 100) / 100
      );
      return;
    }

    // 2. Moving a Furniture Item (requires sustained press/hold past 5px threshold)
    if (pendingItemRef.current && selectedInstanceId) {
      const activeItem = items.find((i) => i.instanceId === selectedInstanceId);
      if (!activeItem) return;

      // Check drag movement threshold (5 pixels) to preserve clean single-click selection
      if (!isDraggingItemRef.current && dragStartPosRef.current) {
        const dx = e.clientX - dragStartPosRef.current.clientX;
        const dy = e.clientY - dragStartPosRef.current.clientY;
        const dist = Math.hypot(dx, dy);

        // Distinguish simple left click from sustained drag motion
        if (dist >= 5) {
          isDraggingItemRef.current = true;
          setIsDraggingItem(true);
        } else {
          return; // Still in click threshold, do not displace item
        }
      }

      if (!isDraggingItemRef.current) return;

      // Pointer coordinates in meters relative to room top-left origin
      const pointerM_X = (pointerSvgX - roomOriginX) / baseScale;
      const pointerM_Y = (pointerSvgY - roomOriginY) / baseScale;

      let newXM = pointerM_X - dragItemOffset.x;
      let newYM = pointerM_Y - dragItemOffset.y;

      // Calculate effective width & height based on current rotation
      const isRotated = activeItem.rotation === 90 || activeItem.rotation === 270;
      const itemW = isRotated ? activeItem.depthM : activeItem.widthM;
      const itemH = isRotated ? activeItem.widthM : activeItem.depthM;

      // Magnetic wall snapping: within 12cm (0.12m), snap flush against the wall so furniture touches it completely
      const snapDist = 0.12;

      // Left (West) wall contact
      if (newXM < snapDist) {
        newXM = 0;
      }
      // Right (East) wall contact
      if (newXM > roomLength - itemW - snapDist) {
        newXM = roomLength - itemW;
      }
      // Top (North / Back) wall contact
      if (newYM < snapDist) {
        newYM = 0;
      }
      // Bottom (South / Front) wall contact
      if (newYM > roomWidth - itemH - snapDist) {
        newYM = roomWidth - itemH;
      }

      // Hard room boundary limits: furniture can touch every wall (min 0) and cannot leave room
      newXM = Math.max(0, Math.min(roomLength - itemW, newXM));
      newYM = Math.max(0, Math.min(roomWidth - itemH, newYM));

      // In L-shaped rooms, handle collision with the alcove cutout corner
      if (isLShape) {
        const inCutoutX = newXM + itemW > roomLength - cutL;
        const inCutoutY = newYM < cutW;
        if (inCutoutX && inCutoutY) {
          const pushDownDist = cutW - newYM;
          const pushLeftDist = newXM + itemW - (roomLength - cutL);
          if (pushDownDist <= pushLeftDist) {
            newYM = cutW; // Snap to bottom edge of cutout
          } else {
            newXM = Math.max(0, roomLength - cutL - itemW); // Snap to left edge of cutout
          }
        }
      }

      onUpdateItemPosition(
        activeItem.instanceId,
        Math.round(newXM * 100) / 100,
        Math.round(newYM * 100) / 100,
        activeItem.rotation
      );
    }
  };

  /**
   * Pointer up handler: ends dragging sessions and resets gesture trackers.
   */
  const handlePointerUp = () => {
    pendingItemRef.current = null;
    dragStartPosRef.current = null;
    isDraggingItemRef.current = false;
    setIsDraggingItem(false);
    setIsDraggingOpening(false);
  };

  /**
   * Rotates a furniture item 90 degrees clockwise about its geometric center.
   * Calculates new bounding box width/depth, checks wall contacts, and clamps within boundaries.
   */
  const handleRotateItem = (instanceId: string) => {
    const item = items.find((i) => i.instanceId === instanceId);
    if (!item) return;

    // Calculate current geometric center in meters
    const currIsRot = item.rotation === 90 || item.rotation === 270;
    const currW = currIsRot ? item.depthM : item.widthM;
    const currH = currIsRot ? item.widthM : item.depthM;
    const centerXM = item.x + currW / 2;
    const centerYM = item.y + currH / 2;

    // Next rotation angle (0 -> 90 -> 180 -> 270 -> 0)
    const nextRot = (item.rotation + 90) % 360;
    const nextIsRot = nextRot === 90 || nextRot === 270;
    const nextW = nextIsRot ? item.depthM : item.widthM;
    const nextH = nextIsRot ? item.widthM : item.depthM;

    let newX = centerXM - nextW / 2;
    let newY = centerYM - nextH / 2;

    // Snap to wall if rotation puts item within 10cm of a boundary
    if (newX < 0.10) newX = 0;
    if (newY < 0.10) newY = 0;
    if (newX > roomLength - nextW - 0.10) newX = roomLength - nextW;
    if (newY > roomWidth - nextH - 0.10) newY = roomWidth - nextH;

    // Strictly clamp within room boundaries
    newX = Math.max(0, Math.min(roomLength - nextW, newX));
    newY = Math.max(0, Math.min(roomWidth - nextH, newY));

    onUpdateItemPosition(
      instanceId,
      Math.round(newX * 100) / 100,
      Math.round(newY * 100) / 100,
      nextRot
    );
  };

  const activeItem = items.find((i) => i.instanceId === selectedInstanceId);
  const activeOpening = dimensions.openings.find(
    (o) => o.id === selectedOpeningId
  );

  // SVG Path for L-shaped room
  const lRoomPath = `
    M ${roomOriginX} ${roomOriginY}
    H ${roomOriginX + roomPixW - cutPixW}
    V ${roomOriginY + cutPixH}
    H ${roomOriginX + roomPixW}
    V ${roomOriginY + roomPixH}
    H ${roomOriginX}
    Z
  `;

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div>
          <h3 className="text-base font-bold text-stone-900 font-serif">
            2. Room Layout Preview & Movable Openings
          </h3>
          <p className="text-xs text-stone-500">
            Click & drag any door or window to position it anywhere along any wall
          </p>
        </div>

        {/* Space Coverage Bar */}
        <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg text-xs">
          <span className="text-stone-500 font-medium">Space Coverage:</span>
          <span className="font-bold text-stone-900 font-mono">
            {coveragePercent}% ({occupiedM2.toFixed(1)} / {roomAreaM2.toFixed(1)} m²)
          </span>
          <div className="w-16 h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                coveragePercent <= 40
                  ? 'bg-emerald-500'
                  : coveragePercent <= 60
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, coveragePercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAutoArrange}
            disabled={items.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-stone-800 font-medium hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Auto-Arrange Layout</span>
          </button>

          {/* Quick Add Opening Shortcuts */}
          <div className="hidden sm:flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-[11px]">
            <button
              type="button"
              onClick={() => onAddOpening('door')}
              className="px-2 py-1 rounded bg-white font-medium text-stone-700 hover:bg-stone-50 shadow-xs"
            >
              + Door
            </button>
            <button
              type="button"
              onClick={() => onAddOpening('window')}
              className="px-2 py-1 rounded bg-white font-medium text-stone-700 hover:bg-stone-50 shadow-xs"
            >
              + Window
            </button>
            <button
              type="button"
              onClick={() => onAddOpening('balcony_door')}
              className="px-2 py-1 rounded bg-white font-medium text-stone-700 hover:bg-stone-50 shadow-xs"
            >
              + Balcony
            </button>
          </div>

          {/* Active Furniture Item Controls */}
          {activeItem && (
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg border border-stone-200">
              <span className="text-[11px] font-bold text-stone-800 px-1 truncate max-w-[140px]">
                {activeItem.name}
              </span>
              <button
                type="button"
                onClick={() => handleRotateItem(activeItem.instanceId)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-white text-stone-800 shadow-xs hover:bg-stone-50 border border-stone-200/70"
                title="Rotate 90 degrees"
              >
                <RotateCw className="w-3 h-3 text-stone-600" />
                <span className="text-[11px] font-medium">Rotate 90°</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onRemoveItem(activeItem.instanceId);
                  setSelectedInstanceId(null);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded bg-white text-rose-600 shadow-xs hover:bg-rose-50 border border-stone-200/70"
                title="Remove Item"
              >
                <Trash2 className="w-3 h-3 text-rose-500" />
                <span className="text-[11px] font-medium">Remove</span>
              </button>
            </div>
          )}

          {/* Active Opening (Door/Window) Toolbar Controls */}
          {activeOpening && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 p-1 rounded-lg">
              <span className="text-[11px] font-bold text-amber-900 uppercase px-1">
                {activeOpening.type.replace('_', ' ')}:
              </span>

              {/* Move to other walls buttons */}
              {(['north', 'south', 'west', 'east'] as WallSide[]).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() =>
                    onUpdateOpeningPosition(activeOpening.id, w, activeOpening.positionM)
                  }
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    activeOpening.wall === w
                      ? 'bg-amber-900 text-white'
                      : 'bg-white text-stone-700 hover:bg-amber-100'
                  }`}
                >
                  {w[0]}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  onRemoveOpening(activeOpening.id);
                  setSelectedOpeningId(null);
                }}
                className="p-1 text-rose-600 hover:bg-rose-100 rounded"
                title="Delete opening"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <span className="text-[11px] text-stone-400">
          * Drag doors & windows along walls to position
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="border border-stone-200 rounded-xl bg-stone-50/80 overflow-hidden flex items-center justify-center min-h-[360px] p-4 select-none relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className="w-full max-h-[480px] touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={() => {
            setSelectedInstanceId(null);
            setSelectedOpeningId(null);
          }}
        >
          {/* Grid Pattern inside Room */}
          <defs>
            <pattern
              id="clean-grid"
              width={baseScale * 0.5}
              height={baseScale * 0.5}
              patternUnits="userSpaceOnUse"
            >
              <rect
                width={baseScale * 0.5}
                height={baseScale * 0.5}
                fill="#ffffff"
              />
              <path
                d={`M ${baseScale * 0.5} 0 L 0 0 0 ${baseScale * 0.5}`}
                fill="none"
                stroke="#eeebe6"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {/* Room Interior Fill */}
          {!isLShape ? (
            <rect
              x={roomOriginX}
              y={roomOriginY}
              width={roomPixW}
              height={roomPixH}
              fill="url(#clean-grid)"
            />
          ) : (
            <path d={lRoomPath} fill="url(#clean-grid)" />
          )}

          {/* Room Outer Wall Line */}
          {!isLShape ? (
            <rect
              x={roomOriginX}
              y={roomOriginY}
              width={roomPixW}
              height={roomPixH}
              fill="none"
              stroke="#292524"
              strokeWidth="4"
            />
          ) : (
            <path
              d={lRoomPath}
              fill="none"
              stroke="#292524"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          )}

          {/* Wall Cardinal Compass Labels */}
          <text
            x={roomOriginX + roomPixW / 2}
            y={roomOriginY - 26}
            textAnchor="middle"
            className="text-[9px] font-bold fill-stone-400 uppercase tracking-widest pointer-events-none"
          >
            North Wall (Top)
          </text>
          <text
            x={roomOriginX + roomPixW / 2}
            y={roomOriginY + roomPixH + 32}
            textAnchor="middle"
            className="text-[9px] font-bold fill-stone-400 uppercase tracking-widest pointer-events-none"
          >
            South Wall (Bottom)
          </text>
          <text
            x={roomOriginX - 32}
            y={roomOriginY + roomPixH / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${roomOriginX - 32} ${roomOriginY + roomPixH / 2})`}
            className="text-[9px] font-bold fill-stone-400 uppercase tracking-widest pointer-events-none"
          >
            West Wall (Left)
          </text>
          <text
            x={roomOriginX + roomPixW + 32}
            y={roomOriginY + roomPixH / 2}
            textAnchor="middle"
            transform={`rotate(90 ${roomOriginX + roomPixW + 32} ${roomOriginY + roomPixH / 2})`}
            className="text-[9px] font-bold fill-stone-400 uppercase tracking-widest pointer-events-none"
          >
            East Wall (Right)
          </text>

          {/* Dimension Label: Top Length */}
          <g>
            <line
              x1={roomOriginX}
              y1={roomOriginY - 14}
              x2={roomOriginX + roomPixW}
              y2={roomOriginY - 14}
              stroke="#78716c"
              strokeWidth="1.5"
            />
            <rect
              x={roomOriginX + roomPixW / 2 - 32}
              y={roomOriginY - 22}
              width="64"
              height="16"
              fill="#ffffff"
              rx="3"
            />
            <text
              x={roomOriginX + roomPixW / 2}
              y={roomOriginY - 10}
              textAnchor="middle"
              className="text-[10px] font-mono font-bold fill-stone-800"
            >
              {formatDim(roomLength, dimensions.unitSystem)}
            </text>
          </g>

          {/* Dimension Label: Left Width */}
          <g>
            <line
              x1={roomOriginX - 14}
              y1={roomOriginY}
              x2={roomOriginX - 14}
              y2={roomOriginY + roomPixH}
              stroke="#78716c"
              strokeWidth="1.5"
            />
            <rect
              x={roomOriginX - 44}
              y={roomOriginY + roomPixH / 2 - 8}
              width="60"
              height="16"
              fill="#ffffff"
              rx="3"
            />
            <text
              x={roomOriginX - 14}
              y={roomOriginY + roomPixH / 2 + 4}
              textAnchor="middle"
              className="text-[10px] font-mono font-bold fill-stone-800"
            >
              {formatDim(roomWidth, dimensions.unitSystem)}
            </text>
          </g>

          {/* Room Center Watermark Label */}
          <text
            x={roomOriginX + (isLShape ? (roomPixW - cutPixW / 2) / 2 : roomPixW / 2)}
            y={roomOriginY + roomPixH / 2}
            textAnchor="middle"
            className="text-lg font-serif font-bold fill-stone-300 pointer-events-none select-none uppercase tracking-widest"
          >
            {dimensions.roomName} ({roomAreaM2.toFixed(1)} m²)
          </text>

          {/* ============================================================ */}
          {/* MOVABLE WALL OPENINGS (DOORS, WINDOWS, BALCONY DOORS)       */}
          {/* ============================================================ */}
          {dimensions.openings.map((opening) => {
            const isSelected = opening.id === selectedOpeningId;
            const opPixW = opening.widthM * baseScale;
            const posPx = opening.positionM * baseScale;

            // Determine wall coordinates & transform angle
            let originX = 0;
            let originY = 0;
            let rotAngle = 0;

            if (opening.wall === 'north') {
              originX = roomOriginX + posPx;
              originY = roomOriginY;
              rotAngle = 0;
            } else if (opening.wall === 'south') {
              originX = roomOriginX + posPx;
              originY = roomOriginY + roomPixH;
              rotAngle = 180;
            } else if (opening.wall === 'west') {
              originX = roomOriginX;
              originY = roomOriginY + posPx;
              rotAngle = -90;
            } else if (opening.wall === 'east') {
              originX = roomOriginX + roomPixW;
              originY = roomOriginY + posPx;
              rotAngle = 90;
            }

            return (
              <g
                key={opening.id}
                transform={`translate(${originX}, ${originY}) rotate(${rotAngle})`}
                onPointerDown={(e) => handleOpeningPointerDown(e, opening)}
                className="cursor-move group"
              >
                {/* 1. INTERIOR SWING DOOR */}
                {opening.type === 'door' && (
                  <g>
                    {/* Opening Cutout in Wall */}
                    <rect x="0" y="-3" width={opPixW} height="6" fill="#faf8f5" />
                    {/* Door Leaf */}
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2={opPixW}
                      stroke="#44403c"
                      strokeWidth="2.5"
                    />
                    {/* Swing Trajectory Arc (towards interior) */}
                    <path
                      d={`M 0 ${opPixW} A ${opPixW} ${opPixW} 0 0 0 ${opPixW} 0`}
                      fill="none"
                      stroke="#a8a29e"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    {/* Grab handle badge */}
                    <rect
                      x="0"
                      y="-7"
                      width={opPixW}
                      height="14"
                      fill={isSelected ? '#0284c7' : 'rgba(41,37,36,0.1)'}
                      rx="3"
                      className="transition-colors group-hover:fill-sky-400/30"
                    />
                    <text
                      x={opPixW / 2}
                      y="-10"
                      textAnchor="middle"
                      className="text-[8px] font-bold fill-stone-700 uppercase"
                    >
                      Door ({formatDim(opening.positionM, dimensions.unitSystem)})
                    </text>
                  </g>
                )}

                {/* 2. STANDARD WINDOW */}
                {opening.type === 'window' && (
                  <g>
                    {/* Double-line architectural glass symbol */}
                    <rect
                      x="0"
                      y="-5"
                      width={opPixW}
                      height="10"
                      fill="#ffffff"
                      stroke={isSelected ? '#0284c7' : '#0369a1'}
                      strokeWidth={isSelected ? 2 : 1.5}
                      rx="1"
                    />
                    <line
                      x1="0"
                      y1="0"
                      x2={opPixW}
                      y2="0"
                      stroke={isSelected ? '#0284c7' : '#0369a1'}
                      strokeWidth="1.5"
                    />
                    <text
                      x={opPixW / 2}
                      y="-8"
                      textAnchor="middle"
                      className="text-[8px] font-bold fill-sky-800 uppercase"
                    >
                      Window ({formatDim(opening.positionM, dimensions.unitSystem)})
                    </text>
                  </g>
                )}

                {/* 3. BALCONY / PATIO SLIDING DOUBLE DOOR */}
                {opening.type === 'balcony_door' && (
                  <g>
                    {/* Wide double sliding track */}
                    <rect
                      x="0"
                      y="-6"
                      width={opPixW}
                      height="12"
                      fill="#ffffff"
                      stroke={isSelected ? '#0284c7' : '#0f766e'}
                      strokeWidth={isSelected ? 2 : 1.5}
                      rx="1"
                    />
                    <line
                      x1="0"
                      y1="-2"
                      x2={opPixW * 0.55}
                      y2="-2"
                      stroke="#0f766e"
                      strokeWidth="1.8"
                    />
                    <line
                      x1={opPixW * 0.45}
                      y1="2"
                      x2={opPixW}
                      y2="2"
                      stroke="#0f766e"
                      strokeWidth="1.8"
                    />
                    <text
                      x={opPixW / 2}
                      y="-9"
                      textAnchor="middle"
                      className="text-[8px] font-bold fill-teal-800 uppercase"
                    >
                      Balcony ({formatDim(opening.positionM, dimensions.unitSystem)})
                    </text>
                  </g>
                )}

                {/* Selection Highlight Ring */}
                {isSelected && (
                  <rect
                    x="-4"
                    y="-10"
                    width={opPixW + 8}
                    height="20"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                    rx="4"
                  />
                )}
              </g>
            );
          })}

          {/* ============================================================ */}
          {/* PLACED FURNITURE ITEMS (WITH SHAPES: RECT, L-SHAPE, ROUND, OVAL) */}
          {/* ============================================================ */}
          {items.map((item) => {
            const isSelected = item.instanceId === selectedInstanceId;
            const isRotated = item.rotation === 90 || item.rotation === 270;
            const visualWM = isRotated ? item.depthM : item.widthM;
            const visualHM = isRotated ? item.widthM : item.depthM;

            const centerXM = item.x + visualWM / 2;
            const centerYM = item.y + visualHM / 2;

            const itemPixW = item.widthM * baseScale;
            const itemPixH = item.depthM * baseScale;
            const centerPixX = roomOriginX + centerXM * baseScale;
            const centerPixY = roomOriginY + centerYM * baseScale;

            const isRug = item.category === 'accents';
            const fillColor = isRug
              ? '#f5f5f4'
              : item.tier === 'luxury'
              ? '#3f3c39'
              : item.tier === 'standard'
              ? '#6b635b'
              : '#8c827a';

            const strokeColor = isSelected
              ? '#0284c7'
              : isRug
              ? '#a8a29e'
              : '#292524';

            return (
              <g
                key={item.instanceId}
                transform={`translate(${centerPixX}, ${centerPixY}) rotate(${item.rotation}) translate(${-itemPixW / 2}, ${-itemPixH / 2})`}
                onPointerDown={(e) => handleItemPointerDown(e, item)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOpeningId(null);
                  setSelectedInstanceId(item.instanceId);
                }}
                className={`group ${
                  isDraggingItem && selectedInstanceId === item.instanceId
                    ? 'cursor-grabbing'
                    : 'cursor-pointer hover:opacity-95'
                }`}
              >
                {/* 1. L-SHAPED CORNER SOFA */}
                {item.shape === 'l_shape' && (
                  <g>
                    {/* Shadow */}
                    <path
                      d={`
                        M 2 2
                        H ${itemPixW + 2}
                        V ${itemPixH * 0.45 + 2}
                        H ${itemPixW * 0.45 + 2}
                        V ${itemPixH + 2}
                        H 2
                        Z
                      `}
                      fill="rgba(0,0,0,0.06)"
                    />
                    {/* Main L-Shape Body */}
                    <path
                      d={`
                        M 0 0
                        H ${itemPixW}
                        V ${itemPixH * 0.45}
                        H ${itemPixW * 0.45}
                        V ${itemPixH}
                        H 0
                        Z
                      `}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeLinejoin="round"
                    />
                    {/* Inner Cushion Division */}
                    <path
                      d={`
                        M 3 3
                        H ${itemPixW - 3}
                        V ${itemPixH * 0.45 - 3}
                        H ${itemPixW * 0.45 - 3}
                        V ${itemPixH - 3}
                        H 3
                        Z
                      `}
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1"
                    />
                  </g>
                )}

                {/* 2. ROUND / CIRCULAR FURNITURE */}
                {item.shape === 'round' && (
                  <g>
                    {/* Shadow */}
                    <ellipse
                      cx={itemPixW / 2 + 2}
                      cy={itemPixH / 2 + 2}
                      rx={itemPixW / 2}
                      ry={itemPixH / 2}
                      fill="rgba(0,0,0,0.06)"
                    />
                    {/* Circle Body */}
                    <ellipse
                      cx={itemPixW / 2}
                      cy={itemPixH / 2}
                      rx={itemPixW / 2}
                      ry={itemPixH / 2}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeDasharray={isRug ? '4 3' : 'none'}
                    />
                    {!isRug && (
                      <ellipse
                        cx={itemPixW / 2}
                        cy={itemPixH / 2}
                        rx={Math.max(2, itemPixW / 2 - 3)}
                        ry={Math.max(2, itemPixH / 2 - 3)}
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1"
                      />
                    )}
                  </g>
                )}

                {/* 3. OVAL FURNITURE */}
                {item.shape === 'oval' && (
                  <g>
                    {/* Shadow */}
                    <ellipse
                      cx={itemPixW / 2 + 2}
                      cy={itemPixH / 2 + 2}
                      rx={itemPixW / 2}
                      ry={itemPixH / 2}
                      fill="rgba(0,0,0,0.06)"
                    />
                    {/* Oval Body */}
                    <ellipse
                      cx={itemPixW / 2}
                      cy={itemPixH / 2}
                      rx={itemPixW / 2}
                      ry={itemPixH / 2}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeDasharray={isRug ? '4 3' : 'none'}
                    />
                    {!isRug && (
                      <ellipse
                        cx={itemPixW / 2}
                        cy={itemPixH / 2}
                        rx={Math.max(2, itemPixW / 2 - 3)}
                        ry={Math.max(2, itemPixH / 2 - 3)}
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1"
                      />
                    )}
                  </g>
                )}

                {/* 4. RECTANGULAR FURNITURE (STANDARD) */}
                {item.shape === 'rect' && (
                  <g>
                    {/* Shadow */}
                    <rect
                      x="2"
                      y="2"
                      width={itemPixW}
                      height={itemPixH}
                      rx="3"
                      fill="rgba(0,0,0,0.06)"
                    />
                    {/* Rect Body */}
                    <rect
                      x="0"
                      y="0"
                      width={itemPixW}
                      height={itemPixH}
                      rx="3"
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeDasharray={isRug ? '4 3' : 'none'}
                    />
                    {!isRug && (
                      <rect
                        x="3"
                        y="3"
                        width={Math.max(0, itemPixW - 6)}
                        height={Math.max(0, itemPixH - 6)}
                        rx="1"
                        fill="none"
                        stroke="rgba(255,255,255,0.18)"
                        strokeWidth="1"
                      />
                    )}
                  </g>
                )}

                {/* Text Label: Name */}
                <text
                  x={item.shape === 'l_shape' ? itemPixW * 0.35 : itemPixW / 2}
                  y={itemPixH / 2 - 3}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-[9.5px] font-bold select-none pointer-events-none ${
                    isRug ? 'fill-stone-700' : 'fill-white'
                  }`}
                >
                  {item.name.length > 20 ? `${item.name.substring(0, 18)}…` : item.name}
                </text>

                {/* Text Label: Dimensions */}
                <text
                  x={item.shape === 'l_shape' ? itemPixW * 0.35 : itemPixW / 2}
                  y={itemPixH / 2 + 9}
                  textAnchor="middle"
                  className={`text-[8px] font-mono select-none pointer-events-none ${
                    isRug ? 'fill-stone-500' : 'fill-stone-200'
                  }`}
                >
                  {formatDim(item.widthM, dimensions.unitSystem)} ×{' '}
                  {formatDim(item.depthM, dimensions.unitSystem)}
                </text>

                {/* Selection Highlight Ring */}
                {isSelected && (
                  <rect
                    x="-2"
                    y="-2"
                    width={itemPixW + 4}
                    height={itemPixH + 4}
                    rx="5"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {items.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50/70 p-4 text-center pointer-events-none">
            <LayoutGrid className="w-8 h-8 text-stone-300 mb-1.5" />
            <p className="text-sm font-semibold text-stone-700">
              No furniture added yet
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              Select items from the catalog below to place them in the room
            </p>
          </div>
        )}
      </div>

      {/* Real-time Position & Wall Contact Status Bar */}
      {activeItem && (() => {
        const isRot = activeItem.rotation === 90 || activeItem.rotation === 270;
        const itW = isRot ? activeItem.depthM : activeItem.widthM;
        const itH = isRot ? activeItem.widthM : activeItem.depthM;

        const touchingWalls: string[] = [];
        if (activeItem.y <= 0.01) touchingWalls.push('Top/Back Wall (North)');
        if (Math.abs(activeItem.y - (roomWidth - itH)) <= 0.01) touchingWalls.push('Bottom/Front Wall (South)');
        if (activeItem.x <= 0.01) touchingWalls.push('Left Wall (West)');
        if (Math.abs(activeItem.x - (roomLength - itW)) <= 0.01) touchingWalls.push('Right Wall (East)');

        return (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs">
            <div className="flex items-center gap-2 text-stone-700">
              <span className="font-semibold">{activeItem.name}:</span>
              <span className="font-mono text-stone-500">
                X: {activeItem.x.toFixed(2)}m (from left) | Y: {activeItem.y.toFixed(2)}m (from back wall)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {touchingWalls.length > 0 ? (
                touchingWalls.map((wall) => (
                  <span
                    key={wall}
                    className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[11px] flex items-center gap-1 border border-emerald-300/60"
                  >
                    ✓ Touching {wall}
                  </span>
                ))
              ) : (
                <span className="text-stone-400 text-[11px]">
                  Drag against any wall to snap flush (0.00m distance)
                </span>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
