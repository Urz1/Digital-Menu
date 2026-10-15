'use client';

import React, { useRef, useEffect } from 'react';
import { Category } from '@/types/database';
import { triggerHaptic } from '@/lib/utils';

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  hasActiveOffers?: boolean;
  offersCount?: number;
  itemCounts?: Record<string, number>;
  locale?: string;
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  onSelectCategory,
  hasActiveOffers = false,
  offersCount = 0,
  itemCounts,
  locale = 'en',
}: CategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    <nav className="sticky top-[108px] z-30 bg-[var(--card)]/90 backdrop-blur-md border-b border-[var(--border)] transition-colors">
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto px-4 py-2.5 no-scrollbar scroll-smooth"
      >
        {hasActiveOffers && (
          <button
            data-category-tab="offers"
            onClick={() => {
              triggerHaptic(10);
              onSelectCategory('offers');
            }}
            className={`flex-shrink-0 h-9 px-3.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 border ${
              activeCategoryId === 'offers'
                ? 'text-white border-transparent shadow-sm'
                : 'bg-[var(--background)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--muted-foreground)]'
            }`}
            style={{
              backgroundColor: activeCategoryId === 'offers' ? 'var(--primary)' : undefined,
            }}
          >
            <span>🏷️</span>
            <span>Offers</span>
            {offersCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
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

        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          const displayName = locale === 'es' && cat.name_es ? cat.name_es : cat.name;
          const count = itemCounts ? itemCounts[cat.id] : undefined;

          return (
            <button
              key={cat.id}
              data-category-tab={cat.id}
              onClick={() => {
                triggerHaptic(10);
                onSelectCategory(cat.id);
              }}
              className={`flex-shrink-0 h-9 px-3.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 border ${
                isActive
                  ? 'text-white border-transparent shadow-sm'
                  : 'bg-[var(--background)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--muted-foreground)]'
              }`}
              style={{
                backgroundColor: isActive ? 'var(--primary)' : undefined,
              }}
            >
              <span>{cat.icon}</span>
              <span>{displayName}</span>
              {typeof count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
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
