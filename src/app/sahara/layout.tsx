import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shaadi Sahara — Donation Platform for Pakistani Weddings',
  description: 'Shaadi Sahara — donate wedding wear or apply for support. Help underprivileged Pakistani brides and grooms have a dignified wedding. Pure platform for giving and receiving.',
  keywords: ['shaadi sahara', 'donate wedding dress pakistan', 'jahez donation pakistan', 'sadqa wedding pakistan'],
  alternates: { canonical: 'https://ruksati.com/sahara' },
};

export default function SaharaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
