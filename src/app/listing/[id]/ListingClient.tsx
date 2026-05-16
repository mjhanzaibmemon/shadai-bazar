'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, Share2, MessageCircle, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ListingDetail {
  _id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  condition: string;
  fabric: string;
  size: {
    chest?: number;
    waist?: number;
    hip?: number;
    length?: number;
    shoulder?: number;
  };
  images: string[];
  defects?: string;
  city: string;
  views: number;
  status: string;
  seller: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    avatar?: string;
  };
  featured?: boolean;
  createdAt: string;
}

export default function ListingClient({ id }: { id: string }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${id}`);
      const data = await response.json();
      setListing(data.listing);
    } catch (error) {
      console.error('Failed to fetch listing:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='container mx-auto px-4'>
          <div className='bg-white rounded-xl p-8 animate-shimmer h-96'></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='container mx-auto px-4 text-center'>
          <h1 className='text-3xl font-bold text-gray-800 mb-4'>Listing not found</h1>
          <a href='/' className='text-[#800020] font-semibold hover:underline'>
            ← Back to home
          </a>
        </div>
      </div>
    );
  }

  const discount = listing.originalPrice
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : 0;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='container mx-auto px-4'>
        {/* Featured Badge */}
        {listing.featured && (
          <div className='mb-4 inline-block bg-gradient-to-r from-[#800020] to-[#d4a853] text-white px-4 py-2 rounded-full font-semibold'>
            ⭐ Featured Listing
          </div>
        )}

        <div className='grid md:grid-cols-3 gap-8'>
          {/* Images Section */}
          <div className='md:col-span-2'>
            <div className='bg-white rounded-xl overflow-hidden mb-4'>
              <div className='relative h-96 bg-gray-200'>
                <Image
                  src={listing.images[selectedImage]}
                  alt={listing.title}
                  fill
                  className='object-cover'
                />

                {discount > 0 && (
                  <div className='absolute top-4 right-4 bg-[#e11d48] text-white px-4 py-2 rounded-lg font-bold'>
                    -{discount}%
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className='p-4 flex gap-2 overflow-x-auto'>
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-[#800020]' : 'border-gray-300'
                    }`}
                  >
                    <Image src={image} alt={`${listing.title} ${index}`} width={80} height={80} />
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className='bg-white rounded-xl p-6'>
              <h2 className='text-2xl font-bold text-gray-800 mb-4'>Description</h2>
              <p className='text-gray-600 whitespace-pre-wrap mb-4'>{listing.description}</p>

              {listing.defects && (
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4'>
                  <p className='font-semibold text-yellow-800 mb-2'>Defects/Repairs Needed:</p>
                  <p className='text-yellow-700'>{listing.defects}</p>
                </div>
              )}

              {/* Size Table */}
              {Object.values(listing.size).some((v) => v !== null && v !== undefined) && (
                <div className='mt-6'>
                  <h3 className='text-xl font-bold text-gray-800 mb-4'>Size Measurements</h3>
                  <table className='w-full text-sm'>
                    <tbody className='divide-y divide-gray-200'>
                      {listing.size.chest && (
                        <tr>
                          <td className='py-2 font-semibold text-gray-700'>Chest</td>
                          <td className='py-2 text-gray-600'>{listing.size.chest} inches</td>
                        </tr>
                      )}
                      {listing.size.waist && (
                        <tr>
                          <td className='py-2 font-semibold text-gray-700'>Waist</td>
                          <td className='py-2 text-gray-600'>{listing.size.waist} inches</td>
                        </tr>
                      )}
                      {listing.size.hip && (
                        <tr>
                          <td className='py-2 font-semibold text-gray-700'>Hip</td>
                          <td className='py-2 text-gray-600'>{listing.size.hip} inches</td>
                        </tr>
                      )}
                      {listing.size.length && (
                        <tr>
                          <td className='py-2 font-semibold text-gray-700'>Length</td>
                          <td className='py-2 text-gray-600'>{listing.size.length} inches</td>
                        </tr>
                      )}
                      {listing.size.shoulder && (
                        <tr>
                          <td className='py-2 font-semibold text-gray-700'>Shoulder</td>
                          <td className='py-2 text-gray-600'>{listing.size.shoulder} inches</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside>
            {/* Price Card */}
            <div className='bg-white rounded-xl p-6 mb-6 sticky top-20'>
              <div className='flex items-baseline gap-2 mb-4'>
                <span className='text-4xl font-bold text-[#800020]'>Rs. {listing.price.toLocaleString()}</span>
                {listing.originalPrice && (
                  <span className='text-xl text-gray-400 line-through'>Rs. {listing.originalPrice.toLocaleString()}</span>
                )}
              </div>

              <div className='flex gap-2 mb-6'>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className='flex-1 py-2 border-2 border-[#800020] text-[#800020] font-semibold rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2'
                >
                  <Heart size={20} fill={isFavorite ? '#800020' : 'none'} /> Save
                </button>
                <button className='flex-1 py-2 border-2 border-[#800020] text-[#800020] font-semibold rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2'>
                  <Share2 size={20} /> Share
                </button>
              </div>

              {/* Details */}
              <div className='space-y-3 text-sm border-t pt-4'>
                <div>
                  <p className='text-gray-600'>Category</p>
                  <p className='font-semibold text-gray-800'>{listing.category.replace('-', ' ')}</p>
                </div>
                <div>
                  <p className='text-gray-600'>Condition</p>
                  <p className='font-semibold text-gray-800'>{listing.condition.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className='text-gray-600'>Fabric</p>
                  <p className='font-semibold text-gray-800'>{listing.fabric}</p>
                </div>
                <div>
                  <p className='text-gray-600'>Location</p>
                  <p className='font-semibold text-gray-800 flex items-center gap-1'>
                    <MapPin size={16} /> {listing.city}
                  </p>
                </div>
                <div>
                  <p className='text-gray-600'>Views</p>
                  <p className='font-semibold text-gray-800'>👁 {listing.views}</p>
                </div>
              </div>
            </div>

            {/* Seller Card */}
            <div className='bg-white rounded-xl p-6 mb-6'>
              <h3 className='text-xl font-bold text-gray-800 mb-4'>Seller</h3>

              <div className='flex items-center gap-4 mb-6 pb-6 border-b'>
                <div className='w-12 h-12 rounded-full bg-gradient-to-br from-[#800020] to-[#d4a853] flex items-center justify-center text-white text-lg font-bold'>
                  {listing.seller.name.charAt(0)}
                </div>
                <div>
                  <p className='font-bold text-gray-800'>{listing.seller.name}</p>
                  <p className='text-sm text-gray-600'>📍 {listing.seller.city}</p>
                </div>
              </div>

              {isAuthenticated && user?.id !== listing.seller._id ? (
                <>
                  <button
                    onClick={() => router.push(`/chat?to=${listing.seller._id}&listingId=${listing._id}`)}
                    className='w-full py-3 bg-gradient-to-r from-[#800020] to-[#e11d48] text-white font-bold rounded-lg hover:shadow-lg transition-all mb-3 flex items-center justify-center gap-2'
                  >
                    <MessageCircle size={20} /> Chat with Seller
                  </button>
                  <a
                    href={`https://wa.me/92${(listing.seller.phone || '').replace(/^(\+92|0)/, '')}?text=${encodeURIComponent(`Salam ${listing.seller.name}, I'm interested in your "${listing.title}" on Rukhsati`)}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2'
                  >
                    <MessageCircle size={20} /> WhatsApp
                  </a>
                </>
              ) : isAuthenticated ? (
                <p className='text-center text-gray-600'>This is your listing</p>
              ) : (
                <a
                  href='/login'
                  className='w-full py-3 bg-gradient-to-r from-[#800020] to-[#e11d48] text-white font-bold rounded-lg hover:shadow-lg transition-all text-center'
                >
                  Login to Contact
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
