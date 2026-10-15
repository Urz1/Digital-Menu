'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Restaurant, Category, MenuItem } from '@/types/database';
import { triggerHaptic } from '@/lib/utils';
import { checkWcagContrast } from '@/lib/admin-engine';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  QrCode,
  Download,
  UtensilsCrossed,
  Palette,
  Clock,
  Globe,
  Building,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  onComplete: (data: {
    restaurantUpdates: Partial<Restaurant>;
    newCategory?: Partial<Category>;
    newDish?: Partial<MenuItem>;
  }) => void;
}

export function OnboardingWizardModal({
  isOpen,
  onClose,
  restaurant,
  onComplete,
}: OnboardingWizardModalProps) {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Step 1: Name & Logo
  const [name, setName] = useState(restaurant.name || '');
  const [logoLetter, setLogoLetter] = useState(restaurant.logo_letter || 'A');
  const [tagline, setTagline] = useState(restaurant.tagline || '');

  // Step 2: Brand Colors
  const [primaryColor, setPrimaryColor] = useState(
    restaurant.theme_config?.primaryColor || '#E8590C'
  );
  const [accentColor, setAccentColor] = useState(
    restaurant.theme_config?.accentColor || '#F76707'
  );

  // Step 3: Hours & Languages
  const [hours, setHours] = useState(restaurant.hours || 'Mon – Sun: 8:00 AM – 10:00 PM');
  const [currency, setCurrency] = useState(restaurant.currency || '$');
  const [enableSpanish, setEnableSpanish] = useState(true);

  // Step 4: First Category & Dish
  const [categoryName, setCategoryName] = useState('Signature Entrées');
  const [dishName, setDishName] = useState('Wood-Fired Ribeye Steak');
  const [dishPrice, setDishPrice] = useState('28.50');
  const [dishDescription, setDishDescription] = useState(
    'Prime cut served with rosemary truffle butter and crispy herb potatoes.'
  );

  if (!isOpen) return null;

  // Check contrast for primary color against white
  const contrastCheck = checkWcagContrast(primaryColor, '#FFFFFF');

  const handleNext = () => {
    triggerHaptic(10);
    setStep((prev) => {
      if (prev < totalSteps) {
        return prev + 1;
      }
      handleFinish();
      return prev;
    });
  };

  const handleBack = () => {
    triggerHaptic(10);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinish = () => {
    triggerHaptic(20);
    onComplete({
      restaurantUpdates: {
        name,
        logo_letter: logoLetter || name.charAt(0).toUpperCase() || 'M',
        tagline,
        hours,
        currency,
        onboarding_completed: true,
        theme_config: {
          ...restaurant.theme_config,
          primaryColor,
          accentColor,
        },
      },
      newCategory: {
        name: categoryName,
        icon: '🥩',
        sort_order: 1,
        is_active: true,
      },
      newDish: {
        name: dishName,
        price: parseFloat(dishPrice) || 25,
        description: dishDescription,
        is_available: true,
        is_chefs_pick: true,
      },
    });
    onClose();
  };

  return (
    <div
      data-testid="onboarding-wizard-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl bg-[#12141C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">5-Minute Menu Onboarding</h2>
              <p className="text-xs text-neutral-400">Step {step} of {totalSteps}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                triggerHaptic(5);
                onClose();
              }}
              className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
              aria-label="Close wizard"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stepper Indicator */}
        <div className="w-full bg-white/5 h-1.5 flex">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-full flex-1 transition-all duration-300 ${
                i + 1 <= step ? 'bg-amber-500' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Step Contents */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: Name & Logo */}
          {step === 1 && (
            <div className="space-y-5" data-testid="wizard-step-1">
              <div>
                <h3 className="text-lg font-bold text-white">Welcome! What is your restaurant called?</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  This appears at the top of your digital menu and on printable table QR cards.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    data-testid="onboarding-input-name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!logoLetter && e.target.value) {
                        setLogoLetter(e.target.value.charAt(0).toUpperCase());
                      }
                    }}
                    placeholder="e.g. Addis Cafeteria"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Logo Badge Letter
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={logoLetter}
                      onChange={(e) => setLogoLetter(e.target.value.toUpperCase())}
                      placeholder="A"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold uppercase text-center focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Badge Preview
                    </label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-md"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {logoLetter || 'A'}
                      </div>
                      <span className="text-xs text-neutral-400">Header Icon</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Tagline or Cuisine (Optional)
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Artisanal Roasts, Handcrafted Pastries & Modern Comfort Dining"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Brand Colours */}
          {step === 2 && (
            <div className="space-y-5" data-testid="wizard-step-2">
              <div>
                <h3 className="text-lg font-bold text-white">Choose your brand colours</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  We calculate contrast ratios automatically so every guest can read your menu clearly.
                </p>
              </div>

              {/* Ready-Made Palette Presets */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  Quick Palette Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { name: 'Warm Amber', primary: '#E8590C', accent: '#F76707' },
                    { name: 'Emerald Bistro', primary: '#059669', accent: '#10B981' },
                    { name: 'Ruby Steakhouse', primary: '#E11D48', accent: '#F43F5E' },
                    { name: 'Midnight Gold', primary: '#D97706', accent: '#F59E0B' },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        triggerHaptic(8);
                        setPrimaryColor(preset.primary);
                        setAccentColor(preset.accent);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        primaryColor === preset.primary
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-white/20"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span className="text-xs font-semibold text-white">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colour Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Primary Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      data-testid="onboarding-primary-color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-28 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Secondary Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-28 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-xs uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Contrast feedback badge */}
              <div
                className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  contrastCheck.passesNormal
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                {contrastCheck.passesNormal ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <div className="text-xs">
                  <p className="font-bold">
                    Contrast Ratio: {contrastCheck.ratio}:1 — {contrastCheck.passesNormal ? 'WCAG AA Compliant' : 'Warning'}
                  </p>
                  <p className="text-neutral-400 mt-0.5">{contrastCheck.plainWarning}</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Hours & Currency */}
          {step === 3 && (
            <div className="space-y-5" data-testid="wizard-step-3">
              <div>
                <h3 className="text-lg font-bold text-white">Opening hours & currency</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Control when guests can submit table orders or see the closed banner.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Operating Schedule
                  </label>
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="Mon – Sun: 7:00 AM – 10:00 PM"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Menu Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="$" className="bg-[#12141C]">$ USD (US Dollar)</option>
                      <option value="€" className="bg-[#12141C]">€ EUR (Euro)</option>
                      <option value="£" className="bg-[#12141C]">£ GBP (British Pound)</option>
                      <option value="Br" className="bg-[#12141C]">Br ETB (Ethiopian Birr)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Multilingual Support
                    </label>
                    <button
                      type="button"
                      onClick={() => setEnableSpanish(!enableSpanish)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-colors ${
                        enableSpanish
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                          : 'border-white/10 bg-white/5 text-neutral-400'
                      }`}
                    >
                      <span>English & Spanish</span>
                      <Check className={`w-4 h-4 ${enableSpanish ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: First Category & Dish */}
          {step === 4 && (
            <div className="space-y-5" data-testid="wizard-step-4">
              <div>
                <h3 className="text-lg font-bold text-white">Add your first signature dish</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Essentials first: you can enrich with allergens, size options, and tags anytime later.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Category Name
                  </label>
                  <input
                    type="text"
                    data-testid="onboarding-input-category"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g. Starters & Small Bites"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Dish Name
                    </label>
                    <input
                      type="text"
                      data-testid="onboarding-input-dish"
                      value={dishName}
                      onChange={(e) => setDishName(e.target.value)}
                      placeholder="e.g. Artisanal Sourdough Bruschetta"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Price ({currency})
                    </label>
                    <input
                      type="text"
                      data-testid="onboarding-input-price"
                      value={dishPrice}
                      onChange={(e) => setDishPrice(e.target.value)}
                      placeholder="18.50"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={dishDescription}
                    onChange={(e) => setDishDescription(e.target.value)}
                    placeholder="Describe textures, artisanal ingredients, or pairing..."
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: QR Download & Celebration */}
          {step === 5 && (
            <div className="space-y-6 text-center py-2" data-testid="wizard-step-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Your menu is live and ready!</h3>
                <p className="text-xs text-neutral-300 max-w-md mx-auto mt-1">
                  You have configured your branding, schedule, and first signature item. Download your table QR code to start receiving guest orders.
                </p>
              </div>

              {/* QR Preview Card */}
              <div className="max-w-xs mx-auto p-5 rounded-2xl bg-white text-black shadow-xl flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-base mb-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  {logoLetter || 'A'}
                </div>
                <h4 className="font-bold text-sm text-neutral-900">{name || 'Addis Cafeteria'}</h4>
                <p className="text-[10px] text-neutral-500">Scan to browse digital menu & order</p>

                {/* Simulated QR Code Visual */}
                <div className="my-3 p-2 bg-neutral-100 rounded-xl border border-neutral-200">
                  <div className="w-36 h-36 bg-neutral-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <QrCode className="w-28 h-28 text-white" />
                  </div>
                </div>

                <span className="text-[11px] font-mono font-bold text-neutral-700 bg-neutral-100 px-3 py-1 rounded-full">
                  Table 14 • /{restaurant.slug || 'addis'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={`/${restaurant.slug || 'addis'}?table=14`}
                  target="_blank"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                  <span>Open Customer Menu</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                data-testid="onboarding-next-button"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                data-testid="onboarding-finish-button"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold transition-all shadow-lg shadow-orange-950/40 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Publish Menu & Enter Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
