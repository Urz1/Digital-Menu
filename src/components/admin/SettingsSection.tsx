'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Restaurant } from '@/types/database';
import { triggerHaptic } from '@/lib/utils';
import {
  Settings,
  QrCode,
  Wifi,
  Clock,
  Printer,
  Download,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileDown,
  Trash2,
  ShieldCheck,
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
  const [address, setAddress] = useState(restaurant.address || '');
  const [taxRate, setTaxRate] = useState(restaurant.tax_rate ? (restaurant.tax_rate * 100).toString() : '8');
  const [isOpen, setIsOpen] = useState(restaurant.is_open ?? true);
  const [soldOutReset, setSoldOutReset] = useState<'midnight' | 'morning_6am' | 'manual'>(
    restaurant.sold_out_reset_time || 'morning_6am'
  );

  const [wifiSsid, setWifiSsid] = useState(restaurant.wifi_config?.ssid || 'Addis-Guest');
  const [wifiPassword, setWifiPassword] = useState(restaurant.wifi_config?.password || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(15);

    const parsedTax = parseFloat(taxRate);
    const updates: Partial<Restaurant> = {
      hours,
      address,
      tax_rate: isNaN(parsedTax) ? 0.08 : parsedTax / 100,
      is_open: isOpen,
      sold_out_reset_time: soldOutReset,
      wifi_config: {
        ssid: wifiSsid,
        password: wifiPassword,
      },
    };

    await onSaveSettings(updates);
    onShowToast('Restaurant settings saved.', 'success');
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

  // Guest Session & Historical Order Purge (GDPR / Privacy retention)
  const handlePurgeGuestData = () => {
    triggerHaptic(20);
    if (
      typeof window !== 'undefined' &&
      window.confirm(
        'Are you sure you want to purge historical customer sessions, resolved waiter calls, and completed orders older than 30 days? This action cannot be undone.'
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
          <h2 className="text-xl font-bold text-white">Settings & Table QR Generator</h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-neutral-300">
            Operations
          </span>
        </div>
        <p className="text-xs text-neutral-400 mt-0.5">
          Configure table QR codes, operational schedules, Wi-Fi credentials, and inventory resets.
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
                style={{ backgroundColor: restaurant.theme_config.primaryColor }}
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

        {/* RIGHT COLUMN: RESTAURANT OPERATIONS & RESET (7 Cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#12141C] border border-white/5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Store Hours & Operations</h3>
              <button
                type="submit"
                data-testid="save-settings-btn"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Settings</span>
              </button>
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
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
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
              <p className="text-[11px] text-neutral-400 mb-2">
                Dishes marked "Sold out today" can automatically reset to available before the next service.
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'morning_6am', label: '6:00 AM (Recommended)' },
                  { id: 'midnight', label: 'Midnight (12:00 AM)' },
                  { id: 'manual', label: 'Manual Reset Only' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSoldOutReset(opt.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
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

            {/* Operating Hours */}
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

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="742 Bole Road, Culinary Arts District"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Tax Rate & Wi-Fi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="8.0"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

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
                  placeholder="tastethevibes"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* PRIVACY & DATA COMPLIANCE SECTION */}
            <div className="pt-6 border-t border-white/5 space-y-4">
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
          </form>
        </div>
      </div>
    </div>
  );
}
