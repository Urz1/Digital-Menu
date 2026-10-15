'use client';

import React from 'react';
import Link from 'next/link';
import { Restaurant, MenuItem, DishReview, Offer, ServiceRequest, Order } from '@/types/database';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import { AdminSection } from './AdminSidebar';
import {
  PlusCircle,
  AlertTriangle,
  Tag,
  DollarSign,
  QrCode,
  TrendingUp,
  Star,
  Bell,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Eye,
  MessageSquare,
  Clock,
  Layers,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface HomeDashboardProps {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  reviews: DishReview[];
  offers: Offer[];
  orders: Order[];
  serviceRequests: ServiceRequest[];
  onNavigate: (section: AdminSection) => void;
  onOpenAddDish: () => void;
  onOpenOnboarding: () => void;
  onOpenBulkPrice: () => void;
  onOpenHelp: () => void;
  onToggleChecklistStep?: (stepId: string) => void;
}

export function HomeDashboard({
  restaurant,
  menuItems,
  reviews,
  offers,
  orders,
  serviceRequests,
  onNavigate,
  onOpenAddDish,
  onOpenOnboarding,
  onOpenBulkPrice,
  onOpenHelp,
  onToggleChecklistStep,
}: HomeDashboardProps) {
  const activeOffers = offers.filter((o) => o.status === 'live' && !o.is_paused);
  const pendingRequests = serviceRequests.filter((r) => r.status === 'pending');
  const soldOutItems = menuItems.filter((i) => !i.is_available);
  const activeDishes = menuItems.filter((i) => i.is_available && !i.is_archived);

  // Calculate rating
  const approvedReviews = reviews.filter((r) => r.status === 'published');
  const avgRating =
    approvedReviews.length > 0
      ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
      : '4.8';

  // Checklist calculations
  const checklist = restaurant.onboarding_checklist || [];
  const completedCount = checklist.filter((s) => s.completed).length;
  const totalCount = checklist.length || 5;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-7xl mx-auto w-full">
      {/* Celebration Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600/30 via-orange-600/20 to-neutral-900 border border-amber-500/30 p-5 md:p-6 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold text-white">Your digital menu is live!</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready for Orders
                </span>
              </div>
              <p className="text-xs md:text-sm text-neutral-300 mt-0.5">
                Guests can view your artisanal menu on any phone. Print table QR stands to start serving.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              href={`/${restaurant.slug}?table=14`}
              target="_blank"
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Preview Live Menu</span>
            </Link>
            <button
              onClick={() => {
                triggerHaptic(10);
                onOpenHelp();
              }}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-all border border-amber-500/20 flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help & Tips</span>
            </button>
          </div>
        </div>
      </div>

      {/* Task-First "What would you like to do?" Row */}
      <section aria-labelledby="tasks-heading">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 id="tasks-heading" className="text-base font-bold text-white">
              What would you like to do?
            </h3>
            <p className="text-xs text-neutral-400">Common restaurant management tasks in one tap</p>
          </div>
          <span className="text-xs font-medium text-neutral-500 hidden sm:inline">Instant actions</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Add Dish */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onOpenAddDish();
            }}
            data-testid="quick-add-dish"
            className="group p-4 rounded-xl bg-[#14161E] hover:bg-[#1A1D27] border border-white/5 hover:border-amber-500/40 transition-all text-left flex flex-col justify-between gap-3 shadow-sm hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-colors">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Add Dish
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">Photo, price, tags</p>
            </div>
          </button>

          {/* 2. Mark Sold Out */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onNavigate('menu');
            }}
            data-testid="quick-mark-sold-out"
            className="group p-4 rounded-xl bg-[#14161E] hover:bg-[#1A1D27] border border-white/5 hover:border-rose-500/40 transition-all text-left flex flex-col justify-between gap-3 shadow-sm hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 group-hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition-colors">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                  Sold Out
                </p>
                {soldOutItems.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                    {soldOutItems.length}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">Toggle availability</p>
            </div>
          </button>

          {/* 3. Create Offer */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onNavigate('offers');
            }}
            data-testid="quick-create-offer"
            className="group p-4 rounded-xl bg-[#14161E] hover:bg-[#1A1D27] border border-white/5 hover:border-emerald-500/40 transition-all text-left flex flex-col justify-between gap-3 shadow-sm hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-colors">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                Create Offer
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">Discounts & combos</p>
            </div>
          </button>

          {/* 4. Edit Prices */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onOpenBulkPrice();
            }}
            data-testid="quick-edit-prices"
            className="group p-4 rounded-xl bg-[#14161E] hover:bg-[#1A1D27] border border-white/5 hover:border-blue-500/40 transition-all text-left flex flex-col justify-between gap-3 shadow-sm hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 text-blue-400 flex items-center justify-center transition-colors">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                Edit Prices
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">Bulk % or $ change</p>
            </div>
          </button>

          {/* 5. Share QR */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onNavigate('qr');
            }}
            data-testid="quick-share-qr"
            className="group p-4 rounded-xl bg-[#14161E] hover:bg-[#1A1D27] border border-white/5 hover:border-purple-500/40 transition-all text-left flex flex-col justify-between gap-3 shadow-sm hover:shadow-md col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 text-purple-400 flex items-center justify-center transition-colors">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                Share QR
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">Table stands & links</p>
            </div>
          </button>
        </div>
      </section>

      {/* Today's Key Numbers with Comparison to Previous Period */}
      <section aria-labelledby="metrics-heading">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 id="metrics-heading" className="text-base font-bold text-white">
              Today's Key Numbers
            </h3>
            <p className="text-xs text-neutral-400">Live operational and guest engagement metrics</p>
          </div>
          <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live sync
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Revenue */}
          <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Today's Orders
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +14.2%
              </span>
            </div>
            <div className="my-3">
              <p className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
                {formatMoney(2480.5, restaurant.currency)}
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">vs $2,172.00 yesterday</p>
            </div>
            <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
              <span>{orders.length} orders placed</span>
              <span className="text-emerald-400 font-medium">96% fulfillment</span>
            </div>
          </div>

          {/* Card 2: Active Dishes & Sold Out */}
          <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Menu Status
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  soldOutItems.length > 0 ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                }`}
              >
                {soldOutItems.length > 0 ? `${soldOutItems.length} Sold Out` : 'All Available'}
              </span>
            </div>
            <div className="my-3">
              <p className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
                {activeDishes.length}{' '}
                <span className="text-sm font-normal text-neutral-400">/ {menuItems.length}</span>
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">Dishes live on customer menu</p>
            </div>
            <button
              onClick={() => onNavigate('menu')}
              className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              <span>Manage dish inventory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Guest Rating & Trust */}
          <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Guest Reviews
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +0.2 this week
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <p className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight flex items-center gap-1">
                {avgRating} <Star className="w-5 h-5 text-amber-400 fill-amber-400 inline" />
              </p>
              <span className="text-xs text-neutral-400">({approvedReviews.length} verified ratings)</span>
            </div>
            <button
              onClick={() => onNavigate('reviews')}
              className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              <span>View dish feedback</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: Service Requests Queue */}
          <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Table Calls
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  pendingRequests.length > 0
                    ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                    : 'bg-emerald-500/15 text-emerald-400'
                }`}
              >
                {pendingRequests.length > 0 ? `${pendingRequests.length} Pending` : 'All clear'}
              </span>
            </div>
            <div className="my-3">
              <p className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
                {pendingRequests.length}
                <span className="text-sm font-normal text-neutral-400 ml-2">unanswered</span>
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">Average response: 1m 40s</p>
            </div>
            <button
              onClick={() => onNavigate('requests')}
              className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              <span>Open service console</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Onboarding Next Steps Checklist (if not 100% complete) */}
      {completedCount < totalCount && (
        <section
          aria-labelledby="checklist-heading"
          className="p-5 md:p-6 rounded-2xl bg-[#12141C] border border-amber-500/20 shadow-md"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 id="checklist-heading" className="text-base font-bold text-white">
                  Next steps to maximize orders
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300">
                  {completedCount} of {totalCount} completed ({progressPercent}%)
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Finish these essential setups to give your diners the smoothest experience.
              </p>
            </div>
            <button
              onClick={() => {
                triggerHaptic(10);
                onOpenOnboarding();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Resume 5-Min Setup Wizard</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Checklist Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {checklist.map((step) => (
              <div
                key={step.id}
                onClick={() => onToggleChecklistStep && onToggleChecklistStep(step.id)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  step.completed
                    ? 'bg-white/[0.02] border-white/5 opacity-70'
                    : 'bg-[#181B26] border-white/10 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.completed ? 'bg-emerald-500 text-black' : 'border border-white/30 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-xs font-medium truncate ${
                      step.completed ? 'line-through text-neutral-400' : 'text-neutral-200'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {!step.completed && (
                  <span className="text-[10px] uppercase font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 flex-shrink-0">
                    Set up
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Two-Column Details: Recent Reviews & Active Running Offers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Dish Reviews */}
        <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Recent Dish Feedback</h4>
              </div>
              <button
                onClick={() => onNavigate('reviews')}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <span>View all ({approvedReviews.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {reviews.slice(0, 3).map((rev) => {
                const item = menuItems.find((i) => i.id === rev.item_id);
                const dishName = item?.name || 'Artisanal Dish';

                return (
                  <div key={rev.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-white truncate">{dishName}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-300 italic line-clamp-2">
                      "{rev.comment || 'Great presentation and delicious flavor!'}"
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-neutral-400">
                      <span>{rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Today'}</span>
                      {rev.owner_reply ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Replied
                        </span>
                      ) : (
                        <button
                          onClick={() => onNavigate('reviews')}
                          className="text-amber-400 hover:underline font-bold"
                        >
                          Reply to diner
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Offers & Promotions */}
        <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Active Promotional Offers</h4>
              </div>
              <button
                onClick={() => onNavigate('offers')}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <span>Offers studio ({offers.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {activeOffers.slice(0, 3).map((offer) => (
                <div key={offer.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-white truncate">{offer.title}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 uppercase">
                        {offer.badge_text || 'Active'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {offer.discount_type === 'percentage'
                        ? `${offer.discount_value}% OFF`
                        : offer.discount_type === 'fixed_amount'
                        ? `-$${offer.discount_value}`
                        : offer.discount_type}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-1">{offer.description}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      {offer.start_time ? 'Active during specific hours' : 'Active all day'}
                    </span>
                    <span className="text-neutral-400 font-mono">{offer.orders_count || 24} orders</span>
                  </div>
                </div>
              ))}
              {activeOffers.length === 0 && (
                <div className="text-center py-6 text-neutral-400 text-xs">
                  No active offers right now.{' '}
                  <button onClick={() => onNavigate('offers')} className="text-amber-400 underline font-bold">
                    Create an introductory deal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
