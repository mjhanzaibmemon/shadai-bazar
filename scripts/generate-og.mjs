#!/usr/bin/env node
import sharp from 'sharp';
import { writeFileSync } from 'fs';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#800020"/>
      <stop offset="50%" style="stop-color:#a01030"/>
      <stop offset="100%" style="stop-color:#e11d48"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f4cf6b"/>
      <stop offset="100%" style="stop-color:#d4a853"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- decorative rings -->
  <circle cx="1050" cy="120" r="200" fill="none" stroke="rgba(244,207,107,0.15)" stroke-width="2"/>
  <circle cx="120" cy="520" r="160" fill="none" stroke="rgba(244,207,107,0.15)" stroke-width="2"/>
  <circle cx="1100" cy="500" r="80" fill="none" stroke="rgba(244,207,107,0.20)" stroke-width="2"/>

  <!-- ring icon emoji as text -->
  <text x="600" y="180" text-anchor="middle" font-size="120">💍</text>

  <!-- brand -->
  <text x="600" y="320" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="120" fill="url(#gold)" letter-spacing="-2">Rukhsati</text>

  <!-- tagline -->
  <text x="600" y="395" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="42" fill="#ffffff" letter-spacing="1">Pakistan's #1 Wedding Marketplace</text>

  <!-- sub-tagline -->
  <text x="600" y="455" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="rgba(255,255,255,0.85)">Buy &amp; sell bridal wear at 40-70% off retail</text>

  <!-- bottom badges -->
  <g transform="translate(600, 540)" font-family="Arial, sans-serif" font-size="22" fill="#ffffff">
    <rect x="-340" y="-25" width="180" height="50" rx="25" fill="rgba(255,255,255,0.15)" stroke="rgba(244,207,107,0.4)"/>
    <text x="-250" y="8" text-anchor="middle">💝 Verified Sellers</text>

    <rect x="-90" y="-25" width="180" height="50" rx="25" fill="rgba(255,255,255,0.15)" stroke="rgba(244,207,107,0.4)"/>
    <text x="0" y="8" text-anchor="middle">📦 Free Listing</text>

    <rect x="160" y="-25" width="180" height="50" rx="25" fill="rgba(255,255,255,0.15)" stroke="rgba(244,207,107,0.4)"/>
    <text x="250" y="8" text-anchor="middle">🇵🇰 All Pakistan</text>
  </g>

  <!-- URL -->
  <text x="600" y="610" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="url(#gold)" font-weight="bold">ruksati.com</text>
</svg>
`;

const buffer = await sharp(Buffer.from(svg))
  .resize(1200, 630)
  .png()
  .toBuffer();
writeFileSync('public/og-image.png', buffer);
console.log('Generated og-image.png (1200x630)');
