# Digital Menu: Master Launch Readiness Checklist
*Go-Live certification checklist for agency team and restaurant owner.*

---

## 🚀 1. Branding & Identity
- [x] Restaurant Name, Tagline, Address, Phone, and Currency configured.
- [x] Primary brand color and hover tokens verified for WCAG 2.2 AA contrast in both Light and Dark modes.
- [x] Vector logo mark and high-resolution logo uploaded.
- [x] Guest Wi-Fi SSID and Password tested on a clean phone.

## 🍽️ 2. Menu & Pricing Accuracy
- [x] All active categories arranged in standard dining order.
- [x] All items priced accurately with correct tax rate (default 8%).
- [x] Dietary flags attached (Vegan, Vegetarian, Gluten-Free, Halal, Nut-Free).
- [x] High-resolution, optimized food photos attached to hero and high-margin dishes.
- [x] "Sold Out Today" toggle verified to instantly grey out unavailable dishes on customer devices.

## 🏷️ 3. Promotions & Offers
- [x] Active deals verified (Happy Hours, Chef Specials, Combo Sets).
- [x] Automatic expiry tested (offers vanish when time expires without requiring app refresh).
- [x] Dish conflict detector active (prevents competing discounts on the same item).
- [x] Calm single-banner rule respected (never popups or modals).

## 🖨️ 4. QR Studio & Physical Table Stands
- [x] Branded QR codes generated with restaurant logo and theme tint.
- [x] Table deep-links tested (`?table=N`) to ensure customer cart maps to the correct table number.
- [x] Printed table stands measured to be at least 4 cm (1.6 in) on matte cardstock.
- [x] A4 batch cutting sheets printed with dashed guidelines.
- [x] High-contrast scanning tested in normal and dim restaurant lighting.

## 📱 5. PWA & Mobile UX
- [x] `manifest.webmanifest` configured with restaurant icons.
- [x] Service worker (`public/sw.js`) active and caching navigation routes and menu photos.
- [x] Graceful offline banner verified in Airplane Mode.
- [x] Repeat visitor install prompt appears only on visit 2+ and stays dismissed once closed.
- [x] Bottom-sheet dish modals draggable and dismissable.
- [x] Floating Order Bar floats cleanly above iOS home indicator.

## 🛡️ 6. Security, RLS & Rate Limiting
- [x] Row Level Security (RLS) active on 100% of PostgreSQL tables (`supabase/migrations/20261015_security_and_rls.sql`).
- [x] Public rate limiter active on waiter calls, orders, and review submissions (`src/lib/rate-limiter.ts`).
- [x] File upload rules limit images to 4MB and whitelist JPEG/PNG/WebP.
- [x] Zero server secret keys exposed in client bundles (`NEXT_PUBLIC_*` audit clean).
- [x] Security headers active in `next.config.ts` (HSTS, nosniff, SAMEORIGIN, strict-origin-when-cross-origin).

## 🔒 7. Privacy & Compliance
- [x] Cookieless, privacy-friendly analytics active (`src/lib/analytics.ts`).
- [x] Customer privacy notice live at `/[slug]/privacy`.
- [x] Tenant data export (JSON dump) functional in Admin Settings.
- [x] Historical guest log purge button active in Admin Settings.

## ⚡ 8. Performance & Reliability
- [x] Lighthouse targets met (90+ mobile on 4G throttling).
- [x] Google Fonts loaded via `next/font/google` with zero layout shift.
- [x] Error monitoring helper configured (`src/lib/error-monitor.ts`).
- [x] Friendly 404 pages configured (`not-found.tsx` and `[slug]/not-found.tsx`).
- [x] Global error boundary with retry button (`error.tsx`).

## 🌐 9. Deployment & CI
- [x] Vercel production deployment configured (`vercel.json`).
- [x] Custom domain DNS / CNAME instructions documented.
- [x] CI pipeline active running lint, `tsc --noEmit`, and Playwright tests (`.github/workflows/ci.yml`).
- [x] 38 automated test cases passing with 0 errors.
