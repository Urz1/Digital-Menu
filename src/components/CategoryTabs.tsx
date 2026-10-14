'use client';

import React from 'react';
import { Category } from '@/types/database';
import { triggerHaptic } from '@/lib/utils';

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  locale?: string;
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  onSelectCategory,
  locale = 'en',
}: CategoryTabsProps) {
  return (
    <nav className="sticky top-[108px] z-30 bg-[var(--card)]/90 backdrop-blur-md border-b border-[var(--border)] transition-colors">
      <div className="flex gap-2 overflow-x-auto px-4 py-2.5 no-scrollbar scroll-smooth">
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          const displayName = (locale === 'es' && cat.name_es) ? cat.name_es : cat.name;

          return (
            <button
              key={cat.id}
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
            </button>
          );
        })}
      </div>
    </nav>
  );
}
