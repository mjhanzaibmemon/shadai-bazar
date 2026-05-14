import { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://44-248-29-160.sslip.io';
  try {
    await connectDB();
    const listings = await Listing.find({ status: 'active' })
      .select('_id updatedAt')
      .lean<any[]>();
    return [
      { url: baseUrl, priority: 1.0 },
      { url: `${baseUrl}/search`, priority: 0.8 },
      { url: `${baseUrl}/sahara`, priority: 0.7 },
      ...listings.map((l) => ({
        url: `${baseUrl}/listing/${l._id}`,
        lastModified: l.updatedAt,
        priority: 0.6,
      })),
    ];
  } catch {
    return [{ url: baseUrl, priority: 1.0 }];
  }
}
