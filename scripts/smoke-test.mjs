#!/usr/bin/env node
/**
 * Rukhsati Smoke Test — live API endpoint testing
 * Run: node scripts/smoke-test.mjs
 */

const BASE = process.env.BASE_URL || 'https://ruksati.jugarbazar.com';
const results = [];

const log = (status, name, detail = '') => {
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
  console.log(`${icon}  ${name}${detail ? ' — ' + detail : ''}`);
  results.push({ status, name, detail });
};

async function test(name, fn) {
  try {
    const r = await fn();
    if (r === true) log('PASS', name);
    else if (typeof r === 'string') log('PASS', name, r);
    else log('FAIL', name, JSON.stringify(r));
  } catch (e) {
    log('FAIL', name, e.message);
  }
}

console.log(`\n🧪 Rukhsati Smoke Test — ${BASE}\n${'='.repeat(60)}\n`);

// 1. Page routes
console.log('📄 Page Routes:');
for (const path of ['/', '/login', '/signup', '/search', '/sahara', '/privacy', '/terms', '/contact', '/forgot-password', '/manifest.json']) {
  await test(`GET ${path}`, async () => {
    const r = await fetch(BASE + path);
    if (r.status !== 200) return { status: r.status };
    return `${r.status}`;
  });
}

// 2. PWA assets
console.log('\n📦 PWA Assets:');
for (const asset of ['/icon-192.png', '/icon-512.png', '/icon-maskable.png', '/.well-known/assetlinks.json', '/sw.js']) {
  await test(`GET ${asset}`, async () => {
    const r = await fetch(BASE + asset);
    if (r.status !== 200) return { status: r.status };
    return `${r.status} ${r.headers.get('content-type')?.split(';')[0]}`;
  });
}

// 3. API: Listings
console.log('\n🛍️  API: Listings:');
await test('GET /api/listings', async () => {
  const r = await fetch(BASE + '/api/listings');
  if (r.status !== 200) return { status: r.status };
  const data = await r.json();
  return `${data.listings?.length || 0} listings`;
});

await test('GET /api/listings?limit=5', async () => {
  const r = await fetch(BASE + '/api/listings?limit=5');
  const data = await r.json();
  if (data.listings?.length > 5) return { error: 'limit not respected', count: data.listings.length };
  return `${data.listings?.length || 0} listings (max 5)`;
});

// 4. API: Auth — unauthenticated probes
console.log('\n🔐 API: Auth Protection:');
for (const ep of ['/api/auth/me', '/api/listings/my', '/api/orders', '/api/chat/conversations', '/api/chat/unread-by-listing', '/api/wishlist']) {
  await test(`${ep} (no auth)`, async () => {
    const r = await fetch(BASE + ep);
    if (r.status === 401) return '401 (correctly blocked)';
    if (r.status === 200) {
      const data = await r.json();
      if (Array.isArray(data) && data.length === 0) return 'returns empty (acceptable)';
      if (data.conversations !== undefined || data.wishlist !== undefined || data.unreadByListing !== undefined) {
        return '200 with empty result (acceptable)';
      }
      return { error: 'should require auth', status: 200 };
    }
    return { status: r.status };
  });
}

// 5. API: Validation
console.log('\n⚠️  API: Validation:');
await test('POST /api/auth/login (invalid email)', async () => {
  const r = await fetch(BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email', password: '12345' }),
  });
  return r.status === 400 ? '400 (rejected)' : { status: r.status };
});

await test('POST /api/auth/login (wrong creds)', async () => {
  const r = await fetch(BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'noexist@nowhere.test', password: 'whatever123' }),
  });
  return r.status === 401 ? '401 (rejected)' : { status: r.status };
});

await test('POST /api/auth/forgot-password (any email)', async () => {
  const r = await fetch(BASE + '/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'whatever@example.com' }),
  });
  const data = await r.json();
  if (r.status === 200 && data.message?.includes('If account exists')) return '200 (anti-enumeration)';
  return { status: r.status, data };
});

await test('POST /api/chat/messages (no auth)', async () => {
  const r = await fetch(BASE + '/api/chat/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiver: '507f1f77bcf86cd799439011', message: 'hi' }),
  });
  return r.status === 401 ? '401 (blocked)' : { status: r.status };
});

// 6. Sitemap & robots
console.log('\n🤖 SEO:');
await test('GET /sitemap.xml', async () => {
  const r = await fetch(BASE + '/sitemap.xml');
  if (r.status !== 200) return { status: r.status };
  const text = await r.text();
  if (!text.includes('<urlset')) return { error: 'invalid xml' };
  const urls = (text.match(/<url>/g) || []).length;
  return `${urls} URLs`;
});

await test('GET /robots.txt', async () => {
  const r = await fetch(BASE + '/robots.txt');
  if (r.status !== 200) return { status: r.status };
  const text = await r.text();
  if (!text.includes('Sitemap')) return { error: 'missing sitemap reference' };
  return 'has sitemap ref';
});

// Summary
console.log('\n' + '='.repeat(60));
const pass = results.filter((r) => r.status === 'PASS').length;
const fail = results.filter((r) => r.status === 'FAIL').length;
console.log(`\n✓ ${pass} passed   ✗ ${fail} failed   (${results.length} total)`);

if (fail > 0) {
  console.log('\n❌ Failures:');
  results.filter((r) => r.status === 'FAIL').forEach((r) => {
    console.log(`   • ${r.name} — ${r.detail}`);
  });
  process.exit(1);
} else {
  console.log('\n🎉 All checks passed!\n');
}
