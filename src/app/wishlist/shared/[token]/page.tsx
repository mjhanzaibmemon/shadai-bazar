'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Calendar, MapPin } from 'lucide-react';

interface SharedData {
  bride: {
    name: string;
    city: string;
    weddingDate?: string;
    role?: string;
  };
  wishlist: {
    _id: string;
    title: string;
    price: number;
    originalPrice?: number;
    images: string[];
    city: string;
    seller?: { name: string };
  }[];
}

export default function SharedWishlistPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/wishlist/shared/${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }
  if (notFound || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
          <p className="text-gray-600 mb-3">Share link not found or expired.</p>
          <Link href="/" className="text-[#800020] font-semibold hover:underline">Go to Home →</Link>
        </div>
      </div>
    );
  }

  const daysLeft = data.bride.weddingDate
    ? Math.max(0, Math.ceil((new Date(data.bride.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <div className="bg-gradient-to-br from-[#800020] to-[#e11d48] text-white">
        <div className="container mx-auto px-4 py-10 text-center">
          <Heart size={36} className="mx-auto text-[#d4a853] fill-[#d4a853] mb-3" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{data.bride.name}'s Wishlist</h1>
          <p className="text-rose-100 flex items-center justify-center gap-3 flex-wrap text-sm">
            <span className="flex items-center gap-1"><MapPin size={14} /> {data.bride.city}</span>
            {daysLeft !== null && (
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {daysLeft} days to wedding
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <p className="text-center text-gray-600 mb-6">
          Yeh dresses {data.bride.name} ne pasand ki hain. Aap apni rai dein ya khud khareed kar gift karein 💝
        </p>

        {data.wishlist.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-500">
            <Heart size={36} className="mx-auto text-rose-200 mb-2" />
            <p>Wishlist abhi khaali hai.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.wishlist.map((item) => (
              <Link
                key={item._id}
                href={`/listing/${item._id}`}
                className="bg-white rounded-xl shadow hover:shadow-md transition-shadow overflow-hidden"
              >
                {item.images[0] && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.images[0]} alt={item.title} className="w-full aspect-square object-cover" />
                )}
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2">{item.title}</p>
                  <p className="text-lg font-bold text-[#800020] mt-1">Rs. {item.price.toLocaleString()}</p>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <p className="text-xs text-gray-400 line-through">Rs. {item.originalPrice.toLocaleString()}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{item.city}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
