'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Restaurant, MenuItem, Category, Offer, OfferTemplateType, OfferStatus, OfferStackingRule, UserRole } from '@/types/database';
import { getOffers, saveOffer, togglePauseOffer, deleteOffer } from '@/lib/data-provider';
import {
  evaluateOfferSchedule,
  evaluateItemPricing,
  detectOfferConflicts,
} from '@/lib/pricing-engine';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import {
  Tag,
  Plus,
  Play,
  Pause,
  Copy,
  Trash2,
  Edit,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  ShieldCheck,
  Eye,
  MousePointer,
  ShoppingBag,
  Gift,
  Flame,
} from 'lucide-react';

interface OffersManagerProps {
  restaurant: Restaurant;
  categories: Category[];
  menuItems: MenuItem[];
  userRole: UserRole;
}

// -----------------------------------------------------------------------------
// PLAIN-LANGUAGE TEMPLATES
// -----------------------------------------------------------------------------
interface TemplatePreset {
  id: OfferTemplateType;
  name: string;
  emoji: string;
  tagline: string;
  defaultTitle: string;
  defaultDesc: string;
  defaultBadge: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_item';
  defaultDiscountValue: number;
  defaultScope: 'all' | 'categories' | 'items';
  defaultStartTime?: string;
  defaultEndTime?: string;
  defaultHonestUrgency: number;
  defaultShowBanner: boolean;
  defaultBannerText: string;
}

const OFFER_TEMPLATES: TemplatePreset[] = [
  {
    id: 'happy_hour',
    name: 'Happy Hour',
    emoji: '🍹',
    tagline: 'Discount drinks or dishes during specific afternoon or late-night hours',
    defaultTitle: 'Afternoon Happy Hour: 25% Off',
    defaultDesc: 'Enjoy 25% off all craft beverages and small plates every weekday afternoon.',
    defaultBadge: 'Happy Hour',
    discountType: 'percentage',
    defaultDiscountValue: 25,
    defaultScope: 'categories',
    defaultStartTime: '16:00',
    defaultEndTime: '18:00',
    defaultHonestUrgency: 2,
    defaultShowBanner: true,
    defaultBannerText: '🍹 Afternoon Happy Hour: 25% off selected dishes until 6 PM.',
  },
  {
    id: 'percentage_off',
    name: 'Percentage Off',
    emoji: '🏷️',
    tagline: 'Take a clear percentage off the whole menu or a category (e.g. 20% off starters)',
    defaultTitle: '20% Off All Artisan Starters',
    defaultDesc: '20% off our handcrafted small plates and appetizers.',
    defaultBadge: '20% Off',
    discountType: 'percentage',
    defaultDiscountValue: 20,
    defaultScope: 'categories',
    defaultHonestUrgency: 0,
    defaultShowBanner: false,
    defaultBannerText: '✨ Enjoy 20% off all artisan starters this week.',
  },
  {
    id: 'money_off',
    name: 'Money Off',
    emoji: '🏷️',
    tagline: 'Specific money saving on signature dishes (e.g. 40 ETB Off)',
    defaultTitle: '40 ETB Off Signature Truffle Flatbread',
    defaultDesc: 'Save 40 ETB on our 72-hour sourdough truffle burrata pizza.',
    defaultBadge: '40 ETB Off',
    discountType: 'fixed_amount',
    defaultDiscountValue: 40.0,
    defaultScope: 'items',
    defaultHonestUrgency: 0,
    defaultShowBanner: false,
    defaultBannerText: 'Save 40 ETB on our Chef Signature Truffle Flatbread.',
  },
  {
    id: 'combo_deal',
    name: 'Combo Deal',
    emoji: '🍽️',
    tagline: 'Bundle an entrée and beverage or side for an attractive joint price',
    defaultTitle: 'Wood-Fired Burger & Brew Combo',
    defaultDesc: 'Order any prime burger and get 50 ETB off your accompanying craft drink.',
    defaultBadge: 'Combo Saving',
    discountType: 'fixed_amount',
    defaultDiscountValue: 50.0,
    defaultScope: 'categories',
    defaultHonestUrgency: 0,
    defaultShowBanner: true,
    defaultBannerText: 'Burger & Craft Drink Combo: Save 50 ETB on your pairing.',
  },
  {
    id: 'bogo',
    name: 'Buy One Get One (BOGO)',
    emoji: '👯',
    tagline: 'Buy one dish and get a second dish discounted or free',
    defaultTitle: 'Buy 1 Specialty Coffee, Get 50% Off Second',
    defaultDesc: 'Order any single-origin pour-over and receive 50% off your second cup.',
    defaultBadge: 'BOGO 50%',
    discountType: 'percentage',
    defaultDiscountValue: 50,
    defaultScope: 'categories',
    defaultHonestUrgency: 0,
    defaultShowBanner: true,
    defaultBannerText: '☕ Afternoon BOGO: 50% off your second specialty coffee.',
  },
  {
    id: 'free_item',
    name: 'Free Item with Order Threshold',
    emoji: '🎁',
    tagline: 'Gift a complimentary item when dining tables spend over a threshold',
    defaultTitle: 'Free Single-Origin Espresso Over 500 ETB',
    defaultDesc: 'Complimentary Yirgacheffe espresso automatically added to orders over 500 ETB.',
    defaultBadge: 'Free Gift',
    discountType: 'free_item',
    defaultDiscountValue: 0,
    defaultScope: 'all',
    defaultHonestUrgency: 0,
    defaultShowBanner: true,
    defaultBannerText: 'Free artisanal espresso with all table orders over 500 ETB.',
  },
  {
    id: 'todays_special',
    name: "Today's Special",
    emoji: '✨',
    tagline: 'Highlight a fresh daily arrival or special kitchen catch at promotional pricing',
    defaultTitle: "Chef's Catch of the Day Special",
    defaultDesc: 'Pan-roasted wild catch at special daily market price.',
    defaultBadge: "Today's Special",
    discountType: 'fixed_amount',
    defaultDiscountValue: 50.0,
    defaultScope: 'items',
    defaultHonestUrgency: 2,
    defaultShowBanner: false,
    defaultBannerText: "Today's Special: Fresh wild sea bass at 50 ETB off.",
  },
  {
    id: 'limited_time',
    name: 'Limited-Time Item',
    emoji: '⏳',
    tagline: 'Seasonal limited run with genuine urgency before ingredients sell out',
    defaultTitle: 'Seasonal Morel Truffle Sourdough (This Week Only)',
    defaultDesc: 'Harvested wild morels on fermented sourdough, available only while seasonal supplies last.',
    defaultBadge: 'Limited Time',
    discountType: 'fixed_amount',
    defaultDiscountValue: 3.0,
    defaultScope: 'items',
    defaultHonestUrgency: 3,
    defaultShowBanner: true,
    defaultBannerText: '⏳ Limited Time: Seasonal morel flatbread runs until Sunday.',
  },
];

export function OffersManager({
  restaurant,
  categories,
  menuItems,
  userRole,
}: OffersManagerProps) {
  const isStaff = userRole === 'staff';
  const [offersList, setOffersList] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [liveSuccessModal, setLiveSuccessModal] = useState<Offer | null>(null);

  // Form draft state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePreset>(OFFER_TEMPLATES[0]);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [badgeText, setBadgeText] = useState('Offer');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount' | 'free_item'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(30);
  const [freeItemId, setFreeItemId] = useState<string>(menuItems[0]?.id || '');
  const [scopeType, setScopeType] = useState<'all' | 'categories' | 'items'>('categories');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Schedule state
  const [scheduleType, setScheduleType] = useState<'always' | 'scheduled'>('always');
  const [startsAt, setStartsAt] = useState<string>('');
  const [endsAt, setEndsAt] = useState<string>('');
  const [useTimeWindow, setUseTimeWindow] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>('16:00');
  const [endTime, setEndTime] = useState<string>('18:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Weekdays default
  const [honestUrgencyHours, setHonestUrgencyHours] = useState<number>(2);

  // Calm banner presentation state
  const [showTopBanner, setShowTopBanner] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const [stackingRule, setStackingRule] = useState<OfferStackingRule>('best_discount');

  // Load offers on mount
  useEffect(() => {
    getOffers(restaurant.id).then((data) => {
      setOffersList(data);
      setIsLoading(false);
    });
  }, [restaurant.id]);

  // Apply template defaults
  const handleApplyTemplate = (tmpl: TemplatePreset) => {
    triggerHaptic(10);
    setSelectedTemplate(tmpl);
    setTitle(tmpl.defaultTitle);
    setDescription(tmpl.defaultDesc);
    setBadgeText(tmpl.defaultBadge);
    setDiscountType(tmpl.discountType);
    setDiscountValue(tmpl.defaultDiscountValue);
    setScopeType(tmpl.defaultScope);
    setShowTopBanner(tmpl.defaultShowBanner);
    setBannerText(tmpl.defaultBannerText);
    setHonestUrgencyHours(tmpl.defaultHonestUrgency);

    if (tmpl.defaultStartTime && tmpl.defaultEndTime) {
      setUseTimeWindow(true);
      setStartTime(tmpl.defaultStartTime);
      setEndTime(tmpl.defaultEndTime);
    } else {
      setUseTimeWindow(false);
    }

    if (tmpl.defaultScope === 'categories') {
      setSelectedCategoryIds([categories[0]?.id || '']);
    } else if (tmpl.defaultScope === 'items') {
      setSelectedItemIds([menuItems[0]?.id || '']);
    }
  };

  // Open creation wizard
  const handleStartCreateOffer = () => {
    triggerHaptic(15);
    setDraftId(null);
    handleApplyTemplate(OFFER_TEMPLATES[0]);
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  // Open edit wizard
  const handleEditOffer = (offer: Offer) => {
    triggerHaptic(15);
    setDraftId(offer.id);
    const tmpl = OFFER_TEMPLATES.find((t) => t.id === offer.template_type) || OFFER_TEMPLATES[0];
    setSelectedTemplate(tmpl);
    setTitle(offer.title);
    setDescription(offer.description || '');
    setBadgeText(offer.badge_text);
    setDiscountType(offer.discount_type);
    setDiscountValue(offer.discount_value);
    setMinOrderAmount(offer.min_order_amount || 0);
    setFreeItemId(offer.free_item_id || menuItems[0]?.id || '');
    setScopeType(offer.scope_type);
    setSelectedCategoryIds(offer.category_ids || []);
    setSelectedItemIds(offer.item_ids || []);
    setShowTopBanner(offer.show_top_banner);
    setBannerText(offer.banner_text || '');
    setStackingRule(offer.stacking_rule);
    setHonestUrgencyHours(offer.honest_urgency_hours);

    if (offer.start_time && offer.end_time) {
      setUseTimeWindow(true);
      setStartTime(offer.start_time);
      setEndTime(offer.end_time);
    } else {
      setUseTimeWindow(false);
    }

    if (offer.starts_at || offer.ends_at) {
      setScheduleType('scheduled');
      setStartsAt(offer.starts_at ? offer.starts_at.slice(0, 10) : '');
      setEndsAt(offer.ends_at ? offer.ends_at.slice(0, 10) : '');
    } else {
      setScheduleType('always');
    }

    if (offer.days_of_week) {
      setSelectedDays(offer.days_of_week);
    }

    setWizardStep(1);
    setIsWizardOpen(true);
  };

  // Pause / Resume toggle
  const handleTogglePause = async (offer: Offer) => {
    triggerHaptic(15);
    const nextPaused = !offer.is_paused;
    const updated = await togglePauseOffer(offer.id, nextPaused);
    if (updated) {
      setOffersList((prev) => prev.map((o) => (o.id === offer.id ? updated : o)));
    }
  };

  // Duplicate offer
  const handleDuplicate = async (offer: Offer) => {
    triggerHaptic(15);
    const duplicated: Partial<Offer> & { restaurant_id: string } = {
      restaurant_id: restaurant.id,
      title: `${offer.title} (Copy)`,
      description: offer.description,
      badge_text: offer.badge_text,
      template_type: offer.template_type,
      status: 'draft',
      is_paused: false,
      discount_type: offer.discount_type,
      discount_value: offer.discount_value,
      min_order_amount: offer.min_order_amount,
      free_item_id: offer.free_item_id,
      scope_type: offer.scope_type,
      category_ids: offer.category_ids,
      item_ids: offer.item_ids,
      timezone: offer.timezone,
      days_of_week: offer.days_of_week,
      start_time: offer.start_time,
      end_time: offer.end_time,
      honest_urgency_hours: offer.honest_urgency_hours,
      show_top_banner: false, // Don't duplicate banner automatically
      banner_text: offer.banner_text,
      stacking_rule: offer.stacking_rule,
      priority: offer.priority,
    };

    const saved = await saveOffer(duplicated);
    setOffersList((prev) => [saved, ...prev]);
  };

  // End offer now
  const handleEndNow = async (offer: Offer) => {
    triggerHaptic(15);
    const updated = await saveOffer({
      ...offer,
      status: 'ended',
      ends_at: new Date().toISOString(),
    });
    setOffersList((prev) => prev.map((o) => (o.id === offer.id ? updated : o)));
  };

  // Delete offer
  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Are you sure you want to permanently delete this offer?')) return;
    triggerHaptic(15);
    await deleteOffer(offerId);
    setOffersList((prev) => prev.filter((o) => o.id !== offerId));
  };

  // Save / Publish offer
  const handlePublishOffer = async () => {
    triggerHaptic(20);
    const payload: Partial<Offer> & { restaurant_id: string } = {
      id: draftId || undefined,
      restaurant_id: restaurant.id,
      title: title.trim() || selectedTemplate.defaultTitle,
      description: description.trim() || selectedTemplate.defaultDesc,
      badge_text: badgeText.trim() || 'Offer',
      template_type: selectedTemplate.id,
      status: 'live',
      is_paused: false,
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_order_amount: discountType === 'free_item' ? Number(minOrderAmount) : undefined,
      free_item_id: discountType === 'free_item' ? freeItemId : undefined,
      scope_type: scopeType,
      category_ids: scopeType === 'categories' ? selectedCategoryIds : [],
      item_ids: scopeType === 'items' ? selectedItemIds : [],
      timezone: 'Africa/Addis_Ababa',
      starts_at: scheduleType === 'scheduled' && startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: scheduleType === 'scheduled' && endsAt ? new Date(endsAt).toISOString() : null,
      days_of_week: selectedDays,
      start_time: useTimeWindow ? startTime : null,
      end_time: useTimeWindow ? endTime : null,
      honest_urgency_hours: honestUrgencyHours,
      show_top_banner: showTopBanner,
      banner_text: bannerText.trim(),
      banner_link_text: 'See offer',
      stacking_rule: stackingRule,
      priority: 10,
    };

    const saved = await saveOffer(payload);
    setOffersList((prev) => {
      const exists = prev.some((o) => o.id === saved.id);
      return exists ? prev.map((o) => (o.id === saved.id ? saved : o)) : [saved, ...prev];
    });

    setIsWizardOpen(false);
    setLiveSuccessModal(saved);
  };

  // Conflict warnings calculation
  const conflictWarnings = useMemo(() => {
    const draftOfferObj: Offer = {
      id: draftId || 'draft-preview',
      restaurant_id: restaurant.id,
      title: title || selectedTemplate.defaultTitle,
      badge_text: badgeText,
      template_type: selectedTemplate.id,
      status: 'live',
      is_paused: false,
      discount_type: discountType,
      discount_value: Number(discountValue),
      scope_type: scopeType,
      category_ids: selectedCategoryIds,
      item_ids: selectedItemIds,
      timezone: 'Africa/Addis_Ababa',
      days_of_week: selectedDays,
      honest_urgency_hours: honestUrgencyHours,
      show_top_banner: showTopBanner,
      stacking_rule: stackingRule,
      priority: 10,
      views_count: 0,
      taps_count: 0,
      orders_count: 0,
      total_savings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const otherOffers = offersList.filter((o) => o.id !== draftId && o.status !== 'ended' && !o.is_paused);
    return detectOfferConflicts([draftOfferObj, ...otherOffers], menuItems);
  }, [
    draftId,
    restaurant.id,
    title,
    selectedTemplate,
    badgeText,
    discountType,
    discountValue,
    scopeType,
    selectedCategoryIds,
    selectedItemIds,
    selectedDays,
    honestUrgencyHours,
    showTopBanner,
    stackingRule,
    offersList,
    menuItems,
  ]);

  // Live Phone Preview sample item calculation
  const previewSampleItem = useMemo(() => {
    if (scopeType === 'items' && selectedItemIds.length > 0) {
      return menuItems.find((i) => selectedItemIds.includes(i.id)) || menuItems[0];
    }
    if (scopeType === 'categories' && selectedCategoryIds.length > 0) {
      return menuItems.find((i) => selectedCategoryIds.includes(i.category_id)) || menuItems[0];
    }
    return menuItems[0] || null;
  }, [scopeType, selectedItemIds, selectedCategoryIds, menuItems]);

  const previewItemPricing = useMemo(() => {
    if (!previewSampleItem) return null;
    const draftOffer: Offer = {
      id: 'draft-preview',
      restaurant_id: restaurant.id,
      title: title || selectedTemplate.defaultTitle,
      badge_text: badgeText || 'Offer',
      template_type: selectedTemplate.id,
      status: 'live',
      is_paused: false,
      discount_type: discountType,
      discount_value: Number(discountValue),
      scope_type: scopeType,
      category_ids: selectedCategoryIds,
      item_ids: selectedItemIds,
      timezone: 'Africa/Addis_Ababa',
      days_of_week: selectedDays,
      start_time: useTimeWindow ? startTime : undefined,
      end_time: useTimeWindow ? endTime : undefined,
      honest_urgency_hours: honestUrgencyHours,
      show_top_banner: showTopBanner,
      stacking_rule: stackingRule,
      priority: 10,
      views_count: 0,
      taps_count: 0,
      orders_count: 0,
      total_savings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return evaluateItemPricing(previewSampleItem, [draftOffer], {
      timezone: 'Africa/Addis_Ababa',
    });
  }, [
    previewSampleItem,
    restaurant.id,
    title,
    badgeText,
    selectedTemplate,
    discountType,
    discountValue,
    scopeType,
    selectedCategoryIds,
    selectedItemIds,
    selectedDays,
    useTimeWindow,
    startTime,
    endTime,
    honestUrgencyHours,
    showTopBanner,
    stackingRule,
  ]);

  // Plain-English performance summary
  const totalViews = offersList.reduce((sum, o) => sum + o.views_count, 0);
  const totalTaps = offersList.reduce((sum, o) => sum + o.taps_count, 0);
  const totalOrders = offersList.reduce((sum, o) => sum + o.orders_count, 0);
  const totalSavings = offersList.reduce((sum, o) => sum + o.total_savings, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/[0.03] border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-white">Restaurant Offers & Happy Hours</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Create transparent, calm offers in under 90 seconds. Guests discover savings inline without annoying popups or false urgency.
          </p>
        </div>

        {!isStaff ? (
          <button
            data-testid="admin-create-offer-btn"
            onClick={handleStartCreateOffer}
            className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/30 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Offer</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Staff Mode (View & Pause/Resume only)</span>
          </div>
        )}
      </div>

      {/* 2. PERFORMANCE METRICS SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Offer Views</span>
            <Eye className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-white mt-2">{totalViews}</span>
          <span className="text-[11px] text-neutral-500 mt-1">Calm banner & dish impressions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Offer Taps</span>
            <MousePointer className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-white mt-2">{totalTaps}</span>
          <span className="text-[11px] text-neutral-500 mt-1">Guests explored offer details</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Dishes Ordered</span>
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400 mt-2">{totalOrders}</span>
          <span className="text-[11px] text-neutral-500 mt-1">Dishes ordered with offers</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Savings</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-white mt-2">
            {formatMoney(totalSavings, restaurant.currency)}
          </span>
          <span className="text-[11px] text-emerald-400 mt-1">Passed to dining guests</span>
        </div>
      </div>

      {/* Plain-English Performance Sentence */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <p className="font-medium">
          Guests ordered <strong className="text-white">{totalOrders} dishes</strong> using your live offers, saving a total of{' '}
          <strong className="text-white">{formatMoney(totalSavings, restaurant.currency)}</strong> with 0 intrusive popups.
        </p>
      </div>

      {/* 3. OFFERS LIST TABLE / CARDS */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Active & Scheduled Offers ({offersList.length})
        </h3>

        {offersList.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-white/[0.02] border border-white/10 text-neutral-400">
            <Tag className="w-10 h-10 mx-auto mb-2 text-neutral-600" />
            <p className="text-sm font-bold text-white">No offers created yet</p>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              Choose a template like Happy Hour or Percentage Off to launch your first promotional deal.
            </p>
            {!isStaff && (
              <button
                onClick={handleStartCreateOffer}
                className="mt-4 px-5 py-2 rounded-full bg-amber-500 text-black text-xs font-bold"
              >
                Create Your First Offer
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {offersList.map((offer) => {
              const schedule = evaluateOfferSchedule(offer, new Date(), offer.timezone);
              let statusBadgeBg = 'bg-neutral-800 text-neutral-400';
              let statusLabel: OfferStatus | 'Paused' = offer.status;

              if (offer.is_paused) {
                statusBadgeBg = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
                statusLabel = 'Paused';
              } else if (schedule.isActive) {
                statusBadgeBg = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
              } else if (offer.status === 'draft') {
                statusBadgeBg = 'bg-neutral-700 text-neutral-300';
              } else if (schedule.reason === 'not_started') {
                statusBadgeBg = 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
                statusLabel = 'scheduled';
              } else if (schedule.reason === 'expired') {
                statusBadgeBg = 'bg-neutral-800 text-neutral-500';
                statusLabel = 'ended';
              }

              return (
                <div
                  key={offer.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                      {offer.template_type === 'happy_hour'
                        ? '🍹'
                        : offer.template_type === 'free_item'
                        ? '🎁'
                        : offer.template_type === 'bogo'
                        ? '👯'
                        : offer.template_type === 'combo_deal'
                        ? '🍔'
                        : '🏷️'}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-white truncate">{offer.title}</h4>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${statusBadgeBg}`}>
                          {statusLabel}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {offer.badge_text}
                        </span>
                        {offer.show_top_banner && (
                          <span className="text-[10px] text-neutral-400">Banner Enabled</span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{offer.description}</p>

                      <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-2 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span>{schedule.scheduleSummary}</span>
                        </span>
                        <span>•</span>
                        <span>{offer.views_count} views</span>
                        <span>•</span>
                        <span>{offer.orders_count} orders</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">
                          {formatMoney(offer.total_savings, restaurant.currency)} saved
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Pause / Resume Button (staff & owner) */}
                    <button
                      onClick={() => handleTogglePause(offer)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        offer.is_paused
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                      }`}
                      title={offer.is_paused ? 'Resume this offer' : 'Pause this offer'}
                    >
                      {offer.is_paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      <span>{offer.is_paused ? 'Resume' : 'Pause'}</span>
                    </button>

                    {/* Duplicate Button */}
                    {!isStaff && (
                      <button
                        onClick={() => handleDuplicate(offer)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
                        title="Duplicate offer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}

                    {/* Edit Button */}
                    {!isStaff && (
                      <button
                        onClick={() => handleEditOffer(offer)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
                        title="Edit offer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {/* End Now Button */}
                    {offer.status !== 'ended' && !isStaff && (
                      <button
                        onClick={() => handleEndNow(offer)}
                        className="px-2.5 py-1.5 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-white/10"
                        title="End offer immediately"
                      >
                        End now
                      </button>
                    )}

                    {/* Delete Button */}
                    {!isStaff && (
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                        title="Delete offer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. STEP-BY-STEP CREATION & EDIT WIZARD MODAL WITH LIVE PHONE PREVIEW */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-5xl max-h-[92vh] bg-[#121318] border border-white/15 rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Top Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="font-bold text-base text-white">
                  {draftId ? 'Edit Offer' : 'Create New Offer'}
                </h3>
                <p className="text-xs text-neutral-400">Step {wizardStep} of 4: Live Phone Preview synced</p>
              </div>

              {/* Step Pills */}
              <div className="hidden sm:flex items-center gap-2">
                {[
                  { step: 1, label: '1. Offer Details' },
                  { step: 2, label: '2. Dishes' },
                  { step: 3, label: '3. Schedule' },
                  { step: 4, label: '4. Review' },
                ].map((s) => (
                  <button
                    key={s.step}
                    onClick={() => setWizardStep(s.step as any)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                      wizardStep === s.step
                        ? 'bg-amber-500 text-black'
                        : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsWizardOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Split Body: Left Configuration | Right Live Phone Mockup */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
              {/* LEFT: STEP CONFIGURATION (7 COLS) */}
              <div className="lg:col-span-7 p-6 overflow-y-auto space-y-6">
                {/* STEP 1: WHAT IS THE OFFER? */}
                {wizardStep === 1 && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div>
                      <label className="text-xs font-bold text-neutral-300 block mb-2 uppercase tracking-wider">
                        Choose a Plain-Language Template
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {OFFER_TEMPLATES.map((tmpl) => {
                          const isSelected = selectedTemplate.id === tmpl.id;
                          return (
                            <button
                              key={tmpl.id}
                              type="button"
                              onClick={() => handleApplyTemplate(tmpl)}
                              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                                isSelected
                                  ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                                  : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                              }`}
                            >
                              <span className="text-xl block mb-1">{tmpl.emoji}</span>
                              <span className="text-xs font-bold block leading-tight">{tmpl.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Offer Title & Plain Description */}
                    <div>
                      <label className="text-xs font-bold text-neutral-300 block mb-1">
                        Offer Title (What guests read)
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Afternoon Happy Hour: 25% Off"
                        className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-300 block mb-1">
                        Plain-Language Description & Terms (Terms are never hidden)
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. 25% off all craft beverages and small bites Mon-Fri 4-6pm."
                        className="w-full h-18 p-3 rounded-xl bg-white/5 border border-white/15 text-xs text-white outline-none focus:border-amber-500 resize-none"
                      />
                    </div>

                    {/* Badge & Discount Value */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-neutral-300 block mb-1">
                          Badge Label
                        </label>
                        <input
                          type="text"
                          value={badgeText}
                          onChange={(e) => setBadgeText(e.target.value)}
                          placeholder={`e.g. 20% Off, Save 40 ${restaurant.currency}`}
                          className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-300 block mb-1">
                          {discountType === 'percentage'
                            ? 'Discount Percentage (%)'
                            : discountType === 'fixed_amount'
                            ? `Amount Off (${restaurant.currency})`
                            : `Order Threshold (${restaurant.currency})`}
                        </label>
                        <input
                          type="number"
                          value={discountType === 'free_item' ? minOrderAmount : discountValue}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            if (discountType === 'free_item') setMinOrderAmount(val);
                            else setDiscountValue(val);
                          }}
                          className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Free item selection if template is free item */}
                    {discountType === 'free_item' && (
                      <div>
                        <label className="text-xs font-bold text-neutral-300 block mb-1">
                          Gifted Free Item
                        </label>
                        <select
                          value={freeItemId}
                          onChange={(e) => setFreeItemId(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl bg-neutral-900 border border-white/15 text-xs text-white outline-none"
                        >
                          {menuItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} ({formatMoney(item.price, restaurant.currency)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Calm Banner Option */}
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showTopBanner}
                          onChange={(e) => setShowTopBanner(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500"
                        />
                        <span className="text-xs font-bold text-white">
                          Show calm single-line banner at top of menu
                        </span>
                      </label>
                      <p className="text-[11px] text-neutral-400">
                        Max ONE calm banner is shown. Dismissible for the session; never blocks the menu.
                      </p>
                      {showTopBanner && (
                        <input
                          type="text"
                          value={bannerText}
                          onChange={(e) => setBannerText(e.target.value)}
                          placeholder="e.g. 🌿 Afternoon Happy Hour: 20% off all artisan wood-fired dishes."
                          className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/15 text-xs text-white outline-none"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: WHICH DISHES OR CATEGORIES? */}
                {wizardStep === 2 && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div>
                      <label className="text-xs font-bold text-neutral-300 block mb-2 uppercase tracking-wider">
                        Offer Scope
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'all', label: 'All Menu Dishes', icon: '🍽️' },
                          { id: 'categories', label: 'Specific Categories', icon: '🥗' },
                          { id: 'items', label: 'Specific Dishes', icon: '🍕' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setScopeType(s.id as any)}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              scopeType === s.id
                                ? 'bg-amber-500/20 border-amber-500 text-white'
                                : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:border-white/30'
                            }`}
                          >
                            <span className="text-lg block mb-1">{s.icon}</span>
                            <span className="text-xs font-bold block">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category Selection */}
                    {scopeType === 'categories' && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-300 block">
                          Select Applicable Categories ({selectedCategoryIds.length} selected)
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                          {categories.map((cat) => {
                            const isChecked = selectedCategoryIds.includes(cat.id);
                            return (
                              <label
                                key={cat.id}
                                className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-amber-500/10 border-amber-500/60 text-white'
                                    : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== cat.id));
                                    } else {
                                      setSelectedCategoryIds([...selectedCategoryIds, cat.id]);
                                    }
                                  }}
                                  className="w-4 h-4 rounded text-amber-500"
                                />
                                <span className="text-xs font-semibold truncate">
                                  {cat.icon} {cat.name}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Item Selection */}
                    {scopeType === 'items' && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-300 block">
                          Select Applicable Dishes ({selectedItemIds.length} selected)
                        </label>
                        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
                          {menuItems.map((item) => {
                            const isChecked = selectedItemIds.includes(item.id);
                            return (
                              <label
                                key={item.id}
                                className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-amber-500/10 border-amber-500/60 text-white'
                                    : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setSelectedItemIds(selectedItemIds.filter((id) => id !== item.id));
                                      } else {
                                        setSelectedItemIds([...selectedItemIds, item.id]);
                                      }
                                    }}
                                    className="w-4 h-4 rounded text-amber-500"
                                  />
                                  <span className="text-xs font-semibold text-white truncate">
                                    {item.name}
                                  </span>
                                </div>
                                <span className="text-xs font-mono text-neutral-400">
                                  {formatMoney(item.price, restaurant.currency)}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: WHEN DOES IT RUN? */}
                {wizardStep === 3 && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div>
                      <label className="text-xs font-bold text-neutral-300 block mb-2 uppercase tracking-wider">
                        Schedule Duration
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setScheduleType('always')}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            scheduleType === 'always'
                              ? 'bg-amber-500/20 border-amber-500 text-white'
                              : 'bg-white/[0.02] border-white/10 text-neutral-400'
                          }`}
                        >
                          <span className="text-xs font-bold block">Until I turn it off</span>
                          <span className="text-[10px] text-neutral-400">Runs continuously</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setScheduleType('scheduled')}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            scheduleType === 'scheduled'
                              ? 'bg-amber-500/20 border-amber-500 text-white'
                              : 'bg-white/[0.02] border-white/10 text-neutral-400'
                          }`}
                        >
                          <span className="text-xs font-bold block">Specific Date Range</span>
                          <span className="text-[10px] text-neutral-400">Auto-expires at end date</span>
                        </button>
                      </div>
                    </div>

                    {scheduleType === 'scheduled' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-neutral-300 block mb-1">Start Date</label>
                          <input
                            type="date"
                            value={startsAt}
                            onChange={(e) => setStartsAt(e.target.value)}
                            className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/15 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-neutral-300 block mb-1">End Date</label>
                          <input
                            type="date"
                            value={endsAt}
                            onChange={(e) => setEndsAt(e.target.value)}
                            className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/15 text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Days of Week */}
                    <div>
                      <label className="text-xs font-bold text-neutral-300 block mb-1">
                        Days of Week Active
                      </label>
                      <div className="flex gap-1.5 flex-wrap">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                          const isSelected = selectedDays.includes(idx);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  if (selectedDays.length > 1) {
                                    setSelectedDays(selectedDays.filter((d) => d !== idx));
                                  }
                                } else {
                                  setSelectedDays([...selectedDays, idx].sort());
                                }
                              }}
                              className={`h-9 px-3 rounded-xl text-xs font-bold border transition-colors ${
                                isSelected
                                  ? 'bg-amber-500 text-black border-transparent'
                                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Window (e.g. 16:00 to 18:00) */}
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useTimeWindow}
                          onChange={(e) => setUseTimeWindow(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500"
                        />
                        <span className="text-xs font-bold text-white">
                          Daily Time Window (e.g. Happy Hour)
                        </span>
                      </label>

                      {useTimeWindow && (
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="text-[11px] text-neutral-400 block mb-1">Start Time</label>
                            <input
                              type="time"
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-xs text-white outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-neutral-400 block mb-1">End Time</label>
                            <input
                              type="time"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-xs text-white outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Honest Urgency Window */}
                    <div>
                      <label className="text-xs font-bold text-neutral-300 block mb-1">
                        Honest Urgency Window (Hours before ending to show countdown)
                      </label>
                      <select
                        value={honestUrgencyHours}
                        onChange={(e) => setHonestUrgencyHours(parseInt(e.target.value, 10))}
                        className="w-full h-11 px-3 rounded-xl bg-neutral-900 border border-white/15 text-xs text-white outline-none"
                      >
                        <option value="0">Never show countdown (calmest)</option>
                        <option value="1">Show countdown in last 1 hour</option>
                        <option value="2">Show countdown in last 2 hours (Recommended)</option>
                        <option value="4">Show countdown in last 4 hours</option>
                      </select>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Countdown displays ONLY when offer genuinely ends then. No fake urgency.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 4: REVIEW & PUBLISH */}
                {wizardStep === 4 && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        Offer Summary
                      </h4>
                      <div className="text-sm font-bold text-white">{title || selectedTemplate.defaultTitle}</div>
                      <p className="text-xs text-neutral-400">{description || selectedTemplate.defaultDesc}</p>
                      <div className="flex gap-2 flex-wrap text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                          {badgeText || 'Offer'}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                          {discountType === 'percentage' ? `${discountValue}% Off` : `Save ${restaurant.currency} ${discountValue}`}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                          {useTimeWindow ? `${startTime} – ${endTime}` : 'All Day'}
                        </span>
                      </div>
                    </div>

                    {/* Conflict Warnings Checker */}
                    {conflictWarnings.length > 0 && (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Overlap Warning ({conflictWarnings.length})</span>
                        </div>
                        {conflictWarnings.map((warn, i) => (
                          <p key={i} className="text-xs text-amber-200 leading-relaxed">
                            {warn.warningMessage}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Stacking Rule Selection */}
                    <div>
                      <label className="text-xs font-bold text-neutral-300 block mb-1">
                        Stacking Rule (How overlapping discounts resolve)
                      </label>
                      <select
                        value={stackingRule}
                        onChange={(e) => setStackingRule(e.target.value as any)}
                        className="w-full h-11 px-3 rounded-xl bg-neutral-900 border border-white/15 text-xs text-white outline-none"
                      >
                        <option value="best_discount">Best discount wins (Recommended - gives guest highest saving)</option>
                        <option value="allow_stack">Allow stacking (Combinable with other offers)</option>
                        <option value="exclusive">Exclusive (Overrides all other discounts)</option>
                      </select>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Ready to publish! Realtime updates will immediately sync to active dining guests.</span>
                    </div>
                  </div>
                )}

                {/* Wizard Bottom Navigation Buttons */}
                <div className="sticky bottom-0 bg-[#121318] pt-3 pb-1 border-t border-white/10 flex items-center justify-between z-30">
                  {wizardStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setWizardStep((prev) => (prev - 1) as any)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-neutral-300 flex items-center gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {wizardStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setWizardStep((prev) => (prev + 1) as any)}
                      className="px-5 py-2 rounded-xl bg-amber-500 text-black text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePublishOffer}
                      className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-950/40"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Publish Offer Live</span>
                    </button>
                  )}
                </div>
              </div>

              {/* RIGHT: LIVE INTERACTIVE PHONE PREVIEW (5 COLS) */}
              <div className="lg:col-span-5 p-6 bg-black/40 flex flex-col items-center justify-center">
                <div className="text-center mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Live Phone Preview
                  </span>
                  <p className="text-[10px] text-neutral-500">Exactly what guests see on their mobile screens</p>
                </div>

                {/* Mobile Mockup Shell */}
                <div className="w-[300px] bg-[#16181E] border-4 border-neutral-700 rounded-[32px] overflow-hidden shadow-2xl flex flex-col text-neutral-200">
                  {/* Speaker notch */}
                  <div className="h-5 w-full bg-black flex justify-center items-center">
                    <div className="w-12 h-1 rounded-full bg-neutral-700" />
                  </div>

                  {/* Top calm banner inside preview */}
                  {showTopBanner && (
                    <div className="bg-neutral-900 border-b border-white/10 px-2.5 py-1.5 flex items-center justify-between text-[10px] text-white">
                      <div className="flex items-center gap-1 min-w-0">
                        <Tag className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" />
                        <span className="truncate">{bannerText || 'Special Offer Available'}</span>
                      </div>
                      <span className="text-amber-500 underline font-bold flex-shrink-0 ml-1">See offer</span>
                    </div>
                  )}

                  {/* Header snippet */}
                  <div className="p-3 border-b border-white/10 bg-neutral-900/50 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">{restaurant.name}</span>
                      <span className="text-[9px] text-neutral-400">Table 14</span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black">
                      🏷️ On Offer
                    </span>
                  </div>

                  {/* Dish card preview snippet */}
                  <div className="p-3 space-y-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Dish Card Preview
                    </span>

                    {previewSampleItem ? (
                      <div className="p-2 rounded-xl bg-neutral-900 border border-white/10 flex gap-2">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                          <Image
                            src={previewSampleItem.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                            alt="Dish preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-black">
                                {badgeText || 'Offer'}
                              </span>
                              {previewItemPricing?.savings ? (
                                <span className="text-[8px] font-bold text-emerald-400">
                                  Save {formatMoney(previewItemPricing.savings, restaurant.currency)}
                                </span>
                              ) : null}
                            </div>
                            <h5 className="font-bold text-[11px] text-white truncate mt-0.5">
                              {previewSampleItem.name}
                            </h5>
                          </div>

                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="font-extrabold text-xs text-amber-500">
                              {formatMoney(
                                previewItemPricing?.finalPrice ?? previewSampleItem.price,
                                restaurant.currency
                              )}
                            </span>
                            {previewItemPricing?.hasOffer && (
                              <span className="text-[9px] text-neutral-500 line-through">
                                {formatMoney(previewSampleItem.price, restaurant.currency)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Order summary savings preview snippet */}
                    <div className="p-2 rounded-xl bg-neutral-900/80 border border-white/5 text-[9px] space-y-1">
                      <div className="flex justify-between text-neutral-400">
                        <span>Dish Subtotal</span>
                        <span>{formatMoney(previewSampleItem?.price || 15, restaurant.currency)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>Offer Discount</span>
                        <span>-{formatMoney(previewItemPricing?.savings || 3, restaurant.currency)}</span>
                      </div>
                      <div className="flex justify-between text-white font-extrabold pt-1 border-t border-dashed border-white/10">
                        <span>Total</span>
                        <span className="text-amber-500">
                          {formatMoney(previewItemPricing?.finalPrice || 12, restaurant.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom bar inside preview */}
                  <div className="p-2.5 bg-black border-t border-white/10 text-center">
                    <div className="h-8 rounded-full bg-amber-500 text-black font-extrabold text-[10px] flex items-center justify-center gap-1 shadow-md">
                      <ShoppingBag className="w-3 h-3" />
                      <span>Review Order (Saved {formatMoney(previewItemPricing?.savings || 3, restaurant.currency)})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. "YOUR OFFER IS LIVE" CONFIRMATION MODAL */}
      {liveSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#16181E] border border-emerald-500/40 rounded-3xl p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-2xl">
              🎉
            </div>

            <h3 className="text-lg font-bold text-white">Your Offer is Live!</h3>
            <p className="text-xs text-neutral-400 mt-1">
              <strong>{liveSuccessModal.title}</strong> is active on your digital menu. Guests can view and order it right now.
            </p>

            <div className="p-3 my-4 rounded-xl bg-white/[0.03] border border-white/10 text-left text-xs space-y-1">
              <div className="text-white font-bold">{liveSuccessModal.badge_text}</div>
              <p className="text-neutral-400 text-[11px]">{liveSuccessModal.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Link
                href={`/${restaurant.slug}?table=14`}
                target="_blank"
                className="flex-1 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View on Customer Menu</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                id="done-live-offer-btn"
                onClick={() => setLiveSuccessModal(null)}
                className="h-11 px-6 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
