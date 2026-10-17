'use client';

import React from 'react';
import { MenuItem, DishReview, Offer, Restaurant } from '@/types/database';
import { classifyMenuMatrix } from '@/lib/admin-engine';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import {
  TrendingUp,
  Star,
  Eye,
  Tag,
  AlertCircle,
  HelpCircle,
  Compass,
  ArrowUpRight,
  Lightbulb,
  Award,
  Zap,
} from 'lucide-react';

interface InsightsSectionProps {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  reviews: DishReview[];
  offers: Offer[];
}

export function InsightsSection({
  restaurant,
  menuItems,
  reviews,
  offers,
}: InsightsSectionProps) {
  // Deterministic mock views, orders, and ratings
  const viewsMap: Record<string, number> = {};
  const ordersMap: Record<string, number> = {};
  const ratingMap: Record<string, number> = {};

  menuItems.forEach((item, idx) => {
    viewsMap[item.id] = 120 + ((item.name.length * 27) % 350);
    ordersMap[item.id] = 12 + ((item.name.length * 13) % 45);
    ratingMap[item.id] = 4.2 + (idx % 8) * 0.1;
  });

  // Calculate insights
  const allInsights = classifyMenuMatrix(menuItems, viewsMap, ordersMap, ratingMap);
  const stars = allInsights.filter((i) => i.classification === 'star');
  const workhorses = allInsights.filter((i) => i.classification === 'workhorse');
  const hiddenGems = allInsights.filter((i) => i.classification === 'hidden_gem');
  const underperformers = allInsights.filter((i) => i.classification === 'underperformer');

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-white">Menu Performance & Analytics</h2>
        </div>
        <p className="text-xs text-neutral-400 mt-0.5">
          Real-time dish popularity, ordering velocity, and guest sentiment.
        </p>
      </div>

      {/* 4 Big Headline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Most Viewed Dish */}
        <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Most Viewed Dish
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-base font-bold text-white line-clamp-1">
              {menuItems[0]?.name || 'Special Fetira'}
            </h3>
            <p className="text-2xl font-extrabold text-white font-mono mt-1">
              482 <span className="text-xs font-normal text-neutral-400">views today</span>
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/5 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Highest guest browsing interest</span>
          </div>
        </div>

        {/* 2. Top Rated Dish */}
        <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Top Rated Dish
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-base font-bold text-white line-clamp-1">
              {menuItems[1]?.name || 'Special Mendi Platter'}
            </h3>
            <p className="text-2xl font-extrabold text-white font-mono mt-1 flex items-center gap-1">
              4.9 <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-normal text-neutral-400">(38 ratings)</span>
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/5 text-[11px] text-amber-300 font-medium">
            <span>Diners praise flavor and freshness</span>
          </div>
        </div>

        {/* 3. Offer Performance */}
        <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Offer Performance
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-base font-bold text-white line-clamp-1">
              {offers[0]?.title || 'Afternoon Happy Hour'}
            </h3>
            <p className="text-2xl font-extrabold text-white font-mono mt-1">
              {restaurant.currency} 6,400 <span className="text-xs font-normal text-neutral-400">revenue</span>
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/5 text-[11px] text-emerald-400 font-medium">
            <span>32 redemptions (+180 {restaurant.currency} basket lift)</span>
          </div>
        </div>

        {/* 4. Looked at but rarely ordered */}
        <div className="p-5 rounded-2xl bg-[#12141C] border border-amber-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                High Views, Low Conversion
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-base font-bold text-white line-clamp-1">
              {menuItems[2]?.name || 'Special Ful'}
            </h3>
            <p className="text-xs text-neutral-300 mt-1">
              210 views, but only 5 orders placed.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/5 text-[11px] text-amber-300/90 flex items-start gap-1 font-medium">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>Tip: Test a 10% intro discount or add appetizing photo.</span>
          </div>
        </div>
      </div>

      {/* Dish Demand & Sales Velocity */}
      <section className="p-6 rounded-2xl bg-[#12141C] border border-white/5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white">Dish Demand & Sales Velocity</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Performance breakdown pairing guest interest (views) with sales velocity (orders).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* STARS */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Award className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-sm font-bold text-emerald-400">Stars (High Views & Orders)</h4>
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              High views and top sales. Keep front and center on your menu top.
            </p>
            <div className="space-y-1.5">
              {stars.slice(0, 4).map((it) => (
                <div
                  key={it.item_id}
                  className="px-3 py-2 rounded-lg bg-black/20 flex items-center justify-between text-xs"
                >
                  <span className="text-white font-medium truncate">{it.name}</span>
                  <span className="font-mono text-emerald-400 text-[11px] font-bold">
                    {it.badgeLabel}
                  </span>
                </div>
              ))}
              {stars.length === 0 && (
                <p className="text-xs text-neutral-500 italic">No items in this category currently.</p>
              )}
            </div>
          </div>

          {/* WORKHORSES */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-sm font-bold text-blue-400">
                Workhorses (High Orders, Low Views)
              </h4>
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              Consistent favorite. Consider pairing with drinks or featuring in combo deals.
            </p>
            <div className="space-y-1.5">
              {workhorses.slice(0, 4).map((it) => (
                <div
                  key={it.item_id}
                  className="px-3 py-2 rounded-lg bg-black/20 flex items-center justify-between text-xs"
                >
                  <span className="text-white font-medium truncate">{it.name}</span>
                  <span className="font-mono text-blue-400 text-[11px] font-bold">
                    {it.badgeLabel}
                  </span>
                </div>
              ))}
              {workhorses.length === 0 && (
                <p className="text-xs text-neutral-500 italic">No items in this category currently.</p>
              )}
            </div>
          </div>

          {/* HIDDEN GEMS */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-sm font-bold text-purple-400">
                Hidden Gems (High Interest, Low Orders)
              </h4>
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              Loved by guests who try it! Move up in category order or feature as Chef Pick.
            </p>
            <div className="space-y-1.5">
              {hiddenGems.slice(0, 4).map((it) => (
                <div
                  key={it.item_id}
                  className="px-3 py-2 rounded-lg bg-black/20 flex items-center justify-between text-xs"
                >
                  <span className="text-white font-medium truncate">{it.name}</span>
                  <span className="font-mono text-purple-400 text-[11px] font-bold">
                    {it.badgeLabel}
                  </span>
                </div>
              ))}
              {hiddenGems.length === 0 && (
                <p className="text-xs text-neutral-500 italic">No items in this category currently.</p>
              )}
            </div>
          </div>

          {/* UNDERPERFORMERS */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-rose-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-sm font-bold text-rose-400">
                Underperformers (Low Interest & Orders)
              </h4>
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              High diner interest but low orders. Consider reviewing pricing or photo.
            </p>
            <div className="space-y-1.5">
              {underperformers.slice(0, 4).map((it) => (
                <div
                  key={it.item_id}
                  className="px-3 py-2 rounded-lg bg-black/20 flex items-center justify-between text-xs"
                >
                  <span className="text-white font-medium truncate">{it.name}</span>
                  <span className="font-mono text-rose-400 text-[11px] font-bold">
                    {it.badgeLabel}
                  </span>
                </div>
              ))}
              {underperformers.length === 0 && (
                <p className="text-xs text-neutral-500 italic">No items in this category currently.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
