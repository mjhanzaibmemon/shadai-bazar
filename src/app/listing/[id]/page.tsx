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
    const desc = (l.description || '').slice(0, 160);
    return {
      title: l.title,
      description: desc || 'Beautiful wedding wear on Shaadi Bazaar',
      openGraph: {
        title: l.title,
        description: desc,
        images: l.images?.[0] ? [l.images[0]] : undefined,
        type: 'website',
      },
    };
  } catch {
    return { title: 'Shaadi Bazaar' };
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ListingClient id={id} />;
}
