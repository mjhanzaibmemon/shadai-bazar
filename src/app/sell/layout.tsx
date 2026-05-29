import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sell Your Wedding Dress — Post Free Listing in 2 Minutes',
  description: 'Sell your bridal lehenga, sherwani, or wedding wear on Rukhsati. Free listing, reach 1000s of Pakistani buyers, secure chat with verified users. Karachi, Lahore, Islamabad.',
  keywords: ['sell bridal lehenga', 'sell wedding dress pakistan', 'post wedding listing', 'free sell shaadi outfit'],
  alternates: { canonical: 'https://ruksati.com/sell' },
};

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return children;
}
