'use client';

import React from 'react';
import { CartItem } from '@/types/menu';
import { formatMoney } from '@/lib/utils';
import { X } from 'lucide-react';
import { Language, TRANSLATIONS } from '@/lib/translations';

interface ServerCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  tableNumber: string;
  restaurantName: string;
  currencySymbol?: string;
  taxRate?: number;
  locale?: Language | string;
}

export function ServerCardModal({
  isOpen,
  onClose,
  cart,
  tableNumber,
  restaurantName,
  currencySymbol = 'ETB',
  taxRate = 0.15,
  locale = 'en',
}: ServerCardModalProps) {
  if (!isOpen) return null;

  const currentLocale = (locale as Language) || 'en';
  const t = TRANSLATIONS[currentLocale] || TRANSLATIONS.en;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = subtotal * (1 + taxRate);

  return (
    <div
      className="fixed inset-0 z-50 bg-black text-white p-6 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
            {restaurantName} • {t.serverSummaryTitle}
          </span>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white hover:bg-neutral-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Large Table Number Banner */}
        <div className="my-6 p-6 rounded-3xl bg-neutral-900 border border-neutral-800 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            {t.dineInSeating}
          </span>
          <h1 className="text-4xl font-black text-amber-400 tracking-tight">
            {tableNumber.toUpperCase()}
          </h1>
        </div>

        {/* Itemized Large Rows */}
        <div className="flex flex-col gap-5">
          {cart.map((entry) => {
            const optString = entry.options.map((o) => o.name).join(' • ');
            return (
              <div key={entry.cartId} className="flex items-start gap-4 text-left">
                <span className="bg-neutral-800 px-3 py-1 rounded-xl text-lg font-black text-white flex-shrink-0">
                  {entry.quantity}x
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold leading-tight text-white">
                    {entry.item.name}
                  </h3>
                  {optString && (
                    <p className="text-xs text-neutral-400 mt-1">
                      {optString}
                    </p>
                  )}
                  {entry.notes && (
                    <p className="text-xs text-amber-300 font-medium mt-1">
                      {t.noteLabel}: "{entry.notes}"
                    </p>
                  )}
                </div>
                <span className="text-sm font-semibold text-neutral-400 flex-shrink-0">
                  {formatMoney(entry.unitPrice * entry.quantity, currencySymbol)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total Banner at Bottom */}
      <div className="mt-8 pt-6 border-t border-neutral-800 flex items-baseline justify-between">
        <span className="text-sm text-neutral-400 font-semibold">
          {t.totalItemsLabel}: <strong className="text-white">{totalItems}</strong>
        </span>
        <span className="text-3xl font-black text-amber-400">
          {formatMoney(total, currencySymbol)}
        </span>
      </div>
    </div>
  );
}
