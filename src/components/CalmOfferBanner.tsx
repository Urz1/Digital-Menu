'use client';

import React, { useState, useEffect } from 'react';
import { Offer } from '@/types/database';
import { Tag, X, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '@/lib/utils';

interface CalmOfferBannerProps {
  activeOffer: Offer | null;
  onSeeOffer: (offer: Offer) => void;
}

export function CalmOfferBanner({ activeOffer, onSeeOffer }: CalmOfferBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Default true until checked

  useEffect(() => {
    if (!activeOffer) return;
    try {
      const dismissed = sessionStorage.getItem(`calm_banner_dismissed_${activeOffer.id}`);
      if (!dismissed) {
        setIsDismissed(false);
      }
    } catch {
      setIsDismissed(false);
    }
  }, [activeOffer]);

  if (!activeOffer || isDismissed || !activeOffer.show_top_banner) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    triggerHaptic(10);
    try {
      sessionStorage.setItem(`calm_banner_dismissed_${activeOffer.id}`, 'true');
    } catch {
      // Storage access check
    }
  };

  const handleAction = () => {
    triggerHaptic(12);
    onSeeOffer(activeOffer);
  };

  const displayText =
    activeOffer.banner_text ||
    `Special Offer: ${activeOffer.title}`;

  return (
    <aside
      role="region"
      aria-label="Current restaurant offer"
      className="w-full bg-[var(--card)] border-b border-[var(--border)] px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-[var(--foreground)] transition-all animate-in fade-in duration-300"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Tag className="w-3.5 h-3.5" />
        </span>

        <p className="truncate text-xs font-medium leading-snug">
          {displayText}
        </p>

        <button
          onClick={handleAction}
          className="flex-shrink-0 inline-flex items-center gap-1 font-bold underline underline-offset-2 hover:opacity-80 transition-opacity ml-1"
          style={{ color: 'var(--primary)' }}
          aria-label={`${activeOffer.banner_link_text || 'See offer'}: ${activeOffer.title}`}
        >
          <span>{activeOffer.banner_link_text || 'See offer'}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <button
        onClick={handleDismiss}
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
        aria-label="Dismiss offer notice for this session"
        title="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
}
