# Custom Domains & Multi-Tenant Deployment Guide

This document describes how to deploy the Digital Menu platform on Vercel and route custom domains or subdomains for client restaurants.

---

## 🌐 Routing Models

### Model A: Shared Domain with Tenant Slugs (Default)
- **Format:** `https://digitalmenu.app/[slug]` (e.g. `https://digitalmenu.app/addis`)
- **Table Deep Link:** `https://digitalmenu.app/addis?table=14`
- **Setup:** Zero DNS setup required for the restaurant. Live immediately upon creating the slug.

### Model B: Client Subdomain
- **Format:** `https://menu.addisrestaurant.com`
- **Table Deep Link:** `https://menu.addisrestaurant.com?table=14`
- **DNS Configuration:**
  - Type: `CNAME`
  - Host / Name: `menu`
  - Target / Value: `cname.vercel-dns.com`

### Model C: Client Root Domain
- **Format:** `https://addismenu.com`
- **DNS Configuration:**
  - Type: `A`
  - Host / Name: `@`
  - Value: `76.76.21.21` (Vercel Anycast IP)

---

## 🛠️ Vercel Deployment Walkthrough

1. **Import Git Repository into Vercel:**
   - Link repository: `Urz1/Digital-Menu`.
   - Framework Preset: **Next.js**.
   - Build Command: `next build`.
   - Output Directory: `.next`.

2. **Add Environment Variables:**
   - Go to **Project Settings > Environment Variables**.
   - Add all variables listed in `.env.example`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_APP_URL`

3. **Attach Custom Domain in Vercel:**
   - Go to **Settings > Domains**.
   - Enter client domain (e.g. `menu.addisrestaurant.com`).
   - Vercel automatically issues an SSL certificate via Let's Encrypt within 60 seconds of DNS propagation.

4. **Multi-Tenant Middleware Rewrite (Optional for Dedicated Domains):**
   - For automatic hostname-to-slug mapping, Next.js middleware inspects `request.headers.get('host')`:
   - If host matches `menu.addisrestaurant.com`, the request is rewritten internally to `/addis`.
