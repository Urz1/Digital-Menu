import React from 'react';
import Link from 'next/link';
import { Utensils, Home, ArrowLeft } from 'lucide-react';

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-[#0E1015] text-white flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
          <Utensils className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500">
            404 • Page Not Found
          </span>
          <h1 className="text-2xl font-bold mt-2 text-white">We couldn't find that table or menu</h1>
          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            The link you scanned might have expired, or the restaurant URL was entered incorrectly.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/addis"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sample Menu (/addis)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
