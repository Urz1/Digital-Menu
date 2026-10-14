'use client';

import React from 'react';
import { Restaurant } from '@/types/database';
import { Search, Heart, Bell, Settings, Wifi, Info } from 'lucide-react';

interface MenuHeaderProps {
  restaurant: Restaurant;
  tableNumber: string;
  favCount: number;
  onToggleSearch: () => void;
  onOpenFavorites: () => void;
  onOpenServiceModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenLegendModal: () => void;
  onShowWifiToast: () => void;
}

export function MenuHeader({
  restaurant,
  tableNumber,
  favCount,
  onToggleSearch,
  onOpenFavorites,
  onOpenServiceModal,
  onOpenSettingsModal,
  onOpenLegendModal,
  onShowWifiToast,
}: MenuHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--card)]/90 backdrop-blur-md border-b border-[var(--border)] transition-colors">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {restaurant.logo_letter || 'A'}
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base leading-tight truncate text-[var(--foreground)] font-brand">
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]"></span>
              <span>{restaurant.is_open ? 'Open Now • Dine-In' : 'Closed'}</span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onToggleSearch}
            className="w-9 h-9 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
            aria-label="Toggle Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenFavorites}
            className="w-9 h-9 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] relative hover:bg-[var(--border)] transition-colors"
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

          <button
            onClick={onOpenServiceModal}
            className="w-9 h-9 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
            aria-label="Call Waiter"
          >
            <Bell className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettingsModal}
            className="w-9 h-9 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Announcement banner if available */}
      {restaurant.announcement && (
        <div 
          className="mx-4 mb-2 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between"
          style={{ 
            backgroundColor: 'rgba(var(--primary-rgb), 0.12)', 
            color: 'var(--primary)' 
          }}
        >
          <span className="truncate">{restaurant.announcement}</span>
        </div>
      )}

      {/* Table & Quick Info Strip */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border)] text-xs text-[var(--muted)]">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--background)] border border-[var(--border)] font-semibold text-[var(--foreground)]">
          <span>📍</span>
          <span>{tableNumber}</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onShowWifiToast}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--background)] border border-[var(--border)] font-medium hover:bg-[var(--border)] transition-colors"
          >
            <Wifi className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>WiFi</span>
          </button>
          <button 
            onClick={onOpenLegendModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--background)] border border-[var(--border)] font-medium hover:bg-[var(--border)] transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Allergens</span>
          </button>
        </div>
      </div>
    </header>
  );
}
