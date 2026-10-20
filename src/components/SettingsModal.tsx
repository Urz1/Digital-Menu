'use client';

import React, { useState } from 'react';
import { triggerHaptic } from '@/lib/utils';
import { X, Sun, Moon, Monitor, Copy, Check } from 'lucide-react';
import { Language, TRANSLATIONS } from '@/lib/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Language | string;
  onLocaleChange: (loc: Language) => void;
  tableNumber?: string;
  onTableNumberChange?: (table: string) => void;
  wifiInfo: { ssid: string; password?: string };
}

export function SettingsModal({
  isOpen,
  onClose,
  locale = 'en',
  onLocaleChange,
  tableNumber,
  onTableNumberChange,
  wifiInfo,
}: SettingsModalProps) {
  const [copiedWifi, setCopiedWifi] = useState(false);

  if (!isOpen) return null;

  const currentLocale = (locale as Language) || 'en';
  const t = TRANSLATIONS[currentLocale] || TRANSLATIONS.en;

  const handleCopyPassword = () => {
    if (!wifiInfo.password) return;
    triggerHaptic(10);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(wifiInfo.password).catch(() => {});
      }
    } catch {}
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2000);
  };

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
          <h2 className="text-xl font-bold text-[var(--foreground)] font-brand">{t.settingsTitle}</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">{t.settingsDesc}</p>
        </div>

        {/* Language Selection: English, Amharic, Somali */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            {t.languageLabel}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              data-testid="lang-btn-en"
              onClick={() => {
                triggerHaptic(10);
                onLocaleChange('en');
              }}
              className={`h-11 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-colors cursor-pointer ${
                currentLocale === 'en'
                  ? 'border-[var(--primary)] bg-[rgba(var(--primary-rgb),0.12)] text-[var(--foreground)] ring-1 ring-[var(--primary)]'
                  : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <span className="text-base">🇺🇸</span>
              <span className="text-[11px] font-semibold">English</span>
            </button>

            <button
              type="button"
              data-testid="lang-btn-am"
              onClick={() => {
                triggerHaptic(10);
                onLocaleChange('am');
              }}
              className={`h-11 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-colors cursor-pointer ${
                currentLocale === 'am'
                  ? 'border-[var(--primary)] bg-[rgba(var(--primary-rgb),0.12)] text-[var(--foreground)] ring-1 ring-[var(--primary)]'
                  : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <span className="text-base">🇪🇹</span>
              <span className="text-[11px] font-semibold">አማርኛ</span>
            </button>

            <button
              type="button"
              data-testid="lang-btn-so"
              onClick={() => {
                triggerHaptic(10);
                onLocaleChange('so');
              }}
              className={`h-11 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-colors cursor-pointer ${
                currentLocale === 'so'
                  ? 'border-[var(--primary)] bg-[rgba(var(--primary-rgb),0.12)] text-[var(--foreground)] ring-1 ring-[var(--primary)]'
                  : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <span className="text-base">🇸🇴</span>
              <span className="text-[11px] font-semibold">Soomaali</span>
            </button>
          </div>
        </div>

        {/* Color Mode */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            {t.appearanceLabel}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('light')}
              className="flex-1 h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-semibold flex items-center justify-center gap-1 text-[var(--foreground)] hover:border-[var(--primary)] transition-colors"
            >
              <Sun className="w-3.5 h-3.5" />
              <span>{t.lightMode}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('dark')}
              className="flex-1 h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-semibold flex items-center justify-center gap-1 text-[var(--foreground)] hover:border-[var(--primary)] transition-colors"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{t.darkMode}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('auto')}
              className="flex-1 h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-semibold flex items-center justify-center gap-1 text-[var(--foreground)] hover:border-[var(--primary)] transition-colors"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{t.autoMode}</span>
            </button>
          </div>
        </div>

        {/* Ready-made Atmosphere Themes */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            {t.themesLabel}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTheme('modern-minimal')}
              className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-left hover:border-[var(--primary)] transition-colors"
            >
              <div className="w-full h-3 rounded bg-gradient-to-r from-amber-500 to-neutral-800 mb-1.5" />
              <span className="text-xs font-bold text-[var(--foreground)] block">
                {t.themeModernMinimal}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('classic-elegance')}
              className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-left hover:border-[var(--primary)] transition-colors"
            >
              <div className="w-full h-3 rounded bg-gradient-to-r from-amber-700 to-amber-200 mb-1.5" />
              <span className="text-xs font-bold text-[var(--foreground)] block">
                {t.themeClassicElegance}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('bold-dark')}
              className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-left hover:border-[var(--primary)] transition-colors"
            >
              <div className="w-full h-3 rounded bg-gradient-to-r from-rose-500 to-neutral-950 mb-1.5" />
              <span className="text-xs font-bold text-[var(--foreground)] block">
                {t.themeBoldDark}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('warm-rustic')}
              className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-left hover:border-[var(--primary)] transition-colors"
            >
              <div className="w-full h-3 rounded bg-gradient-to-r from-orange-700 to-emerald-800 mb-1.5" />
              <span className="text-xs font-bold text-[var(--foreground)] block">
                {t.themeWarmRustic}
              </span>
            </button>
          </div>
        </div>

        {/* Dining Table & WiFi */}
        <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs flex flex-col gap-2">
          {tableNumber && onTableNumberChange && (
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted)] font-semibold">{t.tableNumberLabel}:</span>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => onTableNumberChange(e.target.value)}
                className="w-24 px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--card)] text-right font-bold text-[var(--foreground)] outline-none"
              />
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-[var(--muted)] font-semibold">{t.guestWifiLabel}:</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--foreground)]">
                {wifiInfo?.ssid || 'Guest WiFi'}{' '}
                {wifiInfo?.password ? `(${wifiInfo.password})` : '• Open'}
              </span>
              {wifiInfo?.password && (
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="px-2 py-0.5 rounded-md bg-[var(--border)] hover:bg-[rgba(var(--primary-rgb),0.15)] text-[var(--foreground)] text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy Wi-Fi password"
                >
                  {copiedWifi ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[var(--muted)]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
