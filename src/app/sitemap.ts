import { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ruksati.com';
  try {
    await connectDB();
    const listings = await Listing.find({ status: 'active' })
      .select('_id updatedAt')
      .lean<any[]>();
    return [
      { url: baseUrl, priority: 1.0, changeFrequency: 'daily' as const },
      { url: `${baseUrl}/search`, priority: 0.9, changeFrequency: 'daily' as const },
      { url: `${baseUrl}/sell`, priority: 0.9, changeFrequency: 'monthly' as const },
      { url: `${baseUrl}/sahara`, priority: 0.7, changeFrequency: 'weekly' as const },
      { url: `${baseUrl}/size-guide`, priority: 0.6, changeFrequency: 'monthly' as const },
      { url: `${baseUrl}/privacy`, priority: 0.3, changeFrequency: 'yearly' as const },
      { url: `${baseUrl}/terms`, priority: 0.3, changeFrequency: 'yearly' as const },
      { url: `${baseUrl}/contact`, priority: 0.5, changeFrequency: 'monthly' as const },
      { url: `${baseUrl}/category/bridal-lehenga`, priority: 0.8, changeFrequency: 'daily' as const },
      { url: `${baseUrl}/category/groom-sherwani`, priority: 0.8, changeFrequency: 'daily' as const },
      { url: `${baseUrl}/category/party-wear`, priority: 0.8, changeFrequency: 'daily' as const },
      { url: `${baseUrl}/category/mehndi-wear`, priority: 0.8, changeFrequency: 'daily' as const },
      ...listings.map((l) => ({
        url: `${baseUrl}/listing/${l._id}`,
        lastModified: l.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return [{ url: baseUrl, priority: 1.0 }];
  }
}
