import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getRestaurantBySlug } from '@/lib/data-provider';
import { ShieldCheck, ArrowLeft, Cookie, Lock, EyeOff, FileText, CheckCircle2 } from 'lucide-react';

interface PrivacyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    return { title: 'Privacy Policy — Not Found' };
  }

  return {
    title: `Privacy Notice — ${restaurant.name}`,
    description: `Privacy policy and guest data handling at ${restaurant.name}. We do not track or sell guest information.`,
  };
}

export default async function RestaurantPrivacyPage({ params }: PrivacyPageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0E1015] text-neutral-200 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8" data-testid="privacy-page-container">
        {/* Navigation back */}
        <Link
          href={`/${restaurant.slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {restaurant.name} Menu</span>
        </Link>

        {/* Header */}
        <header className="border-b border-white/10 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-md"
              style={{ backgroundColor: restaurant.theme_config.primaryColor || '#E8590C' }}
            >
              {restaurant.logo_letter || 'A'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{restaurant.name}</h1>
              <p className="text-xs text-neutral-400">{restaurant.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mt-4 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Tracking & Cookie-Free Guarantee</span>
          </div>
        </header>

        {/* Core Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#141620] border border-white/5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Cookie className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">No Tracking Cookies</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              We never place advertising or tracking cookies on your device. Your browsing history is not monitored across any other website.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#141620] border border-white/5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">Anonymous Dining</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              No account, email, or phone number is required to browse our digital menu, view daily specials, or call for service.
            </p>
          </div>
        </div>

        {/* Detailed Notice Sections */}
        <section className="space-y-6 text-xs text-neutral-300 leading-relaxed divide-y divide-white/5">
          <div className="space-y-2 pt-2">
            <h2 className="text-sm font-bold text-white">1. Information We Process</h2>
            <p>
              When you scan the table QR code, our platform securely processes only what is strictly necessary to provide food service:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-400">
              <li>Your assigned dining table number (e.g. Table 14).</li>
              <li>Dishes added to your current session order bar.</li>
              <li>Service alerts you initiate (e.g. requesting water or the bill).</li>
              <li>Dish ratings or feedback you voluntarily submit.</li>
            </ul>
          </div>

          <div className="space-y-2 pt-4">
            <h2 className="text-sm font-bold text-white">2. Local Storage on Your Device</h2>
            <p>
              We use your browser’s temporary storage strictly for functional, offline resilience:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-400">
              <li>Saving your dietary filter preference (e.g. Vegan or Gluten-Free).</li>
              <li>Keeping your dish bookmarks in memory during your dining visit.</li>
              <li>Enabling offline menu browsing if restaurant Wi-Fi drops.</li>
            </ul>
          </div>

          <div className="space-y-2 pt-4">
            <h2 className="text-sm font-bold text-white">3. Third-Party Disclosures</h2>
            <p>
              We do <strong>not</strong> sell, rent, or trade guest data to advertisers or data brokers. Analytics are aggregated with zero personal identifiers.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <h2 className="text-sm font-bold text-white">4. Data Deletion and Inquiries</h2>
            <p>
              Restaurant staff and owners periodically purge historical table sessions and service calls. For questions about your privacy at {restaurant.name}, speak directly with your server or the restaurant owner.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-white/10 text-center text-[11px] text-neutral-500 flex flex-col items-center gap-1.5">
          <div>Last reviewed: October 2026 • {restaurant.name} Digital Dining Experience</div>
          <div className="flex items-center gap-1 text-neutral-500/80">
            <span>Powered by</span>
            <a
              href="https://www.rhizantech.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors underline underline-offset-2"
            >
              Rhizantech
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
