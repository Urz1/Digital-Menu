'use client';

import React, { useState, useEffect } from 'react';
import { Restaurant, StaffAccount, UserRole } from '@/types/database';
import {
  AdminAuthSession,
  getOwnerProfile,
  updateOwnerProfile,
  changeOwnerPassword,
  getStaffProfile,
  updateStaffProfile,
  changeStaffPassword,
  OwnerProfile,
} from '@/lib/auth-service';
import { triggerHaptic } from '@/lib/utils';
import {
  User,
  Shield,
  KeyRound,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  BadgeCheck,
  Building,
  Clock,
  Crown,
  ClipboardList,
  UtensilsCrossed,
  Users,
  Tag,
  Sliders,
  Zap,
  MessageSquare,
  Bell,
} from 'lucide-react';

interface ProfileSectionProps {
  restaurant: Restaurant;
  session: AdminAuthSession | null;
  onUpdateSessionName?: (newName: string, newIdentifier: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export function ProfileSection({
  restaurant,
  session,
  onUpdateSessionName,
  onShowToast,
}: ProfileSectionProps) {
  const isOwner = session?.role === 'owner';
  const staffId = session?.userId || '';

  // Owner Form State
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile>(() => getOwnerProfile());
  const [ownerName, setOwnerName] = useState(ownerProfile.name);
  const [ownerEmail, setOwnerEmail] = useState(ownerProfile.email);
  const [ownerPhone, setOwnerPhone] = useState(ownerProfile.phone);
  const [isSavingOwnerInfo, setIsSavingOwnerInfo] = useState(false);

  // Staff Form State
  const [staffAccount, setStaffAccount] = useState<StaffAccount | null>(() =>
    staffId ? getStaffProfile(staffId) : null
  );
  const [staffName, setStaffName] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [isSavingStaffInfo, setIsSavingStaffInfo] = useState(false);

  // Password / PIN Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sync profile details on mount or session change
  useEffect(() => {
    if (isOwner) {
      const p = getOwnerProfile();
      setOwnerProfile(p);
      setOwnerName(p.name);
      setOwnerEmail(p.email);
      setOwnerPhone(p.phone);
    } else if (staffId) {
      const s = getStaffProfile(staffId);
      if (s) {
        setStaffAccount(s);
        setStaffName(s.name);
        setStaffUsername(s.username);
        setStaffPhone(s.phone || '');
      }
    }
  }, [isOwner, staffId, session]);

  // Handle Personal Info Update for Owner
  const handleSaveOwnerInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim()) {
      onShowToast('Name is required', 'error');
      return;
    }
    if (!ownerEmail.trim() || !ownerEmail.includes('@')) {
      onShowToast('Valid email address is required', 'error');
      return;
    }

    setIsSavingOwnerInfo(true);
    triggerHaptic(10);

    try {
      const updated = updateOwnerProfile({
        name: ownerName.trim(),
        email: ownerEmail.trim(),
        phone: ownerPhone.trim(),
      });
      setOwnerProfile(updated);
      if (onUpdateSessionName) {
        onUpdateSessionName(updated.name, updated.email);
      }
      onShowToast('Owner profile details updated successfully!', 'success');
    } catch {
      onShowToast('Failed to update owner profile.', 'error');
    } finally {
      setIsSavingOwnerInfo(false);
    }
  };

  // Handle Personal Info Update for Staff
  const handleSaveStaffInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) {
      onShowToast('Staff name is required', 'error');
      return;
    }
    if (!staffUsername.trim()) {
      onShowToast('Username / Login ID is required', 'error');
      return;
    }

    setIsSavingStaffInfo(true);
    triggerHaptic(10);

    const res = updateStaffProfile(staffId, {
      name: staffName.trim(),
      username: staffUsername.trim(),
      phone: staffPhone.trim() || undefined,
    });

    setIsSavingStaffInfo(false);

    if (res.success && res.staff) {
      setStaffAccount(res.staff);
      if (onUpdateSessionName) {
        onUpdateSessionName(res.staff.name, res.staff.username);
      }
      onShowToast('Staff profile updated successfully!', 'success');
    } else {
      onShowToast(res.error || 'Failed to update staff profile', 'error');
    }
  };

  // Handle Password / PIN Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      onShowToast('Please enter your current password / PIN', 'error');
      return;
    }
    if (!newPassword) {
      onShowToast('Please enter a new password / PIN', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      onShowToast('New passwords do not match', 'error');
      return;
    }

    setIsChangingPassword(true);
    triggerHaptic(12);

    if (isOwner) {
      const res = changeOwnerPassword(currentPassword, newPassword);
      setIsChangingPassword(false);
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onShowToast('Owner password changed successfully!', 'success');
      } else {
        onShowToast(res.error || 'Failed to change owner password', 'error');
      }
    } else {
      const res = changeStaffPassword(staffId, currentPassword, newPassword);
      setIsChangingPassword(false);
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onShowToast('Staff password / PIN changed successfully!', 'success');
      } else {
        onShowToast(res.error || 'Failed to change staff password / PIN', 'error');
      }
    }
  };

  // Password strength score helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return Math.min(score, 4);
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 animate-in fade-in duration-200">
      {/* 1. PROFILE BANNER */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#12141C] border border-neutral-200/80 dark:border-white/10 shadow-xs dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden profile-banner">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-2xl shadow-inner">
            {isOwner ? <Crown className="w-8 h-8 text-amber-500 dark:text-amber-400" /> : <Shield className="w-8 h-8 text-amber-500 dark:text-amber-400" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-brand">
                {isOwner ? ownerProfile.name : staffAccount?.name || session?.name || 'Staff Member'}
              </h2>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isOwner
                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 font-bold'
                    : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 font-bold'
                }`}
              >
                {isOwner ? 'Executive Owner' : 'Verified Staff Member'}
              </span>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-2">
              <span>{restaurant.name}</span>
              <span>•</span>
              <span className="font-mono text-neutral-600 dark:text-neutral-300 font-semibold">
                {isOwner ? ownerProfile.email : `@${staffAccount?.username || session?.identifier}`}
              </span>
            </p>
          </div>
        </div>

        {/* Quick Restaurant & Status Badge */}
        <div className="flex items-center gap-3 relative z-10 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl p-3 px-4">
          <Building className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <div className="text-left text-xs">
            <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 block">Workspace</span>
            <span className="font-semibold text-neutral-900 dark:text-white">{restaurant.name}</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 ml-2 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. PERSONAL INFORMATION FORM */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141C] border border-neutral-200/80 dark:border-white/5 shadow-xs dark:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <User className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Personal Information</h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5">
              {isOwner
                ? 'Update your executive owner details displayed on receipts and internal management.'
                : 'Update your official staff details used for dining room service and internal communication.'}
            </p>

            {isOwner ? (
              <form onSubmit={handleSaveOwnerInfo} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Abebe Bikila"
                      required
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="e.g. owner@addiscafeteria.com"
                      required
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="e.g. +251 911 223344"
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingOwnerInfo}
                    className="h-10 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingOwnerInfo ? 'Saving Changes...' : 'Save Personal Info'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveStaffInfo} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                    Staff Member Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. Selam Kebede"
                      required
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                    Login Username / ID
                  </label>
                  <div className="relative">
                    <BadgeCheck className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={staffUsername}
                      onChange={(e) => setStaffUsername(e.target.value)}
                      placeholder="e.g. staff_selam"
                      required
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-amber-400 font-mono transition-colors"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    Used to sign in to the staff portal console.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                    Contact Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      placeholder="e.g. +251 911 000000"
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingStaffInfo}
                    className="h-10 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingStaffInfo ? 'Saving Changes...' : 'Save Personal Info'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* 3. SECURITY & PASSWORD MANAGEMENT FORM */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#12141C] border border-neutral-200/80 dark:border-white/5 shadow-xs dark:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <KeyRound className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Change Credentials</h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5">
              {isOwner
                ? 'Update your master owner password. Your new password must be at least 6 characters.'
                : 'Update your staff login PIN or password. Minimum 4 characters/digits required.'}
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Current {isOwner ? 'Password' : 'Password / PIN'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password / PIN"
                    required
                    className="w-full h-10 pl-9 pr-10 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  New {isOwner ? 'Password' : 'Password / PIN'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isOwner ? 'Minimum 6 characters' : 'Minimum 4 digits/characters'}
                    required
                    className="w-full h-10 pl-9 pr-10 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Real-time Strength Meter for Owner */}
                {isOwner && newPassword.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1 h-1.5 w-full">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`flex-1 rounded-full transition-colors ${
                            strength >= step
                              ? strength >= 3
                                ? 'bg-emerald-500'
                                : strength === 2
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                              : 'bg-neutral-200 dark:bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      {strength >= 3 ? 'Strong password' : strength === 2 ? 'Medium strength' : 'Weak password'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Confirm New {isOwner ? 'Password' : 'Password / PIN'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password / PIN"
                    required
                    className="w-full h-10 pl-9 pr-10 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="h-10 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white/10 dark:hover:bg-white/20 dark:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-neutral-800 dark:border-white/10 transition-colors active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isChangingPassword ? 'Verifying...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 4. RESPONSIBILITIES & SESSION AUDIT CARD */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#12141C] border border-neutral-200/80 dark:border-white/5 shadow-xs dark:shadow-xl">
        <div className="flex items-center gap-2.5 mb-2">
          <Shield className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            {isOwner ? 'Account & Station Permissions' : 'Assigned Station Duties'}
          </h3>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          {isOwner
            ? 'Full administrative permissions to manage restaurant configuration, team members, pricing, and dishes.'
            : 'Streamlined console for daily floor service, table assistance, and review replies.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {isOwner ? (
            <>
              <div className="group p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] hover:bg-neutral-100 dark:hover:bg-white/[0.05] border border-neutral-200/70 dark:border-white/5 hover:border-amber-500/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white tracking-wide">Menu Management</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    Update dishes, categories, pricing, and availability.
                  </p>
                </div>
              </div>

              <div className="group p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] hover:bg-neutral-100 dark:hover:bg-white/[0.05] border border-neutral-200/70 dark:border-white/5 hover:border-amber-500/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white tracking-wide">Staff & Team Access</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    Manage team member logins and station access.
                  </p>
                </div>
              </div>

              <div className="group p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] hover:bg-neutral-100 dark:hover:bg-white/[0.05] border border-neutral-200/70 dark:border-white/5 hover:border-amber-500/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                    <Tag className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white tracking-wide">Promotions & Specials</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    Configure happy hours, seasonal specials, and meal combos.
                  </p>
                </div>
              </div>

              <div className="group p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] hover:bg-neutral-100 dark:hover:bg-white/[0.05] border border-neutral-200/70 dark:border-white/5 hover:border-amber-500/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white tracking-wide">Restaurant Settings</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    Configure currency (ETB), tax rules, and guest WiFi.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="group p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] hover:bg-neutral-100 dark:hover:bg-white/[0.05] border border-neutral-200/70 dark:border-white/5 hover:border-amber-500/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white tracking-wide">86 / Sold Out Control</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    Instantly toggle out-of-stock items in real time.
                  </p>
                </div>
              </div>

              <div className="group p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] hover:bg-neutral-100 dark:hover:bg-white/[0.05] border border-neutral-200/70 dark:border-white/5 hover:border-amber-500/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                    <Tag className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white tracking-wide">Active Offers Monitor</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    View and pause running promotions during busy hours.
                  </p>
                </div>
              </div>

              <div className="group p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] hover:bg-neutral-100 dark:hover:bg-white/[0.05] border border-neutral-200/70 dark:border-white/5 hover:border-amber-500/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white tracking-wide">Guest Reviews Reply</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    Read feedback and post friendly staff replies to diners.
                  </p>
                </div>
              </div>

              <div className="group p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] hover:bg-neutral-100 dark:hover:bg-white/[0.05] border border-neutral-200/70 dark:border-white/5 hover:border-amber-500/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white tracking-wide">Service Requests</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    Acknowledge and mark table calls and refills as served.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Audit Meta Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-white/5 flex flex-wrap items-center justify-between text-[11px] text-neutral-500 gap-2">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            Session active since:{' '}
            <strong className="text-neutral-700 dark:text-neutral-300 font-mono">
              {session?.loggedInAt ? new Date(session.loggedInAt).toLocaleTimeString() : 'Current Session'}
            </strong>
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
            <Shield className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>Authenticated Session • Addis Ababa Station</span>
          </span>
        </div>
      </div>
    </div>
  );
}
