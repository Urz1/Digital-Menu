'use client';

import React from 'react';
import { DietaryFilter, SortOrder } from '@/types/menu';
import { triggerHaptic } from '@/lib/utils';
import { LayoutGrid, List } from 'lucide-react';

interface FilterBarProps {
  activeFilter: DietaryFilter;
  onFilterChange: (filter: DietaryFilter) => void;
  sortOrder: SortOrder;
  onSortChange: (sort: SortOrder) => void;
  layout: 'list' | 'grid';
  onToggleLayout: () => void;
}

const FILTER_OPTIONS: { id: DietaryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'chefsPick', label: '⭐ Chef Picks' },
  { id: 'vegetarian', label: '🌱 Vegetarian' },
  { id: 'vegan', label: '🌿 Vegan' },
  { id: 'gluten-free', label: '🌾 Gluten-Free' },
  { id: 'halal', label: '🥩 Halal' },
  { id: 'spicy', label: '🌶️ Spicy' },
  { id: 'nut-free', label: '🥜 Nut-Free' },
];

export function FilterBar({
  activeFilter,
  onFilterChange,
  sortOrder,
  onSortChange,
  layout,
  onToggleLayout,
}: FilterBarProps) {
  return (
    <section className="px-4 py-2.5 flex items-center justify-between gap-3 bg-[var(--background)] transition-colors">
      {/* Scrollable Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-grow">
        {FILTER_OPTIONS.map((opt) => {
          const isActive = activeFilter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => {
                triggerHaptic(8);
                onFilterChange(opt.id);
              }}
              className={`flex-shrink-0 h-8 px-3 rounded-full text-xs transition-colors border ${
                isActive
                  ? 'bg-[var(--foreground)] text-[var(--background)] font-bold border-transparent'
                  : 'bg-[var(--card)] text-[var(--muted)] font-medium border-[var(--border)] hover:border-[var(--muted)]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Sort & Layout Controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <select
          value={sortOrder}
          onChange={(e) => {
            triggerHaptic(8);
            onSortChange(e.target.value as SortOrder);
          }}
          className="h-8 px-2 text-xs rounded-full bg-[var(--card)] text-[var(--muted)] border border-[var(--border)] outline-none cursor-pointer"
          aria-label="Sort dishes"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low-High</option>
          <option value="price-desc">Price: High-Low</option>
          <option value="name-asc">Name: A–Z</option>
        </select>

        <button
          onClick={() => {
            triggerHaptic(10);
            onToggleLayout();
          }}
          className="w-8 h-8 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)]"
          aria-label="Toggle grid or list layout"
          title="Switch layout"
        >
          {layout === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
        </button>
      </div>
    </section>
  );
}
