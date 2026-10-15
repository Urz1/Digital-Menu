# Real Device Pre-Launch Testing Checklist
*Must be completed on physical hardware (iPhone Safari and Android Chrome) before handing over the digital menu to restaurant management.*

---

## 📱 Hardware & Browser Matrix

- [ ] **Device A: Apple iPhone** (iOS 16+ running Safari mobile browser)
- [ ] **Device B: Android Phone** (Google Chrome or Samsung Internet mobile browser)

---

## 🔍 Section 1: Physical QR Scanning & Print Reliability
*Test using printed table stand sample under normal dining room lighting:*

- [ ] **Scan Distance Test:** Camera scans QR code effortlessly from a natural sitting distance (20–40 cm / 8–16 inches).
- [ ] **Anti-Glare Check:** QR stand printed on matte/satin finish shows no blinding specular highlights under overhead spotlights.
- [ ] **Contrast Verification:** QR code pattern is crisp black/dark charcoal on a solid pure-white background.
- [ ] **Deep Link Parameter:** Scanning redirects to `https://domain.com/[slug]?table=X` and assigns the correct table number in the top header.

---

## 🍽️ Section 2: Mobile Menu Interactions & Ergonomics

- [ ] **Safe Area Padding:** Header does not collide with the iPhone Dynamic Island / notch, and bottom Order Bar stays above the home indicator line (`env(safe-area-inset-bottom)`).
- [ ] **Category Scrolling:** Horizontal category pills scroll fluidly without momentum jank. Sticky tabs remain visible while browsing dishes.
- [ ] **Bottom-Sheet Dish Modal:** Tapping an item opens the sheet smoothly. Dragging down with a finger or tapping backdrop dismisses cleanly.
- [ ] **Quantity & Options Controls:** Steppers (+ / -) respond with tactile feedback. Adding required options recalculates the line total instantly.
- [ ] **Search Experience:** Search drawer opens with virtual keyboard. Typing filters dishes instantly with no input lag.

---

## 📶 Section 3: PWA & Offline Resilience Pass

- [ ] **First Visit Test:** Verify that no aggressive pop-up or install prompt interrupts the guest's initial menu browsing.
- [ ] **Repeat Visit Test:** Visit the URL a second time. Verify that a calm, subtle **"Install Addis Menu"** banner appears with an easy dismiss `(X)` button.
- [ ] **Airplane Mode Simulation:**
  1. Load the restaurant menu while connected.
  2. Switch phone to **Airplane Mode** (no Wi-Fi, no Cellular).
  3. Reload the page or navigate between categories.
  4. Verify the graceful amber **"Offline Mode — showing cached menu and offline cart"** banner appears.
  5. Confirm menu items, photos, and bookmarks remain accessible offline.

---

## 🔔 Section 4: Live Service Calls & Kitchen Orders

- [ ] **Waiter Service Call:**
  - Tap **Call Waiter** from header.
  - Choose service type ("Water Refill" or "Request Bill").
  - Verify instant vibration/haptic feedback and calm confirmation toast.
  - Check the kitchen staff console (`/admin`): Verify the alert rings with high visual priority in the requests inbox.
- [ ] **Kitchen Order Submission:**
  - Build a test cart with 2 dishes.
  - Open Order Summary Sheet and confirm the order.
  - Verify the order appears in real-time on the `/admin` Kitchen Queue without page refresh.

---

## ♿ Section 5: Accessibility & Contrast Audit

- [ ] **Reduced Motion:** Turn on "Reduce Motion" in iOS Settings (`Accessibility > Motion > Reduce Motion`). Verify that bottom sheet and dish tabs transition without disorienting slides or zoom effects.
- [ ] **Dark Mode Contrast:** Switch phone between Light and Dark mode. Confirm all ingredients, price tags, and allergens remain comfortably legible with at least 4.5:1 contrast.
- [ ] **Touch Targets:** All interactive icons, chips, and buttons have at least 44x44px touch bounding boxes to prevent accidental mis-taps.
