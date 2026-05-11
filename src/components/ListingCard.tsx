'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { useState } from 'react';

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  condition: string;
  city: string;
  views: number;
  sellerName: string;
  featured?: boolean;
}

export function ListingCard({
  id,
  title,
  price,
  originalPrice,
  image,
  category,
  condition,
  city,
  views,
  sellerName,
  featured,
}: ListingCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <Link href={`/listing/${id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer">
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden bg-gray-200">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-[#800020] to-[#d4a853] text-white px-3 py-1 rounded-full text-xs font-semibold">
              Featured
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-[#e11d48] text-white px-3 py-1 rounded-full text-xs font-bold">
              -{discount}%
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            className="absolute bottom-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100 transition-all"
          >
            <Heart
              size={20}
              className={isFavorite ? 'fill-[#e11d48] text-[#e11d48]' : 'text-gray-400'}
            />
          </button>

          {/* Views Counter */}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            👁 {views} views
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category & Condition */}
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-[#800020] bg-[#800020]/10 px-2 py-1 rounded">
              {category.replace('-', ' ').toUpperCase()}
            </span>
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {condition.replace('_', ' ')}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#800020] transition-colors">
            {title}
          </h3>

          {/* Price */}
          <div className="mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#800020]">
                Rs. {price.toLocaleString()}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  Rs. {originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Seller & City */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <div className="text-sm">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-800">{sellerName}</span>
              </p>
              <p className="text-gray-500 text-xs">📍 {city}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
