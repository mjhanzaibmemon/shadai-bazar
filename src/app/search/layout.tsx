import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Wedding Wear — Lehengas, Sherwanis, Party Dresses',
  description: 'Search 1000+ pre-loved & new wedding outfits across Pakistan. Filter by city, price, condition, fabric. Bridal lehengas, sherwanis, mehndi wear, party dresses at 40-70% off.',
  keywords: ['search wedding wear', 'find bridal dress pakistan', 'wedding outfit search', 'lehenga search'],
  alternates: { canonical: 'https://ruksati.com/search' },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
