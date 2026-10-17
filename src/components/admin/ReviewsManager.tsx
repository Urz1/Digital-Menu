'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Restaurant,
  MenuItem,
  DishReview,
  ReviewModerationLog,
  RestaurantReviewSettings,
  UserRole,
  ReviewStatus,
} from '@/types/database';
import {
  getDishReviews,
  getReviewSettings,
  updateReviewSettings,
  replyToDishReview,
  moderateDishReview,
  getReviewModerationLogs,
  toggleItemReviews,
} from '@/lib/data-provider';
import {
  generateWeeklyReviewSummary,
  canRemoveReview,
  canReplyToReview,
  SUGGESTED_REPLY_STARTERS,
} from '@/lib/review-engine';
import { triggerHaptic } from '@/lib/utils';
import { subscribeSync } from '@/lib/sync-channel';
import {
  Star,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Settings,
  History,
  Send,
  Flag,
  Tag,
  ShieldAlert,
  Bell,
  X,
  Plus,
  Info,
  Check,
} from 'lucide-react';

interface ReviewsManagerProps {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  userRole: UserRole;
  initialReviews?: DishReview[];
  onReviewsChange?: (reviews: DishReview[]) => void;
}

export function ReviewsManager({
  restaurant,
  menuItems,
  userRole,
  initialReviews,
  onReviewsChange,
}: ReviewsManagerProps) {
  const [reviews, setReviews] = useState<DishReview[]>(initialReviews || []);
  const [settings, setSettings] = useState<RestaurantReviewSettings | null>(null);
  const [moderationLogs, setModerationLogs] = useState<ReviewModerationLog[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'new' | 'attention' | 'replied' | 'reported'>('all');
  const [activeReplyReviewId, setActiveReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);

  // Moderation Removal Dialog
  const [removalReview, setRemovalReview] = useState<DishReview | null>(null);
  const [removalReason, setRemovalReason] = useState<string>('Abusive language or profanity');
  const [customRemovalReason, setCustomRemovalReason] = useState<string>('');
  const [removalError, setRemovalError] = useState<string | null>(null);

  // Modals
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState<boolean>(false);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [photoViewerUrl, setPhotoViewerUrl] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    triggerHaptic(12);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch data
  const loadData = async () => {
    const [revs, sets, logs] = await Promise.all([
      getDishReviews(restaurant.id),
      getReviewSettings(restaurant.id),
      getReviewModerationLogs(restaurant.id),
    ]);
    if (revs && revs.length > 0) {
      setReviews(revs);
      onReviewsChange?.(revs);
    }
    setSettings(sets);
    setModerationLogs(logs);
  };

  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      setReviews(initialReviews);
    }
  }, [initialReviews]);

  useEffect(() => {
    loadData();

    // Cross-tab and live sync: any review submitted anywhere immediately appears
    const unsubscribe = subscribeSync((event) => {
      if (event.type === 'REVIEW_SUBMITTED') {
        setReviews((prev) => {
          if (prev.some((r) => r.id === event.review.id)) return prev;
          const next = [event.review, ...prev];
          onReviewsChange?.(next);
          return next;
        });
        showToast(`New feedback received from Table ${event.review.table_number || 'Guest'}!`);
      } else if (event.type === 'REVIEW_UPDATED') {
        setReviews((prev) => {
          const next = prev.map((r) => (r.id === event.review.id ? event.review : r));
          onReviewsChange?.(next);
          return next;
        });
      }
    });

    // 4-second live polling to ensure remote updates from other devices appear without refresh
    const pollInterval = setInterval(() => {
      getDishReviews(restaurant.id).then((freshRevs) => {
        if (freshRevs && freshRevs.length > 0) {
          setReviews(freshRevs);
          onReviewsChange?.(freshRevs);
        }
      });
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [restaurant.id]);

  // Item name lookup map
  const itemMap = useMemo(() => {
    const map = new Map<string, MenuItem>();
    for (const item of menuItems) {
      map.set(item.id, item);
    }
    return map;
  }, [menuItems]);

  // Weekly Summary
  const weeklySummary = useMemo(() => {
    return generateWeeklyReviewSummary(reviews, menuItems);
  }, [reviews, menuItems]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (filterTab === 'new') return !r.owner_reply && r.status === 'published';
      if (filterTab === 'attention') return r.status === 'flagged' || r.status === 'reported';
      if (filterTab === 'replied') return !!r.owner_reply;
      if (filterTab === 'reported') return r.status === 'reported';
      return true; // 'all'
    });
  }, [reviews, filterTab]);

  const countAttention = reviews.filter((r) => r.status === 'flagged' || r.status === 'reported').length;
  const countNew = reviews.filter((r) => !r.owner_reply && r.status === 'published').length;
  const countReplied = reviews.filter((r) => !!r.owner_reply).length;
  const countReported = reviews.filter((r) => r.status === 'reported').length;

  // Handle Reply
  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    triggerHaptic(15);

    const staffName = userRole === 'owner' ? `${restaurant.name} Owner` : 'Kitchen Staff Team';
    const success = await replyToDishReview(reviewId, replyText, staffName);
    setIsSubmittingReply(false);

    if (success) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                owner_reply: replyText.trim(),
                owner_reply_at: new Date().toISOString(),
                owner_reply_by: staffName,
              }
            : r
        )
      );
      setActiveReplyReviewId(null);
      setReplyText('');
      showToast('Reply published successfully.');
      loadData();
    }
  };

  // Handle Approve / Keep
  const handleApprove = async (review: DishReview) => {
    triggerHaptic(15);
    const res = await moderateDishReview(
      review.id,
      'approve',
      'Approved after review inspection',
      userRole,
      userRole === 'owner' ? 'Owner' : 'Staff'
    );
    if (res.success) {
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, status: 'published', flagged_reason: undefined } : r))
      );
      showToast('Review approved and published.');
      loadData();
    }
  };

  // Handle Remove (Owners only)
  const handleConfirmRemoval = async () => {
    if (!removalReview) return;
    setRemovalError(null);

    const effectiveReason =
      removalReason === 'Other' ? customRemovalReason.trim() : removalReason;

    if (!effectiveReason) {
      setRemovalError('A valid reason is required to remove a review.');
      return;
    }

    triggerHaptic(20);
    const res = await moderateDishReview(
      removalReview.id,
      'remove',
      effectiveReason,
      userRole,
      userRole === 'owner' ? 'Owner' : 'Staff'
    );

    if (res.success) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === removalReview.id
            ? { ...r, status: 'removed', flagged_reason: effectiveReason }
            : r
        )
      );
      setRemovalReview(null);
      setCustomRemovalReason('');
      showToast('Review removed and logged to audit trail.');
      loadData();
    } else {
      setRemovalError(res.error || 'Failed to remove review');
    }
  };

  // Toggle Global Reviews
  const handleToggleGlobalReviews = async () => {
    if (!settings) return;
    triggerHaptic(15);
    const updated = await updateReviewSettings(restaurant.id, {
      reviews_enabled: !settings.reviews_enabled,
    });
    setSettings(updated);
    showToast(`Reviews system ${updated.reviews_enabled ? 'enabled' : 'disabled'} globally.`);
  };

  // Tag Management
  const handleAddTag = async () => {
    if (!newTagInput.trim() || !settings) return;
    const tag = newTagInput.trim();
    if (settings.available_tags.includes(tag)) return;

    const updatedTags = [...settings.available_tags, tag];
    const updated = await updateReviewSettings(restaurant.id, {
      available_tags: updatedTags,
    });
    setSettings(updated);
    setNewTagInput('');
    showToast(`Tag "${tag}" added.`);
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!settings) return;
    const updatedTags = settings.available_tags.filter((t) => t !== tagToRemove);
    const updated = await updateReviewSettings(restaurant.id, {
      available_tags: updatedTags,
    });
    setSettings(updated);
    showToast(`Tag "${tagToRemove}" removed.`);
  };

  // Notification Frequency
  const handleUpdateFrequency = async (freq: 'instant' | 'daily_digest' | 'off') => {
    if (!settings) return;
    triggerHaptic(10);
    const updated = await updateReviewSettings(restaurant.id, {
      notification_frequency: freq,
    });
    setSettings(updated);
    showToast(`Alert frequency updated to ${freq}.`);
  };

  return (
    <div className="flex flex-col gap-6 text-white animate-in fade-in duration-300">
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/[0.03] border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-brand">Dish Reviews & Moderation</h2>
            <span
              className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                settings?.reviews_enabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {settings?.reviews_enabled ? '● Reviews Active' : '○ Disabled'}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Honest dish ratings from dining guests. Negative reviews stay visible unless flagged
            for abuse, spam, or personal data.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="open-audit-log-btn"
            onClick={() => setIsAuditLogOpen(true)}
            className="h-9 px-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 flex items-center gap-1.5 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-neutral-400" />
            <span>Audit Log ({moderationLogs.length})</span>
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="h-9 px-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 flex items-center gap-1.5 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-neutral-400" />
            <span>Tags & Settings</span>
          </button>

          {userRole === 'owner' && (
            <button
              onClick={handleToggleGlobalReviews}
              className={`h-9 px-4 rounded-full text-xs font-bold transition-all ${
                settings?.reviews_enabled
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md'
              }`}
            >
              {settings?.reviews_enabled ? 'Turn Reviews Off' : 'Turn Reviews On'}
            </button>
          )}
        </div>
      </div>

      {/* 2. WEEKLY SUMMARY IN PLAIN LANGUAGE */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              Weekly Feedback Digest
            </span>
            <p className="text-xs text-white font-medium mt-0.5 leading-relaxed">
              {weeklySummary.headlineSentence}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-400 flex-wrap">
              {weeklySummary.topRatedDish && (
                <span className="text-emerald-400">
                  ★ Top: <strong>{weeklySummary.topRatedDish.name}</strong> ({weeklySummary.topRatedDish.rating} avg)
                </span>
              )}
              {weeklySummary.needsAttentionDish && (
                <span className="text-amber-300">
                  ⚡ Focus: <strong>{weeklySummary.needsAttentionDish.name}</strong> ({weeklySummary.needsAttentionDish.rating} avg)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <span className="text-[11px] text-neutral-500">
            Threshold: <strong>{settings?.min_reviews_threshold || 3} reviews</strong> to show rating badge
          </span>
        </div>
      </div>

      {/* 3. FAIRNESS REMINDER ALERT */}
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-center gap-2.5">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <p className="text-[11px] leading-relaxed">
          <strong>Fairness Rule:</strong> Genuine negative reviews (1-2 stars) help your culinary team improve and build trust with diners. Moderation strictly removes abuse, hate speech, spam, and personal data.
        </p>
      </div>

      {/* 4. INBOX TABS */}
      <div className="flex gap-2 overflow-x-auto border-b border-white/10 pb-2">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
            filterTab === 'all'
              ? 'bg-amber-500 text-black shadow-xs'
              : 'bg-white/5 text-neutral-400 hover:text-white'
          }`}
        >
          All ({reviews.length})
        </button>

        <button
          onClick={() => setFilterTab('attention')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
            filterTab === 'attention'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-white/5 text-neutral-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Needs Attention</span>
          {countAttention > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-extrabold animate-pulse">
              {countAttention}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilterTab('new')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
            filterTab === 'new'
              ? 'bg-amber-500 text-black shadow-xs'
              : 'bg-white/5 text-neutral-400 hover:text-white'
          }`}
        >
          New ({countNew})
        </button>

        <button
          onClick={() => setFilterTab('replied')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
            filterTab === 'replied'
              ? 'bg-amber-500 text-black shadow-xs'
              : 'bg-white/5 text-neutral-400 hover:text-white'
          }`}
        >
          Replied ({countReplied})
        </button>

        <button
          onClick={() => setFilterTab('reported')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
            filterTab === 'reported'
              ? 'bg-amber-500 text-black shadow-xs'
              : 'bg-white/5 text-neutral-400 hover:text-white'
          }`}
        >
          Reported by Guests ({countReported})
        </button>
      </div>

      {/* 5. REVIEWS LIST */}
      {filteredReviews.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white/[0.02] border border-white/10 text-neutral-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 text-neutral-600" />
          <p className="text-sm font-bold text-white">No reviews in this view</p>
          <p className="text-xs text-neutral-500 mt-1">
            {filterTab === 'attention'
              ? 'Great news! All flagged and reported reviews have been resolved.'
              : 'Select another filter above to view diner feedback.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredReviews.map((rev) => {
            const item = itemMap.get(rev.item_id);
            const isReplying = activeReplyReviewId === rev.id;

            return (
              <div
                key={rev.id}
                className={`p-4 rounded-2xl bg-white/[0.02] border transition-all ${
                  rev.status === 'flagged' || rev.status === 'reported'
                    ? 'border-rose-500/40 bg-rose-500/[0.02]'
                    : rev.status === 'removed'
                    ? 'border-neutral-800 opacity-60'
                    : 'border-white/10'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white font-brand capitalize">
                      {item?.name || (rev.item_id ? rev.item_id.replace(/^item-/, '').replace(/-\d+$/, '').replace(/-/g, ' ') : 'Verified Dish')}
                    </span>
                    {rev.table_number && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-neutral-400">
                        {rev.table_number}
                      </span>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        rev.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : rev.status === 'flagged'
                          ? 'bg-rose-500/20 text-rose-300'
                          : rev.status === 'reported'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>

                  <span className="text-[11px] text-neutral-500">
                    {new Date(rev.created_at).toLocaleDateString()} at{' '}
                    {new Date(rev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Rating & Tags */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'
                        }`}
                      />
                    ))}
                  </div>

                  {rev.tags && rev.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {rev.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-neutral-300 font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Flagged / Reported Notice */}
                {rev.flagged_reason && (
                  <div className="mt-2.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>
                      <strong>Moderation Alert:</strong> {rev.flagged_reason}
                    </span>
                  </div>
                )}

                {/* Comment */}
                {rev.comment && (
                  <p className="text-xs text-neutral-300 mt-2.5 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                )}

                {/* Photo Thumbnail */}
                {rev.photo_url && (
                  <div className="mt-2.5">
                    <button
                      type="button"
                      onClick={() => setPhotoViewerUrl(rev.photo_url!)}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 hover:border-amber-400 transition-colors block"
                    >
                      <Image
                        src={rev.photo_url}
                        alt="Dish review attachment"
                        fill
                        className="object-cover"
                      />
                    </button>
                  </div>
                )}

                {/* Owner Reply */}
                {rev.owner_reply && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                    <span className="font-bold text-amber-400 block">
                      💬 Public Response ({rev.owner_reply_by || 'Owner'}):
                    </span>
                    <p className="text-neutral-200 mt-1">{rev.owner_reply}</p>
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      Posted on {new Date(rev.owner_reply_at || rev.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Actions Bar */}
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {/* Reply Button */}
                    <button
                      onClick={() => {
                        triggerHaptic(8);
                        setActiveReplyReviewId(isReplying ? null : rev.id);
                        setReplyText(rev.owner_reply || '');
                      }}
                      className="h-8 px-3 rounded-full bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{rev.owner_reply ? 'Edit Reply' : 'Reply to Diner'}</span>
                    </button>

                    {/* Approve / Keep for flagged reviews */}
                    {(rev.status === 'flagged' || rev.status === 'reported') && (
                      <button
                        onClick={() => handleApprove(rev)}
                        className="h-8 px-3 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Keep</span>
                      </button>
                    )}
                  </div>

                  {/* Remove Button (Owner only) */}
                  {rev.status !== 'removed' && (
                    <div>
                      {userRole === 'owner' ? (
                        <button
                          onClick={() => {
                            triggerHaptic(12);
                            setRemovalReview(rev);
                            setRemovalReason('Abusive language or profanity');
                            setCustomRemovalReason('');
                            setRemovalError(null);
                          }}
                          className="h-8 px-3 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Review</span>
                        </button>
                      ) : (
                        <span
                          title="Only owners can remove reviews"
                          className="text-[11px] text-neutral-500 italic"
                        >
                          Only owners can remove
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Reply Composer Drawer */}
                {isReplying && (
                  <div className="mt-3 p-3 rounded-2xl bg-white/[0.03] border border-amber-500/30 animate-in fade-in duration-200">
                    <span className="text-xs font-bold text-amber-400 block mb-1">
                      Quick Polite Starters (tap to insert & edit):
                    </span>

                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {SUGGESTED_REPLY_STARTERS.map((starter, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => {
                            triggerHaptic(8);
                            setReplyText(starter);
                          }}
                          className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors text-left"
                        >
                          "{starter.slice(0, 42)}..."
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your public response to the dining guest..."
                      className="w-full h-20 p-2.5 rounded-xl border border-white/10 bg-black/40 text-xs text-white placeholder-neutral-500 resize-none outline-none focus:border-amber-400"
                    />

                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReplyReviewId(null);
                          setReplyText('');
                        }}
                        className="h-8 px-3 rounded-full text-xs text-neutral-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isSubmittingReply || !replyText.trim()}
                        onClick={() => handleSendReply(rev.id)}
                        className="h-8 px-4 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" />
                        <span>Post Public Reply</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 6. REMOVAL CONFIRMATION MODAL WITH REQUIRED REASON */}
      {removalReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#16181E] border border-rose-500/40 rounded-3xl p-6 text-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5 text-rose-400 mb-2">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Moderate Review Removal</h3>
            </div>

            <p className="text-xs text-neutral-400">
              Fairness policy requires documenting why this review is being removed. Genuine negative reviews cannot be removed.
            </p>

            {removalError && (
              <p className="text-xs text-rose-400 mt-2 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                {removalError}
              </p>
            )}

            <div className="my-4 flex flex-col gap-2">
              <span className="text-xs font-bold text-neutral-300">Required Removal Reason:</span>
              {[
                'Abusive language or profanity',
                'Spam or advertisement',
                'Personal contact data (PII)',
                'Off-topic / not about this food item',
                'Other',
              ].map((rOpt) => (
                <label
                  key={rOpt}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition-colors ${
                    removalReason === rOpt
                      ? 'border-rose-500 bg-rose-500/10 text-white'
                      : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="removal_reason"
                    checked={removalReason === rOpt}
                    onChange={() => setRemovalReason(rOpt)}
                    className="w-3.5 h-3.5 text-rose-500"
                  />
                  <span>{rOpt}</span>
                </label>
              ))}

              {removalReason === 'Other' && (
                <textarea
                  value={customRemovalReason}
                  onChange={(e) => setCustomRemovalReason(e.target.value)}
                  placeholder="Specify clear objective violation..."
                  className="w-full h-16 p-2 rounded-xl border border-white/10 bg-black/40 text-xs text-white outline-none focus:border-rose-500"
                />
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRemovalReview(null)}
                className="h-10 px-4 rounded-full bg-white/10 hover:bg-white/15 text-xs font-bold text-white"
              >
                Cancel
              </button>
              <button
                id="confirm-remove-review-btn"
                onClick={handleConfirmRemoval}
                className="h-10 px-5 rounded-full bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg transition-colors"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. AUDIT LOG MODAL */}
      {isAuditLogOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#16181E] border border-white/10 rounded-3xl p-6 text-white shadow-2xl max-h-[85vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAuditLogOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-neutral-400"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <History className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white font-brand">Review Moderation Audit Log</h3>
            </div>
            <p className="text-xs text-neutral-400 mb-4">
              Complete, transparent record of all moderation actions taken by staff and owners.
            </p>

            {moderationLogs.length === 0 ? (
              <p className="text-xs text-neutral-500 py-8 text-center">No moderation actions recorded yet.</p>
            ) : (
              <div className="flex flex-col gap-2 divide-y divide-white/5">
                {moderationLogs.map((log) => (
                  <div key={log.id} className="pt-2.5 first:pt-0 text-xs flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            log.action === 'remove'
                              ? 'bg-rose-500/20 text-rose-300'
                              : log.action === 'reply'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {log.action}
                        </span>
                        <strong className="text-white">{log.user_name}</strong>
                        <span className="text-[10px] text-neutral-500">({log.user_role})</span>
                      </div>
                      {log.reason && (
                        <p className="text-neutral-400 mt-1 text-[11px]">Reason: &ldquo;{log.reason}&rdquo;</p>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. TAGS & SETTINGS MODAL */}
      {isSettingsModalOpen && settings && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#16181E] border border-white/10 rounded-3xl p-6 text-white shadow-2xl max-h-[85vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-neutral-400"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white font-brand mb-1">Review Settings & Tags</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Configure guest quick tags, alert preferences, and per-dish review toggles.
            </p>

            {/* Notification Frequency */}
            <div className="mb-5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-neutral-300">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Alert Notifications for Flagged/Reported Reviews</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['instant', 'daily_digest', 'off'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleUpdateFrequency(opt)}
                    className={`h-8 rounded-xl text-xs font-semibold capitalize transition-colors ${
                      settings.notification_frequency === opt
                        ? 'bg-amber-500 text-black font-bold'
                        : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {opt.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Tags Editor */}
            <div className="mb-5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-xs font-bold text-neutral-300 block mb-1">
                Editable Quick Tags (Shown to Diners)
              </span>
              <p className="text-[11px] text-neutral-500 mb-2.5">
                Guests can tap these tags in under 15 seconds to review without typing.
              </p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {settings.available_tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium flex items-center gap-1.5"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-neutral-400 hover:text-rose-400"
                      title="Remove tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="e.g. Perfectly seasoned, Tender bite"
                  className="flex-1 h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tag</span>
                </button>
              </div>
            </div>

            {/* Per-Dish Review Switches */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-xs font-bold text-neutral-300 block mb-1">
                Per-Dish Review Availability
              </span>
              <p className="text-[11px] text-neutral-500 mb-2.5">
                Turn reviews on or off for individual menu items.
              </p>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
                  >
                    <span className="font-medium text-white truncate max-w-[240px]">
                      {item.name}
                    </span>
                    <button
                      onClick={async () => {
                        const next = item.reviews_enabled === false ? true : false;
                        await toggleItemReviews(item.id, next);
                        item.reviews_enabled = next;
                        showToast(`Reviews ${next ? 'enabled' : 'disabled'} for ${item.name}`);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                        item.reviews_enabled !== false
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.reviews_enabled !== false ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. PHOTO PREVIEW LIGHTBOX */}
      {photoViewerUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPhotoViewerUrl(null)}
        >
          <div className="relative max-w-lg w-full max-h-[80vh] h-96 rounded-2xl overflow-hidden border border-white/20">
            <Image
              src={photoViewerUrl}
              alt="Expanded photo view"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* 10. TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-black px-4 py-2 rounded-full text-xs font-bold shadow-xl animate-toast flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
