# Rukhsati — Project Status

Pakistan's marketplace for pre-loved wedding wear (`ruksati.com`).

## Web app (Next.js) — feature complete

| Area | Status |
|---|---|
| Auth (signup, email verification, login, reset) | Done |
| Listings (CRUD, filters, search, image search, wishlist) | Done |
| Chat + email + Web Push notifications | Done (push needs VAPID keys) |
| Reviews, orders, bookings, seller verification | Done |
| Admin panel (users, listings, reviews, payments, verifications) | Done |
| Sahara, My Wedding, size guide | Done |
| SEO (metadata, JSON-LD, sitemap) and PWA/TWA | Done |
| Payments (JazzCash) | Integrated — needs merchant credentials |

Quality gates: `tsc` clean, `eslint` 0 errors, `next build` passes.

## Mobile app (`mobile/`, Flutter) — new

Browse and filter, listing detail (gallery, call, WhatsApp, reviews), sign up / log in /
password reset, sell with photo upload, chat, my listings (pause / sold / delete), saved items.
Talks to the same API using `Authorization: Bearer` + `X-Client: mobile`.
`flutter analyze` is clean and unit tests pass. It has not been built as an APK/IPA or run on
a device or emulator in this environment — do that before publishing.

`flutter_app/` is the older prototype. It never matched the backend API and is superseded by
`mobile/`; it can be deleted.

## Before launch (needs your accounts)

1. MongoDB Atlas URI, `JWT_SECRET`
2. Resend API key (+ verified sending domain)
3. Cloudinary credentials (otherwise images are stored on local disk)
4. VAPID keys for push: `npx web-push generate-vapid-keys`
5. JazzCash merchant credentials
6. Run `QA_CHECKLIST.md` on a staging deploy

## Fixed in the latest pass

- Service worker no longer caches authenticated `/api` responses
- `/api/emails` was open to anyone (spam relay) — now admin-only
- Pause / Resume / Mark sold on My Listings now actually persists (the API ignored `status`)
- Native-app auth support (Bearer token), real Web Push, `.env.example`
