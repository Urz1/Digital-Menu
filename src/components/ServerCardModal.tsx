'use client';

import React, { useState } from 'react';
import { CartItem } from '@/types/menu';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import { X, Sun, Moon, UtensilsCrossed } from 'lucide-react';
import { Language, TRANSLATIONS } from '@/lib/translations';

interface ServerCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  tableNumber?: string;
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
  // Default is strictly Light Mode (matching the daytime dining menu), with an optional dark mode toggle for low-light ambiances
  const [isDarkMode, setIsDarkMode] = useState(false);

  if (!isOpen) return null;

  const currentLocale = (locale as Language) || 'en';
  const t = TRANSLATIONS[currentLocale] || TRANSLATIONS.en;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = subtotal * (1 + taxRate);

  const toggleTheme = () => {
    triggerHaptic(10);
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div
      className={`fixed inset-0 z-50 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200 transition-colors ${
        isDarkMode
          ? 'bg-neutral-950 text-white'
          : 'bg-stone-50 text-neutral-900'
      }`}
      role="dialog"
      aria-modal="true"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
    >
      <div className="max-w-md w-full mx-auto">
        {/* Header with Title, Mode Toggle, and Close Button */}
        <div
          className={`flex items-center justify-between pb-4 sm:pb-5 border-b transition-colors ${
            isDarkMode ? 'border-neutral-800' : 'border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
              style={{ backgroundColor: 'var(--primary, #D9480F)' }}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
            </div>
            <span
              className={`text-xs uppercase tracking-wider font-bold truncate ${
                isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              {restaurantName} • {t.serverSummaryTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Quick Contrast / Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors active:scale-95 ${
                isDarkMode
                  ? 'bg-neutral-800 text-amber-400 hover:bg-neutral-700'
                  : 'bg-neutral-200/80 text-neutral-700 hover:bg-neutral-300'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to High-Contrast Dark Mode'}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to High-Contrast Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                triggerHaptic(8);
                onClose();
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors active:scale-95 ${
                isDarkMode
                  ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                  : 'bg-neutral-200/80 text-neutral-700 hover:bg-neutral-300 hover:text-neutral-900'
              }`}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Large High-Legibility Dine-In Seating Table Banner */}
        <div
          className={`my-5 sm:my-6 p-5 sm:p-6 rounded-3xl text-center shadow-xs transition-colors ${
            isDarkMode
              ? 'bg-neutral-900 border border-neutral-800'
              : 'bg-white border-2 border-[var(--primary, #D9480F)] shadow-sm'
          }`}
        >
          <span
            className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
              isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
            }`}
          >
            {tableNumber ? t.dineInSeating : t.myOrder}
          </span>
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ color: isDarkMode ? '#FBBF24' : 'var(--primary, #D9480F)' }}
          >
            {tableNumber ? tableNumber.toUpperCase() : `${totalItems} ${totalItems === 1 ? 'Item' : 'Items'}`}
          </h1>
        </div>

        {/* Itemized Order Rows (Optimized for quick waiter glance) */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {cart.map((entry) => {
            const optString = entry.options.map((o) => o.name).join(' • ');
            return (
              <div key={entry.cartId} className="flex items-start gap-3 sm:gap-4 text-left">
                <span
                  className="px-2.5 py-1 rounded-xl text-base sm:text-lg font-black text-white flex-shrink-0 shadow-xs"
                  style={{ backgroundColor: 'var(--primary, #D9480F)' }}
                >
                  {entry.quantity}x
                </span>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-base sm:text-lg font-bold leading-tight ${
                      isDarkMode ? 'text-white' : 'text-neutral-950'
                    }`}
                  >
                    {entry.item.name}
                  </h3>
                  {optString && (
                    <p
                      className={`text-xs mt-1 ${
                        isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
                      }`}
                    >
                      {optString}
                    </p>
                  )}
                  {entry.notes && (
                    <p
                      className={`text-xs font-medium mt-1 ${
                        isDarkMode ? 'text-amber-300' : 'text-amber-700'
                      }`}
                    >
                      {t.noteLabel}: "{entry.notes}"
                    </p>
                  )}
                </div>
                <span
                  className={`text-sm sm:text-base font-bold flex-shrink-0 ${
                    isDarkMode ? 'text-neutral-300' : 'text-neutral-800'
                  }`}
                >
                  {formatMoney(entry.unitPrice * entry.quantity, currencySymbol)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total Banner at Bottom (Sticky/Anchored) */}
      <div
        className={`max-w-md w-full mx-auto mt-6 pt-5 sm:pt-6 border-t flex items-baseline justify-between transition-colors ${
          isDarkMode ? 'border-neutral-800' : 'border-neutral-200'
        }`}
      >
        <span
          className={`text-xs sm:text-sm font-semibold ${
            isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
          }`}
        >
          {t.totalItemsLabel}:{' '}
          <strong className={isDarkMode ? 'text-white' : 'text-neutral-950'}>
            {totalItems}
          </strong>
        </span>
        <span
          className="text-2xl sm:text-3xl font-black"
          style={{ color: isDarkMode ? '#FBBF24' : 'var(--primary, #D9480F)' }}
        >
          {formatMoney(total, currencySymbol)}
        </span>
      </div>
    </div>
  );
}
