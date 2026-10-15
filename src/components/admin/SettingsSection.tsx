'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Restaurant, StaffAccount } from '@/types/database';
import { triggerHaptic } from '@/lib/utils';
import {
  Settings,
  QrCode,
  Wifi,
  Clock,
  Printer,
  ExternalLink,
  Save,
  FileDown,
  Trash2,
  ShieldCheck,
  Users,
  KeyRound,
  Plus,
  RefreshCw,
  Coins,
  Receipt,
  Check,
} from 'lucide-react';

interface SettingsSectionProps {
  restaurant: Restaurant;
  onSaveSettings: (updates: Partial<Restaurant>) => Promise<Restaurant>;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export function SettingsSection({
  restaurant,
  onSaveSettings,
  onShowToast,
}: SettingsSectionProps) {
  // Settings Form State
  const [selectedTable, setSelectedTable] = useState('Table 14');
  const [hours, setHours] = useState(restaurant.hours || 'Mon – Sun: 7:00 AM – 10:00 PM');
  const [address, setAddress] = useState(restaurant.address || 'Bole Road, Addis Ababa');
  const [taxRate, setTaxRate] = useState(
    restaurant.tax_rate ? (restaurant.tax_rate * 100).toString() : '15'
  );
  const [taxMode, setTaxMode] = useState<'inclusive' | 'exclusive'>(
    restaurant.tax_mode || 'inclusive'
  );
  const [currency, setCurrency] = useState(restaurant.currency || 'ETB');
  const [isOpen, setIsOpen] = useState(restaurant.is_open ?? true);
  const [soldOutReset, setSoldOutReset] = useState<'midnight' | 'morning_6am' | 'manual'>(
    restaurant.sold_out_reset_time || 'morning_6am'
  );

  const [wifiSsid, setWifiSsid] = useState(restaurant.wifi_config?.ssid || 'Addis-Guest');
  const [wifiPassword, setWifiPassword] = useState(restaurant.wifi_config?.password || '');

  // Staff Management State
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>([
    {
      id: 'staff-1',
      restaurant_id: restaurant.id,
      name: 'Tigist Haile',
      username: 'tigist',
      pin_code: '4821',
      role: 'staff',
      is_active: true,
    },
    {
      id: 'staff-2',
      restaurant_id: restaurant.id,
      name: 'Dawit Bekele',
      username: 'dawit',
      pin_code: '1974',
      role: 'staff',
      is_active: true,
    },
  ]);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffPin, setNewStaffPin] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(15);

    const parsedTax = parseFloat(taxRate);
    const updates: Partial<Restaurant> = {
      hours,
      address,
      tax_rate: isNaN(parsedTax) ? 0.15 : parsedTax / 100,
      tax_mode: taxMode,
      currency,
      is_open: isOpen,
      sold_out_reset_time: soldOutReset,
      wifi_config: {
        ssid: wifiSsid,
        password: wifiPassword,
      },
    };

    await onSaveSettings(updates);
    onShowToast('Restaurant settings and tax configuration saved.', 'success');
  };

  // Staff Actions
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffUsername.trim() || !newStaffPin.trim()) {
      onShowToast('Please fill all staff fields.', 'error');
      return;
    }
    if (newStaffPin.trim().length !== 4 || isNaN(Number(newStaffPin))) {
      onShowToast('PIN code must be exactly 4 digits.', 'error');
      return;
    }

    const newStaff: StaffAccount = {
      id: `staff-${Date.now()}`,
      restaurant_id: restaurant.id,
      name: newStaffName.trim(),
      username: newStaffUsername.trim().toLowerCase(),
      pin_code: newStaffPin.trim(),
      role: 'staff',
      is_active: true,
    };

    setStaffAccounts((prev) => [...prev, newStaff]);
    setNewStaffName('');
    setNewStaffUsername('');
    setNewStaffPin('');
    setIsAddingStaff(false);
    triggerHaptic(12);
    onShowToast(`Staff account created for ${newStaff.name} (PIN: ${newStaff.pin_code})`, 'success');
  };

  const handleResetPin = (staffId: string) => {
    triggerHaptic(12);
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setStaffAccounts((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, pin_code: randomPin } : s))
    );
    const staff = staffAccounts.find((s) => s.id === staffId);
    onShowToast(`New PIN for ${staff?.name}: ${randomPin}`, 'info');
  };

  const handleToggleStaffActive = (staffId: string) => {
    triggerHaptic(8);
    setStaffAccounts((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, is_active: !s.is_active } : s))
    );
  };

  // Tenant Data Export (JSON dump)
  const handleExportData = () => {
    triggerHaptic(10);
    const exportPayload = {
      restaurant,
      exportedAt: new Date().toISOString(),
      platform: 'Digital Menu Platform v1.0',
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${restaurant.slug}-tenant-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Restaurant tenant data exported successfully.', 'success');
  };

  // Guest Session & Historical Order Purge
  const handlePurgeGuestData = () => {
    triggerHaptic(20);
    if (
      typeof window !== 'undefined' &&
      window.confirm(
        'Are you sure you want to purge historical customer sessions and completed orders older than 30 days? This action cannot be undone.'
      )
    ) {
      onShowToast('Historical guest sessions and resolved logs purged.', 'info');
    }
  };

  const qrUrl = `/${restaurant.slug}?table=${encodeURIComponent(selectedTable.replace('Table ', ''))}`;

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-white">Settings & Operations</h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-neutral-300">
            Owner Console
          </span>
        </div>
        <p className="text-xs text-neutral-400 mt-0.5">
          Configure tax calculation mode, default currency (ETB), staff credentials & 4-digit PINs, and table QR stands.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: TABLE QR GENERATOR & PRINT STAND (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="p-6 rounded-2xl bg-[#12141C] border border-white/5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Table QR Stand Generator</h3>
              </div>
              <span className="text-xs font-mono text-neutral-400">Instant Vector</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Select Dining Table
              </label>
              <select
                value={selectedTable}
                onChange={(e) => {
                  triggerHaptic(8);
                  setSelectedTable(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 font-bold"
              >
                {Array.from({ length: 30 }).map((_, i) => (
                  <option key={i + 1} value={`Table ${i + 1}`} className="bg-[#12141C]">
                    Table {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Printable Table Card Preview */}
            <div className="p-6 rounded-2xl bg-white text-black shadow-xl flex flex-col items-center text-center">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base mb-2 shadow-sm"
                style={{ backgroundColor: restaurant.theme_config.primaryColor || '#E8590C' }}
              >
                {restaurant.logo_letter || 'A'}
              </div>
              <h4 className="font-extrabold text-sm text-neutral-900">{restaurant.name}</h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">Scan to view menu & order</p>

              {/* QR Visual */}
              <div className="my-4 p-3 bg-neutral-100 rounded-2xl border border-neutral-200">
                <div className="w-40 h-40 bg-neutral-900 rounded-xl flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-white" />
                </div>
              </div>

              <div className="px-4 py-1.5 rounded-full bg-neutral-100 font-mono text-xs font-bold text-neutral-800">
                {selectedTable} • /{restaurant.slug}
              </div>

              {wifiSsid && (
                <div className="mt-3 text-[10px] text-neutral-500 flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-neutral-400" />
                  <span>Wi-Fi: {wifiSsid} {wifiPassword ? `• Pass: ${wifiPassword}` : ''}</span>
                </div>
              )}
            </div>

            {/* Print / Test Links */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-white/5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Stand Card</span>
              </button>

              <Link
                href={qrUrl}
                target="_blank"
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Link</span>
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: OPERATIONS, TAX MODE, CURRENCY & STAFF (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#12141C] border border-white/5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <span>Pricing, Tax & Store Hours</span>
              </h3>
              <button
                type="submit"
                data-testid="save-settings-btn"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Settings</span>
              </button>
            </div>

            {/* TAX MODE TOGGLE (Owner Decision) */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tax Calculation Mode</span>
                  </label>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Decide whether prices shown on the menu already include tax, or if tax should be added at checkout.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setTaxMode('inclusive');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    taxMode === 'inclusive'
                      ? 'border-amber-500 bg-amber-500/10 shadow-xs'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Tax-Inclusive (Recommended)</span>
                    {taxMode === 'inclusive' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Standard in Ethiopian dining. Menu price is the exact amount paid. Zero additional tax added.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setTaxMode('exclusive');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    taxMode === 'exclusive'
                      ? 'border-amber-500 bg-amber-500/10 shadow-xs'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Tax-Exclusive (Added on top)</span>
                    {taxMode === 'exclusive' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Adds VAT/tax percentage on top of customer subtotal before showing total to waiter.
                  </p>
                </button>
              </div>
            </div>

            {/* CURRENCY & TAX RATE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Currency</span>
                </label>
                <select
                  value={currency}
                  onChange={(e) => {
                    triggerHaptic(8);
                    setCurrency(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="ETB" className="bg-[#12141C]">ETB (Br • Ethiopian Birr - Default)</option>
                  <option value="USD" className="bg-[#12141C]">USD ($ • US Dollar)</option>
                  <option value="EUR" className="bg-[#12141C]">EUR (€ • Euro)</option>
                  <option value="GBP" className="bg-[#12141C]">GBP (£ • British Pound)</option>
                  <option value="KES" className="bg-[#12141C]">KES (KSh • Kenyan Shilling)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Tax Rate (%) {taxMode === 'inclusive' ? '(Included in menu prices)' : '(Added on top)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="15.0"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Open / Closed Toggle */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Accepting Customer Orders</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Toggle off in emergencies to temporarily pause new table orders.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setIsOpen(!isOpen);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  isOpen
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {isOpen ? 'Open for Orders' : 'Paused / Closed'}
              </button>
            </div>

            {/* Sold-out Auto Reset Schedule */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Sold-Out Auto Reset Schedule
              </label>
              <div className="grid grid-cols-3 gap-2.5 mt-1.5">
                {[
                  { id: 'morning_6am', label: '6:00 AM' },
                  { id: 'midnight', label: 'Midnight' },
                  { id: 'manual', label: 'Manual' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSoldOutReset(opt.id as any)}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      soldOutReset === opt.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-white/5 bg-white/[0.02] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Operating Hours & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Display Operating Hours
                </label>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="Mon – Sun: 7:00 AM – 10:00 PM"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Bole Road, Addis Ababa"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Wi-Fi Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Wi-Fi Network (SSID)
                </label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="Addis-Guest"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Wi-Fi Password
                </label>
                <input
                  type="text"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="Optional password"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </form>

          {/* STAFF ACCOUNTS & PIN CREDENTIALS (Owner Management) */}
          <div className="p-6 rounded-2xl bg-[#12141C] border border-white/5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Staff Accounts & 4-Digit PINs</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Staff can only toggle Sold-Out status and view reviews. Owner provisions credentials directly.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  setIsAddingStaff(!isAddingStaff);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-500/30 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingStaff ? 'Cancel' : 'Add Staff'}</span>
              </button>
            </div>

            {/* Add Staff Inline Form */}
            {isAddingStaff && (
              <form
                onSubmit={handleAddStaff}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3 animate-in fade-in"
              >
                <div className="text-xs font-bold text-amber-300">Create Staff Credentials</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="Staff Full Name (e.g. Selam)"
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="text"
                    value={newStaffUsername}
                    onChange={(e) => setNewStaffUsername(e.target.value)}
                    placeholder="Username or Phone"
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="password"
                    maxLength={4}
                    value={newStaffPin}
                    onChange={(e) => setNewStaffPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="4-digit PIN (e.g. 1234)"
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono tracking-widest text-center focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    Save Staff Member
                  </button>
                </div>
              </form>
            )}

            {/* Staff List */}
            <div className="flex flex-col gap-2">
              {staffAccounts.map((staff) => (
                <div
                  key={staff.id}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{staff.name}</span>
                        <span className="text-[10px] font-normal text-neutral-400">
                          (@{staff.username})
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>PIN: **** (Set)</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${staff.is_active ? 'bg-emerald-500' : 'bg-neutral-600'}`} />
                        <span>{staff.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleResetPin(staff.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-[11px] font-semibold flex items-center gap-1 border border-white/10 transition-colors cursor-pointer"
                      title="1-tap PIN reset"
                    >
                      <RefreshCw className="w-3 h-3 text-amber-400" />
                      <span>Reset PIN</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStaffActive(staff.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                        staff.is_active
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                      }`}
                    >
                      {staff.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRIVACY & DATA COMPLIANCE SECTION */}
          <div className="p-6 rounded-2xl bg-[#12141C] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Data Privacy & Tenant Ownership</span>
                </h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  GDPR / CCPA data export, cookieless telemetry, and historical guest session purge.
                </p>
              </div>
              <Link
                href={`/${restaurant.slug}/privacy`}
                target="_blank"
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <span>Preview Notice</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                data-testid="export-tenant-data-btn"
                onClick={handleExportData}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-semibold flex items-center gap-2 border border-white/10 transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-400" />
                <span>Export Restaurant Data (JSON)</span>
              </button>

              <button
                type="button"
                data-testid="purge-guest-data-btn"
                onClick={handlePurgeGuestData}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2 border border-rose-500/20 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Purge Guest Logs (&gt;30d)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
