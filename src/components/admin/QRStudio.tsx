'use client';

import React, { useState, useEffect } from 'react';
import { Restaurant } from '@/types/database';
import { triggerHaptic } from '@/lib/utils';
import { generateQrSvgDataUri, generateQrPngDataUrl } from '@/lib/qr-code';
import {
  Printer,
  Download,
  Copy,
  Check,
  Wifi,
  ExternalLink,
  Layers,
  FileText,
  Smartphone,
  Info,
} from 'lucide-react';

interface QRStudioProps {
  restaurant: Restaurant;
  onSaveRestaurant?: (updates: Partial<Restaurant>) => Promise<Restaurant> | void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export type QRTemplateType = 'tent' | 'a4' | 'sticker';

export function QRStudio({ restaurant, onSaveRestaurant, onShowToast }: QRStudioProps) {
  // Template Type
  const [templateType, setTemplateType] = useState<QRTemplateType>('tent');

  // Customization Options
  const [qrColor, setQrColor] = useState<string>('#111827');
  const [includeWifi, setIncludeWifi] = useState<boolean>(true);
  const [wifiSsid, setWifiSsid] = useState<string>(restaurant.wifi_config?.ssid || 'Addis-Guest');
  const [wifiPassword, setWifiPassword] = useState<string>(restaurant.wifi_config?.password || '');
  const [isSavingWifi, setIsSavingWifi] = useState<boolean>(false);
  const [wifiSaved, setWifiSaved] = useState<boolean>(false);
  const [callToAction, setCallToAction] = useState<string>(
    'Scan to browse our seasonal menu, call waiter, & order directly from your phone'
  );

  // Keep Wi-Fi fields synced with restaurant updates
  useEffect(() => {
    if (restaurant.wifi_config) {
      setWifiSsid(restaurant.wifi_config.ssid || '');
      setWifiPassword(restaurant.wifi_config.password || '');
    }
  }, [restaurant.wifi_config?.ssid, restaurant.wifi_config?.password]);

  const handleSaveWifi = async () => {
    triggerHaptic(10);
    setIsSavingWifi(true);
    try {
      if (onSaveRestaurant) {
        await onSaveRestaurant({
          wifi_config: {
            ssid: wifiSsid.trim(),
            password: wifiPassword.trim(),
          },
        });
      }
      setWifiSaved(true);
      setTimeout(() => setWifiSaved(false), 2500);
      onShowToast('Guest Wi-Fi network and password saved!', 'success');
    } catch {
      onShowToast('Failed to save Wi-Fi settings', 'error');
    } finally {
      setIsSavingWifi(false);
    }
  };

  // Copy state
  const [copiedLink, setCopiedLink] = useState(false);

  // Menu URL: Clean global URL without table numbers
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://digitalmenu.app';
  const slugPrefix = restaurant.slug === 'addis' ? '' : `/${restaurant.slug}`;
  const menuUrl = `${baseUrl}${slugPrefix || '/'}`;

  // Instant local vector SVG QR code (zero external API, 100% offline & reliable)
  const qrSvgUri = generateQrSvgDataUri(menuUrl, {
    color: qrColor,
    bgColor: '#FFFFFF',
    margin: 1,
  });

  // Copy direct link
  const handleCopyLink = async () => {
    triggerHaptic(10);
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopiedLink(true);
      onShowToast('Menu link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      onShowToast(menuUrl, 'info');
    }
  };

  // Print trigger
  const handlePrint = () => {
    triggerHaptic(15);
    window.print();
  };

  // Download SVG Vector
  const handleDownloadSvg = () => {
    triggerHaptic(10);
    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="400" height="480">
  <rect width="400" height="480" fill="#ffffff" rx="16"/>
  <text x="200" y="44" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="bold" fill="#111827" text-anchor="middle">${restaurant.name}</text>
  <text x="200" y="68" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#6B7280" text-anchor="middle">Digital Menu</text>
  <image href="${qrSvgUri}" x="70" y="90" width="260" height="260"/>
  <text x="200" y="380" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#4B5563" text-anchor="middle">${callToAction.slice(0, 50)}...</text>
  <text x="200" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="bold" fill="#9CA3AF" text-anchor="middle">WiFi: ${wifiSsid || 'Guest'} • Pass: ${wifiPassword || 'none'}</text>
</svg>`.trim();

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${restaurant.slug}-menu-qr.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('SVG downloaded successfully!', 'success');
  };

  // Download PNG using local generator & Canvas
  const handleDownloadPng = async () => {
    triggerHaptic(10);
    try {
      const qrDataUrl = await generateQrPngDataUrl(menuUrl, {
        width: 400,
        margin: 1,
        color: { dark: qrColor, light: '#ffffff' },
      });

      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 750;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header Restaurant Name
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(restaurant.name, 300, 70);

      // Subtitle
      ctx.fillStyle = '#6B7280';
      ctx.font = '18px sans-serif';
      ctx.fillText('Digital Menu', 300, 105);

      // QR Image
      const img = new window.Image();
      img.onload = () => {
        ctx.drawImage(img, 100, 140, 400, 400);

        // Call to action
        ctx.fillStyle = '#374151';
        ctx.font = '16px sans-serif';
        ctx.fillText('Scan to view menu & place orders', 300, 580);

        // Wi-Fi info
        if (includeWifi && wifiSsid) {
          ctx.fillStyle = '#9CA3AF';
          ctx.font = '14px monospace';
          ctx.fillText(`WiFi: ${wifiSsid} | Pass: ${wifiPassword || 'none'}`, 300, 630);
        }

        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${restaurant.slug}-menu-qr.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        onShowToast('PNG downloaded successfully!', 'success');
      };
      img.src = qrDataUrl;
    } catch (err) {
      console.error('Failed to generate PNG:', err);
      onShowToast('Failed to generate PNG', 'error');
    }
  };

  // 8 uniform cards for printable A4 sheet
  const sheetCards = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-6 pb-20 print:p-0 print:pb-0" data-testid="qr-studio-container">
      <div className="screen-only-admin flex flex-col gap-6">
        {/* 1. Header & Quick Actions (Hidden during print) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">QR Studio & Menu Stands</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Print Ready
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
              Generate high-contrast, branded QR codes for table tents, stickers, and printable A4 sheets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              data-testid="qr-copy-link-btn"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy URL'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              data-testid="qr-print-btn"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Stand / PDF</span>
            </button>
          </div>
        </div>

        {/* 2. Controls & Live Preview Grid (Hidden in print) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
          {/* Left Column: Configuration Controls (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Target: Direct Menu Destination */}
            <div className="p-4 rounded-2xl bg-[#12141C] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  1. Menu Destination
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Universal Link
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-neutral-300 truncate" title={menuUrl}>
                  {menuUrl}
                </span>
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors flex-shrink-0"
                  title="Open live menu"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-[11px] text-neutral-400">
                Universal digital menu QR code. Customers can scan from any table or counter to view your full menu.
              </p>
            </div>

            {/* Template Format Selection */}
            <div className="p-4 rounded-2xl bg-[#12141C] border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                2. Print Template Format
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    setTemplateType('tent');
                  }}
                  data-testid="template-tent-btn"
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    templateType === 'tent'
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-bold">Table Tent</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    setTemplateType('a4');
                  }}
                  data-testid="template-a4-btn"
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    templateType === 'a4'
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-bold">A4 Sheet (8)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    setTemplateType('sticker');
                  }}
                  data-testid="template-sticker-btn"
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    templateType === 'sticker'
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-bold">Sticker</span>
                </button>
              </div>
            </div>

            {/* Custom Options */}
            <div className="p-4 rounded-2xl bg-[#12141C] border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                3. Visual Styling & Wi-Fi
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Call to Action Text
                  </label>
                  <input
                    type="text"
                    value={callToAction}
                    onChange={(e) => setCallToAction(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="text-xs font-medium text-neutral-300 cursor-pointer flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-neutral-400" />
                    <span>Show Guest Wi-Fi details</span>
                  </label>
                  <input
                    type="checkbox"
                    checked={includeWifi}
                    onChange={(e) => setIncludeWifi(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                {includeWifi && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2.5 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                        Guest Wi-Fi Network Name (SSID)
                      </label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="e.g. Addis-Guest"
                        className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                        Guest Wi-Fi Password
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          placeholder="e.g. tastethevibes (or leave blank if open)"
                          className="flex-1 px-3 py-1.5 bg-black/40 border border-white/15 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleSaveWifi}
                          disabled={isSavingWifi}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 font-bold text-xs flex items-center gap-1 transition-transform flex-shrink-0"
                        >
                          {wifiSaved ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-neutral-950" />
                              <span>Saved</span>
                            </>
                          ) : (
                            <span>{isSavingWifi ? 'Saving...' : 'Save Wi-Fi'}</span>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        Custom Wi-Fi prints directly onto table cards & updates the dining menu header.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    QR Pattern Tint
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { name: 'Crisp Dark', color: '#111827' },
                      { name: 'Warm Charcoal', color: '#1F2937' },
                      { name: 'Deep Amber', color: '#78350F' },
                      { name: 'Forest Green', color: '#064E3B' },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setQrColor(preset.color)}
                        className={`w-7 h-7 rounded-lg border transition-all ${
                          qrColor === preset.color
                            ? 'border-amber-500 scale-110 shadow-sm'
                            : 'border-white/20'
                        }`}
                        style={{ backgroundColor: preset.color }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  data-testid="qr-download-svg"
                  className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>SVG Vector</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  data-testid="qr-download-png"
                  className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG Image</span>
                </button>
              </div>
            </div>

            {/* 4. Scanning Reliability Advice */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>Reliable Scanning Advice for Owners</span>
              </div>
              <ul className="space-y-1 text-[11px] text-amber-200/90 list-disc pl-4">
                <li>
                  <strong>Local Vector Engine:</strong> Your QR codes are generated directly in-browser. Zero third-party API dependencies, completely offline-safe.
                </li>
                <li>
                  <strong>Minimum Size:</strong> Print at least <strong>2.5 cm (1 in)</strong> for stickers and <strong>4–5 cm (1.8 in)</strong> for table stands.
                </li>
                <li>
                  <strong>Contrast:</strong> Always keep the QR code dark on a pure white background.
                </li>
                <li>
                  <strong>Matte Finish:</strong> Use matte or satin paper. Glossy lamination reflects overhead dining lights, making camera scanning slower.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Live Interactive Card Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#08090C] border border-white/5 min-h-[500px]">
            <div className="text-center mb-4">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                {templateType === 'tent' && 'Foldable Stand Preview'}
                {templateType === 'a4' && 'Printable A4 Sheet (8 Menu Cards)'}
                {templateType === 'sticker' && 'Compact Menu Sticker Preview'}
              </span>
            </div>

            {/* TEMPLATE 1: STAND / TENT */}
            {templateType === 'tent' && (
              <div
                data-testid="preview-tent-card"
                className="w-full max-w-sm bg-white text-black rounded-2xl p-6 shadow-2xl border border-neutral-200 flex flex-col items-center text-center transition-all"
              >
                {/* Restaurant Header */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-md mb-2"
                  style={{ backgroundColor: restaurant.theme_config.primaryColor || '#E8590C' }}
                >
                  {restaurant.logo_letter || 'A'}
                </div>
                <h3 className="font-extrabold text-lg text-neutral-900">{restaurant.name}</h3>
                <p className="text-xs text-neutral-500 font-medium">{restaurant.tagline}</p>

                {/* Digital Menu Pill */}
                <div className="my-3 px-4 py-1 rounded-full bg-neutral-900 text-white font-mono text-xs font-bold shadow-sm">
                  Digital Menu
                </div>

                {/* QR Pattern with High Contrast Border */}
                <div className="p-3 bg-white rounded-xl border-2 border-neutral-900 my-2 shadow-inner">
                  {/* eslint-disable-next-js/no-img-element */}
                  <img
                    src={qrSvgUri}
                    alt="Restaurant menu QR code"
                    className="w-48 h-48 block mx-auto"
                  />
                </div>

                {/* Call to action */}
                <p className="text-[11px] text-neutral-700 max-w-xs mt-2 font-medium">
                  {callToAction}
                </p>

                {/* Wi-Fi Credentials */}
                {includeWifi && wifiSsid && (
                  <div className="mt-4 pt-3 border-t border-neutral-200 w-full flex items-center justify-center gap-1.5 text-[11px] text-neutral-600 font-mono">
                    <Wifi className="w-3.5 h-3.5 text-neutral-700" />
                    <span>WiFi: <strong>{wifiSsid}</strong></span>
                    <span className="text-neutral-400">•</span>
                    <span>Pass: <strong>{wifiPassword || 'none'}</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* TEMPLATE 2: COMPACT STICKER */}
            {templateType === 'sticker' && (
              <div
                data-testid="preview-sticker-card"
                className="w-64 h-64 rounded-full bg-white text-black p-4 shadow-2xl border-4 border-neutral-900 flex flex-col items-center justify-center text-center relative"
              >
                <span className="text-[11px] font-black uppercase tracking-wider text-neutral-800">
                  {restaurant.name}
                </span>
                <div className="my-1">
                  {/* eslint-disable-next-js/no-img-element */}
                  <img
                    src={qrSvgUri}
                    alt="Sticker QR code"
                    className="w-32 h-32 block mx-auto"
                  />
                </div>
                <span className="px-3 py-0.5 rounded-full bg-neutral-900 text-white text-[10px] font-mono font-bold">
                  Scan Menu
                </span>
              </div>
            )}

            {/* TEMPLATE 3: A4 SHEET GRID PREVIEW (8 CARDS) */}
            {templateType === 'a4' && (
              <div
                data-testid="preview-a4-sheet"
                className="w-full max-w-lg bg-white text-black p-5 rounded-2xl shadow-2xl border border-neutral-300"
              >
                <div className="text-center pb-3 border-b border-neutral-200 mb-3">
                  <h4 className="font-bold text-xs text-neutral-800">{restaurant.name} • A4 Sheet Cutting Guide</h4>
                  <p className="text-[10px] text-neutral-500">Cut along dotted lines to separate stands (8 cards)</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {sheetCards.map((cardIndex) => (
                    <div
                      key={cardIndex}
                      className="p-2 rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center text-center bg-neutral-50"
                    >
                      <span className="text-[9px] font-mono font-bold text-neutral-800 uppercase">Digital Menu</span>
                      {/* eslint-disable-next-js/no-img-element */}
                      <img
                        src={qrSvgUri}
                        alt="Menu QR"
                        className="w-16 h-16 my-1 bg-white p-1 rounded"
                      />
                      <span className="text-[8px] text-neutral-500 truncate max-w-full">
                        {restaurant.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* 3. PRINT ONLY LAYOUT (@media print) */}
      {/* ----------------------------------------------------------------------- */}
      <div className="hidden print:block text-black bg-white w-full print-only-card">
        {/* PRINT STAND */}
        {templateType === 'tent' && (
          <div className="w-[140mm] mx-auto p-8 border-2 border-black rounded-3xl flex flex-col items-center text-center">
            <h1 className="text-2xl font-black mb-1">{restaurant.name}</h1>
            <p className="text-sm text-gray-600 mb-3">{restaurant.tagline}</p>

            <div className="my-2 px-6 py-1.5 rounded-full bg-black text-white text-sm font-mono font-bold">
              DIGITAL MENU
            </div>

            <div className="my-4 p-4 bg-white border-4 border-black rounded-2xl">
              {/* eslint-disable-next-js/no-img-element */}
              <img
                src={qrSvgUri}
                alt="Print QR"
                className="w-[70mm] h-[70mm] block"
              />
            </div>

            <p className="text-xs text-gray-800 max-w-xs font-semibold mb-4">
              {callToAction}
            </p>

            {includeWifi && wifiSsid && (
              <div className="pt-4 border-t border-gray-300 w-full text-xs font-mono">
                WiFi: <strong>{wifiSsid}</strong> • Password: <strong>{wifiPassword || 'none'}</strong>
              </div>
            )}
          </div>
        )}

        {/* PRINT STICKER */}
        {templateType === 'sticker' && (
          <div className="w-[90mm] h-[90mm] mx-auto border-4 border-black rounded-full flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-xs font-black uppercase tracking-wider">{restaurant.name}</h2>
            {/* eslint-disable-next-js/no-img-element */}
            <img
              src={qrSvgUri}
              alt="Print Sticker QR"
              className="w-[45mm] h-[45mm] my-2"
            />
            <span className="text-xs font-mono font-bold bg-black text-white px-3 py-0.5 rounded-full">
              SCAN MENU
            </span>
          </div>
        )}

        {/* PRINT A4 SHEET (8 per page) */}
        {templateType === 'a4' && (
          <div className="w-[210mm] min-h-[297mm] p-6 mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-lg font-bold">{restaurant.name} — Printable Menu QR Cards</h1>
              <p className="text-xs text-gray-500">Cut along the dotted guidelines</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {sheetCards.map((cardIndex) => (
                <div
                  key={cardIndex}
                  className="border-2 border-dashed border-gray-400 rounded-2xl p-4 flex flex-col items-center text-center"
                >
                  <div className="flex items-center justify-between w-full px-2 mb-1">
                    <span className="font-bold text-xs">{restaurant.name}</span>
                    <span className="font-mono font-black text-xs bg-black text-white px-2 py-0.5 rounded">
                      DIGITAL MENU
                    </span>
                  </div>
                  {/* eslint-disable-next-js/no-img-element */}
                  <img
                    src={qrSvgUri}
                    alt="Digital Menu QR"
                    className="w-[42mm] h-[42mm] my-1"
                  />
                  <p className="text-[10px] text-gray-600 mt-1">Scan for menu & orders</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
