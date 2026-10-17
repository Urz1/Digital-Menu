'use client';

import React from 'react';
import Image from 'next/image';
import { MenuItem, DishReviewStats } from '@/types/database';
import { ItemPricingResult } from '@/lib/pricing-engine';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import { Heart, Plus, Tag, Clock, Star, ChefHat, Salad, Sprout, Leaf, WheatOff, ShieldCheck, Flame } from 'lucide-react';
import { Language, TRANSLATIONS } from '@/lib/translations';

interface ItemCardProps {
  item: MenuItem;
  pricingResult?: ItemPricingResult;
  reviewStats?: DishReviewStats;
  currencySymbol?: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenDetails: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
  layout?: 'list' | 'grid';
  locale?: Language | string;
}

export function ItemCard({
  item,
  pricingResult,
  reviewStats,
  currencySymbol = 'ETB',
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
  onQuickAdd,
  layout = 'list',
  locale = 'en',
}: ItemCardProps) {
  const currentLocale = (locale as Language) || 'en';
  const t = TRANSLATIONS[currentLocale] || TRANSLATIONS.en;

  const displayName =
    currentLocale === 'am' && item.name_am
      ? item.name_am
      : currentLocale === 'so' && item.name_so
      ? item.name_so
      : currentLocale === 'es' && item.name_es
      ? item.name_es
      : item.name;

  const displayDesc =
    currentLocale === 'am' && item.description_am
      ? item.description_am
      : currentLocale === 'so' && item.description_so
      ? item.description_so
      : currentLocale === 'es' && item.description_es
      ? item.description_es
      : item.description;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.action-prevent-modal')) return;
    onOpenDetails(item);
  };

  const hasOffer = pricingResult?.hasOffer ?? false;
  const originalPrice = pricingResult?.originalPrice ?? item.price;
  const finalPrice = pricingResult?.finalPrice ?? item.price;
  const savings = pricingResult?.savings ?? 0;

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
          {/* Badges (Offer / Chef's Pick / Sold Out / Urgency) */}
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            {hasOffer && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white inline-flex items-center gap-1 shadow-2xs"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Tag className="w-2.5 h-2.5" />
                <span>{pricingResult?.badgeText || t.specialOffer}</span>
              </span>
            )}
            {hasOffer && savings > 0 && !pricingResult?.badgeText?.toLowerCase().includes('off') && !pricingResult?.badgeText?.includes(String(Math.round(savings))) && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                {t.saveAmount} {formatMoney(savings, currencySymbol)}
              </span>
            )}
            {pricingResult?.urgencyText && (
              <span suppressHydrationWarning className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 inline-flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                <span suppressHydrationWarning>{pricingResult.urgencyText}</span>
              </span>
            )}
            {item.is_chefs_pick && !hasOffer && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 inline-flex items-center gap-1">
                <ChefHat className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>{t.chefsPick}</span>
              </span>
            )}
            {!item.is_available && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                {t.soldOut}
              </span>
            )}
            {/* 3-Review Threshold: Show rating & count ONLY when review count >= 3 */}
            {reviewStats?.is_threshold_met && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 inline-flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-current text-amber-500" />
                <span>{reviewStats.average_rating.toFixed(1)}</span>
                <span className="text-[9px] opacity-75 font-normal">({reviewStats.review_count})</span>
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
            {item.tags?.includes('fasting') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-emerald-600 font-semibold border border-[var(--border)] inline-flex items-center gap-1">
                <Salad className="w-2.5 h-2.5 text-emerald-500" /> Tsom
              </span>
            )}
            {item.tags?.includes('vegetarian') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-emerald-600 font-semibold border border-[var(--border)] inline-flex items-center gap-1">
                <Sprout className="w-2.5 h-2.5 text-emerald-500" /> Veg
              </span>
            )}
            {item.tags?.includes('vegan') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-emerald-700 font-semibold border border-[var(--border)] inline-flex items-center gap-1">
                <Leaf className="w-2.5 h-2.5 text-emerald-600" /> Vegan
              </span>
            )}
            {item.tags?.includes('gluten-free') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-amber-700 font-semibold border border-[var(--border)] inline-flex items-center gap-1">
                <WheatOff className="w-2.5 h-2.5 text-amber-500" /> GF
              </span>
            )}
            {item.tags?.includes('halal') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-neutral-700 dark:text-neutral-300 font-semibold border border-[var(--border)] inline-flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" /> Halal
              </span>
            )}
            {item.spice_level > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-rose-500 font-semibold border border-[var(--border)] inline-flex items-center gap-0.5">
                {Array.from({ length: Math.min(item.spice_level, 3) }).map((_, i) => (
                  <Flame key={i} className="w-2.5 h-2.5 fill-rose-500/25 text-rose-500" />
                ))}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Price & Quick Add */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--border)]">
          <div className="flex items-baseline gap-1.5">
            {hasOffer ? (
              <>
                <span className="font-extrabold text-base" style={{ color: 'var(--primary)' }}>
                  {formatMoney(finalPrice, currencySymbol)}
                </span>
                <span className="text-xs text-[var(--muted)] line-through">
                  {formatMoney(originalPrice, currencySymbol)}
                </span>
              </>
            ) : (
              <span className="font-extrabold text-base" style={{ color: 'var(--primary)' }}>
                {formatMoney(item.price, currencySymbol)}
              </span>
            )}
          </div>

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
            className="action-prevent-modal w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xs disabled:bg-neutral-400 disabled:cursor-not-allowed transition-transform active:scale-90"
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
