'use client';

import React, { useState } from 'react';
import { UserRole } from '@/types/database';
import { AdminSection } from './AdminSidebar';
import { triggerHaptic } from '@/lib/utils';
import {
  Home,
  UtensilsCrossed,
  Tag,
  Star,
  Palette,
  BarChart3,
  Settings,
  QrCode,
  MoreHorizontal,
  X,
  LogOut,
  User,
} from 'lucide-react';
import { AdminAuthSession } from '@/lib/auth-service';

interface AdminBottomNavProps {
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  userRole: UserRole;
  session?: AdminAuthSession | null;
  onSignOut?: () => void;
  badgeCounts: {
    requests: number;
    reviewsAttention: number;
    activeOffers: number;
  };
}

export function AdminBottomNav({
  activeSection,
  onSelectSection,
  userRole,
  session,
  onSignOut,
  badgeCounts,
}: AdminBottomNavProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Primary buttons based on simplified role (Owner vs Staff)
  let primaryItems: { id: AdminSection; label: string; icon: React.ElementType; badge?: number }[] = [];
  let overflowItems: { id: AdminSection; label: string; icon: React.ElementType }[] = [];

  if (userRole === 'staff') {
    primaryItems = [
      { id: 'menu', label: 'Sold Out', icon: UtensilsCrossed },
      { id: 'offers', label: 'Offers', icon: Tag, badge: badgeCounts.activeOffers },
      { id: 'reviews', label: 'Reviews', icon: Star, badge: badgeCounts.reviewsAttention },
      { id: 'profile', label: 'My Profile', icon: User },
    ];
  } else {
    // Owner
    primaryItems = [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
      { id: 'offers', label: 'Offers', icon: Tag, badge: badgeCounts.activeOffers },
      { id: 'reviews', label: 'Reviews', icon: Star, badge: badgeCounts.reviewsAttention },
    ];
    overflowItems = [
      { id: 'profile', label: 'My Profile', icon: User },
      { id: 'qr', label: 'QR Studio', icon: QrCode },
      { id: 'design', label: 'Design Studio', icon: Palette },
      { id: 'insights', label: 'Performance', icon: BarChart3 },
      { id: 'settings', label: 'Settings & Staff', icon: Settings },
    ];
  }

  const handleSelect = (id: AdminSection) => {
    triggerHaptic(10);
    onSelectSection(id);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* Fixed Bottom Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E1015]/95 backdrop-blur-md border-t border-white/10 md:hidden flex items-center justify-around h-16 px-2 select-none"
        aria-label="Mobile Admin Navigation"
      >
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              data-testid={`admin-nav-${item.id}`}
              onClick={() => handleSelect(item.id)}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 relative ${
                isActive ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] truncate">{item.label}</span>
            </button>
          );
        })}

        {/* More Button if overflow exists */}
        {overflowItems.length > 0 && (
          <button
            data-testid="mobile-bottom-more-btn"
            onClick={() => {
              triggerHaptic(8);
              setIsMoreOpen(true);
            }}
            className={`flex-1 h-full flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-white ${
              overflowItems.some((o) => o.id === activeSection) ? 'text-amber-400 font-bold' : ''
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px]">More</span>
          </button>
        )}
      </nav>

      {/* Overflow Drawer */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-end md:hidden"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="w-full bg-[#16181E] border-t border-white/10 rounded-t-3xl p-5 text-white animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                More Admin Sections
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-neutral-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {overflowItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    data-testid={`admin-nav-${item.id}`}
                    onClick={() => handleSelect(item.id)}
                    className={`h-12 px-3 rounded-2xl flex items-center gap-2.5 text-xs font-bold border transition-colors ${
                      isActive
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Sign Out Button */}
            {onSignOut && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <button
                  type="button"
                  data-testid="mobile-signout-btn"
                  onClick={() => {
                    setIsMoreOpen(false);
                    triggerHaptic(10);
                    onSignOut();
                  }}
                  className="w-full h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out ({session?.identifier || userRole})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
