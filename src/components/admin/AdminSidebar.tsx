'use client';

import React from 'react';
import Link from 'next/link';
import { Restaurant, UserRole } from '@/types/database';
import { AdminAuthSession } from '@/lib/auth-service';
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
  ExternalLink,
  HelpCircle,
  Sparkles,
  LogOut,
  Shield,
  User,
} from 'lucide-react';

export type AdminSection =
  | 'home'
  | 'menu'
  | 'offers'
  | 'reviews'
  | 'requests'
  | 'qr'
  | 'design'
  | 'insights'
  | 'settings'
  | 'profile';

interface AdminSidebarProps {
  restaurant: Restaurant;
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  userRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  session?: AdminAuthSession | null;
  onSignOut?: () => void;
  badgeCounts: {
    requests: number;
    reviewsAttention: number;
    activeOffers: number;
    totalDishes: number;
  };
  onboardingProgress?: {
    completed: number;
    total: number;
  };
  onOpenOnboarding?: () => void;
  onOpenHelp?: () => void;
}

export function AdminSidebar({
  restaurant,
  activeSection,
  onSelectSection,
  userRole,
  onRoleChange,
  session,
  onSignOut,
  badgeCounts,
  onboardingProgress,
  onOpenOnboarding,
  onOpenHelp,
}: AdminSidebarProps) {
  // Navigation items definition (Strict Owner vs Staff)
  const allNavItems: {
    id: AdminSection;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
    allowedRoles: UserRole[];
  }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      allowedRoles: ['owner'],
    },
    {
      id: 'menu',
      label: userRole === 'staff' ? 'Sold-Out Status' : 'Menu & Dishes',
      icon: UtensilsCrossed,
      badge: badgeCounts.totalDishes,
      badgeColor: 'bg-white/10 text-neutral-300',
      allowedRoles: ['owner', 'staff'],
    },
    {
      id: 'offers',
      label: userRole === 'staff' ? 'Active Offers' : 'Offers & Deals',
      icon: Tag,
      badge: badgeCounts.activeOffers > 0 ? `${badgeCounts.activeOffers} Live` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300',
      allowedRoles: ['owner', 'staff'],
    },
    {
      id: 'reviews',
      label: 'Dish Reviews',
      icon: Star,
      badge: badgeCounts.reviewsAttention > 0 ? badgeCounts.reviewsAttention : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300',
      allowedRoles: ['owner', 'staff'],
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: User,
      allowedRoles: ['owner', 'staff'],
    },
    {
      id: 'qr',
      label: 'QR Studio',
      icon: QrCode,
      allowedRoles: ['owner'],
    },
    {
      id: 'design',
      label: 'Design Studio',
      icon: Palette,
      allowedRoles: ['owner'],
    },
    {
      id: 'insights',
      label: 'Insights & Matrix',
      icon: BarChart3,
      allowedRoles: ['owner'],
    },
    {
      id: 'settings',
      label: 'Settings & Staff',
      icon: Settings,
      allowedRoles: ['owner'],
    },
  ];

  // Role filtering
  const visibleNav = allNavItems.filter((item) => item.allowedRoles.includes(userRole));

  return (
    <aside className="w-64 border-r border-white/10 bg-[#0E1015] hidden md:flex flex-col justify-between p-4 flex-shrink-0 select-none">
      <div className="flex flex-col gap-5">
        {/* Restaurant Header */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-base flex-shrink-0"
            style={{ backgroundColor: restaurant.theme_config.primaryColor || '#E8590C' }}
          >
            {restaurant.logo_letter || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white font-brand truncate">
              {restaurant.name}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-neutral-400 capitalize font-medium">
                {userRole === 'owner' ? 'Owner Portal' : 'Staff Portal'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                type="button"
                key={item.id}
                data-testid={`admin-nav-${item.id}`}
                onClick={() => {
                  triggerHaptic(8);
                  onSelectSection(item.id);
                }}
                className={`w-full h-10 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-orange-950/40'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-black/30 text-white' : item.badgeColor || 'bg-white/10 text-neutral-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Onboarding Widget, Role Selector & Links */}
      <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
        {/* Onboarding Checklist Widget (if in progress) */}
        {userRole === 'owner' && onboardingProgress && onboardingProgress.completed < onboardingProgress.total && (
          <div
            onClick={onOpenOnboarding}
            className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 cursor-pointer hover:border-amber-500/40 transition-colors"
          >
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Setup</span>
              </span>
              <span>{Math.round((onboardingProgress.completed / onboardingProgress.total) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-black/40 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${(onboardingProgress.completed / onboardingProgress.total) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-400 mt-1.5">
              {onboardingProgress.completed} of {onboardingProgress.total} steps finished
            </p>
          </div>
        )}

        {/* Authenticated Account Info & Sign Out */}
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onSelectSection('profile');
            }}
            className="flex items-center gap-2 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer group"
            title="Manage My Profile & Password"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
              userRole === 'owner' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {userRole === 'owner' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                {session?.name || (userRole === 'owner' ? 'Restaurant Owner' : 'Staff Member')}
              </div>
              <div className="text-[10px] text-neutral-400 truncate font-mono">
                {session?.identifier || (userRole === 'owner' ? 'owner@addiscafeteria.com' : 'staff')}
              </div>
            </div>
          </button>

          {onSignOut && (
            <button
              type="button"
              data-testid="sidebar-signout-btn"
              onClick={() => {
                triggerHaptic(10);
                onSignOut();
              }}
              className="w-full h-8 rounded-xl bg-white/5 hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/30 text-[11px] font-semibold text-neutral-300 hover:text-rose-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>

        {/* Quick Links & Help */}
        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <Link
            href={`/${restaurant.slug}?table=14`}
            target="_blank"
            className="text-neutral-400 hover:text-white flex items-center gap-1 transition-colors text-[11px]"
          >
            <span>Customer View</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="text-neutral-400 hover:text-amber-400 flex items-center gap-1 transition-colors text-[11px]"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Help & Tips</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
