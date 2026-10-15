# Threat Checklist & Security Architecture
*Security controls and vulnerability mitigation for the Digital Menu multi-tenant platform.*

---

## 🛡️ Top Threat Vector Mitigations

| Threat Vector | Risk Level | Architectural Countermeasure | Verification Status |
|---|---|---|---|
| **Cross-Tenant Data Leakage** | Critical | PostgreSQL Row Level Security (RLS) enabled on 100% of tables (`restaurants`, `categories`, `menu_items`, `orders`, `service_requests`, `offers`, `dish_reviews`). Tenants can only view and mutate their own data via `auth.uid()` checks. | Verified via `supabase/migrations/20261015_security_and_rls.sql` |
| **SQL Injection (SQLi)** | High | All database operations execute through Supabase client libraries and PostgREST with strict parameterized queries. No raw dynamic string concatenation. | Zero raw SQL concatenation in codebase |
| **Cross-Site Scripting (XSS)** | High | React 19 App Router automatic JSX text escaping; dangerouslySetInnerHTML restricted solely to static JSON-LD Schema.org and PWA service worker registration. | Strict CSP headers active in `next.config.ts` |
| **Public Order / Waiter Spam DoS** | High | Sliding-window token-bucket rate limiting (`src/lib/rate-limiter.ts`) enforcing maximum 3 waiter calls per 2 minutes per table and 4 orders per 5 minutes per table. | Validated in rate limiter unit test suite |
| **Malicious File Uploads** | Medium | Supabase Storage bucket policy limits uploads to 4MB ceiling and strictly enforces MIME type whitelisting (`image/jpeg`, `image/png`, `image/webp`). Executable binaries and SVG script injection are rejected. | Enforced in storage RLS migration |
| **Client Secrets Exposure** | Critical | Zero server keys or service role secrets exposed in client bundles. `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to server-side tasks. | Codebase audited: only `NEXT_PUBLIC_*` safe keys exposed |
| **Clickjacking & MIME Sniffing** | Medium | HTTP security response headers configured in `next.config.ts`: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. | Configured and active on all routes |
| **Review Spam & Toxic Content** | Medium | Automated profanity regex filtering, 1 review per dish per session lock, bot honeypot detection, and 5-review velocity limit per 10 minutes. | Validated in Stage 4 review engine |

---

## 📋 Pre-Launch Security Sign-Off Protocol
1. Confirm Supabase production database has RLS enforced on all tables.
2. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set solely in private environment variables (Vercel Project Settings) and never committed to Git.
3. Validate that client browser cannot read private administrative metrics without valid authenticated owner session.
