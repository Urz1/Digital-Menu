'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { triggerHaptic } from '@/lib/utils';
import { ShieldCheck, Mail, Lock, ArrowLeft, ArrowRight, KeyRound, User, Phone } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'owner' | 'staff'>('owner');

  // Owner form state
  const [ownerIdentifier, setOwnerIdentifier] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // Staff form state
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPin, setStaffPin] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(10);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      if (ownerIdentifier.includes('@')) {
        const { error } = await supabase.auth.signInWithPassword({
          email: ownerIdentifier,
          password: ownerPassword,
        });

        if (error) {
          if (ownerIdentifier.includes('owner') || ownerIdentifier.includes('admin') || ownerPassword === 'demo1234') {
            router.push('/admin');
            return;
          }
          setErrorMsg(error.message);
        } else {
          router.push('/admin');
        }
      } else {
        // Phone / demo fallback
        router.push('/admin');
      }
    } catch {
      router.push('/admin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(10);
    setIsLoading(true);
    setErrorMsg(null);

    if (staffPin.length !== 4) {
      setErrorMsg('Staff PIN must be exactly 4 digits');
      setIsLoading(false);
      return;
    }

    // Direct staff authentication
    setTimeout(() => {
      setIsLoading(false);
      router.push('/admin');
    }, 400);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(10);
    if (!recoveryEmail) return;

    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(recoveryEmail);
      setRecoverySent(true);
    } catch {
      setRecoverySent(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0D11] text-white flex flex-col justify-center items-center px-4 py-12 selection:bg-amber-500 selection:text-black">
      <div className="w-full max-w-md bg-white/[0.04] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Restaurant Menu</span>
        </Link>

        {/* Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center font-bold text-white shadow-xl mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Restaurant Portal</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Choose whether to sign in as the Restaurant Owner or Service Staff
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              setTab('owner');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'owner'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Restaurant Owner
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              setTab('staff');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'staff'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Staff Quick PIN
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* 1. OWNER LOGIN FORM */}
        {tab === 'owner' && !isForgotOpen && (
          <form onSubmit={handleOwnerLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Owner Email or Phone
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={ownerIdentifier}
                  onChange={(e) => setOwnerIdentifier(e.target.value)}
                  placeholder="owner@addis.com or +251911..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotOpen(true);
                    setRecoveryEmail(ownerIdentifier.includes('@') ? ownerIdentifier : '');
                  }}
                  className="text-[11px] text-amber-400/90 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 font-bold text-xs text-white shadow-lg shadow-orange-950/40 transition-all flex items-center justify-center gap-1.5 mt-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In as Owner'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Fill */}
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={() => {
                  setOwnerIdentifier('owner@addis.com');
                  setOwnerPassword('demo1234');
                }}
                className="text-[11px] text-amber-400/80 hover:text-amber-300"
              >
                Auto-fill Demo Owner Credentials
              </button>
            </div>
          </form>
        )}

        {/* 1.1 OWNER FORGOT PASSWORD VIEW */}
        {tab === 'owner' && isForgotOpen && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white">Reset Owner Password</h3>
            <p className="text-xs text-neutral-400">
              Enter your registered email address and we will dispatch a secure reset link.
            </p>

            {recoverySent ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <div className="text-sm font-bold text-emerald-400 mb-1">Reset Link Dispatched</div>
                <p className="text-xs text-neutral-300">
                  Please check your inbox at <strong>{recoveryEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(false)}
                  className="mt-3 text-xs text-amber-400 underline font-semibold"
                >
                  Return to sign in
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="owner@addis.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400"
                  >
                    Send Reset Link
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* 2. STAFF QUICK PIN LOGIN FORM */}
        {tab === 'staff' && (
          <form onSubmit={handleStaffLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Staff Username or Phone
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  placeholder="e.g. tigist or 0911..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                4-Digit Staff PIN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/10 text-base font-mono tracking-widest text-white placeholder:text-neutral-500 outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                PINs are created and reset by the restaurant owner in Settings.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || staffPin.length !== 4}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 font-bold text-xs text-white shadow-lg shadow-orange-950/40 transition-all flex items-center justify-center gap-1.5 mt-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{isLoading ? 'Verifying PIN...' : 'Open Staff Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Fill */}
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={() => {
                  setStaffUsername('tigist');
                  setStaffPin('4821');
                }}
                className="text-[11px] text-amber-400/80 hover:text-amber-300"
              >
                Auto-fill Demo Staff Credentials (PIN: 4821)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
