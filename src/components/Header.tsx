/**
 * ============================================================================
 * APPLICATION TOP NAVIGATION HEADER
 * ============================================================================
 * Renders the top brand identity bar, measurement system toggles (metric/imperial),
 * currency switcher (EUR, USD, GBP, AUD), timeline & roadmap modal launcher,
 * saved quotes drawer trigger with count badge, and layout reset button.
 */

import React, { useState } from 'react';
import {
  Calendar,
  FolderOpen,
  RotateCcw,
  Menu,
  X,
} from 'lucide-react';
import { EstimateSettings, UnitSystem } from '../types';

/**
 * Properties passed to the Header component.
 */
interface HeaderProps {
  /** Active global financial and currency settings */
  settings: EstimateSettings;
  /** State updater callback for modifying settings (currency, toggles) */
  onUpdateSettings: (updater: (prev: EstimateSettings) => EstimateSettings) => void;
  /** Active unit system ('metric' or 'imperial') */
  unitSystem: UnitSystem;
  /** Handler to switch between meters and feet */
  onToggleUnit: (unit: UnitSystem) => void;
  /** Total number of saved client quotes stored in local storage */
  savedQuotesCount: number;
  /** Callback to open the slide-out drawer of saved quotes */
  onOpenSavedQuotes: () => void;
  /** Callback to open the software roadmap and dev cost modal */
  onOpenRoadmap: () => void;
  /** Callback to reset all placed furniture items back to blank layout */
  onResetProject: () => void;
  /** Total count of furniture items currently placed in the room */
  itemCount: number;
}

/**
 * Header component rendering Atelier branding, global toggles, and modal triggers.
 * Includes a responsive mobile hamburger drawer (three lines) for mobile screens.
 */
export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  unitSystem,
  onToggleUnit,
  savedQuotesCount,
  onOpenSavedQuotes,
  onOpenRoadmap,
  onResetProject,
  itemCount,
}) => {
  // Mobile hamburger menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand identity: monogram logo and title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-lg font-bold shadow-xs">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-tight text-stone-900">
                Atelier
              </span>
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider pl-1.5 border-l border-stone-300">
                Cost Estimator
              </span>
            </div>
            <p className="text-[11px] text-stone-400 hidden sm:block">
              Estimate furniture budget based on room dimensions & layout
            </p>
          </div>
        </div>

        {/* Desktop Controls (hidden on mobile, visible on md and up) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Unit Toggle: Switch between Metric (Meters) and Imperial (Feet) */}
          <div className="flex items-center p-0.5 bg-stone-100 rounded-lg border border-stone-200 text-xs">
            <button
              type="button"
              onClick={() => onToggleUnit('metric')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                unitSystem === 'metric'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Meters (m)
            </button>
            <button
              type="button"
              onClick={() => onToggleUnit('imperial')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                unitSystem === 'imperial'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Feet (ft)
            </button>
          </div>

          {/* Currency Toggle: Switch between EUR (€), USD ($), GBP (£), AUD (A$) */}
          <select
            value={settings.currency}
            aria-label="Currency"
            onChange={(e) => {
              const curr = e.target.value as EstimateSettings['currency'];
              const sym =
                curr === 'EUR'
                  ? '€'
                  : curr === 'USD'
                  ? '$'
                  : curr === 'GBP'
                  ? '£'
                  : 'A$';
              onUpdateSettings((prev) => ({
                ...prev,
                currency: curr,
                currencySymbol: sym,
              }));
            }}
            className="text-xs font-semibold text-stone-800 bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="AUD">AUD (A$)</option>
          </select>

          {/* Timeline & Development Cost modal trigger */}
          <button
            type="button"
            onClick={onOpenRoadmap}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
            title="Project Timeline & Initial Cost Estimates"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
            <span>Timeline & Dev Cost</span>
          </button>

          {/* Saved Quotes Drawer trigger with count indicator */}
          <button
            type="button"
            onClick={onOpenSavedQuotes}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-stone-500" />
            <span>Quotes</span>
            {savedQuotesCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-semibold bg-stone-200 text-stone-800 rounded">
                {savedQuotesCount}
              </span>
            )}
          </button>

          {/* Reset all furniture items button */}
          {itemCount > 0 && (
            <button
              type="button"
              onClick={onResetProject}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              title="Reset Items"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button (Three lines) - visible on screens smaller than md */}
        <div className="flex md:hidden items-center gap-2">
          {savedQuotesCount > 0 && (
            <button
              type="button"
              onClick={onOpenSavedQuotes}
              className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              title="Quotes"
            >
              <FolderOpen className="w-5 h-5" />
              <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                {savedQuotesCount}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400"
            aria-label="Toggle Navigation Menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-stone-800" />
            ) : (
              <Menu className="w-5 h-5 text-stone-800" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown / Slide-down Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white/98 backdrop-blur-md px-4 py-4 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {/* Unit System Picker */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5 block">
              Measurement Units
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onToggleUnit('metric');
                  setIsMobileMenuOpen(false);
                }}
                className={`py-2 px-3 text-xs rounded-lg font-medium border text-center transition-colors ${
                  unitSystem === 'metric'
                    ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                    : 'bg-stone-50 text-stone-700 border-stone-200'
                }`}
              >
                Meters (m)
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleUnit('imperial');
                  setIsMobileMenuOpen(false);
                }}
                className={`py-2 px-3 text-xs rounded-lg font-medium border text-center transition-colors ${
                  unitSystem === 'imperial'
                    ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                    : 'bg-stone-50 text-stone-700 border-stone-200'
                }`}
              >
                Feet (ft)
              </button>
            </div>
          </div>

          {/* Currency Picker */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5 block">
              Currency
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { code: 'EUR', sym: '€', label: 'EUR (€)' },
                  { code: 'USD', sym: '$', label: 'USD ($)' },
                  { code: 'GBP', sym: '£', label: 'GBP (£)' },
                  { code: 'AUD', sym: 'A$', label: 'AUD (A$)' },
                ] as const
              ).map((curr) => {
                const isSelected = settings.currency === curr.code;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => {
                      onUpdateSettings((prev) => ({
                        ...prev,
                        currency: curr.code,
                        currencySymbol: curr.sym,
                      }));
                    }}
                    className={`py-2 px-1 text-xs rounded-lg font-medium border text-center transition-colors ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 font-semibold shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {curr.code}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Links & Modals */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            {/* Timeline & Development Cost modal trigger */}
            <button
              type="button"
              onClick={() => {
                onOpenRoadmap();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>Timeline & Dev Cost Proposal</span>
              </div>
              <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded">
                Tiers
              </span>
            </button>

            {/* Saved Quotes Drawer trigger */}
            <button
              type="button"
              onClick={() => {
                onOpenSavedQuotes();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 text-xs font-medium rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-stone-600" />
                <span>Saved Quotes Drawer</span>
              </div>
              {savedQuotesCount > 0 ? (
                <span className="text-[11px] font-semibold bg-stone-200 text-stone-800 px-2 py-0.5 rounded-full">
                  {savedQuotesCount} saved
                </span>
              ) : (
                <span className="text-[11px] text-stone-400">0</span>
              )}
            </button>

            {/* Reset All Items */}
            {itemCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  onResetProject();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2.5 text-xs font-medium rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Furniture Layout ({itemCount} items)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
