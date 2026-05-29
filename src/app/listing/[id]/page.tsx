import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';
import ListingClient from './ListingClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    await connectDB();
    const l = await Listing.findById(id).lean<any>();
    if (!l) return { title: 'Listing not found' };
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ruksati.com';
    const url = `${baseUrl}/listing/${id}`;
    const desc = (l.description || '').slice(0, 155).trim();
    const category = (l.category || '').replace(/-/g, ' ');
    const fullTitle = `${l.title} — ₨${l.price?.toLocaleString() || ''} | ${l.city || 'Pakistan'}`;
    const fullDesc = desc || `${l.title}. ${category} for sale in ${l.city || 'Pakistan'} at ₨${l.price?.toLocaleString()}. Verified seller on Rukhsati — Pakistan's wedding marketplace.`;
    return {
      title: fullTitle,
      description: fullDesc,
      alternates: { canonical: url },
      keywords: [l.title, category, l.fabric, l.city, 'pakistan wedding', 'bridal wear', l.condition].filter(Boolean),
      openGraph: {
        title: l.title,
        description: fullDesc,
        url,
        siteName: 'Rukhsati',
        type: 'website',
        locale: 'en_PK',
        images: l.images?.[0]
          ? [{ url: l.images[0], width: 1200, height: 1200, alt: l.title }]
          : [{ url: '/og-image.png', width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: l.title,
        description: fullDesc,
        images: l.images?.[0] ? [l.images[0]] : ['/og-image.png'],
      },
    };
  } catch {
    return { title: 'Rukhsati' };
  }
}

// Product JSON-LD for rich results
async function getProductJsonLd(id: string) {
  try {
    await connectDB();
    const l = await Listing.findById(id).populate('seller', 'name city').lean<any>();
    if (!l) return null;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ruksati.com';
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: l.title,
      description: l.description,
      image: l.images || [],
      sku: id,
      brand: { '@type': 'Brand', name: 'Rukhsati' },
      offers: {
        '@type': 'Offer',
        url: `${baseUrl}/listing/${id}`,
        priceCurrency: 'PKR',
        price: l.price,
        availability: l.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: l.condition === 'new' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
        seller: { '@type': 'Person', name: l.seller?.name || 'Verified seller' },
      },
    };
  } catch {
    return null;
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const jsonLd = await getProductJsonLd(id);
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ListingClient id={id} />
    </>
  );
}
