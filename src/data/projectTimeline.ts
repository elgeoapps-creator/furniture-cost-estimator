/**
 * ============================================================================
 * PROJECT DEVELOPMENT ROADMAP & BUDGET SPECIFICATION
 * ============================================================================
 * Outlines the tailored project packages, phased software implementation
 * roadmap, milestone payment schedules, and commercial cost estimates
 * presented in the Timeline & Dev Cost modal.
 *
 * Provides realistic pricing tiers tailored for client negotiations:
 * - Starter MVP Tier ($190): Basic room calculator & static catalog
 * - Full Interactive 2D Suite ($490 - Recommended): Real-time canvas,
 *   drag-and-drop physics, snap-to-wall, touch support, multi-currency & PDF quotes
 * - Enterprise Tier ($890): Custom architectural elements, corporate branding,
 *   database sync & warranty
 */

import { TimelinePhase, ProposalPackage } from '../types';

/**
 * Three distinct commercial package tiers for client proposal negotiation.
 * Enables clear value differentiation against low-ball fixed price offers.
 */
export const PROPOSAL_PACKAGES: ProposalPackage[] = [
  {
    id: 'starter',
    name: 'Starter MVP',
    tagline: 'Basic Room Calculator & Static Catalog',
    price: 190,
    duration: '3 - 5 Days',
    recommendedFor: 'Clients with limited budget needing room calculations without interactive CAD manipulation.',
    features: [
      'Room dimensions inputs (Length × Width with metric/imperial units)',
      'Automated room surface area calculation (m² / sq ft)',
      'Curated furniture catalog with category filters',
      'Basic cost breakdown and summary printout',
    ],
    excluded: [
      'Interactive 2D Drag & Drop Canvas',
      'Intelligent Snap-to-Wall physics',
      'Multi-currency switching (EUR, USD, GBP, AUD)',
      'Touch drag & drop mobile optimization',
      'Saved quote history drawer',
    ],
  },
  {
    id: 'interactive',
    name: 'Full Interactive 2D Suite',
    tagline: 'Complete 2D Canvas Planner & Live Cost Estimator',
    price: 490,
    duration: '1.5 - 2 Weeks',
    badge: 'Recommended · Best Value',
    recommendedFor: 'Turn-key delivery of the complete production-grade application shown in this demo.',
    features: [
      'Interactive 2D Floor Plan with live rectangular bounding boxes',
      'Smooth mouse & touch drag-and-drop with long-press gesture support',
      'Intelligent Snap-to-Wall physics & boundary constraint engine',
      'Full 90° item rotation and real-time footprint recalculation',
      'Dynamic multi-currency switching: EUR (€), USD ($), GBP (£), AUD (A$)',
      'Live Bill of Materials: subtotal, delivery, assembly, discount & VAT',
      'Branded client quote generator with instant PDF/Print export',
      'Persistent local quote saving, loading, and deletion management',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Commercial Suite',
    tagline: 'Architectural Elements & White-Label Integration',
    price: 890,
    duration: '2 - 3 Weeks',
    recommendedFor: 'Furniture manufacturers, architectural studios & showrooms requiring custom white-labeling.',
    features: [
      'All features included in the Full Interactive 2D Suite ($490)',
      'Custom corporate branding, logos, color palette & typography',
      'Architectural elements: custom door swings, windows, wall cutouts',
      'Custom catalog integration: JSON / API importer for client product lines',
      'Cloud database synchronization for multi-user quote storage',
      '30-Day dedicated priority bug warranty and technical hand-off support',
    ],
  },
];

/**
 * Sequential development phases, deliverables, and costs for the recommended
 * Full Interactive 2D Suite ($490).
 */
export const DEVELOPMENT_PHASES: TimelinePhase[] = [
  {
    phase: 'Phase 1',
    title: 'Room Calculator & Spatial Grid Foundation',
    duration: '3 - 4 Days',
    deliverables: [
      'Room dimensions inputs (Length × Width with metric/imperial toggle)',
      'Automated room surface area calculation (m² / sq ft)',
      'Responsive architectural layout with clean design tokens',
    ],
    cost: 120,
  },
  {
    phase: 'Phase 2',
    title: 'Interactive 2D Floor Plan & Snap-to-Wall Engine',
    duration: '4 - 5 Days',
    deliverables: [
      'Interactive 2D canvas with precise rectangular furniture footprints',
      'Continuous mouse & long-press touch drag-and-drop movement',
      'Intelligent Snap-to-Wall perimeter alignment physics',
      'Furniture 90° rotation controls and catalog integration',
    ],
    cost: 190,
  },
  {
    phase: 'Phase 3',
    title: 'Cost Estimation Engine, Multi-Currency & Quotes',
    duration: '3 - 4 Days',
    deliverables: [
      'Real-time financial calculator (subtotal, assembly, delivery, VAT, discount)',
      'Multi-currency switcher with live symbol support (EUR, USD, GBP, AUD)',
      'Clean branded client quote generation with PDF / Print export',
      'Saved quotes manager with LocalStorage persistence',
    ],
    cost: 120,
  },
  {
    phase: 'Phase 4',
    title: 'Touch Gestures, Cross-Device QA & Final Delivery',
    duration: '2 Days',
    deliverables: [
      'Mobile/tablet touch testing and touch action optimization',
      'Performance audit, clean English code documentation & handover',
    ],
    cost: 60,
  },
];

/**
 * Summary totals and milestone payment schedule for the recommended Full Interactive Suite ($490).
 */
export const SUMMARY_TIMELINE = {
  totalDuration: '1.5 - 2 Weeks',
  totalEstimatedCost: 490,
  currency: 'USD',
  clientOfferComparison: {
    clientOffered: 110,
    recommendedPrice: 490,
    difference: 380,
  },
  paymentMilestones: [
    { title: 'Project Kickoff & Architectural Layout', percent: 30, amount: 147 },
    { title: 'Interactive Floor Plan & Snap-to-Wall Delivery', percent: 40, amount: 196 },
    { title: 'Final Acceptance, QA Sign-off & Source Handover', percent: 30, amount: 147 },
  ],
};

