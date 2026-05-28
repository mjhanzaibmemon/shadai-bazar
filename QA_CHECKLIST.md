# Rukhsati — QA Testing Checklist

Use this checklist before every major release. Run all flows in **two different browsers/devices** with separate accounts (one buyer, one seller).

---

## 🧪 Test Accounts Setup

| Role | Email | Notes |
|---|---|---|
| Admin | mjhanzaibmemon123@gmail.com | Full access, exempted from email verification |
| Seller A | test-seller-a@yopmail.com | Use yopmail.com for disposable real emails |
| Buyer B | test-buyer-b@yopmail.com | Same |

> Tip: yopmail.com gives free real inboxes — you can verify the email actually arrived.

---

## ✅ Smoke Test (5 min — run before every deploy)

- [ ] Home page loads at `https://ruksati.com`
- [ ] Listings grid shows at least 1 item
- [ ] Click a listing → detail page loads
- [ ] Login as existing user → redirects to home
- [ ] Logout → returns to home, navbar updates
- [ ] No console errors (open DevTools)

---

## 🔐 Auth Flow

### Signup
- [ ] Form validates: empty fields blocked, password < 6 chars rejected
- [ ] Phone validation: `03001234567` accepted, `123` rejected
- [ ] Fake email (e.g. `test@xyz.com`) shows "Check Your Email" screen
- [ ] Verification email arrives in inbox within 30 seconds
- [ ] Welcome email arrives AFTER verification (not before)

### Login
- [ ] Wrong password → "Invalid email or password"
- [ ] Unverified email → 403 with amber resend banner
- [ ] "Resend verification email" button works and shows success state
- [ ] After verification → can login normally
- [ ] Login redirects to home page

### Forgot Password
- [ ] `/forgot-password` form accepts email
- [ ] Reset email arrives with HTTPS link (not http://IP)
- [ ] Reset link works → new password set → can login

---

## 🛒 Listings

### Browse
- [ ] Home page shows featured + recent listings
- [ ] Listing card click → opens detail page
- [ ] Wishlist heart icon: logged-out user redirected to login
- [ ] Wishlist heart icon: logged-in user toggle works (persists on refresh)
- [ ] Featured badge shows on featured listings
- [ ] Discount % badge shows when originalPrice > price

### Detail Page
- [ ] Image gallery — main image + thumbnails
- [ ] **NEW:** Left/Right arrows for images (if >1 image)
- [ ] **NEW:** Image counter (1/N) shows
- [ ] **NEW:** Share button works (copies link / shares natively)
- [ ] WhatsApp button opens correct number with prefilled message
- [ ] Chat with Seller button shows loading state when clicked
- [ ] Own listing shows "This is your listing" instead of chat button
- [ ] Logged-out user sees "Login to chat" button

### Post Listing (Sell)
- [ ] Step 1-5 navigation works
- [ ] Validation error scrolls to top (so user sees it)
- [ ] Image upload — 10 image limit enforced
- [ ] Image size > 5MB rejected with clear error
- [ ] Required fields blocked at each step
- [ ] Successful submit → redirects to my-listings
- [ ] New listing appears in "My Listings"

---

## 💬 Messaging

### Send Message
- [ ] Open a listing as Buyer B → "Chat with Seller"
- [ ] Loading spinner appears on button while navigating
- [ ] Chat opens with pre-filled message "Salam! I'm interested..."
- [ ] Send button shows spinner while sending
- [ ] Message appears in chat immediately after send
- [ ] Logout buyer, login as Seller A

### Receive Message
- [ ] Navbar shows red badge with unread count
- [ ] My Listings page shows red "💬 N" badge on the listing
- [ ] Click badge → opens chat filtered to that listing
- [ ] Messages from buyer visible
- [ ] Reply works
- [ ] Listing image shows in chat header (or hides if broken)

### Edge Cases
- [ ] Cannot message yourself (400 error)
- [ ] Invalid receiver ID rejected (400, not 500)
- [ ] Polling: leave seller's tab open, buyer sends → badge updates within 30s

---

## 🏠 My Listings (Seller Dashboard)

- [ ] All seller's listings show (active/paused/sold filters work)
- [ ] **NEW:** Messages column shows per-listing unread count
- [ ] **NEW:** 0-count listings show gray "💬 0" pill (clickable)
- [ ] Pause button: shows spinner while toggling
- [ ] Activate button: same
- [ ] Edit button → `/sell?edit=<id>` (form pre-fills with existing data)
- [ ] Delete button → modal opens
- [ ] **NEW:** Delete error shows in modal (not silent fail)
- [ ] Successful delete: listing removed from table

---

## 🧭 Navigation

- [ ] Navbar logo → home
- [ ] **NEW:** Inbox badge in navbar (logged-in only) → opens chat
- [ ] User dropdown → My Listings, Verify, Orders, etc.
- [ ] Mobile menu — hamburger opens, all links work
- [ ] **NEW:** Mobile menu shows inbox link with unread count
- [ ] Admin badge shows for admin users only
- [ ] Language toggle EN/UR switches

---

## 🔗 Footer Links (formerly dead)

- [ ] **NEW:** Privacy Policy → `/privacy` page loads
- [ ] **NEW:** Terms & Conditions → `/terms` page loads
- [ ] **NEW:** Contact Us → `/contact` page loads with email/WhatsApp links
- [ ] Sahara link → `/sahara` works
- [ ] Email link opens mail client
- [ ] Phone link opens dialer on mobile

---

## 📱 PWA / Android App

- [ ] Install prompt appears (Chrome on Android after 30s)
- [ ] Add to Home Screen creates app icon (Rukhsati R + gold)
- [ ] APK install (TWA): URL bar hidden
- [ ] Splash screen shows on app launch
- [ ] All flows work in standalone mode

---

## 🔍 Search

- [ ] Text search → results page
- [ ] Image search > 5MB → inline error (not browser alert)
- [ ] Image search fails → inline error (not browser alert)
- [ ] Voice search (Chrome) — toggle EN/UR
- [ ] Search with no results → "No results found" message

---

## 📧 Emails (Resend)

Open Resend dashboard → Emails tab. Verify these emails actually sent:

- [ ] Verification email on signup
- [ ] Welcome email on email verification (NOT on signup)
- [ ] Password reset email
- [ ] New message email (when buyer messages seller)

---

## 🚨 Critical Bugs To Watch For

- [ ] Console errors on any page (DevTools → Console)
- [ ] Network 5xx errors (DevTools → Network → Fetch/XHR)
- [ ] Buttons that look enabled but do nothing
- [ ] Forms that submit without showing loading state
- [ ] Race conditions: rapid click 5x → only 1 result
- [ ] Layout shift (CLS) on load

---

## 🤖 Automated Build Check

Before deploying:
```bash
cd "shaadi-bazaar"
npm run build       # Must exit clean
npm run lint        # Check warnings
```

---

## 🚀 Deploy Checklist

- [ ] All checklist items above ✓
- [ ] `git status` clean
- [ ] Build passes locally
- [ ] `git push origin main`
- [ ] SSH to Hetzner: `git pull && npm run build && pm2 restart shaadi-bazaar`
- [ ] Visit live site, smoke test (top of this doc)

---

## 📊 Production Monitoring

Weekly:
- [ ] Check Resend dashboard → email delivery rate
- [ ] PM2 logs: `pm2 logs shaadi-bazaar --lines 200`
- [ ] MongoDB size: `mongosh shaadi-bazaar --eval 'db.stats()'`
- [ ] Disk space on server: `df -h`

Monthly:
- [ ] Backup MongoDB: `mongodump --db shaadi-bazaar --out /home/backups`
- [ ] Backup uploads folder
- [ ] Review Cloudflare analytics
