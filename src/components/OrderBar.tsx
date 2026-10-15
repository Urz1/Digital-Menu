'use client';

import React from 'react';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import { ShoppingBag, ChevronRight } from 'lucide-react';

interface OrderBarProps {
  totalItems: number;
  subtotal: number;
  totalSavings?: number;
  currencySymbol?: string;
  onOpenOrderSheet: () => void;
}

export function OrderBar({
  totalItems,
  subtotal,
  totalSavings = 0,
  currencySymbol = '$',
  onOpenOrderSheet,
}: OrderBarProps) {
  if (totalItems <= 0) return null;

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
        <div className="flex items-center gap-2.5">
          <ShoppingBag className="w-5 h-5" />
          <span className="bg-black/25 px-2.5 py-0.5 rounded-full text-xs font-bold">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
          <span className="font-extrabold text-base tracking-tight">
            {formatMoney(subtotal, currencySymbol)}
          </span>
          {totalSavings > 0 && (
            <span className="inline-block bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Saved {formatMoney(totalSavings, currencySymbol)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
          <span>Review Order</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>
    </aside>
  );
}
