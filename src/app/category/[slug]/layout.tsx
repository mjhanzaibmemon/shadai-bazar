import type { Metadata } from 'next';

const CATEGORY_LABELS: Record<string, { name: string; description: string; keywords: string[] }> = {
  'bridal-lehenga': {
    name: 'Bridal Lehengas',
    description: 'Bridal lehengas for sale across Pakistan. Pre-loved & new designer bridal lehenga at 40-70% off retail. Maroon, red, gold, embroidered — Karachi, Lahore, Islamabad.',
    keywords: ['bridal lehenga pakistan', 'lehenga for sale', 'pre-loved bridal lehenga', 'designer lehenga pakistan'],
  },
  'groom-sherwani': {
    name: 'Groom Sherwanis',
    description: 'Sherwanis for grooms — pre-loved and new. Buy & sell wedding sherwani at 40-70% off across Pakistan. Verified sellers in Karachi, Lahore, Islamabad.',
    keywords: ['sherwani for sale', 'groom sherwani pakistan', 'wedding sherwani online', 'pre-owned sherwani'],
  },
  'party-wear': {
    name: 'Party Wear',
    description: 'Party wear dresses for women — formal frocks, anarkalis, maxi dresses for weddings, valima, mehndi, and engagements. Pakistan-wide.',
    keywords: ['party wear pakistan', 'formal dress pakistan', 'wedding guest dress', 'pakistani party wear online'],
  },
  'mehndi-wear': {
    name: 'Mehndi Wear',
    description: 'Mehndi function dresses — yellow, green, orange shararas, ghararas, frocks. Pre-loved & new at sasta prices across Pakistan.',
    keywords: ['mehndi dress', 'mehndi function wear', 'yellow mehndi dress pakistan', 'shaadi mehndi outfit'],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const info = CATEGORY_LABELS[slug] || {
    name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    description: `${slug.replace(/-/g, ' ')} for sale in Pakistan on Rukhsati. Verified sellers, buy & sell wedding wear at 40-70% off.`,
    keywords: [slug, 'pakistan wedding'],
  };
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ruksati.com';
  const url = `${baseUrl}/category/${slug}`;
  return {
    title: `${info.name} for Sale in Pakistan`,
    description: info.description,
    keywords: info.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${info.name} — Rukhsati`,
      description: info.description,
      url,
      siteName: 'Rukhsati',
      type: 'website',
      locale: 'en_PK',
    },
  };
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
