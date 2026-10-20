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
    <aside
      className="fixed left-0 right-0 z-40 flex justify-center px-3 sm:px-4 pointer-events-none animate-in slide-in-from-bottom duration-300"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
    >
      <button
        onClick={() => {
          triggerHaptic(15);
          onOpenOrderSheet();
        }}
        className="pointer-events-auto w-full max-w-md h-13 sm:h-14 rounded-full text-white px-3.5 sm:px-5 flex items-center justify-between shadow-xl border border-white/20 transition-transform active:scale-[0.98]"
        style={{ backgroundColor: 'var(--primary)' }}
        aria-label="Review My Order"
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <ShoppingBag className="w-5 h-5 flex-shrink-0" />
          <span className="bg-black/25 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0">
            {totalItems}
          </span>
          <span className="font-extrabold text-sm sm:text-base tracking-tight truncate">
            {formatMoney(subtotal, currencySymbol)}
          </span>
          {totalSavings > 0 && (
            <span className="hidden sm:inline-flex items-center bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
              {t.saveAmount} {formatMoney(totalSavings, currencySymbol)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider flex-shrink-0">
          <span className="hidden sm:inline">{t.reviewOrder}</span>
          <span className="sm:hidden">{locale === 'am' ? 'ትዕዛዝ' : 'My Order'}</span>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
        </div>
      </button>
    </aside>
  );
}
