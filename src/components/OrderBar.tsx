'use client';

import React from 'react';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { Language, TRANSLATIONS } from '@/lib/translations';

interface OrderBarProps {
  totalItems: number;
  subtotal: number;
  totalSavings?: number;
  currencySymbol?: string;
  locale?: Language | string;
  onOpenOrderSheet: () => void;
}

export function OrderBar({
  totalItems,
  subtotal,
  totalSavings = 0,
  currencySymbol = 'ETB',
  locale = 'en',
  onOpenOrderSheet,
}: OrderBarProps) {
  if (totalItems <= 0) return null;

  const currentLocale = (locale as Language) || 'en';
  const t = TRANSLATIONS[currentLocale] || TRANSLATIONS.en;

  return (
    <aside className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none animate-in slide-in-from-bottom duration-300">
      <button
        onClick={() => {
          triggerHaptic(15);
          onOpenOrderSheet();
        }}
        className="pointer-events-auto w-full max-w-md h-14 rounded-full text-white px-5 flex items-center justify-between shadow-xl border border-white/20 transition-transform active:scale-[0.98]"
        style={{ backgroundColor: 'var(--primary)' }}
        aria-label="Review My Order"
      >
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 flex-shrink-0" />
          <span className="bg-black/25 px-2 py-0.5 rounded-full text-xs font-bold">
            {totalItems}
          </span>
          <span className="font-extrabold text-base tracking-tight">
            {formatMoney(subtotal, currencySymbol)}
          </span>
          {totalSavings > 0 && (
            <span className="inline-flex items-center bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {t.saveAmount} {formatMoney(totalSavings, currencySymbol)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
          <span>{t.reviewOrder}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>
    </aside>
  );
}
