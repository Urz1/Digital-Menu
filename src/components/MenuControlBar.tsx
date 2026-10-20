'use client';

import React, { useState } from 'react';
import { Category } from '@/types/database';
import { DietaryFilter, SortOrder } from '@/types/menu';
import { triggerHaptic } from '@/lib/utils';
import { Language, CATEGORY_TRANSLATIONS, TRANSLATIONS } from '@/lib/translations';
import {
  ChevronDown,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
  Check,
  X,
  Compass,
  Award,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  ArrowDownAZ,
  Utensils,
  ChefHat,
  Leaf,
  Sprout,
  Salad,
  WheatOff,
  ShieldCheck,
  Flame,
  Tag,
  Grid,
} from 'lucide-react';

export interface MenuControlBarProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  hasActiveOffers?: boolean;
  offersCount?: number;
  activeFilter: DietaryFilter;
  onFilterChange: (filter: DietaryFilter) => void;
  sortOrder: SortOrder;
  onSortChange: (sort: SortOrder) => void;
  layout: 'list' | 'grid';
  onToggleLayout: () => void;
  locale?: Language;
  itemCounts?: Record<string, number>;
  onOpenCategoryDirectory: () => void;
}

export function MenuControlBar({
  categories,
  activeCategoryId,
  onSelectCategory,
  hasActiveOffers = false,
  offersCount = 0,
  activeFilter,
  onFilterChange,
  sortOrder,
  onSortChange,
  layout,
  onToggleLayout,
  locale = 'en',
  itemCounts = {},
  onOpenCategoryDirectory,
}: MenuControlBarProps) {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;

  // Compute active category details
  const isOffersActive = activeCategoryId === 'offers' || activeFilter === 'onOffer';
  const isAllCategories = !activeCategoryId || activeCategoryId === 'all';
  const activeCategory = isAllCategories ? null : categories.find((c) => c.id === activeCategoryId);

  const totalItemsCount = Object.values(itemCounts).reduce((a, b) => a + b, 0);

  const activeCategoryName = isOffersActive
    ? t.specialOffer
    : activeCategory
    ? CATEGORY_TRANSLATIONS[activeCategory.id]?.[locale]?.name ||
      (locale === 'am' && activeCategory.name_am) ||
      (locale === 'so' && activeCategory.name_so) ||
      (locale === 'es' && activeCategory.name_es) ||
      activeCategory.name
    : t.allCategories;

  const activeCategoryCount = isOffersActive
    ? offersCount
    : activeCategory
    ? itemCounts[activeCategory.id] || 0
    : totalItemsCount;

  // Filter definitions
  const FILTER_OPTIONS: { id: DietaryFilter; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { id: 'all', label: t.filterAll, icon: Utensils, desc: 'Show all dishes on the menu' },
    { id: 'chefsPick', label: t.filterChefsPick, icon: ChefHat, desc: 'Signature dishes recommended by the kitchen' },
    { id: 'fasting', label: t.filterFasting, icon: Leaf, desc: 'Ethiopian fasting dishes (meat & dairy free)' },
    { id: 'vegetarian', label: t.filterVegetarian, icon: Sprout, desc: 'Dishes prepared without meat or poultry' },
    { id: 'vegan', label: t.filterVegan, icon: Salad, desc: '100% plant-based, no animal ingredients' },
    { id: 'gluten-free', label: t.filterGlutenFree, icon: WheatOff, desc: 'Prepared without gluten-containing ingredients' },
    { id: 'halal', label: t.filterHalal, icon: ShieldCheck, desc: 'Prepared according to Halal standards' },
    { id: 'spicy', label: t.filterSpicy, icon: Flame, desc: 'Dishes with chili, awaze, or spicy seasoning' },
  ];

  // Sort definitions
  const SORT_OPTIONS: { id: SortOrder; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { id: 'featured', label: t.sortFeatured, icon: Award, desc: 'Popular and chef-recommended dishes first' },
    { id: 'price-asc', label: t.sortPriceAsc, icon: ArrowDownNarrowWide, desc: 'Most affordable items first' },
    { id: 'price-desc', label: t.sortPriceDesc, icon: ArrowUpNarrowWide, desc: 'Premium platters and feasts first' },
    { id: 'name-asc', label: t.sortNameAsc, icon: ArrowDownAZ, desc: 'Alphabetical order from A to Z' },
  ];

  const currentSort = SORT_OPTIONS.find((s) => s.id === sortOrder) || SORT_OPTIONS[0];
  const isDietaryFilterActive = activeFilter !== 'all' && activeFilter !== 'onOffer';

  const activeFilterObj = FILTER_OPTIONS.find((f) => f.id === activeFilter);

  return (
    <>
      {/* =========================================================================
          UNIFIED SINGLE CONTROL BAR (Sticky, ~52px height, 0 horizontal scrolling)
         ========================================================================= */}
      <nav
        className="sticky top-[53px] z-30 bg-[var(--card)]/95 backdrop-blur-md border-b border-[var(--border)] transition-colors select-none"
        aria-label="Menu Navigation & Controls"
      >
        <div className="flex items-center justify-between px-3 py-2 gap-1.5 sm:gap-2 max-w-4xl mx-auto">
          {/* Left: Tactical Category Selector Pill */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onOpenCategoryDirectory();
            }}
            className="flex-1 min-w-0 h-9 px-2.5 sm:px-3 rounded-full bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)] text-xs font-bold text-[var(--foreground)] flex items-center justify-between gap-1.5 transition-all shadow-2xs group active:scale-[0.98]"
            title={`${t.browseCategories}: ${activeCategoryName}`}
            aria-label={`${t.browseCategories}: ${activeCategoryName}`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {isOffersActive ? (
                <Tag className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              ) : activeCategory ? (
                <span className="text-sm leading-none flex-shrink-0">{activeCategory.icon || '🍽️'}</span>
              ) : (
                <Utensils className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
              )}
              <span className="truncate text-left text-xs text-[var(--foreground)] font-bold">
                {activeCategoryName}
              </span>
              {activeCategoryCount > 0 && (
                <span className="text-[10px] font-semibold text-[var(--muted)] px-1.5 py-0.2 rounded-full bg-[var(--card)] border border-[var(--border)] flex-shrink-0 hidden md:inline-block">
                  {activeCategoryCount}
                </span>
              )}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-[var(--primary)] flex-shrink-0 transition-transform" />
          </button>

          {/* Quick "On Offer" Pill (Only visible when active offers actually exist) */}
          {hasActiveOffers && offersCount > 0 && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                if (activeFilter === 'onOffer') {
                  onFilterChange('all');
                  if (activeCategoryId === 'offers') onSelectCategory(categories[0]?.id || '');
                } else {
                  onFilterChange('onOffer');
                  onSelectCategory('offers');
                }
              }}
              className={`h-9 px-2 sm:px-2.5 rounded-full text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all border flex-shrink-0 active:scale-95 ${
                isOffersActive
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-amber-400'
              }`}
              title="Dishes on Offer"
            >
              <Tag className={`w-3.5 h-3.5 flex-shrink-0 ${isOffersActive ? 'text-white' : 'text-amber-500'}`} />
              <span className="text-xs font-bold hidden xs:inline">Offers</span>
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                  isOffersActive
                    ? 'bg-black/25 text-white'
                    : 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200'
                }`}
              >
                {offersCount}
              </span>
            </button>
          )}

          {/* Quick "Fasting / Tsom" 1-Tap Pill */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onFilterChange(activeFilter === 'fasting' ? 'all' : 'fasting');
            }}
            className={`h-9 px-2.5 rounded-full text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all border flex-shrink-0 active:scale-95 ${
              activeFilter === 'fasting'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-emerald-500'
            }`}
            title="Toggle Fasting (Tsom) dishes"
            aria-label="Toggle Fasting dishes"
          >
            <Leaf className={`w-3.5 h-3.5 flex-shrink-0 ${activeFilter === 'fasting' ? 'text-white' : 'text-emerald-500'}`} />
            <span>{locale === 'am' ? 'ጾም' : 'Fasting'}</span>
          </button>

          {/* Right Action Controls: Filter, Sort, Layout */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Dietary Filter Trigger */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                setIsFilterSheetOpen(true);
              }}
              className={`h-9 w-9 sm:w-auto sm:px-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all border active:scale-95 ${
                isDietaryFilterActive
                  ? 'bg-[var(--primary)] text-white border-transparent shadow-xs'
                  : 'bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] border-[var(--border)]'
              }`}
              title="Dietary Filters"
              aria-label="Dietary Filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filter</span>
              {isDietaryFilterActive && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </button>

            {/* Sort Order Trigger */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                setIsSortSheetOpen(true);
              }}
              className="h-9 w-9 rounded-full bg-[var(--background)] border border-[var(--border)] hover:text-[var(--foreground)] text-[var(--muted)] flex items-center justify-center transition-all active:scale-95 shadow-2xs"
              title={`Sort by: ${currentSort.label}`}
              aria-label={`Sort by: ${currentSort.label}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[var(--primary)]" />
            </button>

            {/* Grid / List Layout Toggle */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                onToggleLayout();
              }}
              className="h-9 w-9 rounded-full bg-[var(--background)] border border-[var(--border)] hover:text-[var(--foreground)] text-[var(--muted)] flex items-center justify-center transition-all active:scale-95 shadow-2xs"
              title={layout === 'list' ? 'Switch to 2-column Grid' : 'Switch to Single-column List'}
              aria-label={layout === 'list' ? 'Switch to Grid' : 'Switch to List'}
            >
              {layout === 'list' ? (
                <LayoutGrid className="w-4 h-4 text-[var(--primary)]" />
              ) : (
                <List className="w-4 h-4 text-[var(--primary)]" />
              )}
            </button>
          </div>
        </div>

        {/* Active Filter Dismissible Chip Bar (Only visible when a filter is active) */}
        {isDietaryFilterActive && activeFilterObj && (
          <div className="px-3 pb-2 pt-0.5 flex items-center justify-between text-xs border-t border-[var(--border)]/40 bg-[var(--background)]/60 animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 text-xs text-[var(--foreground)] font-semibold truncate">
              <activeFilterObj.icon className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span className="text-[11px] text-[var(--muted)]">Filtered by:</span>
              <span className="font-bold text-[var(--primary)] truncate">{activeFilterObj.label}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                onFilterChange('all');
              }}
              className="px-2 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-[10px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] inline-flex items-center gap-1 active:scale-95"
            >
              <span>Clear</span>
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </nav>

      {/* =========================================================================
          DIETARY FILTERS BOTTOM SHEET
         ========================================================================= */}
      {isFilterSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsFilterSheetOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md bg-[var(--card)] rounded-t-3xl sm:rounded-3xl border border-[var(--border)] p-5 shadow-2xl z-10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-250 select-none">
            {/* Grab handle */}
            <div className="w-12 h-1 bg-[var(--border)] rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="font-bold text-base text-[var(--foreground)] font-brand flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[var(--primary)]" />
                  <span>Dietary Preferences & Tags</span>
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Filter dishes to match your dietary lifestyle
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)]"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Options List */}
            <div className="overflow-y-auto flex-1 mt-3 flex flex-col gap-2 py-1 pr-1">
              {FILTER_OPTIONS.map((opt) => {
                const isSelected = activeFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      onFilterChange(opt.id);
                      setIsFilterSheetOpen(false);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[rgba(var(--primary-rgb),0.08)] shadow-xs'
                        : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--muted)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-[var(--primary)] text-white shadow-xs'
                          : 'bg-[var(--card)] text-[var(--muted)] border border-[var(--border)]'
                      }`}>
                        <opt.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div
                          className={`text-sm font-bold ${
                            isSelected ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'
                          }`}
                        >
                          {opt.label}
                        </div>
                        <div className="text-xs text-[var(--muted)] mt-0.5">{opt.desc}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Reset All Footer Button */}
            {activeFilter !== 'all' && (
              <div className="pt-3 border-t border-[var(--border)] mt-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    onFilterChange('all');
                    setIsFilterSheetOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-bold text-[var(--foreground)] hover:border-[var(--primary)]"
                >
                  Reset to All Dishes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SORT ORDER BOTTOM SHEET
         ========================================================================= */}
      {isSortSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsSortSheetOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm bg-[var(--card)] rounded-t-3xl sm:rounded-3xl border border-[var(--border)] p-5 shadow-2xl z-10 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-250 select-none">
            {/* Grab handle */}
            <div className="w-12 h-1 bg-[var(--border)] rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="font-bold text-base text-[var(--foreground)] font-brand flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-[var(--primary)]" />
                  <span>{t.sortLabel}</span>
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">Choose how dishes are ordered</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSortSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)]"
                aria-label="Close sort"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Options */}
            <div className="mt-3 flex flex-col gap-2 py-1">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortOrder === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(8);
                      onSortChange(opt.id);
                      setIsSortSheetOpen(false);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[rgba(var(--primary-rgb),0.08)] shadow-xs'
                        : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--muted)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-[var(--primary)] text-white shadow-xs'
                          : 'bg-[var(--card)] text-[var(--muted)] border border-[var(--border)]'
                      }`}>
                        <opt.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div
                          className={`text-sm font-bold ${
                            isSelected ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'
                          }`}
                        >
                          {opt.label}
                        </div>
                        <div className="text-xs text-[var(--muted)] mt-0.5">{opt.desc}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
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
