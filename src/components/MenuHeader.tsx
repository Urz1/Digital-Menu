'use client';

import React from 'react';
import { Restaurant } from '@/types/database';
import { Search, Heart, Settings, Wifi, Info, Globe, MapPin, Bell } from 'lucide-react';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { triggerHaptic } from '@/lib/utils';

interface MenuHeaderProps {
  restaurant: Restaurant;
  tableNumber?: string;
  favCount: number;
  locale: Language;
  onLocaleChange: (lang: Language) => void;
  onToggleSearch: () => void;
  onOpenFavorites: () => void;
  onOpenSettingsModal: () => void;
  onOpenLegendModal: () => void;
  onShowWifiToast: () => void;
  onShowNoticeToast?: (msg: string) => void;
}

export function MenuHeader({
  restaurant,
  tableNumber,
  favCount,
  locale,
  onLocaleChange,
  onToggleSearch,
  onOpenFavorites,
  onOpenSettingsModal,
  onOpenLegendModal,
  onShowWifiToast,
  onShowNoticeToast,
}: MenuHeaderProps) {
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;

  const cycleLanguage = () => {
    triggerHaptic(10);
    const languages: Language[] = ['en', 'am', 'so'];
    const nextIdx = (languages.indexOf(locale) + 1) % languages.length;
    onLocaleChange(languages[nextIdx]);
  };

  const getLangBadge = (lang: Language) => {
    switch (lang) {
      case 'am':
        return 'አማ';
      case 'so':
        return 'SO';
      default:
        return 'EN';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--card)]/95 backdrop-blur-md border-b border-[var(--border)] transition-colors">
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2 gap-2">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-xs flex-shrink-0"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {restaurant.logo_letter || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-base leading-tight truncate text-[var(--foreground)] font-brand">
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]"></span>
                <span>{restaurant.is_open ? t.openNow : t.closed}</span>
              </span>
              <span className="text-neutral-300 dark:text-neutral-700 select-none">•</span>
              <span className="text-[11px] text-[var(--muted)] whitespace-nowrap">Dine-In</span>
              {restaurant.google_maps_url && (
                <>
                  <span className="text-neutral-300 dark:text-neutral-700 select-none">•</span>
                  <a
                    href={restaurant.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[var(--primary)] hover:underline whitespace-nowrap"
                    title="View branch location on Google Maps"
                  >
                    <MapPin className="w-2.5 h-2.5 text-[var(--primary)] flex-shrink-0" />
                    <span className="truncate max-w-[85px] sm:max-w-none">
                      {restaurant.branch_name ? restaurant.branch_name.split('—')[0].trim() : 'Main Branch'}
                    </span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Quick Trilingual Language Switcher Pill */}
          <button
            type="button"
            onClick={cycleLanguage}
            className="h-8 px-2.5 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center gap-1 text-xs font-bold text-[var(--foreground)] hover:border-[var(--primary)] transition-colors active:scale-95"
            aria-label="Switch Language (English, Amharic, Somali)"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>{getLangBadge(locale)}</span>
          </button>

          {/* Search Toggle */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onToggleSearch();
            }}
            className="w-8 h-8 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--border)] transition-colors active:scale-95"
            aria-label="Toggle Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Favorites */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onOpenFavorites();
            }}
            className="w-8 h-8 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] relative hover:bg-[var(--border)] transition-colors active:scale-95"
            aria-label="View Favorites"
          >
            <Heart className="w-4 h-4" />
            {favCount > 0 && (
              <span
                className="absolute -top-1 -right-1 text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1 border-2 border-[var(--card)]"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {favCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onOpenSettingsModal();
            }}
            className="w-8 h-8 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--border)] transition-colors active:scale-95"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Announcement banner if available */}
      {restaurant.announcement && (
        <div
          className="mx-3.5 mb-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          style={{
            backgroundColor: 'rgba(var(--primary-rgb), 0.12)',
            color: 'var(--primary)',
          }}
        >
          <Bell className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{restaurant.announcement.replace(/^[^\w\s\u1200-\u137F\u00C0-\u024F]+\s*/, '')}</span>
        </div>
      )}

      {/* Quick Info & Action Strip */}
      <div className="flex items-center justify-end px-3.5 py-1 border-t border-[var(--border)] text-xs text-[var(--muted)]">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onShowWifiToast();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--background)] border border-[var(--border)] font-medium text-[11px] hover:bg-[var(--border)] transition-colors active:scale-95"
          >
            <Wifi className="w-3 h-3 text-[var(--primary)]" />
            <span>{t.wifi}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onOpenLegendModal();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--background)] border border-[var(--border)] font-medium text-[11px] hover:bg-[var(--border)] transition-colors active:scale-95"
          >
            <Info className="w-3 h-3" />
            <span>{t.allergens}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
