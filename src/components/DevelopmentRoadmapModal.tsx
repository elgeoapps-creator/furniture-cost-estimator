/**
 * ============================================================================
 * DEVELOPMENT ROADMAP & COMMERCIAL PROPOSAL MODAL
 * ============================================================================
 * Displays the tailored commercial proposal, pricing packages, and agile
 * milestone schedule for the interactive room planner and furniture estimator.
 *
 * Designed to empower freelancers and development teams to negotiate
 * realistically against low fixed-price offers (e.g., initial $110 offer)
 * by clearly contrasting:
 * 1. Starter MVP ($190): Basic room calculator without interactive canvas
 * 2. Full Interactive 2D Suite ($490 - Recommended): The production-grade
 *    solution demonstrated in this application with drag & drop, snap-to-wall,
 *    multi-currency, and client quote generation
 * 3. Enterprise Suite ($890): Custom architectural elements and white-labeling
 *
 * Includes:
 * - Package comparison cards with included and excluded feature matrices
 * - Phased milestone schedule (30% / 40% / 30% payment structure)
 * - Dynamic currency formatting based on active user settings (EUR, USD, GBP, AUD)
 * - 1-Click "Copy Proposal Message" to quickly respond to client bids
 */

import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  DEVELOPMENT_PHASES,
  SUMMARY_TIMELINE,
  PROPOSAL_PACKAGES,
} from '../data/projectTimeline';
import { EstimateSettings, ProposalPackage } from '../types';

/**
 * Props accepted by the DevelopmentRoadmapModal component.
 */
interface DevelopmentRoadmapModalProps {
  /** Controls visibility of the roadmap modal */
  isOpen: boolean;
  /** Callback fired to close the modal */
  onClose: () => void;
  /** Optional active estimation settings for currency formatting */
  settings?: EstimateSettings;
}

/**
 * DevelopmentRoadmapModal component rendering tailored project packages and milestones.
 */
export const DevelopmentRoadmapModal: React.FC<DevelopmentRoadmapModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  /** Active view tab: 'packages' (pricing tiers) or 'milestones' (phased roadmap) */
  const [activeTab, setActiveTab] = useState<'packages' | 'milestones'>('packages');

  /** Currently selected package for detail inspection (defaults to 'interactive') */
  const [selectedPackageId, setSelectedPackageId] = useState<'starter' | 'interactive' | 'enterprise'>('interactive');

  if (!isOpen) return null;

  // Resolve currency symbol and code from settings or fallback to standard USD
  const currencySymbol = settings?.currencySymbol || '$';
  const currencyCode = settings?.currency || 'USD';

  /**
   * Helper function to format monetary amounts using active project currency.
   */
  const formatAmount = (amount: number): string => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-3xl w-full my-auto flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="p-5 bg-stone-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Commercial Proposal & Specifications
              </span>
            </div>
            <h2 className="text-lg font-serif font-bold mt-0.5">
              Project Pricing Packages & Agile Milestones
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            aria-label="Close Proposal Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation: Packages vs Phased Milestones */}
        <div className="px-6 pt-4 border-b border-stone-200 flex gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'packages'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3 Commercial Packages (Tiers)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('milestones')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'milestones'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Phased Agile Roadmap ({formatAmount(SUMMARY_TIMELINE.totalEstimatedCost)})</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {activeTab === 'packages' ? (
            /* Packages Comparison View */
            <div className="space-y-6">
              {/* Package Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PROPOSAL_PACKAGES.map((pkg: ProposalPackage) => {
                  const isSelected = selectedPackageId === pkg.id;
                  const isRecommended = pkg.id === 'interactive';

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-stone-900 shadow-md ring-1 ring-stone-900 bg-stone-50/50'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      {/* Highlight Badge */}
                      {pkg.badge && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                          {pkg.badge}
                        </div>
                      )}

                      <div>
                        {/* Package Name & Tagline */}
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif font-bold text-stone-900 text-sm">
                            {pkg.name}
                          </h3>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-stone-900 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1 min-h-[30px] leading-tight">
                          {pkg.tagline}
                        </p>

                        {/* Price & Turnaround */}
                        <div className="my-3 pb-3 border-b border-stone-200/80">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold font-serif text-stone-900">
                              {formatAmount(pkg.price)}
                            </span>
                            <span className="text-[11px] text-stone-500 font-medium">
                              {currencyCode} fixed
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-stone-600 mt-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>{pkg.duration} delivery</span>
                          </div>
                        </div>

                        {/* Deliverables Checklist */}
                        <div className="space-y-1.5 text-xs">
                          <div className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">
                            Included
                          </div>
                          {pkg.features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-[11px] text-stone-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}

                          {/* Excluded items (if any) */}
                          {pkg.excluded && pkg.excluded.length > 0 && (
                            <>
                              <div className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider pt-2">
                                Excluded
                              </div>
                              {pkg.excluded.map((exc, idx) => (
                                <div key={idx} className="flex items-start gap-1.5 text-[11px] text-stone-400 line-through">
                                  <XCircle className="w-3.5 h-3.5 text-stone-300 shrink-0 mt-0.5" />
                                  <span>{exc}</span>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Package Target note */}
                      <div className="mt-4 pt-3 border-t border-stone-100 text-[10px] text-stone-500 italic">
                        {pkg.recommendedFor}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Architecture & Engineering Quality Callout */}
              <div className="p-4 bg-stone-900 text-white rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-amber-300 text-xs font-semibold">
                    Production Architecture & Scalable Foundation
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Built with clean TypeScript and modern React components. Includes full responsive touch support, robust perimeter collision physics, and clean modular code structured for seamless long-term maintenance.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Phased Milestones View */
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Total Project Turnaround</span>
                  </div>
                  <div className="text-lg font-bold font-serif text-stone-900">
                    {SUMMARY_TIMELINE.totalDuration}
                  </div>
                  <span className="text-[11px] text-stone-500">
                    4 Agile Development Milestones
                  </span>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-1.5 text-amber-800 text-xs mb-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Recommended Dev Budget</span>
                  </div>
                  <div className="text-lg font-bold font-serif text-stone-900">
                    {formatAmount(SUMMARY_TIMELINE.totalEstimatedCost)} {currencyCode}
                  </div>
                  <span className="text-[11px] text-amber-700">
                    Full-scope application delivery
                  </span>
                </div>
              </div>

              {/* Milestone Phases List */}
              <div className="space-y-3">
                <h3 className="text-sm font-serif font-bold text-stone-900">
                  Agile Deliverables Breakdown
                </h3>

                <div className="space-y-3">
                  {DEVELOPMENT_PHASES.map((phase) => (
                    <div
                      key={phase.phase}
                      className="p-4 rounded-xl border border-stone-200 bg-white space-y-2"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-stone-900 text-white">
                            {phase.phase}
                          </span>
                          <h4 className="text-xs font-bold text-stone-900">
                            {phase.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-stone-500">{phase.duration}</span>
                          <span className="font-mono font-bold text-stone-900">
                            {formatAmount(phase.cost)}
                          </span>
                        </div>
                      </div>

                      <ul className="space-y-1 text-xs text-stone-600">
                        {phase.deliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Schedule Table */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Escrow / Milestone Payment Schedule
                </h4>
                <div className="space-y-1.5 text-xs text-stone-700">
                  {SUMMARY_TIMELINE.paymentMilestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-1.5 border-b border-stone-200/60 last:border-none"
                    >
                      <span>
                        {m.title} ({m.percent}%)
                      </span>
                      <span className="font-mono font-bold text-stone-900">
                        {formatAmount(m.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors shadow-xs"
          >
            Close Specifications
          </button>
        </div>
      </div>
    </div>
  );
};
