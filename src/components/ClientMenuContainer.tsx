'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Restaurant, Category, MenuItem, ItemOption } from '@/types/database';
import { CartItem, DietaryFilter, SortOrder } from '@/types/menu';
import { MenuHeader } from './MenuHeader';
import { CategoryTabs } from './CategoryTabs';
import { FilterBar } from './FilterBar';
import { ItemCard } from './ItemCard';
import { ItemDetailModal } from './ItemDetailModal';
import { OrderBar } from './OrderBar';
import { OrderSummarySheet } from './OrderSummarySheet';
import { ServerCardModal } from './ServerCardModal';
import { ServiceAssistanceModal } from './ServiceAssistanceModal';
import { SettingsModal } from './SettingsModal';
import { AllergenLegendModal } from './AllergenLegendModal';
import { QrModal } from './QrModal';
import { createClient } from '@/lib/supabase/client';
import { createOrder, createServiceRequest } from '@/lib/data-provider';
import { triggerHaptic } from '@/lib/utils';
import { ArrowUp, Share2, QrCode, Info, Sparkles } from 'lucide-react';

interface ClientMenuContainerProps {
  restaurant: Restaurant;
  categories: Category[];
  initialItems: MenuItem[];
  initialTable?: string;
}

export function ClientMenuContainer({
  restaurant,
  categories,
  initialItems,
  initialTable,
}: ClientMenuContainerProps) {
  // Items state (updated in real-time via Supabase Realtime)
  const [items, setItems] = useState<MenuItem[]>(initialItems);

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
  // SUPABASE REALTIME: STREAM PRICE CHANGES & SOLD OUT TOGGLES INSTANTLY
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co') {
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

  // Cart operations
  const handleAddToCart = (
    item: MenuItem,
    quantity: number,
    options: ItemOption[],
    notes: string
  ) => {
    const addonsTotal = options.reduce((sum, o) => sum + Number(o.price || 0), 0);
    const unitPrice = item.price + addonsTotal;
    const optKey = options.map((o) => o.name).sort().join('|');

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

    // Dietary chip filter
    if (activeFilter === 'chefsPick') {
      result = result.filter((i) => i.is_chefs_pick);
    } else if (activeFilter === 'favorites') {
      result = result.filter((i) => favorites.has(i.id));
    } else if (activeFilter !== 'all') {
      result = result.filter((i) => i.tags?.includes(activeFilter));
    }

    // Sorting
    if (sortOrder === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOrder === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [items, searchQuery, activeFilter, sortOrder, favorites]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="w-full max-w-lg mx-auto bg-[var(--background)] min-h-screen relative flex flex-col pb-28 md:shadow-2xl md:border md:border-[var(--border)] md:rounded-[28px] md:my-4 md:overflow-hidden transition-colors">
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

      {/* 2. STICKY CATEGORY TABS */}
      <CategoryTabs
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelectCategory={(id) => {
          setActiveCategoryId(id);
          const el = document.getElementById(`cat-${id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        locale={locale}
      />

      {/* 3. FILTER BAR */}
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        layout={layout}
        onToggleLayout={() => setLayout(layout === 'list' ? 'grid' : 'list')}
      />

      {/* 4. MAIN MENU ITEMS */}
      <main className="px-4 py-4 flex-1">
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center text-[var(--muted)]">
            <span className="text-4xl block mb-2">{activeFilter === 'favorites' ? '❤️' : '🔍'}</span>
            <h3 className="text-base font-bold text-[var(--foreground)]">
              {activeFilter === 'favorites' ? 'No favorites saved yet' : 'No matching dishes found'}
            </h3>
            <p className="text-xs mt-1">Try adjusting your search or clearing your active filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="mt-4 px-5 py-2 rounded-full text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Reset Filters
            </button>
          </div>
        ) : activeFilter !== 'all' || searchQuery.trim().length > 0 ? (
          // Filtered list view
          <section className="mb-8">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-[var(--primary)]" />
              <h2 className="text-base font-bold text-[var(--foreground)] font-brand">
                Results ({filteredItems.length})
              </h2>
            </div>
            <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}>
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
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
        subtotal={cartSubtotal}
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
        currencySymbol={restaurant.currency}
        onClose={() => setSelectedDetailItem(null)}
        onAddToCart={handleAddToCart}
        locale={locale}
      />

      <OrderSummarySheet
        isOpen={isOrderSheetOpen}
        onClose={() => setIsOrderSheetOpen(false)}
        cart={cart}
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
