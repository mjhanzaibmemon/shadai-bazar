import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PWAInstall } from "@/components/PWAInstall";
import Analytics from "@/components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ruksati.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Rukhsati — Pakistan\'s #1 Wedding Marketplace | Buy & Sell Bridal Wear',
    template: '%s | Rukhsati',
  },
  description:
    'Rukhsati (رخصتی) — Pakistan\'s trusted wedding marketplace. Buy & sell pre-loved bridal lehengas, sherwanis, mehndi outfits, jewellery, and decor at 40-70% off retail. Verified sellers across Karachi, Lahore, Islamabad. Free listings.',
  keywords: [
    'rukhsati', 'ruksati', 'rukhsati.com', 'ruksati pakistan',
    'wedding marketplace pakistan', 'bridal lehenga pakistan',
    'sherwani for sale pakistan', 'pre-loved bridal wear',
    'wedding dresses pakistan', 'mehndi dress online',
    'shaadi marketplace', 'buy bridal dress pakistan',
    'sell wedding dress pakistan', 'pakistani wedding wear online',
    'cheap bridal lehenga karachi', 'sasta lehenga online',
    'wedding shopping pakistan', 'pakistani wedding clothes online',
    'rukhsati ka jora', 'shadi ka jora online',
  ],
  authors: [{ name: 'Rukhsati', url: SITE_URL }],
  creator: 'Rukhsati',
  publisher: 'Rukhsati',
  alternates: {
    canonical: SITE_URL,
    languages: { 'en-PK': SITE_URL, 'ur-PK': SITE_URL },
  },
  openGraph: {
    title: 'Rukhsati — Pakistan\'s #1 Wedding Marketplace',
    description: 'Buy & sell wedding wear at 40-70% off. Verified sellers, secure payments, all of Pakistan.',
    type: 'website',
    locale: 'en_PK',
    alternateLocale: 'ur_PK',
    url: SITE_URL,
    siteName: 'Rukhsati',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Rukhsati — Pakistan\'s Wedding Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rukhsati — Pakistan\'s #1 Wedding Marketplace',
    description: 'Buy & sell wedding wear at 40-70% off. Verified sellers across Pakistan.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Rukhsati',
  },
  formatDetection: { telephone: false, address: false, email: false },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
  category: 'shopping',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Rukhsati',
      alternateName: ['Ruksati', 'رخصتی'],
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      sameAs: [],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@ruksati.com',
        areaServed: 'PK',
        availableLanguage: ['English', 'Urdu'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Rukhsati',
      description: 'Pakistan\'s Wedding Marketplace',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'en-PK',
    },
    {
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#business`,
      name: 'Rukhsati',
      image: `${SITE_URL}/icon-512.png`,
      url: SITE_URL,
      priceRange: 'PKR',
      address: { '@type': 'PostalAddress', addressCountry: 'PK' },
      areaServed: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'],
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#800020",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <PWAInstall />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
