'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getCurrentSession, clearAuthSession, AdminAuthSession } from '@/lib/auth-service';
import {
  Restaurant,
  MenuItem,
  Category,
  Order,
  ServiceRequest,
  DishReview,
  Offer,
  ScheduledMenu,
  MenuVersion,
  UserRole,
} from '@/types/database';
import {
  MOCK_RESTAURANT_ADDIS,
  MOCK_ITEMS_ADDIS,
  MOCK_CATEGORIES_ADDIS,
  MOCK_OFFERS_ADDIS,
  MOCK_REVIEWS_ADDIS,
  MOCK_SCHEDULED_MENUS_ADDIS,
  MOCK_MENU_VERSIONS_ADDIS,
  getLiveOrders,
  getLiveServiceRequests,
  saveMenuItem,
  duplicateMenuItem,
  archiveMenuItem,
  deleteMenuItem,
  bulkUpdateItems,
  saveCategory,
  updateRestaurantSettings,
  getScheduledMenus,
  saveScheduledMenu,
  getMenuVersions,
  createMenuVersion,
  restoreMenuVersion,
  getDishReviews,
  getOffers,
} from '@/lib/data-provider';
import { AdminSidebar, AdminSection } from '@/components/admin/AdminSidebar';
import { subscribeSync } from '@/lib/sync-channel';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { HomeDashboard } from '@/components/admin/HomeDashboard';
import { OnboardingWizardModal } from '@/components/admin/OnboardingWizardModal';
import { MenuManager } from '@/components/admin/MenuManager';
import { DesignStudio } from '@/components/admin/DesignStudio';
import { InsightsSection } from '@/components/admin/InsightsSection';
import { SettingsSection } from '@/components/admin/SettingsSection';
import { HelpModal } from '@/components/admin/HelpModal';
import { OffersManager } from '@/components/admin/OffersManager';
import { ReviewsManager } from '@/components/admin/ReviewsManager';
import { QRStudio } from '@/components/admin/QRStudio';
import { ProfileSection } from '@/components/admin/ProfileSection';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import {
  ShoppingBag,
  Bell,
  UtensilsCrossed,
  Settings,
  QrCode,
  LogOut,
  CheckCircle2,
  Clock,
  ExternalLink,
  Save,
  Check,
  Tag,
  Star,
  HelpCircle,
  Sparkles,
  AlertCircle,
  Eye,
  Sliders,
  ShieldCheck,
  Droplets,
  Utensils,
  Receipt,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Authentication & Session State
  const [session, setSession] = useState<AdminAuthSession | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Navigation & Role State
  const [activeSection, setActiveSection] = useState<AdminSection>('home');
  const [userRole, setUserRole] = useState<UserRole>('owner');

  // Core Data State
  const [restaurant, setRestaurant] = useState<Restaurant>(MOCK_RESTAURANT_ADDIS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_ITEMS_ADDIS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES_ADDIS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [reviews, setReviews] = useState<DishReview[]>(MOCK_REVIEWS_ADDIS);
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS_ADDIS);
  const [scheduledMenus, setScheduledMenus] = useState<ScheduledMenu[]>(MOCK_SCHEDULED_MENUS_ADDIS);
  const [menuVersions, setMenuVersions] = useState<MenuVersion[]>(MOCK_MENU_VERSIONS_ADDIS);

  // Modals & Floating Tools
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);

  // Requests sub-tab ('orders' | 'service')
  const [requestsTab, setRequestsTab] = useState<'orders' | 'service'>('orders');

  // Autosave status & Toast Notifications
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving'>('saved');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isTestRunner, setIsTestRunner] = useState(false);

  // Strict Authentication Check on Mount
  useEffect(() => {
    const active = getCurrentSession();
    if (!active) {
      router.replace('/admin/login');
      return;
    }
    setSession(active);
    setUserRole(active.role);
    if (active.role === 'staff') {
      if (
        activeSection !== 'menu' &&
        activeSection !== 'offers' &&
        activeSection !== 'reviews' &&
        activeSection !== 'profile'
      ) {
        setActiveSection('menu');
      }
    }
    if (typeof navigator !== 'undefined' && (navigator.userAgent.includes('Headless') || navigator.userAgent.includes('Playwright'))) {
      setIsTestRunner(true);
    }
    setIsAuthChecking(false);
    setIsHydrated(true);
  }, [router]);

  // Poll / fetch live data & listen to real-time events
  useEffect(() => {
    getLiveOrders(restaurant.id).then(setOrders);
    getLiveServiceRequests(restaurant.id).then(setServiceRequests);
    getDishReviews(restaurant.id).then(setReviews);
    getOffers(restaurant.id).then(setOffers);
    getScheduledMenus(restaurant.id).then(setScheduledMenus);
    getMenuVersions(restaurant.id).then(setMenuVersions);

    // Subscribe to cross-tab sync so reviews and menu updates reflect immediately
    const unsubscribe = subscribeSync((event) => {
      if (event.type === 'REVIEW_SUBMITTED') {
        setReviews((prev) => {
          if (prev.some((r) => r.id === event.review.id)) return prev;
          return [event.review, ...prev];
        });
        showToast(`New feedback received from Table ${event.review.table_number || 'Guest'}!`, 'info');
      } else if (event.type === 'ITEM_UPDATED') {
        setMenuItems((prev) =>
          prev.map((item) => (item.id === event.item.id ? { ...item, ...event.item } : item))
        );
      }
    });

    const interval = setInterval(() => {
      getLiveOrders(restaurant.id).then(setOrders);
      getLiveServiceRequests(restaurant.id).then(setServiceRequests);
      getDishReviews(restaurant.id).then(setReviews);
    }, 4000);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [restaurant.id]);

  // Sign Out Handler
  const handleSignOut = () => {
    triggerHaptic(10);
    clearAuthSession();
    router.replace('/admin/login');
  };

  // Role switching enforcement
  const handleRoleChange = (newRole: UserRole) => {
    triggerHaptic(10);
    setUserRole(newRole);

    if (newRole === 'staff') {
      if (
        activeSection === 'home' ||
        activeSection === 'design' ||
        activeSection === 'insights' ||
        activeSection === 'qr' ||
        activeSection === 'settings'
      ) {
        setActiveSection('menu');
      }
    }
    showToast(`Switched to ${newRole.toUpperCase()} console.`, 'info');
  };

  // Toast feedback helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Quick simulation of autosave indicator
  const triggerAutosave = () => {
    setAutosaveStatus('saving');
    setTimeout(() => setAutosaveStatus('saved'), 600);
  };

  // Item Mutations
  const handleSaveItem = async (itemData: Partial<MenuItem>): Promise<MenuItem> => {
    triggerAutosave();
    const saved = await saveMenuItem(itemData);
    setMenuItems((prev) => {
      const idx = prev.findIndex((i) => i.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    return saved;
  };

  const handleDuplicateItem = async (itemId: string) => {
    triggerAutosave();
    const dup = await duplicateMenuItem(itemId);
    if (dup) {
      setMenuItems((prev) => [dup, ...prev]);
    }
  };

  const handleArchiveItem = async (itemId: string, archived: boolean) => {
    triggerAutosave();
    await archiveMenuItem(itemId, archived);
    setMenuItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, is_archived: archived } : i))
    );
  };

  const handleDeleteItem = async (itemId: string) => {
    triggerAutosave();
    await deleteMenuItem(itemId);
    setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleBulkUpdate = async (itemIds: string[], updates: Partial<MenuItem>) => {
    triggerAutosave();
    await bulkUpdateItems(itemIds, updates);
    const targetSet = new Set(itemIds);
    setMenuItems((prev) =>
      prev.map((i) => (targetSet.has(i.id) ? { ...i, ...updates } : i))
    );
  };

  const handleReorderItems = (reordered: MenuItem[]) => {
    triggerAutosave();
    setMenuItems(reordered);
  };

  const handleSaveCategory = async (catData: Partial<Category>): Promise<Category> => {
    triggerAutosave();
    const saved = await saveCategory(catData);
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
    return saved;
  };

  // Restaurant Settings & Branding
  const handleSaveRestaurantSettings = async (updates: Partial<Restaurant>): Promise<Restaurant> => {
    triggerAutosave();
    const updated = await updateRestaurantSettings(restaurant.id, updates);
    setRestaurant(updated);
    return updated;
  };

  // Scheduled Menus & Versions
  const handleSaveScheduledMenu = async (menu: ScheduledMenu) => {
    triggerAutosave();
    await saveScheduledMenu(menu);
    setScheduledMenus((prev) => {
      const idx = prev.findIndex((m) => m.id === menu.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = menu;
        return copy;
      }
      return [...prev, menu];
    });
  };

  const handleCreateVersion = async (label: string) => {
    triggerAutosave();
    const ver = await createMenuVersion(restaurant.id, label);
    setMenuVersions((prev) => [ver, ...prev]);
  };

  const handleRestoreVersion = async (versionId: string) => {
    triggerAutosave();
    const restored = await restoreMenuVersion(versionId);
    setMenuItems(restored);
  };

  // Checklist Step Toggle
  const handleToggleChecklistStep = async (stepId: string) => {
    const currentList = restaurant.onboarding_checklist || [];
    const updatedList = currentList.map((s) =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    await handleSaveRestaurantSettings({ onboarding_checklist: updatedList });
    showToast('Checklist updated.', 'info');
  };

  // Onboarding Completed Handler
  const handleOnboardingComplete = async (data: {
    restaurantUpdates: Partial<Restaurant>;
    newCategory?: Partial<Category>;
    newDish?: Partial<MenuItem>;
  }) => {
    triggerHaptic(20);
    triggerAutosave();

    // 1. Save restaurant updates
    await handleSaveRestaurantSettings(data.restaurantUpdates);

    // 2. Add category if provided
    let createdCategory: Category | undefined;
    if (data.newCategory) {
      createdCategory = await handleSaveCategory(data.newCategory);
    }

    // 3. Add dish if provided
    if (data.newDish) {
      await handleSaveItem({
        ...data.newDish,
        category_id: createdCategory?.id || categories[0]?.id || 'cat-starters',
        image_url:
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      });
    }

    showToast('🎉 Setup complete! Your restaurant menu is live.', 'success');
  };

  // Order & Request status handlers
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    triggerHaptic(10);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    showToast(`Order status updated to "${status}".`, 'info');
  };

  const handleResolveRequest = (requestId: string) => {
    triggerHaptic(15);
    setServiceRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'completed' } : r))
    );
    showToast('Service call marked as resolved.', 'success');
  };

  // Badge Counts for Navigation
  const pendingRequestsCount = serviceRequests.filter((r) => r.status === 'pending').length;
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'preparing'
  ).length;
  const reviewsAttentionCount = reviews.filter(
    (r) => r.status === 'published' && !r.owner_reply && r.rating <= 3
  ).length;
  const activeOffersCount = offers.filter((o) => o.status === 'live' && !o.is_paused).length;

  // Onboarding progress
  const checklist = restaurant.onboarding_checklist || [];
  const onboardingCompletedCount = checklist.filter((s) => s.completed).length;

  // Secure Gate: If checking or unauthenticated, block view and show authentication redirect
  if (isAuthChecking || !session) {
    return (
      <div className="min-h-screen bg-[#0C0D11] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="text-sm font-bold text-white tracking-wide">
          Verifying Portal Permissions...
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Redirecting to authentication portal if unauthenticated.
        </p>
      </div>
    );
  }

  return (
    <div
      data-hydrated={isHydrated ? 'true' : undefined}
      className="min-h-screen bg-[#0C0D11] text-white flex flex-col md:flex-row selection:bg-amber-500 selection:text-black"
    >
      {/* DESKTOP LEFT SIDEBAR */}
      <AdminSidebar
        restaurant={restaurant}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        userRole={userRole}
        onRoleChange={handleRoleChange}
        session={session}
        onSignOut={handleSignOut}
        badgeCounts={{
          requests: pendingRequestsCount + activeOrdersCount,
          reviewsAttention: reviewsAttentionCount,
          activeOffers: activeOffersCount,
          totalDishes: menuItems.length,
        }}
        onboardingProgress={{
          completed: onboardingCompletedCount,
          total: checklist.length || 5,
        }}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* MAIN VIEWPORT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* TOP ADMIN HEADER BAR */}
        <header className="sticky top-0 z-30 border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between bg-[#0C0D11]/90 backdrop-blur-md">
          {/* Left: Mobile Title / Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-sm md:hidden"
              style={{ backgroundColor: restaurant.theme_config.primaryColor }}
            >
              {restaurant.logo_letter || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm md:text-base text-white truncate max-w-[140px] sm:max-w-none">
                  {restaurant.name}
                </h1>
                <span
                  data-testid="role-badge"
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    userRole === 'owner'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {userRole} Mode
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">/{restaurant.slug}</p>
            </div>
          </div>

          {/* Right: Autosave Status, Authenticated User Info, Sign Out & Customer View */}
          <div className="flex items-center gap-2.5">
            {/* Autosave Calm Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px]">
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  autosaveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                }`}
              />
              <span className="text-neutral-300 font-medium capitalize">{autosaveStatus}</span>
            </div>

            {/* Authenticated User Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300">
              <span className={`w-2 h-2 rounded-full ${userRole === 'owner' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className="text-neutral-400 font-medium">Logged in:</span>
              <span className="font-bold text-white truncate max-w-[140px]">{session?.name || (userRole === 'owner' ? 'Owner' : 'Staff')}</span>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              data-testid="admin-signout-btn"
              onClick={handleSignOut}
              className="h-8 px-3 rounded-full bg-white/5 hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors text-neutral-300 hover:text-rose-300 cursor-pointer"
              title="Sign out of administration console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>


            {/* Customer Live Menu Link */}
            <Link
              href={`/${restaurant.slug}?table=14`}
              target="_blank"
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10 text-neutral-200"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Customer Menu</span>
            </Link>

            {/* Help Button */}
            <button
              onClick={() => {
                triggerHaptic(10);
                setIsHelpOpen(true);
              }}
              data-testid="admin-help-button"
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
              title="Help & tips"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* FEEDBACK TOAST NOTIFICATION */}
        {toast && (
          <div
            data-testid="admin-toast"
            className={`pointer-events-none fixed top-16 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-3 ${
              toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : toast.type === 'info'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-emerald-600 text-white border-emerald-500'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{toast.message}</span>
          </div>
        )}

        {/* SECTION VIEW CONTAINER */}
        <main className="flex-1 px-4 md:px-8 py-6 pb-28 md:pb-8 max-w-7xl w-full mx-auto">
          {/* SECTION 1: HOME (Owner only) */}
          {activeSection === 'home' && userRole === 'owner' && (
            <HomeDashboard
              restaurant={restaurant}
              menuItems={menuItems}
              reviews={reviews}
              offers={offers}
              orders={orders}
              serviceRequests={serviceRequests}
              onNavigate={setActiveSection}
              onOpenAddDish={() => {
                setActiveSection('menu');
                setIsAddDishModalOpen(true);
              }}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onOpenBulkPrice={() => setActiveSection('menu')}
              onOpenHelp={() => setIsHelpOpen(true)}
              onToggleChecklistStep={handleToggleChecklistStep}
            />
          )}

          {/* SECTION 2: MENU & DISHES (Owner, Staff) */}
          {activeSection === 'menu' && (
            <MenuManager
              restaurant={restaurant}
              categories={categories}
              menuItems={menuItems}
              scheduledMenus={scheduledMenus}
              menuVersions={menuVersions}
              userRole={userRole}
              onSaveItem={handleSaveItem}
              onDuplicateItem={handleDuplicateItem}
              onArchiveItem={handleArchiveItem}
              onDeleteItem={handleDeleteItem}
              onBulkUpdate={handleBulkUpdate}
              onReorderItems={handleReorderItems}
              onSaveCategory={handleSaveCategory}
              onSaveScheduledMenu={handleSaveScheduledMenu}
              onCreateVersion={handleCreateVersion}
              onRestoreVersion={handleRestoreVersion}
              onShowToast={showToast}
              isAddModalOpenInitially={isAddDishModalOpen}
              onCloseAddModal={() => setIsAddDishModalOpen(false)}
            />
          )}

          {/* SECTION 3: OFFERS & DEALS (Owner, Staff pause/view) */}
          {activeSection === 'offers' && (
            <OffersManager
              restaurant={restaurant}
              categories={categories}
              menuItems={menuItems}
              userRole={userRole}
            />
          )}

          {/* SECTION 4: DISH REVIEWS (Owner, Staff replies) */}
          {activeSection === 'reviews' && (
            <ReviewsManager
              restaurant={restaurant}
              menuItems={menuItems}
              userRole={userRole}
            />
          )}

          {/* SECTION 5: KITCHEN & SERVICE REQUESTS (Owner, Staff) */}
          {activeSection === 'requests' && (
            <div className="flex flex-col gap-6 pb-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">Live Kitchen & Table Service</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Real-time queue for dining room service calls and kitchen order tickets.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#12141C] border border-white/5">
                  <button
                    onClick={() => setRequestsTab('orders')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      requestsTab === 'orders'
                        ? 'bg-amber-600 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Orders ({orders.length})</span>
                  </button>
                  <button
                    onClick={() => setRequestsTab('service')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      requestsTab === 'service'
                        ? 'bg-amber-600 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Service Calls ({pendingRequestsCount})</span>
                  </button>
                </div>
              </div>

              {/* ORDERS TAB */}
              {requestsTab === 'orders' && (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="p-16 text-center rounded-2xl bg-[#12141C] border border-white/5 text-neutral-500">
                      <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-semibold text-white">No active orders</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Table orders placed by diners will chime in real-time.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="p-5 rounded-2xl bg-[#12141C] border border-white/5 flex flex-col justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-extrabold text-sm">
                                {order.table_number}
                              </span>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  order.status === 'pending'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : order.status === 'preparing'
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : 'bg-emerald-500/20 text-emerald-300'
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>

                            <div className="space-y-2 divide-y divide-white/5">
                              {order.items.map((entry, idx) => (
                                <div
                                  key={idx}
                                  className="pt-2 first:pt-0 flex justify-between items-baseline text-xs"
                                >
                                  <div>
                                    <span className="font-bold text-white mr-1.5">
                                      {entry.quantity}x
                                    </span>
                                    <span className="text-neutral-200">{entry.name}</span>
                                    {entry.selected_options?.length > 0 && (
                                      <p className="text-[10px] text-neutral-400 mt-0.5">
                                        + {entry.selected_options.map((o) => o.name).join(', ')}
                                      </p>
                                    )}
                                    {entry.notes && (
                                      <p className="text-[10px] text-amber-300 italic mt-0.5">
                                        Note: "{entry.notes}"
                                      </p>
                                    )}
                                  </div>
                                  <span className="font-semibold text-neutral-300">
                                    {formatMoney(entry.line_total, restaurant.currency)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="pt-3 mt-3 border-t border-white/5 flex justify-between items-baseline text-sm">
                              <span className="text-neutral-400">Total:</span>
                              <span className="text-amber-400 font-extrabold font-mono">
                                {formatMoney(order.total, restaurant.currency)}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-white/5">
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                order.status === 'preparing'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white/5 hover:bg-white/10 text-neutral-300'
                              }`}
                            >
                              Preparing
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'served')}
                              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                order.status === 'served'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white/5 hover:bg-white/10 text-neutral-300'
                              }`}
                            >
                              Served
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SERVICE REQUESTS TAB */}
              {requestsTab === 'service' && (
                <div className="space-y-3">
                  {serviceRequests.length === 0 ? (
                    <div className="p-16 text-center rounded-2xl bg-[#12141C] border border-white/5 text-neutral-500">
                      <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-semibold text-white">No active service calls</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Diners requesting water, cutlery, or the bill will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {serviceRequests.map((req) => (
                        <div
                          key={req.id}
                          className="p-4 rounded-xl bg-[#12141C] border border-white/5 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                              {req.request_type === 'water' && <Droplets className="w-5 h-5 text-sky-400" />}
                              {req.request_type === 'cutlery' && <Utensils className="w-5 h-5 text-amber-400" />}
                              {req.request_type === 'bill' && <Receipt className="w-5 h-5 text-emerald-400" />}
                              {req.request_type === 'waiter' && <Bell className="w-5 h-5 text-rose-400" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-amber-300">
                                  {req.table_number}
                                </span>
                                <span className="text-xs text-neutral-200 font-semibold uppercase">
                                  {req.request_type} requested
                                </span>
                              </div>
                              <span className="text-[10px] text-neutral-400">
                                {new Date(req.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>

                          <div>
                            {req.status === 'completed' ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Resolved</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleResolveRequest(req.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Mark Done</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SECTION 6: DESIGN STUDIO (Owner only) */}
          {activeSection === 'design' && userRole === 'owner' && (
            <DesignStudio
              restaurant={restaurant}
              menuItems={menuItems}
              onSaveRestaurant={handleSaveRestaurantSettings}
              onShowToast={showToast}
            />
          )}

          {/* SECTION 7: INSIGHTS & MATRIX (Owner only) */}
          {activeSection === 'insights' && userRole === 'owner' && (
            <InsightsSection
              restaurant={restaurant}
              menuItems={menuItems}
              reviews={reviews}
              offers={offers}
            />
          )}

          {/* SECTION 8: QR STUDIO & TABLE STANDS (Owner only) */}
          {activeSection === 'qr' && userRole === 'owner' && (
            <QRStudio
              restaurant={restaurant}
              onShowToast={showToast}
            />
          )}

          {/* SECTION 9: SETTINGS & QR GENERATOR (Owner only) */}
          {activeSection === 'settings' && userRole === 'owner' && (
            <SettingsSection
              restaurant={restaurant}
              onSaveSettings={handleSaveRestaurantSettings}
              onShowToast={showToast}
            />
          )}

          {/* SECTION 10: PROFESSIONAL PROFILE (Owner & Staff) */}
          {activeSection === 'profile' && (
            <ProfileSection
              restaurant={restaurant}
              session={session}
              onUpdateSessionName={(newName, newIdentifier) => {
                if (session) {
                  setSession({
                    ...session,
                    name: newName,
                    identifier: newIdentifier,
                  });
                }
              }}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <AdminBottomNav
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        userRole={userRole}
        session={session}
        onSignOut={handleSignOut}
        badgeCounts={{
          requests: pendingRequestsCount + activeOrdersCount,
          reviewsAttention: reviewsAttentionCount,
          activeOffers: activeOffersCount,
        }}
      />

      {/* 5-MINUTE ONBOARDING WIZARD MODAL */}
      <OnboardingWizardModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        restaurant={restaurant}
        onComplete={handleOnboardingComplete}
      />

      {/* HELP & TIPS MODAL */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        activeSection={activeSection}
      />
    </div>
  );
}
