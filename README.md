# Rukhsati

Pakistan's marketplace for pre-loved wedding wear — bridal, groom, guest outfits, jewelry, footwear and accessories. Live at **https://ruksati.com**.

**Stack:** Next.js 16 (App Router) · TypeScript · MongoDB/Mongoose · Tailwind 4 · Zod · Resend (email) · Cloudinary (images) · JazzCash (payments) · Web Push · PWA/TWA.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in MONGODB_URI and JWT_SECRET at minimum
npm run dev                  # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run smoke` | Automated smoke test (`scripts/smoke-test.mjs`) |
| `npm run make-admin` | Promote a user to admin |
| `npm run reset-password` | Admin password recovery |
| `npm run icons` | Regenerate PWA icons |

## Features

- **Auth:** signup, email verification (required to log in), login, forgot/reset password, rate limiting
- **Listings:** create/edit/delete, categories, filters, search, image search, wishlist (shareable)
- **Chat:** buyer–seller messaging, unread counts, email + web push notifications
- **Reviews & seller ratings**, orders, bookings, seller verification
- **Admin:** users, listings, reviews, payments, verifications
- **Sahara:** donations and help requests for families
- **My Wedding:** wedding planner profile
- **SEO:** per-page metadata, Product JSON-LD, sitemap, robots
- **PWA / TWA:** installable, offline shell, Play Store ready (`assetlinks.json`)

## Web Push setup

```bash
npx web-push generate-vapid-keys
```

Put the keys in `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`. Until they are set, the notifications toggle is hidden and nothing is sent.

## Mobile clients

The API accepts the auth cookie (web) **or** an `Authorization: Bearer <token>` header (native apps). A native client logs in with the header `X-Client: mobile` and receives the token in the JSON body; browsers never get the token in the body.

## Docs

`DEPLOYMENT.md` · `PRODUCTION_SETUP.md` · `QA_CHECKLIST.md` · `FLUTTER_SETUP.md`
