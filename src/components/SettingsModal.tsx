'use client';

import React from 'react';
import { triggerHaptic } from '@/lib/utils';
import { X, Sun, Moon, Monitor } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  onLocaleChange: (loc: string) => void;
  tableNumber: string;
  onTableNumberChange: (table: string) => void;
  wifiInfo: { ssid: string; password?: string };
}

export function SettingsModal({
  isOpen,
  onClose,
  locale,
  onLocaleChange,
  tableNumber,
  onTableNumberChange,
  wifiInfo,
}: SettingsModalProps) {
  if (!isOpen) return null;

  const setMode = (mode: 'light' | 'dark' | 'auto') => {
    triggerHaptic(10);
    const root = document.documentElement;
    if (mode === 'auto') {
      root.removeAttribute('data-mode');
    } else {
      root.setAttribute('data-mode', mode);
    }
  };

  const setTheme = (theme: string) => {
    triggerHaptic(12);
    const root = document.documentElement;
    if (theme === 'modern-minimal') {
      root.style.setProperty('--primary', '#E8590C');
      root.style.setProperty('--primary-hover', '#D9480F');
      root.style.setProperty('--accent', '#F76707');
    } else if (theme === 'classic-elegance') {
      root.style.setProperty('--primary', '#B88E3E');
      root.style.setProperty('--primary-hover', '#9E7528');
      root.style.setProperty('--accent', '#8E6822');
    } else if (theme === 'bold-dark') {
      root.style.setProperty('--primary', '#FF3B5C');
      root.style.setProperty('--primary-hover', '#E02747');
      root.style.setProperty('--accent', '#FF5E7E');
    } else if (theme === 'warm-rustic') {
      root.style.setProperty('--primary', '#C05621');
      root.style.setProperty('--primary-hover', '#9C4215');
      root.style.setProperty('--accent', '#556B2F');
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
        className="w-full max-w-lg bg-[var(--card)] rounded-t-3xl p-5 flex flex-col gap-5 shadow-2xl animate-in slide-in-from-bottom duration-300 relative"
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
          <h2 className="text-xl font-bold text-[var(--foreground)] font-brand">Display & Preferences</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">Customize your digital dining view.</p>
        </div>

        {/* Language Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Language / Idioma</label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                triggerHaptic(10);
                onLocaleChange('en');
              }}
              className={`flex-1 h-10 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                locale === 'en'
                  ? 'border-[var(--primary)] bg-[rgba(var(--primary-rgb),0.1)] text-[var(--foreground)]'
                  : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted)]'
              }`}
            >
              <span>🇺🇸</span>
              <span>English</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic(10);
                onLocaleChange('es');
              }}
              className={`flex-1 h-10 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                locale === 'es'
                  ? 'border-[var(--primary)] bg-[rgba(var(--primary-rgb),0.1)] text-[var(--foreground)]'
                  : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted)]'
              }`}
            >
              <span>🇪🇸</span>
              <span>Español</span>
            </button>
          </div>
        </div>

        {/* Color Mode */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Appearance</label>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('light')}
              className="flex-1 h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-semibold flex items-center justify-center gap-1 text-[var(--foreground)]"
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setMode('dark')}
              className="flex-1 h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-semibold flex items-center justify-center gap-1 text-[var(--foreground)]"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => setMode('auto')}
              className="flex-1 h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-semibold flex items-center justify-center gap-1 text-[var(--foreground)]"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Auto</span>
            </button>
          </div>
        </div>

        {/* Ready-made Atmosphere Themes */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Themes</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTheme('modern-minimal')}
              className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-left hover:border-[var(--primary)] transition-colors"
            >
              <div className="w-full h-3 rounded bg-gradient-to-r from-amber-500 to-neutral-800 mb-1.5" />
              <span className="text-xs font-bold text-[var(--foreground)] block">Modern Minimal</span>
            </button>
            <button
              onClick={() => setTheme('classic-elegance')}
              className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-left hover:border-[var(--primary)] transition-colors"
            >
              <div className="w-full h-3 rounded bg-gradient-to-r from-amber-700 to-amber-200 mb-1.5" />
              <span className="text-xs font-bold text-[var(--foreground)] block">Classic Elegance</span>
            </button>
            <button
              onClick={() => setTheme('bold-dark')}
              className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-left hover:border-[var(--primary)] transition-colors"
            >
              <div className="w-full h-3 rounded bg-gradient-to-r from-rose-500 to-neutral-950 mb-1.5" />
              <span className="text-xs font-bold text-[var(--foreground)] block">Bold Dark</span>
            </button>
            <button
              onClick={() => setTheme('warm-rustic')}
              className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-left hover:border-[var(--primary)] transition-colors"
            >
              <div className="w-full h-3 rounded bg-gradient-to-r from-orange-700 to-emerald-800 mb-1.5" />
              <span className="text-xs font-bold text-[var(--foreground)] block">Warm Rustic</span>
            </button>
          </div>
        </div>

        {/* Dining Table & WiFi */}
        <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[var(--muted)] font-semibold">Table Number:</span>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => onTableNumberChange(e.target.value)}
              className="w-24 px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--card)] text-right font-bold text-[var(--foreground)] outline-none"
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--muted)] font-semibold">Guest WiFi:</span>
            <span className="font-bold text-[var(--foreground)]">
              {wifiInfo.ssid} {wifiInfo.password ? `(${wifiInfo.password})` : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
