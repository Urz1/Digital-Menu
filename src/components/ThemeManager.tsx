'use client';

import React, { useEffect } from 'react';
import { ThemeConfig } from '@/types/database';

interface ThemeManagerProps {
  themeConfig: ThemeConfig;
  children: React.ReactNode;
}

export function ThemeManager({ themeConfig, children }: ThemeManagerProps) {
  useEffect(() => {
    const root = document.documentElement;

    // Apply Dynamic Brand Color Tokens
    if (themeConfig.primaryColor) {
      root.style.setProperty('--primary', themeConfig.primaryColor);
      root.style.setProperty('--primary-hover', themeConfig.primaryHover || themeConfig.primaryColor);
    }
    if (themeConfig.accentColor) {
      root.style.setProperty('--accent', themeConfig.accentColor);
    }

    // Apply Border Radius Tokens
    const radiusMap: Record<string, string> = {
      sm: '6px',
      md: '12px',
      lg: '18px',
      full: '9999px',
    };
    root.style.setProperty('--radius-token', radiusMap[themeConfig.borderRadius] || '12px');

    // Apply Display Font Token
    if (themeConfig.fontFamily === 'serif') {
      root.style.setProperty('--font-brand', "'Playfair Display', Georgia, serif");
    } else if (themeConfig.fontFamily === 'sans') {
      root.style.setProperty('--font-brand', "var(--font-geist-sans), sans-serif");
    } else {
      root.style.setProperty('--font-brand', "'Outfit', sans-serif");
    }

    // Default Layout preference
    if (themeConfig.defaultLayout) {
      root.setAttribute('data-layout', themeConfig.defaultLayout);
    }
  }, [themeConfig]);

  return <div className="app-container min-h-screen transition-colors duration-200">{children}</div>;
}
