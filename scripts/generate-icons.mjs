#!/usr/bin/env node
import sharp from 'sharp';
import { writeFileSync } from 'fs';

const sizes = [192, 512];

const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#800020"/>
      <stop offset="100%" style="stop-color:#e11d48"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f4cf6b"/>
      <stop offset="100%" style="stop-color:#d4a853"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <text x="50%" y="38%" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="160" fill="url(#gold)">R</text>
  <text x="50%" y="72%" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="56" fill="#ffffff" letter-spacing="2">RUKHSATI</text>
  <circle cx="256" cy="430" r="6" fill="url(#gold)"/>
</svg>
`;

for (const size of sizes) {
  const buffer = await sharp(Buffer.from(svg(size)))
    .resize(size, size)
    .png()
    .toBuffer();
  writeFileSync(`public/icon-${size}.png`, buffer);
  console.log(`Generated icon-${size}.png`);
}

// Also generate a maskable version (with safe area padding)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#800020"/>
      <stop offset="100%" style="stop-color:#e11d48"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f4cf6b"/>
      <stop offset="100%" style="stop-color:#d4a853"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <text x="50%" y="48%" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="180" fill="url(#gold)">R</text>
  <text x="50%" y="68%" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="42" fill="#ffffff" letter-spacing="2">RUKHSATI</text>
</svg>
`;

const maskBuf = await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toBuffer();
writeFileSync('public/icon-maskable.png', maskBuf);
console.log('Generated icon-maskable.png');

console.log('\nDone! Icons saved to public/');
