'use client';

import React, { useEffect } from 'react';
import { ThemeConfig } from '@/types/database';
import { getStoredRestaurant } from '@/lib/data-provider';

export function hexToRgb(hex?: string): string {
  if (!hex) return '217, 72, 15';
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
  return '217, 72, 15';
}

export function applyThemeTokensToDOM(themeConfig?: ThemeConfig | null): void {
  if (typeof document === 'undefined' || !themeConfig) return;
  const root = document.documentElement;

  // 1. Dynamic Brand Color Tokens & RGB helpers for translucent backdrops
  if (themeConfig.primaryColor) {
    root.style.setProperty('--primary', themeConfig.primaryColor);
    root.style.setProperty('--primary-hover', themeConfig.primaryHover || themeConfig.primaryColor);
    root.style.setProperty('--primary-rgb', hexToRgb(themeConfig.primaryColor));
  }
  if (themeConfig.accentColor) {
    root.style.setProperty('--accent', themeConfig.accentColor);
    root.style.setProperty('--accent-rgb', hexToRgb(themeConfig.accentColor));
  }

  // 2. Border Radius Tokens
  const radiusMap: Record<string, string> = {
    sm: '6px',
    md: '12px',
    lg: '18px',
    full: '9999px',
  };
  root.style.setProperty('--radius-token', radiusMap[themeConfig.borderRadius] || '12px');

  // 3. Display Font Token
  if (themeConfig.fontFamily === 'serif') {
    root.style.setProperty('--font-brand', "'Playfair Display', Georgia, serif");
  } else if (themeConfig.fontFamily === 'sans') {
    root.style.setProperty('--font-brand', "var(--font-geist-sans), sans-serif");
  } else {
    root.style.setProperty('--font-brand', "'Outfit', sans-serif");
  }

  // 4. Default Layout preference
  if (themeConfig.defaultLayout) {
    root.setAttribute('data-layout', themeConfig.defaultLayout);
  }
}

interface ThemeManagerProps {
  themeConfig: ThemeConfig;
  children: React.ReactNode;
}

export function ThemeManager({ themeConfig, children }: ThemeManagerProps) {
  useEffect(() => {
    const cached = getStoredRestaurant();
    if (cached?.theme_config) {
      applyThemeTokensToDOM(cached.theme_config);
    } else {
      applyThemeTokensToDOM(themeConfig);
    }
  }, [themeConfig]);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              var raw = localStorage.getItem('digital_menu_restaurant_cache');
              if (raw) {
                var r = JSON.parse(raw);
                if (r && r.theme_config) {
                  var tc = r.theme_config;
                  var root = document.documentElement;
                  if (tc.primaryColor) {
                    root.style.setProperty('--primary', tc.primaryColor);
                    root.style.setProperty('--primary-hover', tc.primaryHover || tc.primaryColor);
                    var clean = tc.primaryColor.replace('#', '').trim();
                    if (clean.length === 6) {
                      var rV = parseInt(clean.substring(0, 2), 16);
                      var gV = parseInt(clean.substring(2, 4), 16);
                      var bV = parseInt(clean.substring(4, 6), 16);
                      root.style.setProperty('--primary-rgb', rV + ', ' + gV + ', ' + bV);
                    }
                  }
                  if (tc.accentColor) {
                    root.style.setProperty('--accent', tc.accentColor);
                  }
                }
              }
            } catch (e) {}
          `,
        }}
      />
      <div className="app-container min-h-screen transition-colors duration-200">{children}</div>
    </>
  );
}
