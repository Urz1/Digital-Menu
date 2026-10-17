'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  authenticateOwnerAsync,
  authenticateStaff,
  getOwnerProfile,
  getStaffAccounts,
  DEFAULT_OWNER_PROFILE,
} from '@/lib/auth-service';
import { triggerHaptic } from '@/lib/utils';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'owner' | 'staff'>('owner');

  // Owner form state
  const [ownerIdentifier, setOwnerIdentifier] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // Staff form state
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // OWNER AUTHENTICATION
  // ---------------------------------------------------------------------------
  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(10);
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await authenticateOwnerAsync(ownerIdentifier, ownerPassword);

      setIsLoading(false);
      if (!result.success) {
        triggerHaptic(20);
        setErrorMsg(result.error || 'Incorrect owner password. Access denied.');
        return;
      }

      setSuccessMsg('Owner authenticated successfully. Loading dashboard...');
      setTimeout(() => {
        router.push('/admin');
      }, 350);
    } catch {
      setIsLoading(false);
      setErrorMsg('Authentication error. Please check your credentials and try again.');
    }
  };

  // ---------------------------------------------------------------------------
  // STAFF AUTHENTICATION
  // ---------------------------------------------------------------------------
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(10);
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = authenticateStaff(staffUsername, staffPassword);

    setTimeout(() => {
      setIsLoading(false);
      if (!result.success) {
        triggerHaptic(20);
        setErrorMsg(result.error || 'Incorrect staff password / PIN. Access denied.');
        return;
      }

      setSuccessMsg(`Welcome, ${result.session?.name}! Loading staff console...`);
      setTimeout(() => {
        router.push('/admin');
      }, 350);
    }, 300);
  };

  // ---------------------------------------------------------------------------
  // FORGOT PASSWORD RECOVERY (OWNER ONLY)
  // ---------------------------------------------------------------------------
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(10);
    if (!recoveryEmail) return;

    const currentOwner = getOwnerProfile();
    if (recoveryEmail.toLowerCase().trim() === currentOwner.email.toLowerCase().trim()) {
      setRecoverySent(true);
    } else {
      setErrorMsg('No owner account registered with this email address.');
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
            Secure authentication for Restaurant Owner and Service Staff
          </p>
        </div>

        {/* Role Tabs: Owner vs Staff */}
        <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              setTab('owner');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'staff'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Staff Portal
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* =========================================================================
            1. OWNER LOGIN FORM (Email/Phone + Password)
           ========================================================================= */}
        {tab === 'owner' && !isForgotOpen && (
          <form onSubmit={handleOwnerLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Owner Email or Phone Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  data-testid="owner-identifier-input"
                  value={ownerIdentifier}
                  onChange={(e) => setOwnerIdentifier(e.target.value)}
                  placeholder="owner@addiscafeteria.com or +251..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Owner Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotOpen(true);
                    setRecoveryEmail(ownerIdentifier.includes('@') ? ownerIdentifier : '');
                  }}
                  className="text-[11px] text-amber-400/90 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type={showOwnerPassword ? 'text' : 'password'}
                  required
                  data-testid="owner-password-input"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                  className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-white"
                  aria-label={showOwnerPassword ? 'Hide password' : 'Show password'}
                >
                  {showOwnerPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !ownerPassword}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 font-bold text-xs text-white shadow-lg shadow-orange-950/40 transition-all flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In as Owner'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* =========================================================================
            1.1 OWNER FORGOT PASSWORD VIEW
           ========================================================================= */}
        {tab === 'owner' && isForgotOpen && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-white">Reset Owner Password</h3>
            <p className="text-xs text-neutral-400">
              Enter your registered owner email address to receive password recovery instructions.
            </p>

            {recoverySent ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-emerald-400 mb-1">Recovery Dispatched</div>
                <p className="text-xs text-neutral-300">
                  Password instructions and reset link dispatched to <strong>{recoveryEmail}</strong>.
                </p>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Please check your inbox (and spam folder) to complete your password update.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotOpen(false);
                    setRecoverySent(false);
                  }}
                  className="mt-4 text-xs text-amber-400 underline font-semibold block mx-auto cursor-pointer"
                >
                  Return to Sign In
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
                    placeholder="owner@addiscafeteria.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 cursor-pointer"
                  >
                    Send Recovery
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* =========================================================================
            2. STAFF LOGIN FORM (Username/Phone + Password/PIN)
           ========================================================================= */}
        {tab === 'staff' && (
          <form onSubmit={handleStaffLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Staff Username or Phone Number
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  data-testid="staff-username-input"
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  placeholder="e.g. staff_selam or +251..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Staff Password / PIN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type={showStaffPassword ? 'text' : 'password'}
                  required
                  data-testid="staff-password-input"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="Enter staff password or PIN"
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowStaffPassword(!showStaffPassword)}
                  className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-white"
                  aria-label={showStaffPassword ? 'Hide password' : 'Show password'}
                >
                  {showStaffPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1.5 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span>Forgot your staff password? Contact your restaurant owner to reset it.</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !staffPassword}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 font-bold text-xs text-white shadow-lg shadow-orange-950/40 transition-all flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Open Staff Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
