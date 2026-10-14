'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MenuItem, ItemOption } from '@/types/database';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import { X, Minus, Plus } from 'lucide-react';

interface ItemDetailModalProps {
  item: MenuItem | null;
  currencySymbol?: string;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, options: ItemOption[], notes: string) => void;
  locale?: string;
}

export function ItemDetailModal({
  item,
  currencySymbol = '$',
  onClose,
  onAddToCart,
  locale = 'en',
}: ItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<ItemOption[]>([]);
  const [notes, setNotes] = useState('');

  // Reset state when opening a new item
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSelectedOptions([]);
      setNotes('');
    }
  }, [item]);

  if (!item) return null;

  const displayName = (locale === 'es' && item.name_es) ? item.name_es : item.name;
  const displayDesc = (locale === 'es' && item.description_es) ? item.description_es : item.description;

  const toggleOption = (opt: ItemOption) => {
    triggerHaptic(8);
    const exists = selectedOptions.some((o) => o.id === opt.id);
    if (exists) {
      setSelectedOptions(selectedOptions.filter((o) => o.id !== opt.id));
    } else {
      setSelectedOptions([...selectedOptions, opt]);
    }
  };

  const addonsTotal = selectedOptions.reduce((acc, opt) => acc + Number(opt.price || 0), 0);
  const lineTotal = (item.price + addonsTotal) * quantity;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end items-center transition-opacity"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[88vh] bg-[var(--card)] rounded-t-3xl overflow-y-auto flex flex-col relative shadow-2xl animate-in slide-in-from-bottom duration-300"
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

        {/* Hero Image */}
        <div className="relative w-full h-56 bg-neutral-900 flex-shrink-0">
          <Image
            src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
            alt={displayName}
            fill
            sizes="(max-width: 520px) 100vw, 520px"
            className="object-cover"
          />
        </div>

        {/* Details Body */}
        <div className="p-5 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {item.is_chefs_pick && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                  ⭐ Chef's Pick
                </span>
              )}
              {!item.is_available && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  Sold Out
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-[var(--foreground)] font-brand">
              {displayName}
            </h2>

            <div className="text-lg font-extrabold mt-1" style={{ color: 'var(--primary)' }}>
              {formatMoney(item.price, currencySymbol)}
            </div>

            <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">
              {displayDesc}
            </p>
          </div>

          {/* Meta Box (Spice, Dietary, Allergens) */}
          <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[var(--muted)]">Spice Level:</span>
              <span className="font-bold text-[var(--foreground)]">
                {item.spice_level === 0 ? 'None' : '🌶️'.repeat(item.spice_level) + ` (Level ${item.spice_level})`}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-[var(--muted)]">Dietary:</span>
              <span className="font-bold text-[var(--foreground)] uppercase">
                {item.tags?.filter((t) => t !== 'chefsPick').join(', ') || 'Standard'}
              </span>
            </div>

            {item.allergens && item.allergens.length > 0 && (
              <div>
                <span className="font-semibold text-[var(--muted)] block mb-1">Contains Allergens:</span>
                <div className="flex flex-wrap gap-1.5">
                  {item.allergens.map((allg) => (
                    <span
                      key={allg}
                      className="px-2 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] font-medium text-[11px]"
                    >
                      {allg}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add-ons & Customizations */}
          {item.options && item.options.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Customizations & Add-ons</h3>
              <div className="flex flex-col gap-2">
                {item.options.map((opt) => {
                  const isChecked = selectedOptions.some((o) => o.id === opt.id);
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-[var(--primary)] bg-[rgba(var(--primary-rgb),0.05)]'
                          : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--muted)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOption(opt)}
                          className="w-4 h-4 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                        <span className="text-xs font-semibold text-[var(--foreground)]">{opt.name}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
                        {opt.price > 0 ? `+${formatMoney(opt.price, currencySymbol)}` : 'Included'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Requests / Notes */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Special Instructions</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dressing on the side, extra crispy, sauce temperature..."
              className="w-full h-18 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] resize-none outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 bg-[var(--card)] border-t border-[var(--border)] p-4 flex items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-full p-1">
            <button
              onClick={() => {
                if (quantity > 1) {
                  triggerHaptic(8);
                  setQuantity(quantity - 1);
                }
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--border)]"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-[var(--foreground)]">
              {quantity}
            </span>
            <button
              onClick={() => {
                triggerHaptic(8);
                setQuantity(quantity + 1);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--border)]"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Order Button */}
          <button
            disabled={!item.is_available}
            onClick={() => {
              triggerHaptic(20);
              onAddToCart(item, quantity, selectedOptions, notes);
              onClose();
            }}
            className="flex-1 h-11 rounded-full text-white font-bold text-sm shadow-md transition-all disabled:bg-neutral-500 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            style={{ backgroundColor: item.is_available ? 'var(--primary)' : undefined }}
          >
            <span>{item.is_available ? 'Add to Order' : 'Sold Out'}</span>
            {item.is_available && <span>• {formatMoney(lineTotal, currencySymbol)}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
