# Shaadi Bazaar — Production Setup Guide

Sab free-tier services use kar rahe hain. Yeh guide step-by-step batayega kaise har service signup karke API keys app mein add karni hain.

**Total monthly cost: $0** (until you outgrow free tiers)

---

## 1. MongoDB Atlas (Database) — FREE 512MB

Pakistan ka data backup-safe + multi-region. EC2 ki local MongoDB sirf demo ke liye.

### Steps:
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/email
3. Create a free **M0 Sandbox** cluster:
   - Cloud: AWS
   - Region: Mumbai (ap-south-1) — closest to Pakistan
   - Cluster name: `shaadi-bazaar`
4. Database Access → Add Database User
   - Username: `shaadi-app`
   - Password: generate strong (save it!)
   - Built-in role: `Atlas admin`
5. Network Access → Add IP Address → **Allow Access From Anywhere** (`0.0.0.0/0`)
6. Connect → Drivers → Node.js → Copy the connection string:
   ```
   mongodb+srv://shaadi-app:<password>@shaadi-bazaar.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your actual password
8. Add `/shaadi-bazaar` before the `?` to set the database name

### Migrate existing data:
```bash
# On EC2:
mongodump --db shaadi-bazaar --out /tmp/dump
mongorestore --uri "mongodb+srv://..." /tmp/dump/shaadi-bazaar --db shaadi-bazaar
```

### Update environment:
```bash
# Edit /home/ubuntu/shadai-bazar/ecosystem.config.js
# Change MONGODB_URI to the Atlas connection string
pm2 restart shaadi-bazaar --update-env
```

---

## 2. Cloudinary (Image Hosting) — FREE 25GB + 25k transformations/month

Listings ki photos ab cloud pe rahegi, EC2 disk safe.

### Steps:
1. Go to https://cloudinary.com/users/register_free
2. Sign up (use Google for fastest)
3. Dashboard → copy these 3 values:
   - **Cloud name** (e.g., `shaadibazaar`)
   - **API Key**
   - **API Secret**
4. Add to EC2 PM2 ecosystem:
   ```js
   // ecosystem.config.js
   env: {
     // ... existing ...
     CLOUDINARY_CLOUD_NAME: 'your-cloud-name',
     CLOUDINARY_API_KEY: 'your-key',
     CLOUDINARY_API_SECRET: 'your-secret',
   }
   ```
5. `pm2 restart shaadi-bazaar --update-env`

**Code already handles fallback** — if env vars missing, images save to local disk (current behavior).

---

## 3. Resend (Email Service) — FREE 100 emails/day, 3000/month

Welcome emails, email verification, password reset, order notifications, chat notifications.

### Steps:
1. Go to https://resend.com/signup
2. Sign up with Google/GitHub
3. **Without your own domain** (start here): use the testing email `onboarding@resend.dev` — emails can only send to your verified email address.
4. **With your own domain** (later): Add Domain → DNS records → Verify → can send from `noreply@yourdomain.com`
5. API Keys → Create API Key (e.g., "shaadi-bazaar-production")
6. Copy the key (starts with `re_...`)
7. Add to ecosystem.config.js:
   ```js
   env: {
     RESEND_API_KEY: 're_your_key_here',
     FROM_EMAIL: 'Shaadi Bazaar <onboarding@resend.dev>',  // or your verified domain email
   }
   ```
8. `pm2 restart`

**Free tier**: 100 emails/day. If you outgrow → upgrade to $20/mo for 50k emails.

---

## 4. JazzCash Sandbox (Payments) — FREE for testing

Real payment integration for buying listings + featured-listing fees.

### Steps:
1. Go to https://sandbox.jazzcash.com.pk/ → Register as Merchant
2. Or contact JazzCash sales: https://www.jazzcash.com.pk/business/
3. After approval you get:
   - **Merchant ID** (e.g., MC12345)
   - **Password**
   - **Integrity Salt** (HMAC key)
4. Add to ecosystem.config.js:
   ```js
   env: {
     JAZZCASH_MERCHANT_ID: 'MC12345',
     JAZZCASH_PASSWORD: 'xxxxxxxx',
     JAZZCASH_INTEGRITY_SALT: 'xxxxxxxxxxxx',
     NEXT_PUBLIC_BASE_URL: 'https://44-248-29-160.sslip.io',
   }
   ```
5. `pm2 restart`

**Production**: Once tested, switch from sandbox URL to `https://payments.jazzcash.com.pk/...` in `src/lib/jazzcash.ts`.

**Without these env vars**: Code falls back to "payment record only" mode — order placed but no real payment.

---

## 5. Web Push Notifications — FREE (just VAPID keys)

Push notifications when buyer sends message or order placed.

### Steps:
1. Generate VAPID keys (one-time):
   ```bash
   # On EC2 or locally
   npx web-push generate-vapid-keys
   ```
   You'll get two keys: `Public Key` and `Private Key`.
2. Add to ecosystem.config.js:
   ```js
   env: {
     NEXT_PUBLIC_VAPID_PUBLIC_KEY: 'BPxxxx...',
     VAPID_PRIVATE_KEY: 'xxx',
     VAPID_SUBJECT: 'mailto:mjhanzaibmemon123@gmail.com',
   }
   ```
3. Install `web-push` for actual sending (when ready):
   ```bash
   npm install web-push
   ```
4. `pm2 restart`

---

## 6. Plausible Analytics — FREE (self-hostable) or $9/mo

Privacy-friendly, GDPR-compliant. No cookies, no PII.

### Option A: Plausible Cloud ($9/mo for 10k visits)
1. Go to https://plausible.io
2. Sign up → Add Site → use `44-248-29-160.sslip.io`
3. Get the snippet `<script defer data-domain="..." src="https://plausible.io/js/script.js"></script>`
4. It's already wired up in `src/app/layout.tsx` — just set env var:
   ```js
   env: { NEXT_PUBLIC_PLAUSIBLE_DOMAIN: '44-248-29-160.sslip.io' }
   ```

### Option B: Google Analytics — FREE forever
1. Go to https://analytics.google.com → Create Property
2. Get the Measurement ID (e.g., `G-XXXXXXXX`)
3. Add env var: `NEXT_PUBLIC_GA_ID=G-XXXXXXXX`

---

## 7. AWS S3 (Backup Strategy) — FREE 5GB tier

Daily MongoDB backup. Skip if using Atlas (Atlas auto-backups on M10+).

```bash
# On EC2 cron:
0 2 * * * mongodump --uri "..." --archive | gzip | aws s3 cp - s3://your-bucket/backup-$(date +%Y%m%d).gz
```

---

## 8. Domain Name (Optional) — $10-15/year

If you don't want `44-248-29-160.sslip.io`:

### Cheap registrars:
- **Namecheap**: `.com` $10-12/year, `.pk` $30/year (need PKNIC)
- **Cloudflare Registrar**: at-cost (~$10/year for .com)

### Steps after buying:
1. Point A record to `44.248.29.160`
2. Update `/etc/caddy/Caddyfile`:
   ```
   shaadibazaar.pk {
       reverse_proxy localhost:3000
   }
   ```
3. `sudo systemctl reload caddy` — Caddy auto-issues new SSL cert
4. Update `NEXT_PUBLIC_BASE_URL` env var

---

## Complete Ecosystem.config.js Example

```js
module.exports = {
  apps: [{
    name: 'shaadi-bazaar',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/home/ubuntu/shadai-bazar',
    instances: 1,
    autorestart: true,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,

      // Database
      MONGODB_URI: 'mongodb+srv://...',  // Atlas

      // Auth
      JWT_SECRET: 'your-strong-random-secret-32-chars-min',
      COOKIE_SECURE: 'true',              // HTTPS enabled

      // App URL
      NEXT_PUBLIC_BASE_URL: 'https://44-248-29-160.sslip.io',

      // Cloudinary
      CLOUDINARY_CLOUD_NAME: '...',
      CLOUDINARY_API_KEY: '...',
      CLOUDINARY_API_SECRET: '...',

      // Resend
      RESEND_API_KEY: 're_...',
      FROM_EMAIL: 'Shaadi Bazaar <onboarding@resend.dev>',

      // JazzCash (sandbox or production)
      JAZZCASH_MERCHANT_ID: 'MC...',
      JAZZCASH_PASSWORD: '...',
      JAZZCASH_INTEGRITY_SALT: '...',

      // Push (optional)
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: 'B...',
      VAPID_PRIVATE_KEY: '...',
      VAPID_SUBJECT: 'mailto:admin@yourdomain.com',

      // Analytics (optional)
      NEXT_PUBLIC_PLAUSIBLE_DOMAIN: '44-248-29-160.sslip.io',
      // OR
      // NEXT_PUBLIC_GA_ID: 'G-XXXXXXXX',
    }
  }]
}
```

---

## Setup Order (Recommended)

| Day | Task | Time | Cost |
|-----|------|------|------|
| 1 | MongoDB Atlas signup + migrate data | 30 min | Free |
| 1 | Cloudinary signup + add keys | 10 min | Free |
| 2 | Resend signup + test email | 15 min | Free |
| 2 | Make first admin: `npm run make-admin -- you@email.com` | 1 min | Free |
| 3 | JazzCash sandbox apply | 15 min (+ approval wait) | Free |
| 4 | VAPID keys + push notifications | 10 min | Free |
| 5 | Plausible/GA analytics | 5 min | Free |
| 6 | (Optional) Buy domain | 10 min | $10/yr |

**Day 0 already done:** HTTPS via Caddy + sslip.io ✅

---

## Verify Everything Works

```bash
# On EC2:
ssh -i app.pem ubuntu@ec2-44-248-29-160...

# Test the app
curl https://44-248-29-160.sslip.io
# Should return 200 OK

# Test email sending (after Resend setup)
node -e "
import('./src/lib/email.ts').then(({sendEmail}) =>
  sendEmail({to:'you@email.com', subject:'Test', html:'<h1>Hello</h1>'})
)"

# Test Cloudinary
curl -X POST https://44-248-29-160.sslip.io/api/upload \
  -b "auth_token=YOUR_TOKEN" \
  -F "file=@photo.jpg"
# URL in response should be `https://res.cloudinary.com/...`
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Caddy cert renewal fails | `sudo systemctl reload caddy` and wait 60s |
| MongoDB Atlas connection slow | Add EC2 IP to Atlas whitelist (not 0.0.0.0/0) |
| Cloudinary 401 | Check API secret has no trailing spaces |
| Resend 422 | Verify `from` email matches verified domain |
| JazzCash signature mismatch | Re-check the alphabetical sort order of params |

---

## Quick Win: 30-Minute Production Setup

If you only have 30 minutes:
1. **MongoDB Atlas** (10 min) — most critical
2. **Cloudinary** (5 min) — second most critical
3. **Resend** (10 min) — UX critical (welcome + verify emails)
4. **Make yourself admin** (5 min)

Everything else can wait. The app works fine without them (graceful fallbacks built in).
