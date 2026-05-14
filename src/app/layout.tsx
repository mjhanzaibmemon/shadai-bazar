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

export const metadata: Metadata = {
  title: {
    default: 'Shaadi Bazaar — Pakistan\'s Wedding Marketplace',
    template: '%s | Shaadi Bazaar',
  },
  description:
    'Buy and sell pre-loved wedding wear at 40-70% off retail. Pakistan\'s trusted marketplace for bridal lehengas, sherwanis, and party wear.',
  openGraph: {
    title: 'Shaadi Bazaar',
    description: 'Pakistan\'s wedding marketplace',
    type: 'website',
    locale: 'en_PK',
  },
  twitter: { card: 'summary_large_image' },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Shaadi Bazaar',
  },
  formatDetection: { telephone: false },
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
