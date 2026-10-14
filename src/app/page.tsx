import React from 'react';
import Link from 'next/link';
import { Utensils, QrCode, ShieldCheck, Zap, Layers, Sparkles, ArrowRight, Settings } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0C0D11] text-white flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Top Navigation */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center font-bold text-white shadow-lg">
            A
          </div>
          <span className="font-bold text-lg tracking-tight">Digital Menu Platform</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Staff & Owner Portal</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-16 flex-1 flex flex-col items-center text-center justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production-Ready Multi-Tenant QR Menu Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.15] mb-6">
          Mobile-First QR Dining Experience for Modern Restaurants.
        </h1>

        <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed">
          Powered by Next.js App Router, Supabase Realtime, and Tailwind CSS.
          Lightning-fast customer menus with table QR codes, zero login required, and instant staff notifications.
        </p>

        {/* Demo Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
          <Link
            href="/addis?table=14"
            className="w-full sm:w-auto px-8 h-13 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-orange-950/40 transition-all active:scale-98"
          >
            <Utensils className="w-4 h-4" />
            <span>Open "Addis" Cafeteria Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/admin"
            className="w-full sm:w-auto px-6 h-13 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Settings className="w-4 h-4" />
            <span>Open Staff Live Console</span>
          </Link>
        </div>

        {/* Architecture Grid Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 text-left w-full">
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center mb-1">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Supabase Realtime</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Price adjustments and "Sold Out" switches stream live to diners' screens without refreshing.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Multi-Tenant Tokens</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Brand colors, typography, logos, and layouts are stored per restaurant as data, not code changes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Row Level Security</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              PostgreSQL RLS ensures public diners can browse and order, while staff and owners have isolated roles.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-6 text-center text-xs text-neutral-500 max-w-6xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-3">
        <span>Digital Menu Multi-Tenant System • Next.js & Supabase</span>
        <div className="flex gap-4">
          <Link href="/addis?table=14" className="hover:text-neutral-300">Dine-in Demo</Link>
          <Link href="/admin" className="hover:text-neutral-300">Staff Portal</Link>
        </div>
      </footer>
    </div>
  );
}
