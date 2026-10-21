/**
 * ============================================================================
 * FURNITURE CATALOG & ROOM PRESETS REPOSITORY
 * ============================================================================
 * Contains preconfigured architectural room presets (dimensions, default ratios)
 * and the complete curated catalog of furniture pieces spanning seating, tables,
 * storage, beds, workstations, and accents across multiple geometric silhouettes
 * (rectangles, L-shapes, circles, and ovals).
 */

import { CatalogItem, RoomType } from '../types';

/**
 * Standard architectural room presets.
 * Used when switching room types to provide realistic initial room dimensions.
 */
export const ROOM_PRESETS: {
  type: RoomType;
  label: string;
  defaultLengthM: number;
  defaultWidthM: number;
}[] = [
  {
    type: 'living_room',
    label: 'Living Room',
    defaultLengthM: 5.5,
    defaultWidthM: 4.2,
  },
  {
    type: 'bedroom',
    label: 'Bedroom',
    defaultLengthM: 4.5,
    defaultWidthM: 3.8,
  },
  {
    type: 'dining_room',
    label: 'Dining Room',
    defaultLengthM: 4.5,
    defaultWidthM: 3.5,
  },
  {
    type: 'office',
    label: 'Home Office',
    defaultLengthM: 3.8,
    defaultWidthM: 3.2,
  },
  {
    type: 'studio',
    label: 'Studio Apartment',
    defaultLengthM: 6.5,
    defaultWidthM: 4.5,
  },
];

/**
 * Master catalog of interior furniture items.
 * Each item specifies real-world dimensions in meters, geometric silhouette shape
 * (rectangle, L-shape, circle, oval), recommended room categories, and tiered pricing.
 */
export const FURNITURE_CATALOG: CatalogItem[] = [
  // --- SEATING ---
  {
    id: 'sofa-sectional',
    name: 'Corner Sectional Sofa (L-Shape)',
    category: 'seating',
    shape: 'l_shape',
    roomTypes: ['living_room', 'studio'],
    widthM: 2.8,
    depthM: 2.0,
    description: 'L-shaped modular sectional sofa with right/left chaise arrangement.',
    prices: { budget: 780, standard: 1480, luxury: 2950 },
    defaultTier: 'standard',
  },
  {
    id: 'sofa-3seat',
    name: '3-Seater Sofa',
    category: 'seating',
    shape: 'rect',
    roomTypes: ['living_room', 'office', 'studio'],
    widthM: 2.2,
    depthM: 0.95,
    description: 'Comfortable 3-seater linear sofa with durable upholstery fabric.',
    prices: { budget: 450, standard: 850, luxury: 1650 },
    defaultTier: 'standard',
  },
  {
    id: 'sofa-2seat',
    name: '2-Seater Sofa',
    category: 'seating',
    shape: 'rect',
    roomTypes: ['living_room', 'office', 'studio'],
    widthM: 1.7,
    depthM: 0.9,
    description: 'Compact 2-seater sofa ideal for smaller living rooms or offices.',
    prices: { budget: 320, standard: 620, luxury: 1200 },
    defaultTier: 'standard',
  },
  {
    id: 'armchair',
    name: 'Accent Armchair',
    category: 'seating',
    shape: 'rect',
    roomTypes: ['living_room', 'bedroom', 'office'],
    widthM: 0.85,
    depthM: 0.85,
    description: 'Comfortable accent armchair with supportive back cushioning.',
    prices: { budget: 180, standard: 380, luxury: 750 },
    defaultTier: 'standard',
  },
  {
    id: 'pouf-round',
    name: 'Round Ottoman Pouf',
    category: 'seating',
    shape: 'round',
    roomTypes: ['living_room', 'bedroom'],
    widthM: 0.65,
    depthM: 0.65,
    description: 'Circular upholstered footstool pouf for relaxed seating.',
    prices: { budget: 65, standard: 145, luxury: 320 },
    defaultTier: 'standard',
  },

  // --- TABLES ---
  {
    id: 'coffee-table-round',
    name: 'Round Coffee Table',
    category: 'tables',
    shape: 'round',
    roomTypes: ['living_room', 'studio'],
    widthM: 0.95,
    depthM: 0.95,
    description: 'Circular wooden coffee table with chamfered edge and slim legs.',
    prices: { budget: 110, standard: 260, luxury: 620 },
    defaultTier: 'standard',
  },
  {
    id: 'coffee-table',
    name: 'Rectangular Coffee Table',
    category: 'tables',
    shape: 'rect',
    roomTypes: ['living_room', 'studio'],
    widthM: 1.2,
    depthM: 0.65,
    description: 'Rectangular low coffee table with storage shelf.',
    prices: { budget: 90, standard: 240, luxury: 580 },
    defaultTier: 'standard',
  },
  {
    id: 'dining-table-round',
    name: 'Round Dining Table (Seats 4)',
    category: 'tables',
    shape: 'round',
    roomTypes: ['dining_room', 'living_room'],
    widthM: 1.3,
    depthM: 1.3,
    description: 'Pedestal round dining table promoting easy conversation.',
    prices: { budget: 260, standard: 590, luxury: 1350 },
    defaultTier: 'standard',
  },
  {
    id: 'dining-table-oval',
    name: 'Oval Dining Table (Seats 6-8)',
    category: 'tables',
    shape: 'oval',
    roomTypes: ['dining_room', 'living_room'],
    widthM: 2.0,
    depthM: 1.05,
    description: 'Sculptural oval dining table with softened organic geometry.',
    prices: { budget: 360, standard: 790, luxury: 1850 },
    defaultTier: 'standard',
  },
  {
    id: 'dining-table',
    name: 'Rectangular Dining Table (Seats 6)',
    category: 'tables',
    shape: 'rect',
    roomTypes: ['dining_room', 'living_room'],
    widthM: 1.8,
    depthM: 0.9,
    description: 'Solid rectangular dining table comfortably seating 6 people.',
    prices: { budget: 280, standard: 650, luxury: 1450 },
    defaultTier: 'standard',
  },
  {
    id: 'dining-chairs',
    name: 'Dining Chairs (Set of 4)',
    category: 'seating',
    shape: 'rect',
    roomTypes: ['dining_room', 'living_room'],
    widthM: 1.6,
    depthM: 0.5,
    description: 'Set of 4 matching padded dining chairs footprint.',
    prices: { budget: 160, standard: 380, luxury: 800 },
    defaultTier: 'standard',
  },
  {
    id: 'side-table',
    name: 'Side Table',
    category: 'tables',
    shape: 'rect',
    roomTypes: ['living_room', 'bedroom'],
    widthM: 0.5,
    depthM: 0.5,
    description: 'Small rectangular end table for lamps and books.',
    prices: { budget: 45, standard: 110, luxury: 250 },
    defaultTier: 'standard',
  },

  // --- STORAGE ---
  {
    id: 'tv-unit',
    name: 'TV Media Console',
    category: 'storage',
    shape: 'rect',
    roomTypes: ['living_room', 'bedroom', 'studio'],
    widthM: 1.8,
    depthM: 0.45,
    description: 'Low TV media console with shelving and cord management.',
    prices: { budget: 150, standard: 390, luxury: 890 },
    defaultTier: 'standard',
  },
  {
    id: 'bookcase',
    name: 'Tall Bookcase',
    category: 'storage',
    shape: 'rect',
    roomTypes: ['living_room', 'office', 'bedroom'],
    widthM: 1.0,
    depthM: 0.38,
    description: 'Tall open-shelf bookcase for books and home decor.',
    prices: { budget: 110, standard: 280, luxury: 690 },
    defaultTier: 'standard',
  },
  {
    id: 'wardrobe',
    name: '3-Door Wardrobe',
    category: 'storage',
    shape: 'rect',
    roomTypes: ['bedroom', 'studio'],
    widthM: 1.8,
    depthM: 0.6,
    description: 'Spacious rectangular wardrobe with clothes hanging rail and shelves.',
    prices: { budget: 350, standard: 750, luxury: 1600 },
    defaultTier: 'standard',
  },
  {
    id: 'dresser',
    name: 'Chest of Drawers',
    category: 'storage',
    shape: 'rect',
    roomTypes: ['bedroom', 'living_room'],
    widthM: 1.2,
    depthM: 0.5,
    description: '4-drawer wide storage chest for clothes and linens.',
    prices: { budget: 160, standard: 380, luxury: 780 },
    defaultTier: 'standard',
  },

  // --- BEDS ---
  {
    id: 'bed-double',
    name: 'Double Bed (160×200 cm)',
    category: 'beds',
    shape: 'rect',
    roomTypes: ['bedroom', 'studio'],
    widthM: 1.7,
    depthM: 2.1,
    description: 'Double platform bed frame with integrated upholstered headboard.',
    prices: { budget: 320, standard: 720, luxury: 1500 },
    defaultTier: 'standard',
  },
  {
    id: 'nightstands',
    name: 'Nightstands (Pair of 2)',
    category: 'storage',
    shape: 'rect',
    roomTypes: ['bedroom'],
    widthM: 1.1,
    depthM: 0.42,
    description: 'Pair of matching rectangular bedside tables.',
    prices: { budget: 90, standard: 220, luxury: 480 },
    defaultTier: 'standard',
  },

  // --- WORKSPACE ---
  {
    id: 'desk-office',
    name: 'Office Desk',
    category: 'workspace',
    shape: 'rect',
    roomTypes: ['office', 'bedroom', 'studio'],
    widthM: 1.4,
    depthM: 0.7,
    description: 'Sturdy rectangular workstation desk with cable management port.',
    prices: { budget: 140, standard: 350, luxury: 790 },
    defaultTier: 'standard',
  },
  {
    id: 'office-chair',
    name: 'Ergonomic Office Chair',
    category: 'seating',
    shape: 'round',
    roomTypes: ['office', 'bedroom'],
    widthM: 0.65,
    depthM: 0.65,
    description: 'Swivel task chair with pneumatic height adjustment and lumbar support.',
    prices: { budget: 95, standard: 240, luxury: 580 },
    defaultTier: 'standard',
  },

  // --- ACCENTS ---
  {
    id: 'rug-large',
    name: 'Large Area Rug (200×290 cm)',
    category: 'accents',
    shape: 'rect',
    roomTypes: ['living_room', 'bedroom', 'dining_room'],
    widthM: 2.9,
    depthM: 2.0,
    description: 'Rectangular textured woven floor rug to ground the seating zone.',
    prices: { budget: 120, standard: 290, luxury: 680 },
    defaultTier: 'standard',
  },
  {
    id: 'rug-oval',
    name: 'Oval Accent Rug (170×260 cm)',
    category: 'accents',
    shape: 'oval',
    roomTypes: ['living_room', 'bedroom', 'dining_room'],
    widthM: 2.6,
    depthM: 1.7,
    description: 'Curved oval floor rug softening corners and geometric lines.',
    prices: { budget: 130, standard: 310, luxury: 720 },
    defaultTier: 'standard',
  },
];
