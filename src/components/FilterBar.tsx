'use client';

import React, { useState } from 'react';
import { DietaryFilter, SortOrder } from '@/types/menu';
import { triggerHaptic } from '@/lib/utils';
import { LayoutGrid, List, ArrowUpDown, Check, X } from 'lucide-react';
import { Language, TRANSLATIONS } from '@/lib/translations';

interface FilterBarProps {
  activeFilter: DietaryFilter;
  onFilterChange: (filter: DietaryFilter) => void;
  sortOrder: SortOrder;
  onSortChange: (sort: SortOrder) => void;
  layout: 'list' | 'grid';
  onToggleLayout: () => void;
  locale?: Language;
}

export function FilterBar({
  activeFilter,
  onFilterChange,
  sortOrder,
  onSortChange,
  layout,
  onToggleLayout,
  locale = 'en',
}: FilterBarProps) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;

  const FILTER_OPTIONS: { id: DietaryFilter; label: string }[] = [
    { id: 'all', label: t.filterAll },
    { id: 'onOffer', label: t.filterOnOffer },
    { id: 'chefsPick', label: t.filterChefsPick },
    { id: 'fasting', label: t.filterFasting },
    { id: 'vegetarian', label: t.filterVegetarian },
    { id: 'vegan', label: t.filterVegan },
    { id: 'gluten-free', label: t.filterGlutenFree },
    { id: 'halal', label: t.filterHalal },
    { id: 'spicy', label: t.filterSpicy },
  ];

  const SORT_OPTIONS: { id: SortOrder; label: string; icon: string; desc: string }[] = [
    {
      id: 'featured',
      label: t.sortFeatured,
      icon: '⭐',
      desc: 'Popular and chef-recommended dishes first',
    },
    {
      id: 'price-asc',
      label: t.sortPriceAsc,
      icon: '💵',
      desc: 'Most affordable items first',
    },
    {
      id: 'price-desc',
      label: t.sortPriceDesc,
      icon: '💎',
      desc: 'Premium platters and feasts first',
    },
    {
      id: 'name-asc',
      label: t.sortNameAsc,
      icon: '🔤',
      desc: 'Alphabetical order from A to Z',
    },
  ];

  const currentSortObj = SORT_OPTIONS.find((s) => s.id === sortOrder) || SORT_OPTIONS[0];

  return (
    <>
      <section className="px-4 py-2.5 flex items-center justify-between gap-2.5 bg-[var(--background)] transition-colors">
        {/* Scrollable Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-grow py-0.5">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activeFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  triggerHaptic(8);
                  onFilterChange(opt.id);
                }}
                className={`flex-shrink-0 h-8 px-3 rounded-full text-xs transition-all border ${
                  isActive
                    ? 'bg-[var(--foreground)] text-[var(--background)] font-bold border-transparent shadow-xs scale-[1.02]'
                    : 'bg-[var(--card)] text-[var(--muted)] font-medium border-[var(--border)] hover:border-[var(--muted)]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Tactile Sort & Layout Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Integrated Tactile Sort Button (Replaces native <select>) */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setIsSortOpen(true);
            }}
            aria-label="Sort dishes"
            className="h-8 px-2.5 rounded-full bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--muted)] flex items-center gap-1.5 text-xs font-semibold shadow-xs active:scale-95 transition-all"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span className="hidden sm:inline">{currentSortObj.label.split(' ')[0]}</span>
            <span className="sm:hidden">{t.sortLabel}</span>
          </button>

          {/* Grid / List Layout Toggle */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onToggleLayout();
            }}
            className="w-8 h-8 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:border-[var(--muted)] shadow-xs active:scale-95 transition-all"
            aria-label="Toggle grid or list layout"
            title="Switch layout"
          >
            {layout === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>
        </div>
      </section>

      {/* Tactile Mobile Bottom Sheet for Sorting */}
      {isSortOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => {
              triggerHaptic(6);
              setIsSortOpen(false);
            }}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-lg bg-[var(--card)] rounded-t-3xl border-t border-[var(--border)] p-5 shadow-2xl z-10 animate-in slide-in-from-bottom-4 duration-250">
            {/* Grab handle */}
            <div className="w-12 h-1 bg-[var(--border)] rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="font-bold text-base text-[var(--foreground)] flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-[var(--primary)]" />
                  <span>{t.sortLabel}</span>
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Choose how dishes are ordered in the catalog
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(6);
                  setIsSortOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tactile Sort Pills */}
            <div className="flex flex-col gap-2 mt-4">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortOrder === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(12);
                      onSortChange(opt.id);
                      setIsSortOpen(false);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[rgba(var(--primary-rgb),0.08)] shadow-xs'
                        : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--muted)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl flex-shrink-0">{opt.icon}</span>
                      <div>
                        <div
                          className={`text-sm font-bold ${
                            isSelected ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'
                          }`}
                        >
                          {opt.label}
                        </div>
                        <div className="text-xs text-[var(--muted)]">{opt.desc}</div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
