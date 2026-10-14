'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Restaurant, MenuItem, Order, ServiceRequest } from '@/types/database';
import { MOCK_RESTAURANT_ADDIS, MOCK_ITEMS_ADDIS, getLiveOrders, getLiveServiceRequests } from '@/lib/data-provider';
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
  Flame, 
  AlertCircle,
  ExternalLink,
  Save,
  Check
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'requests' | 'menu' | 'branding' | 'qrcodes'>('orders');
  const [restaurant, setRestaurant] = useState<Restaurant>(MOCK_RESTAURANT_ADDIS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_ITEMS_ADDIS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [selectedQrTable, setSelectedQrTable] = useState('Table 14');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Poll / fetch live data
  useEffect(() => {
    getLiveOrders(restaurant.id).then(setOrders);
    getLiveServiceRequests(restaurant.id).then(setServiceRequests);

    const interval = setInterval(() => {
      getLiveOrders(restaurant.id).then(setOrders);
      getLiveServiceRequests(restaurant.id).then(setServiceRequests);
    }, 4000);

    return () => clearInterval(interval);
  }, [restaurant.id]);

  // Toggle item availability (sold-out)
  const handleToggleAvailability = (itemId: string) => {
    triggerHaptic(15);
    setMenuItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, is_available: !i.is_available } : i))
    );
  };

  // Toggle chef's pick
  const handleToggleChefsPick = (itemId: string) => {
    triggerHaptic(15);
    setMenuItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, is_chefs_pick: !i.is_chefs_pick } : i))
    );
  };

  // Update order status
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    triggerHaptic(10);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  // Resolve service request
  const handleResolveRequest = (requestId: string) => {
    triggerHaptic(15);
    setServiceRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'completed' } : r))
    );
  };

  // Save branding changes
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(20);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const pendingRequestsCount = serviceRequests.filter((r) => r.status === 'pending').length;
  const activeOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length;

  return (
    <div className="min-h-screen bg-[#0C0D11] text-white flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Admin Bar */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
            style={{ backgroundColor: restaurant.theme_config.primaryColor }}
          >
            {restaurant.logo_letter}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-white">{restaurant.name}</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Staff Console
              </span>
            </div>
            <p className="text-xs text-neutral-400">Slug: /{restaurant.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${restaurant.slug}?table=14`}
            target="_blank"
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <span>Customer View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/admin/login"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-neutral-400 hover:text-white"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto px-6 py-6 flex-1 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'bg-amber-600 text-white shadow-lg shadow-orange-950/40'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders Queue</span>
            {activeOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-extrabold">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'requests'
                ? 'bg-amber-600 text-white shadow-lg shadow-orange-950/40'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Service Calls</span>
            {pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'menu'
                ? 'bg-amber-600 text-white shadow-lg shadow-orange-950/40'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Menu & Availability</span>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'branding'
                ? 'bg-amber-600 text-white shadow-lg shadow-orange-950/40'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Brand & Tokens</span>
          </button>

          <button
            onClick={() => setActiveTab('qrcodes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'qrcodes'
                ? 'bg-amber-600 text-white shadow-lg shadow-orange-950/40'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Table QR Generator</span>
          </button>
        </div>

        {/* -------------------------------------------------------------------
            TAB 1: ORDERS QUEUE
            ------------------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Incoming Dine-In Orders</h2>
              <span className="text-xs text-neutral-400">Auto-refreshing in real-time</span>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/10 text-neutral-500">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">No active orders right now</p>
                <p className="text-xs mt-1">Orders placed by customers will appear here instantly</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-sm">
                          {order.table_number}
                        </span>
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          order.status === 'pending'
                            ? 'bg-rose-500/20 text-rose-300'
                            : order.status === 'preparing'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 my-3 divide-y divide-white/5">
                        {order.items.map((entry, idx) => (
                          <div key={idx} className="pt-2 first:pt-0 flex justify-between items-baseline text-xs">
                            <div>
                              <span className="font-bold text-white mr-1.5">{entry.quantity}x</span>
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

                      <div className="pt-2 border-t border-white/10 flex justify-between items-baseline font-bold text-sm">
                        <span className="text-neutral-400">Total:</span>
                        <span className="text-amber-400 text-base">
                          {formatMoney(order.total, restaurant.currency)}
                        </span>
                      </div>
                    </div>

                    {/* Status actions */}
                    <div className="flex gap-2 pt-2 border-t border-white/10">
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
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 2: SERVICE CALLS
            ------------------------------------------------------------------- */}
        {activeTab === 'requests' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Live Table Assistance Calls</h2>
              <span className="text-xs text-neutral-400">Streamed from customer phones</span>
            </div>

            {serviceRequests.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/10 text-neutral-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">No active service calls</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {serviceRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                        {req.request_type === 'water' && '💧'}
                        {req.request_type === 'cutlery' && '🍽️'}
                        {req.request_type === 'bill' && '💳'}
                        {req.request_type === 'waiter' && '🛎️'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-amber-300">{req.table_number}</span>
                          <span className="text-xs text-neutral-300 font-semibold uppercase">
                            {req.request_type} requested
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500">
                          {new Date(req.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div>
                      {req.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Handled</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleResolveRequest(req.id)}
                          className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 3: MENU AVAILABILITY (INSTANT SOLD OUT / CHEF'S PICK)
            ------------------------------------------------------------------- */}
        {activeTab === 'menu' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Quick Availability & Pricing Toggles</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Toggling "Available" or "Chef's Pick" broadcasts immediately to customer devices.
                </p>
              </div>
              <span className="text-xs text-neutral-400">{menuItems.length} Dishes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    item.is_available
                      ? 'bg-white/[0.04] border-white/10'
                      : 'bg-red-500/[0.03] border-red-500/20 opacity-70'
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-white truncate">{item.name}</h4>
                      <span className="text-xs font-extrabold text-amber-400">
                        {formatMoney(item.price, restaurant.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Quick Toggles */}
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/10">
                    <button
                      onClick={() => handleToggleAvailability(item.id)}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-colors ${
                        item.is_available
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {item.is_available ? 'Available' : 'Sold Out'}
                    </button>

                    <button
                      onClick={() => handleToggleChefsPick(item.id)}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-colors ${
                        item.is_chefs_pick
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      ⭐ {item.is_chefs_pick ? "Chef's Pick" : 'Standard'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 4: RESTAURANT BRANDING & DESIGN TOKENS
            ------------------------------------------------------------------- */}
        {activeTab === 'branding' && (
          <form onSubmit={handleSaveBranding} className="max-w-2xl flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-bold">Restaurant Branding & Design Tokens</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Saved per-tenant in Supabase. Customizes branding without needing code deployments.
              </p>
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Branding tokens saved successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={restaurant.name}
                  onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={restaurant.tagline}
                  onChange={(e) => setRestaurant({ ...restaurant, tagline: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Primary Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={restaurant.theme_config.primaryColor}
                    onChange={(e) =>
                      setRestaurant({
                        ...restaurant,
                        theme_config: { ...restaurant.theme_config, primaryColor: e.target.value },
                      })
                    }
                    className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={restaurant.theme_config.primaryColor}
                    onChange={(e) =>
                      setRestaurant({
                        ...restaurant,
                        theme_config: { ...restaurant.theme_config, primaryColor: e.target.value },
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Currency Symbol & Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={restaurant.currency}
                    onChange={(e) => setRestaurant({ ...restaurant, currency: e.target.value })}
                    className="w-20 h-10 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white text-center font-bold"
                  />
                  <input
                    type="text"
                    value={restaurant.currency_code}
                    onChange={(e) => setRestaurant({ ...restaurant, currency_code: e.target.value })}
                    className="flex-1 h-10 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Guest WiFi SSID
                </label>
                <input
                  type="text"
                  value={restaurant.wifi_config.ssid}
                  onChange={(e) =>
                    setRestaurant({
                      ...restaurant,
                      wifi_config: { ...restaurant.wifi_config, ssid: e.target.value },
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  WiFi Password
                </label>
                <input
                  type="text"
                  value={restaurant.wifi_config.password || ''}
                  onChange={(e) =>
                    setRestaurant({
                      ...restaurant,
                      wifi_config: { ...restaurant.wifi_config, password: e.target.value },
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Announcement Banner
              </label>
              <input
                type="text"
                value={restaurant.announcement || ''}
                onChange={(e) => setRestaurant({ ...restaurant, announcement: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto self-start px-6 h-11 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40"
            >
              <Save className="w-4 h-4" />
              <span>Save Restaurant Tokens</span>
            </button>
          </form>
        )}

        {/* -------------------------------------------------------------------
            TAB 5: TABLE QR CODE GENERATOR & PRINT PACK
            ------------------------------------------------------------------- */}
        {activeTab === 'qrcodes' && (
          <div className="max-w-2xl flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-bold">Printable Table QR Generator</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Generate high-resolution QR codes encoded with table numbers for physical placement.
              </p>
            </div>

            <div className="flex gap-2 items-center">
              <label className="text-xs text-neutral-400 font-semibold">Select Table:</label>
              <select
                value={selectedQrTable}
                onChange={(e) => setSelectedQrTable(e.target.value)}
                className="h-10 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white outline-none cursor-pointer"
              >
                <option value="Table 1">Table 1</option>
                <option value="Table 2">Table 2</option>
                <option value="Table 3">Table 3</option>
                <option value="Table 4">Table 4</option>
                <option value="Table 5">Table 5</option>
                <option value="Table 14">Table 14 (Default Demo)</option>
                <option value="Bar-1">Bar Stool 1</option>
                <option value="Patio-1">Patio 1</option>
              </select>
            </div>

            {/* QR Preview Card */}
            <div className="p-8 rounded-3xl bg-white text-black flex flex-col items-center max-w-sm text-center shadow-2xl mx-auto sm:mx-0">
              <span className="text-xs uppercase tracking-widest font-black text-neutral-500 mb-1">
                {restaurant.name}
              </span>
              <h3 className="text-2xl font-black mb-3">{selectedQrTable}</h3>

              <div className="p-4 bg-white border-2 border-neutral-200 rounded-2xl mb-4">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://menu.example.com/${restaurant.slug}?table=${encodeURIComponent(selectedQrTable)}&color=000000&bgcolor=ffffff`}
                  alt="Table QR"
                  width={220}
                  height={220}
                  className="w-48 h-48 block"
                  unoptimized
                />
              </div>

              <p className="text-xs font-semibold text-neutral-600">
                Scan with phone camera to browse & order
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
