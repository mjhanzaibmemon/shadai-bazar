#!/usr/bin/env node
/**
 * Submit URLs to IndexNow (Bing, Yandex, Naver, Seznam, etc.)
 * Run: node scripts/submit-indexnow.mjs
 */

const KEY = '2038e93809902392f694f2930f002e3a';
const HOST = 'ruksati.com';

// Fetch current sitemap to get all URLs
async function getUrlsFromSitemap() {
  const r = await fetch(`https://${HOST}/sitemap.xml`);
  const xml = await r.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return urls;
}

async function submit(urls) {
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  };
  const r = await fetch('https://api.indexnow.org/IndexNow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  console.log(`IndexNow response: ${r.status} ${r.statusText}`);
  if (r.status === 202 || r.status === 200) {
    console.log(`✓ Submitted ${urls.length} URLs successfully`);
  } else {
    const text = await r.text().catch(() => '');
    console.error('Error:', text);
  }
}

const urls = await getUrlsFromSitemap();
console.log(`Found ${urls.length} URLs in sitemap`);
await submit(urls);
