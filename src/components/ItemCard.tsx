'use client';

import React from 'react';
import Image from 'next/image';
import { MenuItem } from '@/types/database';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import { Heart, Plus } from 'lucide-react';

interface ItemCardProps {
  item: MenuItem;
  currencySymbol?: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenDetails: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
  layout?: 'list' | 'grid';
  locale?: string;
}

export function ItemCard({
  item,
  currencySymbol = '$',
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
  onQuickAdd,
  layout = 'list',
  locale = 'en',
}: ItemCardProps) {
  const displayName = (locale === 'es' && item.name_es) ? item.name_es : item.name;
  const displayDesc = (locale === 'es' && item.description_es) ? item.description_es : item.description;

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicked on favorite button or quick add button, don't open details modal
    if ((e.target as HTMLElement).closest('.action-prevent-modal')) return;
    onOpenDetails(item);
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group relative bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:border-[var(--muted-foreground)] ${
        layout === 'grid' ? 'flex flex-col p-2.5 gap-2' : 'flex gap-3 p-3'
      } ${!item.is_available ? 'opacity-60' : ''}`}
    >
      {/* Thumbnail Container */}
      <div
        className={`relative flex-shrink-0 bg-neutral-800 rounded-xl overflow-hidden ${
          layout === 'grid' ? 'w-full h-32' : 'w-24 h-24'
        }`}
      >
        <Image
          src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
          alt={displayName}
          fill
          sizes={layout === 'grid' ? '(max-width: 480px) 50vw, 220px' : '96px'}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic(15);
            onToggleFavorite(item.id);
          }}
          className={`action-prevent-modal absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'
          }`}
          aria-label={`Favorite ${displayName}`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content Column */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Badges (Chef's Pick / Sold Out) */}
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            {item.is_chefs_pick && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                ⭐ Chef Pick
              </span>
            )}
            {!item.is_available && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                Sold Out
              </span>
            )}
          </div>

          <h3 className="font-bold text-sm text-[var(--foreground)] leading-tight truncate">
            {displayName}
          </h3>

          <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2 leading-relaxed">
            {displayDesc}
          </p>

          {/* Dietary tags */}
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {item.tags?.includes('vegetarian') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-emerald-600 font-semibold">
                🌱 Veg
              </span>
            )}
            {item.tags?.includes('vegan') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-emerald-700 font-semibold">
                🌿 Vegan
              </span>
            )}
            {item.tags?.includes('gluten-free') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-amber-700 font-semibold">
                🌾 GF
              </span>
            )}
            {item.spice_level > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-red-600 font-semibold">
                {'🌶️'.repeat(Math.min(item.spice_level, 3))}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Price & Quick Add */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--border)]">
          <span className="font-extrabold text-base" style={{ color: 'var(--primary)' }}>
            {formatMoney(item.price, currencySymbol)}
          </span>

          <button
            disabled={!item.is_available}
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic(18);
              if (item.options && item.options.length > 0) {
                onOpenDetails(item);
              } else {
                onQuickAdd(item);
              }
            }}
            className="action-prevent-modal w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm disabled:bg-neutral-400 disabled:cursor-not-allowed transition-transform"
            style={{ backgroundColor: item.is_available ? 'var(--primary)' : undefined }}
            aria-label={`Add ${displayName} to order`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
