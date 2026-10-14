'use client';

import React from 'react';
import { CartItem } from '@/types/menu';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import { X, Minus, Plus, Tablet, BellRing } from 'lucide-react';

interface OrderSummarySheetProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currencySymbol?: string;
  taxRate?: number;
  tableNumber: string;
  onUpdateQty: (cartId: string, delta: number) => void;
  onClearOrder: () => void;
  onShowWaiterCard: () => void;
  onCallServer: () => void;
}

export function OrderSummarySheet({
  isOpen,
  onClose,
  cart,
  currencySymbol = '$',
  taxRate = 0.08,
  tableNumber,
  onUpdateQty,
  onClearOrder,
  onShowWaiterCard,
  onCallServer,
}: OrderSummarySheetProps) {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

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
              <h2 className="text-xl font-bold text-[var(--foreground)] font-brand">My Order</h2>
              <span className="text-xs text-[var(--muted)]">{tableNumber}</span>
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
                Clear All
              </button>
            )}
          </div>

          {/* Items List */}
          {cart.length === 0 ? (
            <div className="py-12 text-center text-[var(--muted)]">
              <span className="text-3xl block mb-2">🛍️</span>
              <p className="text-sm font-medium">Your order is currently empty</p>
              <p className="text-xs mt-1">Tap items on the menu to add them</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 divide-y divide-[var(--border)]">
              {cart.map((entry) => {
                const lineTotal = entry.unitPrice * entry.quantity;
                const optionsString = entry.options.map((o) => o.name).join(', ');

                return (
                  <div key={entry.cartId} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-[var(--foreground)] truncate">
                        {entry.item.name}
                      </h4>
                      {optionsString && (
                        <p className="text-[11px] text-[var(--muted)] line-clamp-1 mt-0.5">
                          + {optionsString}
                        </p>
                      )}
                      {entry.notes && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 italic line-clamp-1">
                          Note: "{entry.notes}"
                        </p>
                      )}
                      <span className="text-xs font-extrabold mt-1 block" style={{ color: 'var(--primary)' }}>
                        {formatMoney(lineTotal, currencySymbol)}
                      </span>
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

          {/* Pricing Breakdown Card */}
          {cart.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-xs flex flex-col gap-2 mt-2">
              <div className="flex justify-between text-[var(--muted)]">
                <span>Subtotal</span>
                <span className="font-semibold text-[var(--foreground)]">{formatMoney(subtotal, currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>Estimated Tax ({(taxRate * 100).toFixed(0)}%)</span>
                <span className="font-semibold text-[var(--foreground)]">{formatMoney(tax, currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold pt-2 border-t border-dashed border-[var(--border)] text-[var(--foreground)]">
                <span>Total</span>
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
                <span>Show Order to Waiter</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic(15);
                  onClose();
                  onCallServer();
                }}
                className="w-full h-11 rounded-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[var(--border)] transition-colors"
              >
                <BellRing className="w-4 h-4 text-[var(--primary)]" />
                <span>Call Server to Place Order</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
