'use client';

import React from 'react';
import { CartItem } from '@/types/menu';
import { CartPricingResult } from '@/lib/pricing-engine';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import { X, Minus, Plus, Tablet, BellRing, Tag, Gift, ShoppingBag } from 'lucide-react';

import { Language, TRANSLATIONS } from '@/lib/translations';

interface OrderSummarySheetProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartPricing?: CartPricingResult;
  currencySymbol?: string;
  taxRate?: number;
  tableNumber?: string;
  locale?: Language | string;
  onUpdateQty: (cartId: string, delta: number) => void;
  onClearOrder: () => void;
  onShowWaiterCard: () => void;
  onCallServer?: () => void;
}

export function OrderSummarySheet({
  isOpen,
  onClose,
  cart,
  cartPricing,
  currencySymbol = 'ETB',
  taxRate = 0.08,
  tableNumber,
  locale = 'en',
  onUpdateQty,
  onClearOrder,
  onShowWaiterCard,
  onCallServer,
}: OrderSummarySheetProps) {
  if (!isOpen) return null;

  const currentLocale = (locale as Language) || 'en';
  const t = TRANSLATIONS[currentLocale] || TRANSLATIONS.en;

  const rawSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const subtotal = cartPricing?.netSubtotal ?? rawSubtotal;
  const originalSubtotal = cartPricing?.originalSubtotal ?? rawSubtotal;
  const totalSavings = cartPricing?.totalSavings ?? 0;
  const tax = cartPricing?.tax ?? subtotal * taxRate;
  const total = cartPricing?.total ?? subtotal + tax;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] bg-[var(--card)] rounded-t-3xl overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
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

        <div className="p-5 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)] font-brand">{t.myOrder}</h2>
              {tableNumber ? <span className="text-xs text-[var(--muted)]">{tableNumber}</span> : null}
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Clear all items from your order?')) {
                    triggerHaptic(15);
                    onClearOrder();
                  }
                }}
                className="text-xs font-semibold text-red-500 hover:underline px-2 py-1"
              >
                {t.clearAll}
              </button>
            )}
          </div>

          {/* Items List */}
          {cart.length === 0 ? (
            <div className="py-12 text-center text-[var(--muted)]">
              <div className="w-12 h-12 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center mx-auto mb-2.5 text-[var(--muted)]">
                <ShoppingBag className="w-6 h-6 opacity-60" />
              </div>
              <p className="text-sm font-medium">{t.emptyOrder}</p>
              <p className="text-xs mt-1">{t.emptyOrderHint}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 divide-y divide-[var(--border)]">
              {cart.map((entry) => {
                const linePricing = cartPricing?.lines.find((l) => l.cartId === entry.cartId);
                const originalLineTotal = linePricing?.originalLineTotal ?? entry.unitPrice * entry.quantity;
                const finalLineTotal = linePricing?.finalLineTotal ?? originalLineTotal;
                const lineSavings = linePricing?.lineSavings ?? 0;
                const optionsString = entry.options.map((o) => o.name).join(', ');

                return (
                  <div key={entry.cartId} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-[var(--foreground)] truncate">
                          {entry.item.name}
                        </h4>
                        {lineSavings > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            Save {formatMoney(lineSavings, currencySymbol)}
                          </span>
                        )}
                      </div>

                      {optionsString && (
                        <p className="text-[11px] text-[var(--muted)] line-clamp-1 mt-0.5">
                          + {optionsString}
                        </p>
                      )}

                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xs font-extrabold" style={{ color: 'var(--primary)' }}>
                          {formatMoney(finalLineTotal, currencySymbol)}
                        </span>
                        {lineSavings > 0 && (
                          <span className="text-[11px] text-[var(--muted)] line-through">
                            {formatMoney(originalLineTotal, currencySymbol)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-full p-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          triggerHaptic(8);
                          onUpdateQty(entry.cartId, -1);
                        }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--border)]"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-[var(--foreground)]">
                        {entry.quantity}
                      </span>
                      <button
                        onClick={() => {
                          triggerHaptic(8);
                          onUpdateQty(entry.cartId, 1);
                        }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--border)]"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Complimentary Item Banner (Free item award) */}
          {cartPricing?.freeItemAwarded && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-center gap-2.5">
              <Gift className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-bold text-[var(--foreground)] block">
                  Free Gift: {cartPricing.freeItemAwarded.item.name}
                </span>
                <span className="text-[11px] text-[var(--muted)]">
                  {cartPricing.freeItemAwarded.reason}
                </span>
              </div>
            </div>
          )}

          {/* Pricing Breakdown Card */}
          {cart.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-xs flex flex-col gap-2 mt-2">
              <div className="flex justify-between text-[var(--muted)]">
                <span>{t.itemsSubtotal}</span>
                <span className="font-semibold text-[var(--foreground)]">{formatMoney(originalSubtotal, currencySymbol)}</span>
              </div>

              {/* Applied Offers line-by-line */}
              {cartPricing?.appliedOffers && cartPricing.appliedOffers.length > 0 && (
                <div className="flex flex-col gap-1 py-1 border-y border-dashed border-[var(--border)]">
                  {cartPricing.appliedOffers.map(({ offer, totalSavings }) => (
                    <div key={offer.id} className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="inline-flex items-center gap-1 truncate max-w-[240px]">
                        <Tag className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{offer.title}</span>
                      </span>
                      <span>-{formatMoney(totalSavings, currencySymbol)}</span>
                    </div>
                  ))}
                </div>
              )}

              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>{t.totalSavings}</span>
                  <span>-{formatMoney(totalSavings, currencySymbol)}</span>
                </div>
              )}

              {cartPricing?.isTaxInclusive ? (
                <div className="flex justify-between text-[var(--muted)] text-[11px]">
                  <span>{t.taxLabel}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{t.taxIncluded}</span>
                </div>
              ) : (
                <div className="flex justify-between text-[var(--muted)]">
                  <span>{t.taxLabel} ({(taxRate * 100).toFixed(0)}%)</span>
                  <span className="font-semibold text-[var(--foreground)]">{formatMoney(tax, currencySymbol)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-extrabold pt-2 border-t border-dashed border-[var(--border)] text-[var(--foreground)]">
                <span>{t.total}</span>
                <span style={{ color: 'var(--primary)' }}>{formatMoney(total, currencySymbol)}</span>
              </div>
            </div>
          )}

          {/* Actions Stack */}
          {cart.length > 0 && (
            <div className="flex flex-col gap-2.5 mt-2">
              <button
                onClick={() => {
                  triggerHaptic(15);
                  onClose();
                  onShowWaiterCard();
                }}
                className="w-full h-12 rounded-full bg-[var(--foreground)] text-[var(--background)] font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity"
              >
                <Tablet className="w-4 h-4" />
                <span>{t.showToWaiter}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
