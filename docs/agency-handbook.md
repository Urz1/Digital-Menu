# Agency Handbook: Zero-to-Live Client Onboarding in Under 30 Minutes

This handbook provides the exact operational procedure for onboarding any restaurant client onto the Digital Menu platform in under 30 minutes.

---

## ⏱️ The 30-Minute Speed Run

| Time Window | Milestone | Key Steps |
|---|---|---|
| **00:00 – 05:00** | **Tenant Creation** | Create restaurant record in database or via Admin Onboarding Wizard. Configure slug (e.g. `/addis`), restaurant name, currency, tax rate, and Wi-Fi credentials. |
| **05:00 – 12:00** | **Brand Styling** | Upload high-resolution logo or set stylized logo mark. Select brand primary color, typography (e.g. Playfair Display or Modern Sans), border radius token, and default menu layout (list vs. 2-column grid). |
| **12:00 – 20:00** | **Menu Ingestion** | Create core categories (Starters, Mains, Desserts, Craft Drinks). Input menu items with prices, descriptions, dietary flags (Vegan, GF, Halal), and photo URLs. |
| **20:00 – 25:00** | **QR Studio Generation** | Open **QR Studio** in Admin. Select table range (e.g. Tables 1–20). Export SVG vector files for commercial print shop or print A4 foldable table tents immediately. |
| **25:00 – 30:00** | **Real Phone Check & Handover** | Run the 5-point mobile smoke test on iPhone Safari & Android Chrome. Grant Owner credentials to client and conduct a 5-minute handover walkthrough. |

---

## 🚀 Step-by-Step Onboarding Execution

### Step 1: Restaurant Provisioning (5 mins)
1. Open Admin console at `/admin`.
2. Click **Start 5-Minute Setup Wizard** on the Home dashboard.
3. Enter:
   - **Restaurant Name:** (e.g. *Afla Restaurant & Lounge*)
   - **Slug:** `afla` (URL will be `yourdomain.com/afla`)
   - **Currency Code:** `ETB` or `USD`
   - **Guest Wi-Fi:** SSID and Password for diners.
4. Click **Save & Continue**.

### Step 2: Visual Identity & Design Studio (7 mins)
1. Navigate to **Design Studio** in the admin sidebar.
2. Pick the brand's primary color using the palette or hex picker (e.g. `#E8590C`).
3. Set the layout style:
   - **List View:** Best for fine dining with detailed tasting notes and pairings.
   - **Grid View:** Best for fast-casual, cocktail lounges, and photo-heavy menus.
4. Verify dynamic contrast: Ensure text labels remain legible in both Light Mode and Dark Mode.

### Step 3: Menu Structure & Specials (8 mins)
1. Go to **Menu & Dishes**.
2. Add categories in dining order (e.g., Appetizers → Mains → Desserts → Beverages).
3. Populate dishes:
   - Mark hero items as **"Featured"** or **"Chef's Choice"**.
   - Attach dietary chips (Vegetarian, Vegan, Gluten-Free, Nut-Free).
   - If Happy Hour applies, navigate to **Offers & Deals** and create a time-window discount (e.g. 20% off craft cocktails Mon–Fri 4–7 PM).

### Step 4: Generate Branded Table QRs (5 mins)
1. Click **QR Studio** in the admin navigation.
2. Select **Table Specific** target.
3. Choose template format:
   - **Foldable Table Tent:** Dual-sided stand with restaurant branding and Wi-Fi.
   - **Compact Sticker:** Circular badge for table corners or coasters.
   - **A4 Cut Sheet:** Batch of 6–8 table codes on a single printable sheet with cutting guidelines.
4. Export:
   - Click **Download SVG** for vector engraving or acrylic stand printing.
   - Click **Print Stand / PDF** for instant on-site printing.

---

## 🤝 Client Handover Protocol

### 1. Granting Access to the Owner
1. Provide the owner their private admin URL: `https://yourdomain.com/admin`.
2. Explain the 3 Role consoles:
   - **Owner Console:** Full control over branding, prices, offers, reviews, and settings.
   - **Manager Console:** Menu edits, price updates, offer scheduling, and review moderation.
   - **Staff Console:** Focused on live kitchen orders, service calls, and one-tap **"Sold Out"** toggles.

### 2. The 3 Golden Rules for Owners
1. **Never delete genuine negative reviews:** Customers trust authentic 4.2-star menus far more than artificial 5.0-star menus. Use the built-in Staff Reply tool to turn unhappy guests into loyal regulars.
2. **Use "Sold Out Today" early:** If kitchen inventory runs low, tap the item toggle immediately. It updates customer phones in real time with zero reload.
3. **Print QR codes on matte paper:** Glossy laminate causes light reflections under dining room spotlights, which slows down camera scanning.
