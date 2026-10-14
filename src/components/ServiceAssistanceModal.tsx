'use client';

import React from 'react';
import { triggerHaptic } from '@/lib/utils';
import { X, Bell, Droplets, Utensils, Receipt } from 'lucide-react';

interface ServiceAssistanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
  onRequestService: (type: 'waiter' | 'water' | 'cutlery' | 'bill') => void;
}

export function ServiceAssistanceModal({
  isOpen,
  onClose,
  tableNumber,
  onRequestService,
}: ServiceAssistanceModalProps) {
  if (!isOpen) return null;

  const handleSelect = (type: 'waiter' | 'water' | 'cutlery' | 'bill') => {
    triggerHaptic(20);
    onRequestService(type);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--card)] rounded-t-3xl p-5 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
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
          <h2 className="text-xl font-bold text-[var(--foreground)] font-brand">Server Assistance</h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            Tap a quick request below to alert your server immediately for <strong className="text-[var(--foreground)]">{tableNumber}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 my-2">
          <button
            onClick={() => handleSelect('waiter')}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-left hover:border-[var(--primary)] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--foreground)]">Call Waiter</h4>
              <p className="text-xs text-[var(--muted)]">Need help with recommendations or questions</p>
            </div>
          </button>

          <button
            onClick={() => handleSelect('water')}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-left hover:border-[var(--primary)] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--foreground)]">Request Water Refill</h4>
              <p className="text-xs text-[var(--muted)]">Sparkling or still water for the table</p>
            </div>
          </button>

          <button
            onClick={() => handleSelect('cutlery')}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-left hover:border-[var(--primary)] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--foreground)]">Extra Cutlery / Napkins</h4>
              <p className="text-xs text-[var(--muted)]">Fresh forks, knives, spoons, or paper napkins</p>
            </div>
          </button>

          <button
            onClick={() => handleSelect('bill')}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-left hover:border-[var(--primary)] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--foreground)]">Request The Bill (Check)</h4>
              <p className="text-xs text-[var(--muted)]">Server will bring the check for cash or card</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
