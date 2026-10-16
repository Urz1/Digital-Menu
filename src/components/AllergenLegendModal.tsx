'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Language, TRANSLATIONS } from '@/lib/translations';

interface AllergenLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale?: Language | string;
}

export function AllergenLegendModal({ isOpen, onClose, locale = 'en' }: AllergenLegendModalProps) {
  if (!isOpen) return null;

  const currentLocale = (locale as Language) || 'en';
  const t = TRANSLATIONS[currentLocale] || TRANSLATIONS.en;

  const legendItems = [
    { icon: '🌱', title: t.vegetarianTitle, desc: t.vegetarianDesc },
    { icon: '🌿', title: t.veganTitle, desc: t.veganDesc },
    { icon: '🌾', title: t.glutenFreeTitle, desc: t.glutenFreeDesc },
    { icon: '🥩', title: t.halalTitle, desc: t.halalDesc },
    { icon: '🥜', title: t.nutFreeTitle, desc: t.nutFreeDesc },
    { icon: '🌶️', title: t.spiceIndicatorsTitle, desc: t.spiceIndicatorsDesc },
    { icon: '⭐', title: t.chefSelectionTitle, desc: t.chefSelectionDesc },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[80vh] bg-[var(--card)] rounded-t-3xl p-5 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom duration-300 relative overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full py-1 flex justify-center sticky top-0 bg-[var(--card)]">
          <div className="w-10 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)]"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)] font-brand">{t.legendTitle}</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {t.legendDesc}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 my-2">
          {legendItems.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)]"
            >
              <span className="text-2xl w-8 text-center flex-shrink-0">{item.icon}</span>
              <div>
                <h4 className="text-xs font-bold text-[var(--foreground)]">{item.title}</h4>
                <p className="text-[11px] text-[var(--muted)] leading-tight mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

