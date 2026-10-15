'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MenuItem, ItemOption, DishReview, DishReviewStats } from '@/types/database';
import { ItemPricingResult } from '@/lib/pricing-engine';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import { X, Minus, Plus, Tag, Clock, Sparkles, Star, MessageSquare, Flag, Check } from 'lucide-react';

interface ItemDetailModalProps {
  item: MenuItem | null;
  pricingResult?: ItemPricingResult;
  reviewStats?: DishReviewStats;
  dishReviews?: DishReview[];
  pairingRecommendations?: MenuItem[];
  currencySymbol?: string;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, options: ItemOption[], notes: string) => void;
  onQuickAddPairing?: (pairingItem: MenuItem) => void;
  onOpenReviewModal?: () => void;
  onReportReview?: (reviewId: string, reason: string) => void;
  locale?: string;
}

export function ItemDetailModal({
  item,
  pricingResult,
  reviewStats,
  dishReviews = [],
  pairingRecommendations = [],
  currencySymbol = '$',
  onClose,
  onAddToCart,
  onQuickAddPairing,
  onOpenReviewModal,
  onReportReview,
  locale = 'en',
}: ItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<ItemOption[]>([]);
  const [notes, setNotes] = useState('');
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportedReviewIds, setReportedReviewIds] = useState<Set<string>>(new Set());

  // Reset state when opening a new item
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSelectedOptions([]);
      setNotes('');
      setReportingReviewId(null);
    }
  }, [item]);

  if (!item) return null;

  const displayName = (locale === 'es' && item.name_es) ? item.name_es : item.name;
  const displayDesc = (locale === 'es' && item.description_es) ? item.description_es : item.description;

  const toggleOption = (opt: ItemOption) => {
    triggerHaptic(8);
    const exists = selectedOptions.some((o) => o.id === opt.id);
    if (exists) {
      setSelectedOptions(selectedOptions.filter((o) => o.id !== opt.id));
    } else {
      setSelectedOptions([...selectedOptions, opt]);
    }
  };

  const handleReport = (reviewId: string, reason: string) => {
    triggerHaptic(12);
    setReportedReviewIds(new Set([...reportedReviewIds, reviewId]));
    setReportingReviewId(null);
    if (onReportReview) {
      onReportReview(reviewId, reason);
    }
  };

  const hasOffer = pricingResult?.hasOffer ?? false;
  const unitBasePrice = hasOffer ? (pricingResult?.finalPrice ?? item.price) : item.price;
  const addonsTotal = selectedOptions.reduce((acc, opt) => acc + Number(opt.price || 0), 0);
  const lineTotal = (unitBasePrice + addonsTotal) * quantity;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end items-center transition-opacity"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[88vh] bg-[var(--card)] rounded-t-3xl overflow-y-auto flex flex-col relative shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-full py-2.5 flex justify-center sticky top-0 bg-[var(--card)] z-10">
          <div className="w-10 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-4 w-8 h-8 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] z-20 hover:bg-[var(--border)]"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Image */}
        <div className="relative w-full h-56 bg-neutral-900 flex-shrink-0">
          <Image
            src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
            alt={displayName}
            fill
            sizes="(max-width: 520px) 100vw, 520px"
            className="object-cover"
          />
        </div>

        {/* Details Body */}
        <div className="p-5 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {hasOffer && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white inline-flex items-center gap-1 shadow-xs"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <Tag className="w-3 h-3" />
                  <span>{pricingResult?.badgeText || 'Special Offer'}</span>
                </span>
              )}
              {hasOffer && pricingResult && pricingResult.savings > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Save {formatMoney(pricingResult.savings, currencySymbol)}
                </span>
              )}
              {pricingResult?.urgencyText && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{pricingResult.urgencyText}</span>
                </span>
              )}
              {item.is_chefs_pick && !hasOffer && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                  ⭐ Chef's Pick
                </span>
              )}
              {!item.is_available && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  Sold Out
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-[var(--foreground)] font-brand">
              {displayName}
            </h2>

            {/* Price section */}
            <div className="flex items-baseline gap-2 mt-1">
              {hasOffer ? (
                <>
                  <span className="text-xl font-extrabold" style={{ color: 'var(--primary)' }}>
                    {formatMoney(unitBasePrice, currencySymbol)}
                  </span>
                  <span className="text-sm text-[var(--muted)] line-through">
                    {formatMoney(item.price, currencySymbol)}
                  </span>
                </>
              ) : (
                <div className="text-lg font-extrabold" style={{ color: 'var(--primary)' }}>
                  {formatMoney(item.price, currencySymbol)}
                </div>
              )}
            </div>

            {/* 3-Review Threshold: Show rating & count ONLY when review count >= 3 */}
            {reviewStats?.is_threshold_met && (
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-extrabold ml-1">{reviewStats.average_rating.toFixed(1)}</span>
                </div>
                <span className="text-[var(--muted)]">•</span>
                <span className="text-xs text-[var(--muted)]">
                  {reviewStats.review_count} verified reviews
                </span>
              </div>
            )}

            {/* Plain-language Offer Terms box (never hidden) */}
            {hasOffer && pricingResult?.appliedOffer && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-[var(--foreground)]">
                <span className="font-bold block text-amber-600 dark:text-amber-400">
                  {pricingResult.appliedOffer.title}
                </span>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  {pricingResult.appliedOffer.description || pricingResult.termsSummary}
                </p>
              </div>
            )}

            <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">
              {displayDesc}
            </p>
          </div>

          {/* Gentle "Goes well with" Row (Non-blocking) */}
          {pairingRecommendations.length > 0 && (
            <div className="pt-2 border-t border-[var(--border)]">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                  Goes well with
                </h4>
              </div>

              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {pairingRecommendations.slice(0, 3).map((pairing) => (
                  <div
                    key={pairing.id}
                    className="flex-shrink-0 w-36 bg-[var(--background)] border border-[var(--border)] rounded-xl p-2 flex flex-col justify-between"
                  >
                    <div className="relative w-full h-16 rounded-lg overflow-hidden mb-1.5 bg-neutral-800">
                      <Image
                        src={pairing.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'}
                        alt={pairing.name}
                        fill
                        className="object-cover"
                        sizes="140px"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[var(--foreground)] truncate leading-tight">
                      {pairing.name}
                    </span>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-[var(--border)]">
                      <span className="text-[11px] font-bold" style={{ color: 'var(--primary)' }}>
                        +{formatMoney(pairing.price, currencySymbol)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(12);
                          if (onQuickAddPairing) onQuickAddPairing(pairing);
                        }}
                        className="h-6 px-2 rounded-full text-[10px] font-bold text-white shadow-xs transition-transform active:scale-95"
                        style={{ backgroundColor: 'var(--primary)' }}
                        title={`Add ${pairing.name}`}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta Box (Spice, Dietary, Allergens) */}
          <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[var(--muted)]">Spice Level:</span>
              <span className="font-bold text-[var(--foreground)]">
                {item.spice_level === 0 ? 'None' : '🌶️'.repeat(item.spice_level) + ` (Level ${item.spice_level})`}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-[var(--muted)]">Dietary:</span>
              <span className="font-bold text-[var(--foreground)] uppercase">
                {item.tags?.filter((t) => t !== 'chefsPick').join(', ') || 'Standard'}
              </span>
            </div>

            {item.allergens && item.allergens.length > 0 && (
              <div>
                <span className="font-semibold text-[var(--muted)] block mb-1">Contains Allergens:</span>
                <div className="flex flex-wrap gap-1.5">
                  {item.allergens.map((allg) => (
                    <span
                      key={allg}
                      className="px-2 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] font-medium text-[11px]"
                    >
                      {allg}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add-ons & Customizations */}
          {item.options && item.options.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Customizations & Add-ons</h3>
              <div className="flex flex-col gap-2">
                {item.options.map((opt) => {
                  const isChecked = selectedOptions.some((o) => o.id === opt.id);
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-[var(--primary)] bg-[rgba(var(--primary-rgb),0.05)]'
                          : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--muted)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOption(opt)}
                          className="w-4 h-4 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                        <span className="text-xs font-semibold text-[var(--foreground)]">{opt.name}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
                        {opt.price > 0 ? `+${formatMoney(opt.price, currencySymbol)}` : 'Included'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Requests / Notes */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Special Instructions</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dressing on the side, extra crispy, sauce temperature..."
              className="w-full h-18 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] resize-none outline-none focus:border-[var(--primary)]"
            />
          </div>

          {/* GUEST REVIEWS & RATINGS */}
          <div className="pt-3 border-t border-[var(--border)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Guest Reviews</span>
                </h3>
                <p className="text-[11px] text-[var(--muted)]">Honest feedback from recent diners</p>
              </div>

              {onOpenReviewModal && (
                <button
                  type="button"
                  onClick={onOpenReviewModal}
                  className="h-8 px-3 rounded-full text-xs font-bold text-white shadow-xs transition-transform active:scale-95 flex items-center gap-1"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <Star className="w-3 h-3 fill-current" />
                  <span>Rate this dish</span>
                </button>
              )}
            </div>

            {dishReviews.length === 0 ? (
              <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-center text-xs text-[var(--muted)]">
                No reviews yet for this dish. Be the first to share your thoughts!
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                {dishReviews.map((rev) => {
                  const isReported = reportedReviewIds.has(rev.id);
                  const isReportingThis = reportingReviewId === rev.id;

                  return (
                    <div
                      key={rev.id}
                      className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-600'
                                }`}
                              />
                            ))}
                          </div>
                          {rev.table_number && (
                            <span className="text-[10px] text-[var(--muted)]">• {rev.table_number}</span>
                          )}
                        </div>

                        {/* Report button */}
                        {isReported ? (
                          <span className="text-[10px] text-amber-500 font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" /> Reported
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setReportingReviewId(isReportingThis ? null : rev.id)}
                            className="text-[10px] text-[var(--muted)] hover:text-red-400 flex items-center gap-0.5"
                            title="Report review"
                          >
                            <Flag className="w-3 h-3" />
                            <span>Report</span>
                          </button>
                        )}
                      </div>

                      {/* Inline reporting reason prompt */}
                      {isReportingThis && (
                        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-200 flex flex-col gap-1.5 my-1">
                          <span className="font-semibold text-white">Why are you reporting this review?</span>
                          <div className="flex flex-wrap gap-1">
                            {['Abusive language', 'Spam / Promo', 'Personal data', 'Off-topic'].map((reason) => (
                              <button
                                key={reason}
                                type="button"
                                onClick={() => handleReport(rev.id, reason)}
                                className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/40 text-red-100 font-medium"
                              >
                                {reason}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {rev.tags && rev.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {rev.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-neutral-300 font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Comment */}
                      {rev.comment && (
                        <p className="text-[var(--foreground)] text-xs leading-relaxed">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                      )}

                      {/* Photo Thumbnail */}
                      {rev.photo_url && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--border)] mt-1">
                          <Image
                            src={rev.photo_url}
                            alt="Guest review photo"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Public Owner / Staff Reply */}
                      {rev.owner_reply && (
                        <div className="mt-1 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px]">
                          <span className="font-bold text-amber-600 dark:text-amber-400 block">
                            💬 Response from {rev.owner_reply_by || 'Restaurant'}:
                          </span>
                          <p className="text-[var(--foreground)] mt-0.5">
                            {rev.owner_reply}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 bg-[var(--card)] border-t border-[var(--border)] p-4 flex items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-full p-1">
            <button
              onClick={() => {
                if (quantity > 1) {
                  triggerHaptic(8);
                  setQuantity(quantity - 1);
                }
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--border)]"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-[var(--foreground)]">
              {quantity}
            </span>
            <button
              onClick={() => {
                triggerHaptic(8);
                setQuantity(quantity + 1);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--border)]"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Order Button */}
          <button
            disabled={!item.is_available}
            onClick={() => {
              triggerHaptic(20);
              // Important: Pass base item with discounted price if offer applies so cart receives correct pricing
              const effectiveItem = hasOffer
                ? { ...item, price: unitBasePrice }
                : item;
              onAddToCart(effectiveItem, quantity, selectedOptions, notes);
              onClose();
            }}
            className="flex-1 h-11 rounded-full text-white font-bold text-sm shadow-md transition-all disabled:bg-neutral-500 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            style={{ backgroundColor: item.is_available ? 'var(--primary)' : undefined }}
          >
            <span>{item.is_available ? 'Add to Order' : 'Sold Out'}</span>
            {item.is_available && <span>• {formatMoney(lineTotal, currencySymbol)}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
