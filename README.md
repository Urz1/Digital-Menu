# Addis & Multi-Tenant Digital Menu Platform

> Production-ready, mobile-first digital restaurant & cafeteria menu web application built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase.

Designed for high-traffic restaurant environments where speed, thumb-friendly interaction, multi-tenancy, and real-time menu management are paramount. Open by scanning table QR codes on iOS and Android devices without installing any native app.

---

## 🌟 Key Features

### 📱 Customer Experience (Mobile-First)
- **Instant Load & Zero Friction**: Sub-second cold start with server-rendered initial shell and optimized Next.js WebP/AVIF images.
- **Dynamic Restaurant Branding**: Design tokens (primary brand color, border radius, typography) are loaded per restaurant tenant from Supabase. Each restaurant's custom look and feel is a data update, never a code redeployment.
- **Realtime Sold-Out & Price Sync**: Supabase Realtime automatically syncs dish availability toggles and price updates directly to customers' active screens without page refreshes.
- **Floating Cart & Order Bar**: Thumb-friendly bottom sticky order bar with haptic feedback, order preview sheet, table selection, and dietary summary.
- **Smart Search & Dietary Filters**: Instant client-side filtering for Vegetarian, Vegan, Halal, Gluten-Free, Dairy-Free, Nut-Free, and Chef Picks, with live result counters.
- **Interactive Modals**:
  - Item detail bottom-sheet with dietary tags, spice meters, ingredients, and allergen breakdown.
  - Waiter / Service assistance call modal (Water, Napkins, Server assistance, Bill request).
  - Digital Table QR generator for in-store printing and table-top placement.
  - Server card with quick-share and restaurant info.
  - Allergen legend modal explaining safety icons.
- **Progressive Web App (PWA)**: Web app manifest (`/manifest.webmanifest`) and Cache-First Service Worker (`/sw.js`) ensure full offline viewing under poor dining-room connectivity.
- **SEO & Rich Snippets**: Dynamic Open Graph preview cards and structured **Schema.org Menu** & **Restaurant** JSON-LD on all tenant routes for search engine indexing and social sharing.

### 🧑‍💼 Staff & Owner Console (`/admin`)
- **Role-Based Supabase Auth**: Secure role validation (`owner` and `staff`) via Supabase Auth (email/password and passwordless Magic Links).
- **No Insecure Client-Side PINs**: Hardened server-validated authentication with Row Level Security (RLS) policies enforcing tenant isolation.
- **Live Kitchen & Service Queue**:
  - Live order tracker with instant status transitions (`pending` ➔ `preparing` ➔ `served` ➔ `cancelled`).
  - Realtime service assistance requests (Table number, request type, timestamp, resolution toggle).
- **One-Click Item Availability**: Toggle dish availability ("Sold Out" / "In Stock") with immediate Realtime broadcast to all diners.
- **Live Brand Customizer**: Adjust primary hex color, font pairing, and card border radius on the fly with live preview.
- **Table QR Code Generator**: Generate and download printable table-specific QR codes with pre-filled table query parameters (e.g. `?table=12`).

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js](https://nextjs.org) (App Router, Server Components & Route Handlers) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict type safety, end-to-end models) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) with shadcn/ui design tokens & CSS custom properties |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL 15+ with Row Level Security enabled) |
| **Realtime** | Supabase Realtime Channels (`postgres_changes` on `items`, `orders`, `service_requests`) |
| **Authentication** | Supabase Auth (Magic Link & Email/Password with `owner` and `staff` roles) |
| **Validation** | [Zod](https://zod.dev/) schemas for runtime payload safety |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Offline/PWA** | Web App Manifest + Service Worker with stale-while-revalidate asset caching |
| **Deployment** | [Vercel](https://vercel.com/) / Docker |

---

## 📂 Project Directory Structure

```text
├── legacy/                          # Archived single-file HTML preview
│   └── index.html
├── public/
│   ├── sw.js                        # Cache-first service worker for PWA
│   └── icons/                       # PWA application icons
├── src/
│   ├── app/
│   │   ├── [slug]/                  # Multi-tenant public restaurant route (e.g. /addis)
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   ├── login/               # Supabase role-based auth login
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx             # Live orders, service calls & inventory manager
│   │   ├── layout.tsx               # Root layout, fonts, PWA registration
│   │   ├── page.tsx                 # Multi-tenant portal landing page
│   │   └── manifest.ts              # Dynamic Web App Manifest
│   ├── components/
│   │   ├── AllergenLegendModal.tsx  # Dietary & allergen guide modal
│   │   ├── CategoryTabs.tsx         # Horizontally scrollable sticky category bar
│   │   ├── ClientMenuContainer.tsx  # Customer menu state, cart & realtime listener
│   │   ├── FilterBar.tsx            # Sticky search bar & dietary badge filter pills
│   │   ├── ItemCard.tsx             # Appetizing dish cards with lazy images & badges
│   │   ├── ItemDetailModal.tsx      # Bottom-sheet modal with full dish breakdown
│   │   ├── MenuHeader.tsx           # Restaurant hero branding, wifi & server card trigger
│   │   ├── OrderBar.tsx             # Floating thumb-zone cart pill
│   │   ├── OrderSummarySheet.tsx    # Order review & table checkout bottom-sheet
│   │   ├── QrModal.tsx              # Printable Table QR code modal
│   │   ├── ServerCardModal.tsx      # Restaurant info & waiter tips modal
│   │   ├── ServiceAssistanceModal.tsx # Waiter call & napkin/bill request modal
│   │   ├── SettingsModal.tsx        # Accessibility, font size & language modal
│   │   └── ThemeManager.tsx         # Client dynamic CSS variable injector
│   ├── lib/
│   │   ├── data-provider.ts         # Unified Supabase data layer with offline fallback
│   │   ├── utils.ts                 # cn, formatMoney, haptic vibration
│   │   ├── validators.ts            # Zod validation schemas
│   │   └── supabase/
│   │       ├── client.ts            # Supabase browser client
│   │       └── server.ts            # Supabase SSR / Cookie-backed server client
│   └── types/
│       ├── database.ts              # Database schema TypeScript types
│       └── menu.ts                  # Cart, filter, allergen and order types
├── supabase/
│   └── migrations/
│       └── 20261014_init_digital_menu.sql # Complete PostgreSQL schema, RLS, and seed data
└── .env.example                     # Environment variables template
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `20.x` or higher
- A [Supabase](https://supabase.com) project (free tier works great)

### 2. Clone and Install Dependencies
```bash
git clone git@github.com:Urz1/Digital-Menu.git
cd "Digital Menu"
npm install
```

*(Note for Linux environments encountering IPv6 timeout on npm registry: use `NODE_OPTIONS="--dns-result-order=ipv4first" npm install`)*

### 3. Setup Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase project keys from your Supabase Dashboard (`Project Settings > API`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Apply Database Migrations & Seed Data
1. In your Supabase Dashboard, open the **SQL Editor**.
2. Copy and paste the contents of [`supabase/migrations/20261014_init_digital_menu.sql`](supabase/migrations/20261014_init_digital_menu.sql).
3. Click **Run**.

This script will:
- Create all core tables: `restaurants`, `categories`, `items`, `item_options`, `translations`, `orders`, `service_requests`, `staff_users`.
- Configure Row Level Security (RLS) policies allowing public read of active tenant menus and staff-authenticated write access.
- Enable Supabase Realtime publications on `items`, `orders`, and `service_requests`.
- Seed full production data for **Addis Cafeteria** (slug: `addis`) with 6 categories and 19+ authentic dishes.

### 5. Run the Local Development Server
```bash
npm run dev
```

Visit the following URLs in your browser:
- **Tenant Menu Demo (Addis)**: [http://localhost:3000/addis](http://localhost:3000/addis)
- **Staff / Owner Console**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Tenant Portal Home**: [http://localhost:3000](http://localhost:3000)

---

## 🍽️ Onboarding a New Restaurant Tenant

Adding a new restaurant does **not** require modifying or redeploying code.

Run this simple SQL snippet in your Supabase SQL editor:

```sql
-- 1. Insert new restaurant tenant
INSERT INTO public.restaurants (
    slug,
    name,
    tagline,
    description,
    primary_color,
    font_family,
    border_radius,
    currency,
    contact_phone,
    wifi_ssid,
    wifi_password
) VALUES (
    'le-petit-bistro',
    'Le Petit Bistro',
    'Artisanal French & Mediterranean Cuisine',
    'Chic neighborhood dining featuring seasonal organic ingredients.',
    '#2563eb',       -- Custom Royal Blue branding
    'sans-serif',
    '1rem',          -- Custom rounded corners
    'EUR',
    '+33 1 42 68 00 00',
    'LePetitBistro-Guest',
    'bonappetit'
);

-- 2. Add categories for the new tenant
INSERT INTO public.categories (restaurant_id, name, slug, sort_order)
SELECT id, 'Entrées', 'entrees', 1 FROM public.restaurants WHERE slug = 'le-petit-bistro';

-- 3. Add dishes under the category
INSERT INTO public.items (
    restaurant_id,
    category_id,
    name,
    description,
    price,
    is_available,
    dietary_tags
)
SELECT 
    r.id,
    c.id,
    'Soupe à l''Oignon Gratinée',
    'Classic caramelized French onion soup with aged Gruyère crouton.',
    12.50,
    true,
    ARRAY['vegetarian']
FROM public.restaurants r
JOIN public.categories c ON c.restaurant_id = r.id AND c.slug = 'entrees'
WHERE r.slug = 'le-petit-bistro';
```

Now navigate directly to `http://localhost:3000/le-petit-bistro` — the menu is live immediately with full search, ordering, and real-time capabilities!

---

## 🔐 Security & Role-Based Access Control (RBAC)

- **Owner Role**: Full permissions to edit restaurant metadata, branding tokens, update menu items, review analytics, and manage staff users.
- **Staff Role**: Permissions to update order status, resolve service assistance calls, and toggle item sold-out status.
- **Row Level Security (RLS)**: Enforced directly at the PostgreSQL level. Staff members can only view and mutate records belonging to their assigned `restaurant_id`.

---

## 🌐 Production Deployment (Vercel)

1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/new), import your `Digital-Menu` repository.
3. In **Settings > Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. Click **Deploy**. Vercel will build and deploy the Next.js App Router application worldwide on the edge.

---

## 📄 License
This project is licensed under the MIT License.
