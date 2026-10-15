'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Restaurant, ThemeConfig, MenuItem, CustomBadge, HolidayClosure } from '@/types/database';
import { checkWcagContrast } from '@/lib/admin-engine';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import {
  Palette,
  Type,
  Layout,
  Sliders,
  Check,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Eye,
  Plus,
  Trash2,
  Calendar,
  Layers,
  ShoppingBag,
  Bell,
  Star,
  Tag,
  Heart,
  Save,
  RotateCcw,
} from 'lucide-react';

interface DesignStudioProps {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  onSaveRestaurant: (updates: Partial<Restaurant>) => Promise<Restaurant>;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export function DesignStudio({
  restaurant,
  menuItems,
  onSaveRestaurant,
  onShowToast,
}: DesignStudioProps) {
  // Active design sub-tab
  const [activeTab, setActiveTab] = useState<'themes' | 'colors' | 'layout' | 'features' | 'badges' | 'messaging'>('themes');

  // Form State
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    primaryColor: restaurant.theme_config?.primaryColor || '#E8590C',
    primaryHover: restaurant.theme_config?.primaryHover || '#D9480F',
    accentColor: restaurant.theme_config?.accentColor || '#F76707',
    fontFamily: restaurant.theme_config?.fontFamily || 'serif',
    borderRadius: restaurant.theme_config?.borderRadius || 'md',
    defaultMode: restaurant.theme_config?.defaultMode || 'auto',
    defaultLayout: restaurant.theme_config?.defaultLayout || 'list',
    cardStyle: restaurant.theme_config?.cardStyle || 'elevated',
    imageSize: restaurant.theme_config?.imageSize || 'standard',
    priceStyle: restaurant.theme_config?.priceStyle || 'accented',
    badgeStyle: restaurant.theme_config?.badgeStyle || 'vibrant',
  });

  const [featureFlags, setFeatureFlags] = useState(
    restaurant.feature_flags || {
      orders_enabled: true,
      waiter_call_enabled: true,
      bill_request_enabled: true,
      offers_enabled: true,
      dietary_filters_enabled: true,
      favorites_enabled: true,
      allergens_enabled: true,
      calories_enabled: true,
    }
  );

  const [customBadges, setCustomBadges] = useState<CustomBadge[]>(
    restaurant.custom_badges || [
      { id: 'b1', name: 'House Special', color: '#E8590C' },
      { id: 'b2', name: 'Family Recipe', color: '#10B981' },
    ]
  );

  const [customLabels, setCustomLabels] = useState<Record<string, string>>(
    restaurant.custom_labels || {
      callWaiter: 'Call Waiter',
      requestBill: 'Request Bill',
      placeOrder: 'Send to Kitchen',
      soldOut: 'Sold out today',
    }
  );

  const [closedMessage, setClosedMessage] = useState(
    restaurant.closed_message || "We're currently resting! Our kitchen re-opens tomorrow at 7:00 AM."
  );

  const [holidayClosures, setHolidayClosures] = useState<HolidayClosure[]>(
    restaurant.holiday_closures || [
      { date: '2026-12-25', reason: 'Christmas Day' },
      { date: '2027-01-01', reason: 'New Year Day' },
    ]
  );

  const [newBadgeName, setNewBadgeName] = useState('');
  const [newBadgeColor, setNewBadgeColor] = useState('#E8590C');

  // Preview Mode: 'dark' | 'light'
  const [previewThemeMode, setPreviewThemeMode] = useState<'dark' | 'light'>('dark');

  // Contrast check
  const contrastCheck = checkWcagContrast(themeConfig.primaryColor, '#FFFFFF');

  // 6 Ready-Made Themes
  const THEME_PRESETS: {
    id: string;
    name: string;
    description: string;
    primary: string;
    hover: string;
    accent: string;
    font: 'serif' | 'sans' | 'display';
    radius: 'sm' | 'md' | 'lg' | 'full';
  }[] = [
    {
      id: 'amber',
      name: 'Artisanal Amber',
      description: 'Warm, cozy & appetizing for bistros and craft cafés',
      primary: '#E8590C',
      hover: '#D9480F',
      accent: '#F76707',
      font: 'serif',
      radius: 'md',
    },
    {
      id: 'emerald',
      name: 'Botanical Emerald',
      description: 'Fresh, organic feel for plant-forward & farm-to-table dining',
      primary: '#059669',
      hover: '#047857',
      accent: '#10B981',
      font: 'sans',
      radius: 'lg',
    },
    {
      id: 'steakhouse',
      name: 'Ruby Steakhouse',
      description: 'Sophisticated & bold for prime cuts, grills, and wine cellars',
      primary: '#E11D48',
      hover: '#BE123C',
      accent: '#F43F5E',
      font: 'serif',
      radius: 'sm',
    },
    {
      id: 'midnight',
      name: 'Midnight Velvet',
      description: 'Luxe golden accents on deep obsidian for fine dining lounges',
      primary: '#D97706',
      hover: '#B45309',
      accent: '#F59E0B',
      font: 'display',
      radius: 'md',
    },
    {
      id: 'slate',
      name: 'Nordic Slate',
      description: 'Clean, understated minimalism focused purely on gastronomy',
      primary: '#475569',
      hover: '#334155',
      accent: '#64748B',
      font: 'sans',
      radius: 'sm',
    },
    {
      id: 'terracotta',
      name: 'Mediterranean Terracotta',
      description: 'Sun-drenched coastal tones for Italian, Greek, and tapas bars',
      primary: '#EA580C',
      hover: '#C2410C',
      accent: '#FB923C',
      font: 'serif',
      radius: 'full',
    },
  ];

  const handleApplyPreset = (preset: typeof THEME_PRESETS[0]) => {
    triggerHaptic(10);
    setThemeConfig({
      ...themeConfig,
      primaryColor: preset.primary,
      primaryHover: preset.hover,
      accentColor: preset.accent,
      fontFamily: preset.font,
      borderRadius: preset.radius,
    });
    onShowToast(`Applied theme preset: ${preset.name}`, 'success');
  };

  const handleSaveAll = async () => {
    triggerHaptic(15);
    await onSaveRestaurant({
      theme_config: themeConfig,
      feature_flags: featureFlags,
      custom_badges: customBadges,
      custom_labels: customLabels,
      closed_message: closedMessage,
      holiday_closures: holidayClosures,
    });
    onShowToast('Design settings and brand configuration published.', 'success');
  };

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-7xl mx-auto w-full">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white">Design Studio & Live Preview</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 uppercase">
              Interactive Preview
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Customize colors, typography, layout, and feature switches with instant live phone reflection.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          data-testid="save-design-btn"
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Publish Design Changes</span>
        </button>
      </div>

      {/* Main Two-Column Layout: Controls on Left, Live Phone on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#12141C] border border-white/5 overflow-x-auto">
            {[
              { id: 'themes', label: 'Presets', icon: Sparkles },
              { id: 'colors', label: 'Colors & Contrast', icon: Palette },
              { id: 'layout', label: 'Style & Fonts', icon: Layout },
              { id: 'features', label: 'Feature Switches', icon: Sliders },
              { id: 'badges', label: 'Custom Badges', icon: Tag },
              { id: 'messaging', label: 'Labels & Hours', icon: Type },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    triggerHaptic(8);
                    setActiveTab(tab.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: PRESETS */}
          {activeTab === 'themes' && (
            <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Ready-Made Design Themes</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Hand-crafted palettes calibrated for dining environments and accessibility.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEME_PRESETS.map((preset) => {
                  const isCurrent = themeConfig.primaryColor === preset.primary;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 ${
                        isCurrent
                          ? 'border-amber-500 bg-amber-500/10 shadow-md'
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span className="text-xs font-bold text-white">{preset.name}</span>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        {preset.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                        <span>Font: {preset.font}</span>
                        <span>•</span>
                        <span>Radius: {preset.radius}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: COLORS & WCAG CONTRAST */}
          {activeTab === 'colors' && (
            <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white">Brand Colors & WCAG 2.2 AA Contrast</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Automatic contrast ratio checking ensures elderly or visually impaired diners can read all prices and buttons.
                </p>
              </div>

              {/* Color pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      data-testid="design-primary-color"
                      value={themeConfig.primaryColor}
                      onChange={(e) => {
                        setThemeConfig({ ...themeConfig, primaryColor: e.target.value });
                      }}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={themeConfig.primaryColor}
                      onChange={(e) =>
                        setThemeConfig({ ...themeConfig, primaryColor: e.target.value })
                      }
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-xs uppercase w-32 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Accent / Highlight Color
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={themeConfig.accentColor}
                      onChange={(e) => {
                        setThemeConfig({ ...themeConfig, accentColor: e.target.value });
                      }}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={themeConfig.accentColor}
                      onChange={(e) =>
                        setThemeConfig({ ...themeConfig, accentColor: e.target.value })
                      }
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-xs uppercase w-32 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Automatic Contrast Checker Warning Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                  contrastCheck.passesNormal
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                {contrastCheck.passesNormal ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold">
                      Contrast Ratio: {contrastCheck.ratio}:1
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                        contrastCheck.passesNormal
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {contrastCheck.passesNormal ? 'WCAG AA Pass' : 'Caution'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    {contrastCheck.plainWarning}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STYLE & FONTS */}
          {activeTab === 'layout' && (
            <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white">Typography & Card Styling</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Fine-tune the culinary aesthetic to match your restaurant's physical interior.
                </p>
              </div>

              {/* Typography Curated List */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  Typography Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'serif', name: 'Artisanal Serif', desc: 'Playfair / Georgia' },
                    { id: 'sans', name: 'Modern Sans', desc: 'Inter / Clean' },
                    { id: 'display', name: 'Editorial Display', desc: 'Cinzel / Luxe' },
                  ].map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setThemeConfig({ ...themeConfig, fontFamily: font.id as any })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        themeConfig.fontFamily === font.id
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                      }`}
                    >
                      <p className="text-xs font-bold text-white">{font.name}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{font.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Corner Roundness */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  Corner Roundness
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {(['sm', 'md', 'lg', 'full'] as const).map((rad) => (
                    <button
                      key={rad}
                      type="button"
                      onClick={() => setThemeConfig({ ...themeConfig, borderRadius: rad })}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold capitalize transition-all ${
                        themeConfig.borderRadius === rad
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-white/5 bg-white/[0.02] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {rad}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Style & Image Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Card Style
                  </label>
                  <select
                    value={themeConfig.cardStyle || 'elevated'}
                    onChange={(e) =>
                      setThemeConfig({ ...themeConfig, cardStyle: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="elevated" className="bg-[#12141C]">Elevated (Soft Shadow)</option>
                    <option value="bordered" className="bg-[#12141C]">Bordered (Crisp Lines)</option>
                    <option value="minimal" className="bg-[#12141C]">Minimal (Flat Clean)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Price Accent Style
                  </label>
                  <select
                    value={themeConfig.priceStyle || 'accented'}
                    onChange={(e) =>
                      setThemeConfig({ ...themeConfig, priceStyle: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="accented" className="bg-[#12141C]">Brand Color Accent</option>
                    <option value="bold-mono" className="bg-[#12141C]">Bold Monospace</option>
                    <option value="classic" className="bg-[#12141C]">Classic Subtle</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FEATURE SWITCHES */}
          {activeTab === 'features' && (
            <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Feature On/Off Switches</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Tailor the customer menu to your exact service model (e.g. view-only vs order list).
                </p>
              </div>

              <div className="divide-y divide-white/5">
                {[
                  {
                    key: 'reviews_enabled',
                    label: 'Dish Reviews & Ratings',
                    desc: 'Allow diners to view 1-5 star reviews and leave authentic feedback.',
                  },
                  {
                    key: 'orders_enabled',
                    label: 'Order Placement / Cart',
                    desc: 'Let guests build an order list and send directly to your kitchen.',
                  },
                  {
                    key: 'waiter_call_enabled',
                    label: 'Call Waiter Button',
                    desc: 'Floating quick call button for water refills, cutlery, or assistance.',
                  },
                  {
                    key: 'bill_request_enabled',
                    label: 'Request Bill Button',
                    desc: 'One-tap bill request notifying your service staff immediately.',
                  },
                  {
                    key: 'offers_enabled',
                    label: 'Promotional Offers & Combos',
                    desc: 'Display automated discount banners and lunch specials.',
                  },
                  {
                    key: 'dietary_filters_enabled',
                    label: 'Dietary Filters (Vegan, Halal, etc.)',
                    desc: 'Quick dietary pills allowing diners to filter dishes by lifestyle.',
                  },
                  {
                    key: 'favorites_enabled',
                    label: 'Guest Favorites / Bookmarking',
                    desc: 'Allow guests to heart dishes to compare before ordering.',
                  },
                  {
                    key: 'allergens_enabled',
                    label: 'Allergen Badges',
                    desc: 'Show Dairy, Gluten, Nut warnings on dish cards.',
                  },
                  {
                    key: 'calories_enabled',
                    label: 'Calorie Counter Display',
                    desc: 'Display caloric values beside dish descriptions.',
                  },
                ].map((feat) => {
                  const isEnabled = (featureFlags as any)[feat.key] ?? true;
                  return (
                    <div
                      key={feat.key}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{feat.label}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{feat.desc}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(8);
                          setFeatureFlags({
                            ...featureFlags,
                            [feat.key]: !isEnabled,
                          });
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 flex-shrink-0 ${
                          isEnabled ? 'bg-amber-600' : 'bg-white/10'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOM BADGES */}
          {activeTab === 'badges' && (
            <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Custom Dish Badges</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Create custom highlights like "House Special", "Family Recipe", or "Secret Menu".
                </p>
              </div>

              {/* Add New Badge Row */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newBadgeName}
                  onChange={(e) => setNewBadgeName(e.target.value)}
                  placeholder="Badge name (e.g. Award Winner)"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
                <input
                  type="color"
                  value={newBadgeColor}
                  onChange={(e) => setNewBadgeColor(e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newBadgeName.trim()) return;
                    triggerHaptic(10);
                    setCustomBadges([
                      ...customBadges,
                      {
                        id: `b-${Date.now()}`,
                        name: newBadgeName.trim(),
                        color: newBadgeColor,
                      },
                    ]);
                    setNewBadgeName('');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Badge</span>
                </button>
              </div>

              {/* Badge List */}
              <div className="space-y-2 pt-2">
                {customBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
                        style={{ backgroundColor: badge.color }}
                      >
                        {badge.name}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-500">{badge.color}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(8);
                        setCustomBadges(customBadges.filter((b) => b.id !== badge.id));
                      }}
                      className="p-1 rounded text-neutral-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: MESSAGING & HOURS */}
          {activeTab === 'messaging' && (
            <div className="p-5 rounded-2xl bg-[#12141C] border border-white/5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Custom Labels & Service Messaging</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Rename every button and label to fit your restaurant voice (e.g. "Ring Captain" instead of "Call Waiter").
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Call Waiter Button Text
                  </label>
                  <input
                    type="text"
                    value={customLabels.callWaiter || ''}
                    onChange={(e) =>
                      setCustomLabels({ ...customLabels, callWaiter: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Request Bill Button Text
                  </label>
                  <input
                    type="text"
                    value={customLabels.requestBill || ''}
                    onChange={(e) =>
                      setCustomLabels({ ...customLabels, requestBill: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Custom "We're Closed" Message
                </label>
                <textarea
                  rows={2}
                  value={closedMessage}
                  onChange={(e) => setClosedMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Scheduled Holiday Closures
                </label>
                <div className="space-y-2">
                  {holidayClosures.map((h, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-mono text-neutral-300">{h.date}</span>
                        <span className="text-white font-medium">— {h.reason}</span>
                      </div>
                      <button
                        onClick={() =>
                          setHolidayClosures(holidayClosures.filter((_, idx) => idx !== i))
                        }
                        className="text-neutral-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INTERACTIVE LIVE PHONE PREVIEW (5 Cols) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white">Live Phone Simulation</h3>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 p-0.5 rounded-full border border-white/10 text-[10px]">
              <button
                type="button"
                onClick={() => setPreviewThemeMode('dark')}
                className={`px-2 py-0.5 rounded-full font-bold transition-colors ${
                  previewThemeMode === 'dark' ? 'bg-black text-white' : 'text-neutral-400'
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setPreviewThemeMode('light')}
                className={`px-2 py-0.5 rounded-full font-bold transition-colors ${
                  previewThemeMode === 'light' ? 'bg-white text-black' : 'text-neutral-400'
                }`}
              >
                Light
              </button>
            </div>
          </div>

          {/* Phone Mockup Frame */}
          <div
            data-testid="live-phone-preview"
            className={`w-full max-w-[380px] mx-auto rounded-[36px] border-4 border-neutral-700 shadow-2xl overflow-hidden transition-colors ${
              previewThemeMode === 'dark' ? 'bg-[#0E1015] text-white' : 'bg-[#FAFAFA] text-neutral-900'
            }`}
            style={{
              fontFamily:
                themeConfig.fontFamily === 'serif'
                  ? 'Playfair Display, serif'
                  : themeConfig.fontFamily === 'display'
                  ? 'Cinzel, serif'
                  : 'Inter, sans-serif',
            }}
          >
            {/* Phone Speaker Notch */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-20 h-3 rounded-full bg-neutral-800" />
            </div>

            {/* Simulated Live Customer Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-md"
                  style={{ backgroundColor: themeConfig.primaryColor }}
                >
                  {restaurant.logo_letter || 'A'}
                </div>
                <div>
                  <h4 className="text-xs font-bold truncate">{restaurant.name}</h4>
                  <p className="text-[9px] text-neutral-400">Table 14 • Artisanal Dining</p>
                </div>
              </div>

              {featureFlags.orders_enabled && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow-xs"
                  style={{ backgroundColor: themeConfig.primaryColor }}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Dietary Filter Pills Simulation */}
            {featureFlags.dietary_filters_enabled && (
              <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-hidden border-b border-white/5">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: themeConfig.primaryColor }}
                >
                  All Items
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-neutral-400">
                  Vegetarian
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-neutral-400">
                  Chef's Pick
                </span>
              </div>
            )}

            {/* Live Simulated Dish Cards */}
            <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto">
              {menuItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl transition-all border ${
                    themeConfig.cardStyle === 'elevated'
                      ? 'bg-white/[0.04] shadow-md border-white/5'
                      : themeConfig.cardStyle === 'bordered'
                      ? 'bg-transparent border-white/20'
                      : 'bg-white/[0.02] border-transparent'
                  }`}
                  style={{
                    borderRadius:
                      themeConfig.borderRadius === 'full'
                        ? '20px'
                        : themeConfig.borderRadius === 'lg'
                        ? '16px'
                        : themeConfig.borderRadius === 'md'
                        ? '12px'
                        : '6px',
                  }}
                >
                  <div className="flex gap-2.5">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-bold truncate">{item.name}</span>
                        {customBadges[0] && (
                          <span
                            className="px-1.5 py-0.2 rounded-full text-[8px] font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: customBadges[0].color }}
                          >
                            {customBadges[0].name}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between mt-1.5 pt-1">
                        <span
                          className={`text-xs font-mono font-bold ${
                            themeConfig.priceStyle === 'accented'
                              ? 'text-amber-400'
                              : 'text-white'
                          }`}
                          style={{
                            color:
                              themeConfig.priceStyle === 'accented'
                                ? themeConfig.primaryColor
                                : undefined,
                          }}
                        >
                          {formatMoney(item.price, restaurant.currency)}
                        </span>

                        {featureFlags.orders_enabled && (
                          <button
                            type="button"
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: themeConfig.primaryColor }}
                          >
                            Add +
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Service Bar Simulation */}
            <div className="p-3 bg-black/40 border-t border-white/10 flex items-center justify-around text-[10px]">
              {featureFlags.waiter_call_enabled && (
                <span className="flex items-center gap-1 text-neutral-300">
                  <Bell className="w-3 h-3 text-amber-400" />
                  <span>{customLabels.callWaiter || 'Call Waiter'}</span>
                </span>
              )}
              {featureFlags.bill_request_enabled && (
                <span className="flex items-center gap-1 text-neutral-300">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{customLabels.requestBill || 'Request Bill'}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
