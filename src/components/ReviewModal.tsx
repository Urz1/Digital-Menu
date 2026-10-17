'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { MenuItem } from '@/types/database';
import { validateReviewPhoto } from '@/lib/review-engine';
import { triggerHaptic } from '@/lib/utils';
import { X, Star, Camera, Check, AlertCircle } from 'lucide-react';
import { Language, TRANSLATIONS } from '@/lib/translations';

interface ReviewModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  tableNumber?: string;
  availableTags?: string[];
  locale?: Language | string;
  onClose: () => void;
  onSubmitReview: (data: {
    item_id: string;
    rating: number;
    tags: string[];
    comment?: string;
    photo_url?: string;
    honeypot?: string;
    submissionDurationMs: number;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function ReviewModal({
  isOpen,
  item,
  availableTags,
  locale = 'en',
  onClose,
  onSubmitReview,
}: ReviewModalProps) {
  const currentLocale = (locale as Language) || 'en';
  const t = TRANSLATIONS[currentLocale] || TRANSLATIONS.en;
  const tagsToUse = availableTags && availableTags.length > 0 ? availableTags : t.defaultReviewTags;

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const formOpenedAtRef = useRef<number>(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isExplicitSubmitRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setHoverRating(0);
      setSelectedTags([]);
      setComment('');
      setPhotoPreview(null);
      setPhotoError(null);
      setHoneypot('');
      setSubmitError(null);
      setIsSuccess(false);
      formOpenedAtRef.current = Date.now();
      isExplicitSubmitRef.current = false;
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const toggleTag = (tag: string) => {
    triggerHaptic(8);
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isExplicitSubmitRef.current = false;
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate photo
    const validation = validateReviewPhoto({ type: file.type, size: file.size });
    if (!validation.isValid) {
      setPhotoError(validation.error || 'Invalid photo');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Strictly prevent auto-submission triggered by file dialog enter keyups or label clicks
    if (!isExplicitSubmitRef.current) {
      return;
    }
    isExplicitSubmitRef.current = false;

    setSubmitError(null);
    setIsSubmitting(true);
    triggerHaptic(15);

    const duration = Date.now() - formOpenedAtRef.current;

    const res = await onSubmitReview({
      item_id: item.id,
      rating,
      tags: selectedTags,
      comment: comment.trim() || undefined,
      photo_url: photoPreview || undefined,
      honeypot,
      submissionDurationMs: duration,
    });

    setIsSubmitting(false);

    if (res.success) {
      triggerHaptic(25);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setSubmitError(res.error || 'Failed to submit review. Please try again.');
    }
  };

  const starLabels = t.starRatingLabels;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 transition-opacity"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-t-3xl sm:rounded-3xl p-5 overflow-y-auto max-h-[90vh] shadow-2xl relative text-[var(--foreground)] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle for Mobile */}
        <div className="w-full py-1 sm:hidden flex justify-center -mt-1 mb-2">
          <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--surface)] hover:bg-[var(--border)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          /* FRIENDLY THANK-YOU STATE (No upsell, no redirect) */
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mb-3">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)]">{t.thankYouReviewTitle}</h3>
            <p className="text-xs text-[var(--muted)] mt-1 max-w-xs">
              {t.thankYouReviewDesc}
            </p>
            <button
              onClick={onClose}
              className="mt-6 h-10 px-8 rounded-full bg-[var(--surface)] hover:bg-[var(--border)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] transition-colors"
            >
              {t.done}
            </button>
          </div>
        ) : (
          /* REVIEW SUBMISSION FORM (< 15 seconds) */
          <form
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                e.preventDefault();
              }
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <span className="text-[11px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider block">
                {t.reviewModalTitle}
              </span>
              <h2 className="text-lg font-bold text-[var(--foreground)] font-brand mt-0.5 truncate">
                {item.name}
              </h2>
              <p className="text-[11px] text-[var(--muted)]">
                {t.reviewModalSubtitle}
              </p>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* 1-5 Star Tap Rating */}
            <div className="flex flex-col items-center py-3 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        triggerHaptic(12);
                        setRating(star);
                      }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                      aria-label={`${star} star rating`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          active
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-[var(--muted)]/40 hover:text-amber-400/50'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-300 mt-1">
                {starLabels[hoverRating || rating]}
              </span>
            </div>

            {/* Quick Tags Chips */}
            <div>
              <span className="text-xs font-bold text-[var(--foreground)] block mb-1.5">
                {t.quickTagsTitle} <span className="text-[var(--muted)] font-normal">{t.quickTagsOptional}</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tagsToUse.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`h-7 px-3 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-black font-bold shadow-xs'
                          : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] hover:border-amber-400/50'
                      }`}
                    >
                      {isSelected ? `✓ ${tag}` : tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Short Comment */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-[var(--foreground)]">
                  {t.commentLabel} <span className="text-[var(--muted)] font-normal">{t.commentOptional}</span>
                </span>
                <span className="text-[10px] text-[var(--muted)]">{comment.length}/280</span>
              </div>
              <textarea
                value={comment}
                maxLength={280}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t.commentPlaceholder}
                className="w-full h-20 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none outline-none focus:border-amber-400"
              />
            </div>

            {/* Photo Upload (Optional) */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--foreground)]">
                  {t.dishPhotoLabel} <span className="text-[var(--muted)] font-normal">{t.dishPhotoOptional}</span>
                </span>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    {t.removePhoto}
                  </button>
                )}
              </div>

              {photoPreview ? (
                <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border border-amber-500/40">
                  <Image
                    src={photoPreview}
                    alt="Review preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onClick={(e) => e.stopPropagation()}
                    onChange={handlePhotoSelect}
                    id="review-photo-input"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="h-9 px-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--border)] text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-[var(--muted)]" />
                    <span>{t.uploadPhoto}</span>
                  </button>
                  <span className="text-[11px] text-[var(--muted)]">JPG, PNG, or WEBP</span>
                </div>
              )}

              {photoError && (
                <p className="text-[11px] text-red-500 mt-1">{photoError}</p>
              )}
            </div>

            {/* Invisible Honeypot Field for Bot Prevention */}
            <input
              type="text"
              name="website_url"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="opacity-0 absolute -z-10 w-0 h-0 pointer-events-none"
            />

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                onClick={() => {
                  isExplicitSubmitRef.current = true;
                }}
                disabled={isSubmitting}
                className="w-full h-11 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{t.submittingReview}</span>
                ) : (
                  <span>{t.submitReview}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
