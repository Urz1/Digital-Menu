'use client';

import React, { useRef, useEffect } from 'react';
import { Category } from '@/types/database';
import { triggerHaptic } from '@/lib/utils';
import { Language, CATEGORY_TRANSLATIONS, TRANSLATIONS } from '@/lib/translations';
import { Compass, Tag } from 'lucide-react';

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  hasActiveOffers?: boolean;
  offersCount?: number;
  itemCounts?: Record<string, number>;
  locale?: Language;
  onOpenCategoryDirectory?: () => void;
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  onSelectCategory,
  hasActiveOffers = false,
  offersCount = 0,
  itemCounts,
  locale = 'en',
  onOpenCategoryDirectory,
}: CategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;

  // Auto-scroll the active tab into view horizontally when activeCategoryId changes
  useEffect(() => {
    if (!activeCategoryId || !scrollContainerRef.current) return;
    const activeBtn = scrollContainerRef.current.querySelector(
      `[data-category-tab="${activeCategoryId}"]`
    ) as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategoryId]);

  return (
    <nav className="sticky top-[96px] z-30 bg-[var(--card)]/95 backdrop-blur-md border-b border-[var(--border)] transition-colors">
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1.5 overflow-x-auto px-3.5 py-2 no-scrollbar scroll-smooth"
      >
        {/* Menu Directory Quick Drawer Button */}
        {onOpenCategoryDirectory && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onOpenCategoryDirectory();
            }}
            className="flex-shrink-0 h-8 px-2.5 rounded-full bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--muted)] flex items-center gap-1.5 text-xs font-bold active:scale-95 transition-all shadow-2xs"
            title={t.browseCategories}
            aria-label={t.browseCategories}
          >
            <Compass className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span className="hidden sm:inline">{t.browseCategories}</span>
          </button>
        )}

        {/* Active Offers Tab */}
        {hasActiveOffers && (
          <button
            data-category-tab="offers"
            onClick={() => {
              triggerHaptic(10);
              onSelectCategory('offers');
            }}
            className={`flex-shrink-0 h-8 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              activeCategoryId === 'offers'
                ? 'text-white border-transparent shadow-xs font-bold'
                : 'bg-[var(--background)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--muted)]'
            }`}
            style={{
              backgroundColor: activeCategoryId === 'offers' ? 'var(--primary)' : undefined,
            }}
          >
            <Tag className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{locale === 'am' ? 'ልዩ ቅናሾች' : locale === 'so' ? 'Dalabyada' : 'Offers'}</span>
            {offersCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-none ${
                  activeCategoryId === 'offers'
                    ? 'bg-white/25 text-white'
                    : 'bg-amber-500/20 text-amber-500'
                }`}
              >
                {offersCount}
              </span>
            )}
          </button>
        )}

        {/* Category Tabs */}
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          const translatedName =
            CATEGORY_TRANSLATIONS[cat.id]?.[locale]?.name ||
            (locale === 'am' && cat.name_am) ||
            (locale === 'so' && cat.name_so) ||
            (locale === 'es' && cat.name_es) ||
            cat.name;
          const count = itemCounts ? itemCounts[cat.id] : undefined;

          return (
            <button
              key={cat.id}
              data-category-tab={cat.id}
              onClick={() => {
                triggerHaptic(10);
                onSelectCategory(cat.id);
              }}
              className={`flex-shrink-0 h-8 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                isActive
                  ? 'text-white border-transparent shadow-xs font-bold'
                  : 'bg-[var(--background)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--muted)]'
              }`}
              style={{
                backgroundColor: isActive ? 'var(--primary)' : undefined,
              }}
            >
              <span>{cat.icon}</span>
              <span>{translatedName}</span>
              {typeof count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-none ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
