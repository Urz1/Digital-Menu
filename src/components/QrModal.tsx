'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { triggerHaptic } from '@/lib/utils';
import { X, Copy, Check } from 'lucide-react';
import { Language, TRANSLATIONS } from '@/lib/translations';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  tableNumber?: string;
  locale?: Language | string;
}

export function QrModal({ isOpen, onClose, restaurantName, tableNumber, locale = 'en' }: QrModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentLocale = (locale as Language) || 'en';
  const t = TRANSLATIONS[currentLocale] || TRANSLATIONS.en;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}&color=1a1a1a&bgcolor=ffffff`;

  const handleCopy = () => {
    triggerHaptic(15);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--card)] rounded-t-3xl p-6 flex flex-col items-center gap-4 shadow-2xl animate-in slide-in-from-bottom duration-300 relative text-center"
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
          <h2 className="text-xl font-bold text-[var(--foreground)] font-brand">{tableNumber ? t.tableQrTitle : 'Menu QR Code'}</h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            {t.tableQrDesc} {restaurantName}{tableNumber ? ` (${tableNumber})` : ''}.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-3xl shadow-md border border-neutral-200 inline-flex my-2">
          <Image
            src={qrUrl}
            alt="Table QR Code"
            width={200}
            height={200}
            className="w-48 h-48 block"
            unoptimized
          />
        </div>

        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          className="w-full h-11 rounded-full bg-[var(--foreground)] text-[var(--background)] font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{t.linkCopied}</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>{t.copyMenuLink}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

