'use client';

import React from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface IosInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
}

export function IosInstallModal({ isOpen, onClose, restaurantName }: IosInstallModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#141620] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom duration-300 text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center overflow-hidden flex-shrink-0">
              <span className="font-brand font-bold text-lg text-amber-400">A</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Install {restaurantName}</h3>
              <p className="text-xs text-neutral-400">Add to iPhone or iPad Home Screen</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-5 space-y-4">
          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
              1
            </div>
            <div className="text-xs leading-relaxed">
              <p className="font-semibold text-white flex items-center gap-1.5">
                Tap the Share icon <Share className="w-3.5 h-3.5 text-amber-400 inline" />
              </p>
              <p className="text-neutral-400 mt-0.5">
                Look for the square icon with an upward arrow at the bottom of Safari.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
              2
            </div>
            <div className="text-xs leading-relaxed">
              <p className="font-semibold text-white flex items-center gap-1.5">
                Select &ldquo;Add to Home Screen&rdquo; <PlusSquare className="w-3.5 h-3.5 text-amber-400 inline" />
              </p>
              <p className="text-neutral-400 mt-0.5">
                Scroll down in the share sheet menu and tap &ldquo;Add to Home Screen&rdquo;.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
              3
            </div>
            <div className="text-xs leading-relaxed">
              <p className="font-semibold text-white flex items-center gap-1.5">
                Tap &ldquo;Add&rdquo; in top right <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
              </p>
              <p className="text-neutral-400 mt-0.5">
                The {restaurantName} app icon will now appear on your home screen for instant offline dining!
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors shadow-lg shadow-amber-500/20"
        >
          Got it, thanks!
        </button>
      </div>
    </div>
  );
}
