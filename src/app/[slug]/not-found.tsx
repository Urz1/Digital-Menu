import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, ArrowLeft } from 'lucide-react';

export default function RestaurantNotFound() {
  return (
    <div className="min-h-screen bg-[#0E1015] text-white flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
          <UtensilsCrossed className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500">
            Restaurant Not Found
          </span>
          <h1 className="text-2xl font-bold mt-2 text-white">This menu is currently unavailable</h1>
          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            The restaurant slug may have changed or the venue may not be taking digital orders at this moment.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Link
            href="/addis"
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Addis Restaurant Demo</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
