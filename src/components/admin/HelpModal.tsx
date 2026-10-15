'use client';

import React from 'react';
import { AdminSection } from './AdminSidebar';
import {
  HelpCircle,
  X,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  QrCode,
  UtensilsCrossed,
  Tag,
  Star,
  Palette,
  ExternalLink,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: AdminSection;
}

export function HelpModal({ isOpen, onClose, activeSection }: HelpModalProps) {
  if (!isOpen) return null;

  const TIPS: Record<
    AdminSection,
    { title: string; tips: { heading: string; desc: string }[] }
  > = {
    home: {
      title: 'Home Dashboard Tips',
      tips: [
        {
          heading: 'Task-First Row',
          desc: 'Use the top action buttons to quickly add dishes or mark items sold out without hunting through nested menus.',
        },
        {
          heading: 'Onboarding Checklist',
          desc: 'Work through the 5 essential setups at your own pace to get the most out of your digital menu.',
        },
      ],
    },
    menu: {
      title: 'Menu Management Tips',
      tips: [
        {
          heading: 'Inline Quick Editing',
          desc: 'Click directly on any dish name or price in the list to update it instantly without opening the edit modal.',
        },
        {
          heading: 'One-Tap Sold Out',
          desc: 'Toggle the green Available button to Sold Out Today when a dish runs out. It will auto-reset before tomorrow’s morning service.',
        },
        {
          heading: 'Bulk Price Changes',
          desc: 'Select multiple dishes with the checkboxes to raise or lower prices by a percentage or fixed dollar amount in one step.',
        },
      ],
    },
    offers: {
      title: 'Offers & Promotions Tips',
      tips: [
        {
          heading: 'Time-Restricted Combos',
          desc: 'Schedule weekday lunch specials or happy hour promotions that automatically turn on and off based on the clock.',
        },
        {
          heading: 'Highlight Badge',
          desc: 'Use snappy badges like "Chef Lunch" or "Save 20%" to draw diner eyes to your best margin items.',
        },
      ],
    },
    reviews: {
      title: 'Dish Reviews & Reputation Tips',
      tips: [
        {
          heading: 'Authentic 1-5 Star Ratings',
          desc: 'Ratings appear on customer dish cards only after 3 verified reviews to ensure statistical fairness.',
        },
        {
          heading: 'Owner Replies',
          desc: 'Diners appreciate public acknowledgments! Replying to constructive feedback turns occasional guests into loyal regulars.',
        },
      ],
    },
    requests: {
      title: 'Service & Kitchen Console Tips',
      tips: [
        {
          heading: 'Realtime Table Calls',
          desc: 'Keep this screen open on your host counter or service tablet to hear chime alerts whenever a table needs water, bill, or service.',
        },
        {
          heading: 'Quick Resolve',
          desc: 'Tap "Mark Done" once a server attends to the table to keep the queue clean and track average response times.',
        },
      ],
    },
    design: {
      title: 'Design Studio Tips',
      tips: [
        {
          heading: 'Live Phone Simulation',
          desc: 'Notice how every theme, font, and button change reflects immediately in the phone preview on the right.',
        },
        {
          heading: 'Accessibility Contrast Check',
          desc: 'Keep an eye on the WCAG 2.2 AA rating badge. We automatically flag low contrast colors that may be hard for older diners to read.',
        },
      ],
    },
    insights: {
      title: 'Insights & Matrix Tips',
      tips: [
        {
          heading: 'Stars vs Hidden Gems',
          desc: 'Stars are your top sellers; keep quality high. Hidden Gems get lots of views but fewer orders—try testing a small promotional discount!',
        },
      ],
    },
    qr: {
      title: 'QR Studio & Print Templates',
      tips: [
        {
          heading: 'High-Contrast Scanning',
          desc: 'Always print dark codes on pure white backgrounds. Never invert colors. Maintain at least 4 cm size on table stands for fast camera scans.',
        },
        {
          heading: 'Matte Cardstock',
          desc: 'Avoid glossy lamination that causes harsh light reflections under dining room spotlights.',
        },
        {
          heading: 'Table-Specific vs Main Menu',
          desc: 'Table QR codes automatically attach ?table=N so guests can order without manually typing their table number.',
        },
      ],
    },
    settings: {
      title: 'Settings & Compliance Tips',
      tips: [
        {
          heading: 'Data Privacy & Ownership',
          desc: 'Export your complete menu and restaurant configuration anytime in open JSON format.',
        },
        {
          heading: 'Sold-Out Auto Reset',
          desc: 'Set to 6:00 AM so items marked sold out during dinner service automatically become available for the morning rush.',
        },
      ],
    },
  };

  const current = TIPS[activeSection] || TIPS.home;

  return (
    <div
      data-testid="help-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-[#12141C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{current.title}</h3>
              <p className="text-[11px] text-neutral-400">Short friendly advice for this screen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {current.tips.map((tip, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{tip.heading}</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <span>Need custom setup support?</span>
          <a
            href="mailto:support@digitalmenu.app"
            className="text-amber-400 hover:underline font-bold"
          >
            Contact Team
          </a>
        </div>
      </div>
    </div>
  );
}
