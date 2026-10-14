# Aura Bistro — Mobile-First Digital Restaurant Menu 🍽️

A lightweight, single-file (`HTML`, `CSS`, and vanilla `JS`), mobile-first digital restaurant menu web app designed specifically for table QR code scanning. Built with zero dependencies, instantaneous load times, tactile haptic feedback, and a luxurious culinary aesthetic.

![Digital Menu Screenshot](https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Key Features

### Design & Mobile Experience
- **Ultra-Fast & Mobile-First**: Optimized for 360–430px smartphone viewports with graceful scaling to tablets and desktops.
- **Refined Typography**: Editorial pairing of **Playfair Display** (headings) with ultra-clean **Plus Jakarta Sans** (body & meta).
- **Smooth Micro-Animations**: Native-feeling transitions (<250ms), tap scaling, and tactile haptic vibration simulation.
- **Unified Sticky Header**: Logo, restaurant status, live search, and horizontally scrollable category bar that tracks scroll position (`IntersectionObserver`).
- **Bottom-Sheet Details**: Slide-up sheet with hero imagery, full ingredient descriptions, spice indicators, allergen disclosures, and customizable add-ons.
- **List & Grid Views**: Diners can toggle between an editorial list layout and a compact 2-column photo grid.
- **Full Dark Mode**: Auto-detects device OS preference (`prefers-color-scheme: dark`) with manual light/dark overrides.

### Customer Dining Features
- **Instant Search**: Real-time filtering across dish names, ingredients, descriptions, and dietary tags.
- **Dietary Filter Chips**: Quick filtering for ⭐ *Chef's Picks*, 🌱 *Vegetarian*, 🌿 *Vegan*, 🌾 *Gluten-Free*, 🥩 *Halal*, 🌶️ *Spicy*, and 🥜 *Nut-Free*.
- **Session Favorites**: Save favorite dishes with a heart tap, preserved in session storage.
- **"My Order" Floating Bar**: Keeps a live item count and running total in the natural bottom thumb zone.
- **"Show to Waiter" Mode**: High-contrast full-screen view with enlarged table number and items, so diners can hold up their screen to the server in noisy environments.
- **"Call Server" Assistance**: One-tap requests for waiter assistance, water refills, extra napkins/cutlery, or the check.
- **Allergen & Dietary Legend**: Built-in visual guide explaining all icons and kitchen safety commitments.

### 4 Ready-Made Atmosphere Themes
Driven entirely by CSS custom properties (`--primary`, `--surface`, `--bg`, `--border`):
1. **Modern Minimal** (Default): Crisp slate with vibrant citrus amber.
2. **Classic Elegance**: Warm champagne gold, rich espresso, and ivory velvet.
3. **Bold Dark**: High-energy midnight obsidian with electric coral neon.
4. **Warm Rustic**: Terracotta clay, Tuscan olive, and hearth linen.

### Multi-Language Support
- Built-in bilingual support (**English** & **Español**), switchable on the fly with instantaneous translation of all interface strings.

---

## 📱 How to Generate Table QR Codes

When hosting this menu (e.g. on GitHub Pages, Netlify, or your domain), customers scan a QR code at their table to open the menu.

### 1. Dynamic Table Number Parameter
The app automatically detects the table number from the URL query parameter:
```
https://your-domain.com/?table=14
https://your-domain.com/?table=VIP-2
```
When scanned, the menu automatically personalizes the dining session to that table for orders and server assistance calls.

### 2. Free QR Code Generation Tools
You can generate high-resolution QR codes using any of the following:
- **Free Online Generator**: [QR Code Generator](https://www.qr-code-generator.com/) or [QR Code Monkey](https://www.qrcode-monkey.com/) (allows embedding your logo in SVG/PNG format).
- **Chrome Browser**: Right-click anywhere on the deployed page and select **"Create QR code for this page"**.
- **CLI / Curl Generator**:
  ```bash
  curl "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://your-domain.com/?table=1" -o table_01_qr.png
  ```

### 3. Print Recommendations for Restaurant Tables
- **Size**: 2.5" × 2.5" (65mm × 65mm) minimum for easy scanning under ambient restaurant lighting.
- **Finish**: Matte lamination or acrylic table-tent inserts to prevent glare from overhead chandeliers or sunlight.
- **Call-to-Action**: Include a short prompt such as *"Scan with your camera to explore our menu & specials"*.

---

## 🛠️ Owner Customization Guide

All restaurant details, categories, items, and settings are configured in **one place** inside `index.html`.

### 1. Edit Restaurant Information
Look for `MENU_CONFIG.restaurant` near the bottom of `index.html`:
```javascript
restaurant: {
  name: "Aura Bistro & Lounge",
  shortName: "Aura Bistro",
  logoLetter: "A",
  tagline: "Contemporary Artisanal Dining & Craft Mixology",
  currency: "$",
  currencyCode: "USD",
  defaultTable: "Table 14",
  hours: "Tue – Sun: 11:30 AM – 11:00 PM",
  address: "742 Evergreen Terrace, Culinary Arts District",
  wifi: {
    ssid: "Aura-Guest",
    password: "tastethevibes"
  },
  announcement: "✨ Chef's Seasonal Truffle Menu is now available!",
}
```

### 2. Adding or Editing Dishes
Each item in `MENU_CONFIG.items` has a simple JSON structure:
```javascript
{
  id: "mains-1",
  categoryId: "mains",
  name: "45-Day Dry-Aged Prime Ribeye (14oz)",
  name_es: "Ribeye Prime Madurado 45 Días (14oz)",
  description: "Cast-iron seared USDA Prime ribeye with bone marrow butter...",
  price: 54.00,
  image: "https://images.unsplash.com/...",
  tags: ["chefsPick", "gluten-free", "halal"],
  allergens: ["Dairy"],
  spiceLevel: 0,        // 0 = none, 1 = mild, 2 = medium, 3 = hot
  soldOut: false,       // <-- Set to true to mark SOLD OUT instantly!
  chefsPick: true,      // <-- Set to true to highlight with a golden badge!
  options: [
    { name: "Cooking: Rare", price: 0 },
    { name: "Cooking: Medium Rare", price: 0 },
    { name: "Add Jumbo Garlic Butter Prawns +$12.00", price: 12.00 }
  ]
}
```

### 3. Marking Items "Sold Out" or "Chef's Pick"
- **To mark Sold Out**: Set `soldOut: true`. The item will automatically dim, display a "Sold Out" badge, and disable the order button.
- **To promote a dish**: Set `chefsPick: true`. The item will display a prominent gold badge and appear in the "⭐ Chef's Picks" quick filter.

---

## 🚀 Deployment

Because the entire app is contained in a single static `index.html` file, it can be deployed anywhere with zero build configuration:

### GitHub Pages
1. Push this repository to GitHub (`https://github.com/Urz1/Digital-Menu.git`).
2. Go to **Settings** > **Pages** in your repository.
3. Under **Branch**, select `main` and `/ (root)`.
4. Click **Save**. Your menu will be live at `https://Urz1.github.io/Digital-Menu/` within seconds!

### Netlify / Vercel / Cloudflare Pages
- Drag and drop this folder directly into the Netlify or Vercel dashboard.

---

## 📋 Assumptions Made
1. **Ordering & Waiter Communication**: In accordance with the prompt, this app does not process real-time credit card payments. Instead, it provides a "Show to Waiter" card and server alert notifications designed for frictionless dine-in ordering.
2. **Table Number Persistence**: The app checks the URL for `?table=XX` (e.g. from unique table QR codes) and falls back to the default configured table number if none is provided. Diners can also manually edit their table in settings.
3. **Session Persistence**: Cart items and favorites are kept in `sessionStorage` so a diner's order and favorites persist through page refreshes during their meal without cluttering permanent storage across multiple visits.
4. **Image Fallbacks**: In addition to online Unsplash food photos, an inline SVG plate placeholder is bundled to gracefully handle network dropouts on slow mobile networks.
