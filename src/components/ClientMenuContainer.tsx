'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Restaurant, Category, MenuItem, ItemOption, Offer, DishReview, RestaurantReviewSettings, DishReviewStats } from '@/types/database';
import { CartItem, DietaryFilter, SortOrder } from '@/types/menu';
import { MenuHeader } from './MenuHeader';
import { CategoryTabs } from './CategoryTabs';
import { FilterBar } from './FilterBar';
import { ItemCard } from './ItemCard';
import { ItemDetailModal } from './ItemDetailModal';
import { CalmOfferBanner } from './CalmOfferBanner';
import { ReviewModal } from './ReviewModal';
import { OrderBar } from './OrderBar';
import { OrderSummarySheet } from './OrderSummarySheet';
import { ServerCardModal } from './ServerCardModal';
import { ServiceAssistanceModal } from './ServiceAssistanceModal';
import { SettingsModal } from './SettingsModal';
import { AllergenLegendModal } from './AllergenLegendModal';
import { QrModal } from './QrModal';
import { createClient } from '@/lib/supabase/client';
import {
  createServiceRequest,
  recordOfferInteraction,
  MOCK_OFFERS_ADDIS,
  MOCK_REVIEWS_ADDIS,
  DEFAULT_REVIEW_SETTINGS_ADDIS,
  submitDishReview,
  reportDishReview,
} from '@/lib/data-provider';
import {
  evaluateOfferSchedule,
  evaluateItemPricing,
  evaluateCartPricing,
  ItemPricingResult,
  CartPricingResult,
} from '@/lib/pricing-engine';
import { calculateDishReviewStats } from '@/lib/review-engine';
import { triggerHaptic } from '@/lib/utils';
import { ArrowUp, Share2, QrCode, Info, Sparkles, Tag, Clock, X, WifiOff } from 'lucide-react';

interface ClientMenuContainerProps {
  restaurant: Restaurant;
  categories: Category[];
  initialItems: MenuItem[];
  initialOffers?: Offer[];
  initialReviews?: DishReview[];
  initialReviewSettings?: RestaurantReviewSettings;
  initialTable?: string;
}

export function ClientMenuContainer({
  restaurant,
  categories,
  initialItems,
  initialOffers,
  initialReviews,
  initialReviewSettings,
  initialTable,
}: ClientMenuContainerProps) {
  // Items state (updated in real-time via Supabase Realtime)
  const [items, setItems] = useState<MenuItem[]>(initialItems);

  // Offers state (updated in real-time via Supabase Realtime)
  const [offers, setOffers] = useState<Offer[]>(initialOffers || MOCK_OFFERS_ADDIS);

  // Reviews & Settings state
  const [reviews, setReviews] = useState<DishReview[]>(initialReviews || MOCK_REVIEWS_ADDIS);
  const [reviewSettings] = useState<RestaurantReviewSettings>(
    initialReviewSettings || DEFAULT_REVIEW_SETTINGS_ADDIS
  );
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewModalItem, setReviewModalItem] = useState<MenuItem | null>(null);
  const [sessionToken, setSessionToken] = useState<string>('guest-session-default');

  useEffect(() => {
    try {
      let token = localStorage.getItem('guest_review_session_token');
      if (!token) {
        token = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem('guest_review_session_token', token);
      }
      setSessionToken(token);
    } catch {
      // Storage fallback
    }
  }, []);

  // Periodic clock tick for honest urgency & automatic offer start/expiry without refresh
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  // PWA Offline detection & Repeat Visitor Install Prompt
  const [isOffline, setIsOffline] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Repeat visitor check (> 1 visit) and not previously dismissed
    try {
      let visits = parseInt(localStorage.getItem('menu_visit_count') || '0', 10);
      if (!sessionStorage.getItem('menu_session_active')) {
        sessionStorage.setItem('menu_session_active', 'true');
        visits += 1;
        localStorage.setItem('menu_visit_count', visits.toString());
      }
      const isDismissed = localStorage.getItem('menu_pwa_install_dismissed') === 'true';

      if (visits > 1 && !isDismissed) {
        setShowInstallPrompt(true);
      }
    } catch {
      // quota/privacy fallback
    }

    // Capture browser beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    triggerHaptic(10);
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choiceResult = await deferredInstallPrompt.userChoice;
      if (choiceResult?.outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredInstallPrompt(null);
    } else {
      showToast('Tap Share / Menu and select "Add to Home Screen"');
      setShowInstallPrompt(false);
    }
    try {
      localStorage.setItem('menu_pwa_install_dismissed', 'true');
    } catch {}
  };

  const handleDismissInstall = () => {
    triggerHaptic(5);
    setShowInstallPrompt(false);
    try {
      localStorage.setItem('menu_pwa_install_dismissed', 'true');
    } catch {}
  };

  // User state
  const [tableNumber, setTableNumber] = useState<string>(
    initialTable || restaurant.default_table || 'Table 14'
  );
  const [locale, setLocale] = useState<string>('en');
  const [layout, setLayout] = useState<'list' | 'grid'>(
    restaurant.theme_config?.defaultLayout || 'list'
  );
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<DietaryFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('featured');

  // Favorites & Cart (Session memory)
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals state
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [isOrderSheetOpen, setIsOrderSheetOpen] = useState(false);
  const [isServerCardOpen, setIsServerCardOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLegendModalOpen, setIsLegendModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Initialize session storage on mount
  useEffect(() => {
    try {
      const savedFavs = sessionStorage.getItem(`favs_${restaurant.id}`);
      if (savedFavs) setFavorites(new Set(JSON.parse(savedFavs)));

      const savedCart = sessionStorage.getItem(`cart_${restaurant.id}`);
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch {
      // Storage access check
    }
  }, [restaurant.id]);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ---------------------------------------------------------------------------
  // SUPABASE REALTIME: STREAM ITEMS & OFFERS INSTANTLY
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co') {
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel(`menu-realtime-${restaurant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as MenuItem;
            setItems((prev) =>
              prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
            );
            showToast(`Item updated: ${updated.name}`);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'offers',
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOffer = payload.new as Offer;
            setOffers((prev) => [newOffer, ...prev]);
            showToast(`New offer live: ${newOffer.title}`);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Offer;
            setOffers((prev) =>
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
            );
          } else if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as { id: string }).id;
            setOffers((prev) => prev.filter((o) => o.id !== oldId));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRev = payload.new as DishReview;
            setReviews((prev) => [newRev, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedRev = payload.new as DishReview;
            setReviews((prev) =>
              prev.map((r) => (r.id === updatedRev.id ? { ...r, ...updatedRev } : r))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant.id]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    triggerHaptic(12);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Review Submissions
  const handlePostReview = async (data: {
    item_id: string;
    rating: number;
    tags: string[];
    comment?: string;
    photo_url?: string;
    honeypot?: string;
    submissionDurationMs: number;
  }) => {
    const res = await submitDishReview({
      ...data,
      restaurant_id: restaurant.id,
      session_token: sessionToken,
      table_number: tableNumber,
    });
    if (res.success && res.review) {
      setReviews((prev) => [res.review!, ...prev]);
      showToast('Thank you for rating this dish!');
    }
    return res;
  };

  const handleReportReview = async (reviewId: string, reason: string) => {
    await reportDishReview(reviewId, reason);
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, status: 'reported', report_count: r.report_count + 1 } : r
      )
    );
    showToast('Review reported for moderation.');
  };

  // ---------------------------------------------------------------------------
  // 3-REVIEW THRESHOLD STATS MAPPING
  // ---------------------------------------------------------------------------
  const reviewStatsMap = useMemo(() => {
    const map = new Map<string, DishReviewStats>();
    for (const item of items) {
      map.set(
        item.id,
        calculateDishReviewStats(reviews, item.id, reviewSettings.min_reviews_threshold)
      );
    }
    return map;
  }, [items, reviews, reviewSettings.min_reviews_threshold]);
  // ---------------------------------------------------------------------------
  const restaurantTimezone = restaurant.slug === 'addis' ? 'Africa/Addis_Ababa' : 'UTC';

  // Evaluate which offers are currently active
  const activeOffers = useMemo(() => {
    return offers.filter((offer) => {
      const schedule = evaluateOfferSchedule(offer, currentTime, offer.timezone || restaurantTimezone);
      return schedule.isActive;
    });
  }, [offers, currentTime, restaurantTimezone]);

  // Single top calm banner: maximum of ONE calm banner at the top of the menu
  const bannerOffer = useMemo(() => {
    return activeOffers.find((o) => o.show_top_banner) || null;
  }, [activeOffers]);

  // Record view on top banner if shown
  useEffect(() => {
    if (bannerOffer) {
      recordOfferInteraction(bannerOffer.id, 'view').catch(() => {});
    }
  }, [bannerOffer]);

  // Item pricing evaluation map
  const itemPricingMap = useMemo(() => {
    const map = new Map<string, ItemPricingResult>();
    for (const item of items) {
      const result = evaluateItemPricing(item, activeOffers, {
        currentTime,
        timezone: restaurantTimezone,
      });
      map.set(item.id, result);
    }
    return map;
  }, [items, activeOffers, currentTime, restaurantTimezone]);

  // Items lookup map
  const itemsMap = useMemo(() => {
    return new Map(items.map((i) => [i.id, i]));
  }, [items]);

  // Evaluate Cart Pricing (Line-by-line savings, applied offers, free items)
  const cartPricing = useMemo(() => {
    return evaluateCartPricing(cart, activeOffers, restaurant.tax_rate, {
      currentTime,
      timezone: restaurantTimezone,
      menuItemsMap: itemsMap,
    });
  }, [cart, activeOffers, restaurant.tax_rate, currentTime, restaurantTimezone, itemsMap]);

  // Cart operations
  const handleAddToCart = (
    item: MenuItem,
    quantity: number,
    options: ItemOption[],
    notes: string
  ) => {
    const addonsTotal = options.reduce((sum, o) => sum + Number(o.price || 0), 0);
    // Use effective unit price from pricing evaluation
    const pricing = itemPricingMap.get(item.id);
    const basePrice = pricing?.hasOffer ? pricing.finalPrice : item.price;
    const unitPrice = basePrice + addonsTotal;
    const optKey = options.map((o) => o.name).sort().join('|');

    // If an offer was applied, record analytics tap/order
    if (pricing?.appliedOffer) {
      recordOfferInteraction(pricing.appliedOffer.id, 'tap', pricing.savings * quantity).catch(() => {});
    }

    setCart((prev) => {
      const existing = prev.find(
        (c) => c.item.id === item.id && c.notes === notes && c.options.map((o) => o.name).sort().join('|') === optKey
      );

      let nextCart: CartItem[];
      if (existing) {
        nextCart = prev.map((c) =>
          c.cartId === existing.cartId ? { ...c, quantity: c.quantity + quantity } : c
        );
      } else {
        nextCart = [
          ...prev,
          {
            cartId: `${Date.now()}-${Math.random()}`,
            item,
            quantity,
            options,
            notes,
            unitPrice,
          },
        ];
      }

      sessionStorage.setItem(`cart_${restaurant.id}`, JSON.stringify(nextCart));
      return nextCart;
    });

    showToast(`Added to your order: ${item.name}`);
  };

  const handleUpdateCartQty = (cartId: string, delta: number) => {
    setCart((prev) => {
      const nextCart = prev
        .map((entry) => {
          if (entry.cartId === cartId) {
            const newQty = entry.quantity + delta;
            return newQty > 0 ? { ...entry, quantity: newQty } : null;
          }
          return entry;
        })
        .filter(Boolean) as CartItem[];

      sessionStorage.setItem(`cart_${restaurant.id}`, JSON.stringify(nextCart));
      return nextCart;
    });
  };

  const handleClearOrder = () => {
    setCart([]);
    sessionStorage.removeItem(`cart_${restaurant.id}`);
  };

  const handleToggleFavorite = (itemId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      sessionStorage.setItem(`favs_${restaurant.id}`, JSON.stringify([...next]));
      return next;
    });
  };

  // Submit Call Server / Request
  const handleRequestService = async (type: 'waiter' | 'water' | 'cutlery' | 'bill') => {
    await createServiceRequest({
      restaurant_id: restaurant.id,
      table_number: tableNumber,
      request_type: type,
    });

    const labels: Record<string, string> = {
      waiter: 'Server assistance requested!',
      water: 'Water refill requested!',
      cutlery: 'Extra napkins and cutlery requested!',
      bill: 'The check has been requested!',
    };

    showToast(`🛎️ ${labels[type]} for ${tableNumber}`);
  };

  // Banner action handler: smoothly jumps to dishes on offer
  const handleSeeOffer = (offer: Offer) => {
    recordOfferInteraction(offer.id, 'tap').catch(() => {});
    setActiveFilter('onOffer');
    setActiveCategoryId('offers');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Filtered & Sorted items computation
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search query filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.name_es && i.name_es.toLowerCase().includes(q)) ||
          i.description.toLowerCase().includes(q) ||
          (i.tags && i.tags.join(' ').toLowerCase().includes(q)) ||
          (i.allergens && i.allergens.join(' ').toLowerCase().includes(q))
      );
    }

    // "On offer" Filter Chip or "Offers" tab
    if (activeFilter === 'onOffer' || activeCategoryId === 'offers') {
      result = result.filter((i) => itemPricingMap.get(i.id)?.hasOffer);
    } else if (activeFilter === 'chefsPick') {
      result = result.filter((i) => i.is_chefs_pick);
    } else if (activeFilter === 'favorites') {
      result = result.filter((i) => favorites.has(i.id));
    } else if (activeFilter !== 'all') {
      result = result.filter((i) => i.tags?.includes(activeFilter));
    }

    // Sorting
    if (sortOrder === 'price-asc') {
      result.sort((a, b) => {
        const priceA = itemPricingMap.get(a.id)?.finalPrice ?? a.price;
        const priceB = itemPricingMap.get(b.id)?.finalPrice ?? b.price;
        return priceA - priceB;
      });
    } else if (sortOrder === 'price-desc') {
      result.sort((a, b) => {
        const priceA = itemPricingMap.get(a.id)?.finalPrice ?? a.price;
        const priceB = itemPricingMap.get(b.id)?.finalPrice ?? b.price;
        return priceB - priceA;
      });
    } else if (sortOrder === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [items, searchQuery, activeFilter, activeCategoryId, sortOrder, favorites, itemPricingMap]);

  // Gentle pairing recommendations for "Goes well with"
  const pairingItems = useMemo(() => {
    return items.filter(
      (i) =>
        i.category_id === 'cat-drinks' ||
        i.category_id === 'cat-juices' ||
        i.category_id === 'cat-desserts' ||
        i.category_id === 'cat-snacks' ||
        i.category_id === 'cat-starters'
    );
  }, [items]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="w-full max-w-lg mx-auto bg-[var(--background)] min-h-screen relative flex flex-col pb-28 md:shadow-2xl md:border md:border-[var(--border)] md:rounded-[28px] md:my-4 md:overflow-hidden transition-colors">
      {/* 0. PWA GRACEFUL OFFLINE BANNER */}
      {isOffline && (
        <div
          data-testid="pwa-offline-banner"
          className="sticky top-0 z-50 bg-[#161822]/95 backdrop-blur-md border-b border-amber-500/40 px-4 py-2 text-xs flex items-center justify-between text-amber-200 animate-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>You're offline — showing cached menu and offline cart</span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
            Offline Mode
          </span>
        </div>
      )}

      {/* 0.1 PWA REPEAT VISITOR INSTALL PROMPT */}
      {showInstallPrompt && (
        <div
          data-testid="pwa-install-banner"
          className="mx-3 mt-2 p-2.5 rounded-2xl bg-[#141620]/95 border border-white/10 shadow-lg flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
              style={{ backgroundColor: restaurant.theme_config.primaryColor || '#E8590C' }}
            >
              {restaurant.logo_letter || 'A'}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white truncate text-[11px]">Install {restaurant.name}</p>
              <p className="text-[10px] text-neutral-400 truncate">Instant access & offline dining</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              data-testid="pwa-install-action"
              onClick={handleInstallClick}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] transition-colors"
            >
              Install
            </button>
            <button
              type="button"
              data-testid="pwa-install-dismiss"
              onClick={handleDismissInstall}
              className="text-neutral-400 hover:text-white p-1"
              aria-label="Dismiss installation prompt"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. STICKY TOP HEADER */}
      <MenuHeader
        restaurant={restaurant}
        tableNumber={tableNumber}
        favCount={favorites.size}
        onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
        onOpenFavorites={() => setActiveFilter(activeFilter === 'favorites' ? 'all' : 'favorites')}
        onOpenServiceModal={() => setIsServiceModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenLegendModal={() => setIsLegendModalOpen(true)}
        onShowWifiToast={() =>
          showToast(`📶 WiFi: ${restaurant.wifi_config.ssid} (Pass: ${restaurant.wifi_config.password || 'none'})`)
        }
      />

      {/* 1.1 CALM OFFER BANNER (Maximum ONE calm banner at the top, dismissible for session) */}
      <CalmOfferBanner
        activeOffer={bannerOffer}
        onSeeOffer={handleSeeOffer}
      />

      {/* Collapsible Search Drawer */}
      {isSearchOpen && (
        <div className="px-4 py-2.5 bg-[var(--card)] border-b border-[var(--border)] animate-in slide-in-from-top-2">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes, ingredients, dietary tags..."
            className="w-full h-11 px-4 rounded-full bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
            autoFocus
          />
        </div>
      )}

      {/* 2. STICKY CATEGORY TABS (Includes Offers tab if active offers exist) */}
      <CategoryTabs
        categories={categories}
        activeCategoryId={activeCategoryId}
        hasActiveOffers={activeOffers.length > 0}
        onSelectCategory={(id) => {
          setActiveCategoryId(id);
          if (id === 'offers') {
            setActiveFilter('onOffer');
          } else {
            if (activeFilter === 'onOffer') setActiveFilter('all');
            const el = document.getElementById(`cat-${id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        locale={locale}
      />

      {/* 3. FILTER BAR (Includes "On offer" filter chip) */}
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={(filter) => {
          setActiveFilter(filter);
          if (filter !== 'onOffer' && activeCategoryId === 'offers') {
            setActiveCategoryId(categories[0]?.id || '');
          }
        }}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        layout={layout}
        onToggleLayout={() => setLayout(layout === 'list' ? 'grid' : 'list')}
      />

      {/* 4. MAIN MENU ITEMS */}
      <main className="px-4 py-4 flex-1">
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center text-[var(--muted)]">
            <span className="text-4xl block mb-2">
              {activeFilter === 'onOffer' || activeCategoryId === 'offers'
                ? '🏷️'
                : activeFilter === 'favorites'
                ? '❤️'
                : '🔍'}
            </span>
            <h3 className="text-base font-bold text-[var(--foreground)]">
              {activeFilter === 'onOffer' || activeCategoryId === 'offers'
                ? 'No active offers right now'
                : activeFilter === 'favorites'
                ? 'No favorites saved yet'
                : 'No matching dishes found'}
            </h3>
            <p className="text-xs mt-1">
              {activeFilter === 'onOffer'
                ? 'Check back soon for upcoming happy hours and chef specials'
                : 'Try adjusting your search or clearing your active filters'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
                setActiveCategoryId(categories[0]?.id || '');
              }}
              className="mt-4 px-5 py-2 rounded-full text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Reset Filters
            </button>
          </div>
        ) : activeFilter !== 'all' || activeCategoryId === 'offers' || searchQuery.trim().length > 0 ? (
          // Filtered list / Offers view
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                {activeFilter === 'onOffer' || activeCategoryId === 'offers' ? (
                  <Tag className="w-4 h-4 text-[var(--primary)]" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                )}
                <h2 className="text-base font-bold text-[var(--foreground)] font-brand">
                  {activeFilter === 'onOffer' || activeCategoryId === 'offers'
                    ? `Dishes on Offer (${filteredItems.length})`
                    : `Results (${filteredItems.length})`}
                </h2>
              </div>

              {activeOffers.length > 0 && (activeFilter === 'onOffer' || activeCategoryId === 'offers') && (
                <span className="text-[11px] text-[var(--muted)]">
                  {activeOffers.length} {activeOffers.length === 1 ? 'deal running' : 'deals running'}
                </span>
              )}
            </div>

            <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}>
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  pricingResult={itemPricingMap.get(item.id)}
                  reviewStats={reviewStatsMap.get(item.id)}
                  currencySymbol={restaurant.currency}
                  isFavorite={favorites.has(item.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenDetails={setSelectedDetailItem}
                  onQuickAdd={(i) => handleAddToCart(i, 1, [], '')}
                  layout={layout}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        ) : (
          // Standard Category-grouped sections
          categories.map((cat) => {
            const catItems = filteredItems.filter((i) => i.category_id === cat.id);
            if (catItems.length === 0) return null;

            const displayName = locale === 'es' && cat.name_es ? cat.name_es : cat.name;
            const displayDesc = locale === 'es' && cat.description_es ? cat.description_es : cat.description;

            return (
              <section key={cat.id} id={`cat-${cat.id}`} className="mb-8 scroll-mt-36">
                <div className="mb-3">
                  <h2 className="text-lg font-bold text-[var(--foreground)] font-brand flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{displayName}</span>
                  </h2>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{displayDesc}</p>
                </div>

                <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}>
                  {catItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      pricingResult={itemPricingMap.get(item.id)}
                      reviewStats={reviewStatsMap.get(item.id)}
                      currencySymbol={restaurant.currency}
                      isFavorite={favorites.has(item.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onOpenDetails={setSelectedDetailItem}
                      onQuickAdd={(i) => handleAddToCart(i, 1, [], '')}
                      layout={layout}
                      locale={locale}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* 5. FLOATING BOTTOM ORDER BAR */}
      <OrderBar
        totalItems={totalCartCount}
        subtotal={cartPricing.netSubtotal}
        totalSavings={cartPricing.totalSavings}
        currencySymbol={restaurant.currency}
        onOpenOrderSheet={() => setIsOrderSheetOpen(true)}
      />

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={() => {
            triggerHaptic(10);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="fixed bottom-20 right-4 z-30 w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] shadow-lg flex items-center justify-center hover:bg-[var(--border)] transition-transform active:scale-95"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* 6. FOOTER */}
      <footer className="px-5 py-8 border-t border-[var(--border)] text-center text-xs text-[var(--muted)] flex flex-col gap-3 mt-auto">
        <h3 className="font-bold text-sm text-[var(--foreground)] font-brand">
          {restaurant.name}
        </h3>
        <p>{restaurant.hours}</p>
        <p>{restaurant.address}</p>
        <div className="flex justify-center gap-4 text-xs font-semibold" style={{ color: 'var(--primary)' }}>
          <button onClick={() => setIsQrModalOpen(true)} className="inline-flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5" />
            <span>Table QR</span>
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: restaurant.name,
                  text: restaurant.tagline,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                setIsQrModalOpen(true);
              }
            }}
            className="inline-flex items-center gap-1"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Menu</span>
          </button>
          <button onClick={() => setIsLegendModalOpen(true)} className="inline-flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Allergen Guide</span>
          </button>
        </div>
      </footer>

      {/* 7. MODALS & BOTTOM SHEETS */}
      <ItemDetailModal
        item={selectedDetailItem}
        pricingResult={selectedDetailItem ? itemPricingMap.get(selectedDetailItem.id) : undefined}
        reviewStats={selectedDetailItem ? reviewStatsMap.get(selectedDetailItem.id) : undefined}
        dishReviews={
          selectedDetailItem
            ? reviews.filter((r) => r.item_id === selectedDetailItem.id && r.status === 'published')
            : []
        }
        pairingRecommendations={pairingItems}
        currencySymbol={restaurant.currency}
        onClose={() => setSelectedDetailItem(null)}
        onAddToCart={handleAddToCart}
        onQuickAddPairing={(pairing) => handleAddToCart(pairing, 1, [], '')}
        onOpenReviewModal={() => {
          setReviewModalItem(selectedDetailItem);
          setIsReviewModalOpen(true);
        }}
        onReportReview={handleReportReview}
        locale={locale}
      />

      {/* Review Submission Modal (< 15 seconds) */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        item={reviewModalItem}
        availableTags={reviewSettings.available_tags}
        onClose={() => {
          setIsReviewModalOpen(false);
          setReviewModalItem(null);
        }}
        onSubmitReview={handlePostReview}
      />

      <OrderSummarySheet
        isOpen={isOrderSheetOpen}
        onClose={() => setIsOrderSheetOpen(false)}
        cart={cart}
        cartPricing={cartPricing}
        currencySymbol={restaurant.currency}
        taxRate={restaurant.tax_rate}
        tableNumber={tableNumber}
        onUpdateQty={handleUpdateCartQty}
        onClearOrder={handleClearOrder}
        onShowWaiterCard={() => setIsServerCardOpen(true)}
        onCallServer={() => setIsServiceModalOpen(true)}
      />

      <ServerCardModal
        isOpen={isServerCardOpen}
        onClose={() => setIsServerCardOpen(false)}
        cart={cart}
        tableNumber={tableNumber}
        restaurantName={restaurant.name}
        currencySymbol={restaurant.currency}
        taxRate={restaurant.tax_rate}
      />

      <ServiceAssistanceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        tableNumber={tableNumber}
        onRequestService={handleRequestService}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        locale={locale}
        onLocaleChange={setLocale}
        tableNumber={tableNumber}
        onTableNumberChange={setTableNumber}
        wifiInfo={restaurant.wifi_config}
      />

      <AllergenLegendModal
        isOpen={isLegendModalOpen}
        onClose={() => setIsLegendModalOpen(false)}
      />

      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        restaurantName={restaurant.name}
        tableNumber={tableNumber}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--foreground)] text-[var(--background)] px-4 py-2.5 rounded-full text-xs font-bold shadow-xl animate-toast flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
