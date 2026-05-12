'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ListingCard } from '@/components/ListingCard';
import { CATEGORIES } from '@/lib/constants';
import { ArrowRight, ShoppingBag, Eye, Star, Zap } from 'lucide-react';

interface Listing {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  condition: string;
  city: string;
  views: number;
  seller: {
    name: string;
    avatar?: string;
  };
  featured?: boolean;
}

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/listings?limit=20&featured=true');
      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800020] via-[#e11d48] to-[#d4a853] opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml+%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff fill-opacity=0.05%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

        <div className="relative container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fadeInUp">
                Pakistan's #1 Wedding Marketplace
              </h1>
              <p className="text-xl text-gray-100 mb-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                Buy and sell premium wedding wear at 40-70% cheaper prices. From bridal dresses to groom wear, find everything here.
              </p>

              <div className="flex gap-4 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                <Link
                  href="/search"
                  className="px-8 py-3 bg-white text-[#800020] font-bold rounded-lg hover:bg-[#d4a853] hover:text-white transition-all flex items-center gap-2"
                >
                  Browse Now <ShoppingBag size={20} />
                </Link>
                <Link
                  href="/signup"
                  className="px-8 py-3 bg-[#800020] text-white font-bold rounded-lg border-2 border-white hover:bg-white hover:text-[#800020] transition-all"
                >
                  Start Selling
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div className="animate-pulse-gold">
                  <div className="text-3xl font-bold text-[#d4a853]">50K+</div>
                  <div className="text-sm text-gray-200">Active Listings</div>
                </div>
                <div className="animate-pulse-gold" style={{ animationDelay: '0.2s' }}>
                  <div className="text-3xl font-bold text-[#d4a853]">100K+</div>
                  <div className="text-sm text-gray-200">Happy Users</div>
                </div>
                <div className="animate-pulse-gold" style={{ animationDelay: '0.4s' }}>
                  <div className="text-3xl font-bold text-[#d4a853]">25+ Cities</div>
                  <div className="text-sm text-gray-200">Across Pakistan</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="hidden md:block relative h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4a853] to-[#e11d48] rounded-3xl opacity-50 animate-float"></div>
              <div className="absolute inset-4 bg-white rounded-2xl flex items-center justify-center text-6xl shadow-2xl">
                💍
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-gold">Shop by Category</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => (
              <Link key={category.id} href={`/category/${category.id}`}>
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all p-6 text-center cursor-pointer group h-full">
                  <div className="text-4xl mb-3 group-hover:animate-float">{category.icon}</div>
                  <p className="font-semibold text-gray-800 group-hover:text-[#800020]">{category.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{category.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/size-guide"
              className="inline-flex items-center gap-2 px-5 py-2 bg-amber-50 text-amber-900 border-2 border-amber-200 rounded-full font-semibold text-sm hover:bg-amber-100 transition-colors"
            >
              📏 New seller? Read the Size & Measurement Guide
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature highlights ───────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/sahara" className="group p-5 bg-gradient-to-br from-rose-50 to-amber-50 rounded-xl border-2 border-transparent hover:border-[#d4a853] transition-all">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className="font-bold text-gray-800 mb-1 group-hover:text-[#800020]">Shaadi Sahara</h3>
              <p className="text-xs text-gray-600">Donate a dress, change a life. Free for verified low-income brides.</p>
            </Link>
            <Link href="/verify" className="group p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-transparent hover:border-blue-300 transition-all">
              <div className="text-3xl mb-2">🛡️</div>
              <h3 className="font-bold text-gray-800 mb-1 group-hover:text-blue-700">Get Verified</h3>
              <p className="text-xs text-gray-600">CNIC verification = 3x more buyer trust + higher prices.</p>
            </Link>
            <Link href="/my-wedding" className="group p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-transparent hover:border-purple-300 transition-all">
              <div className="text-3xl mb-2">💍</div>
              <h3 className="font-bold text-gray-800 mb-1 group-hover:text-purple-700">My Wedding</h3>
              <p className="text-xs text-gray-600">Countdown, budget tracker, wishlist + share with family.</p>
            </Link>
            <Link href="/orders" className="group p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-transparent hover:border-green-300 transition-all">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-bold text-gray-800 mb-1 group-hover:text-green-700">Escrow Protection</h3>
              <p className="text-xs text-gray-600">Money held safely until you receive and inspect your dress.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold gradient-gold">Featured Listings</h2>
          <Link href="/search" className="text-[#800020] font-semibold hover:text-[#e11d48] flex items-center gap-2">
            View All <ArrowRight size={20} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-64 animate-shimmer"></div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.slice(0, 8).map((listing) => (
              <ListingCard
                key={listing._id}
                id={listing._id}
                title={listing.title}
                price={listing.price}
                originalPrice={listing.originalPrice}
                image={listing.images[0]}
                category={listing.category}
                condition={listing.condition}
                city={listing.city}
                views={listing.views}
                sellerName={listing.seller.name}
                featured={listing.featured}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p className="text-xl">No listings yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-r from-[#800020]/10 to-[#e11d48]/10">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-gold">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🔍',
                title: 'Browse',
                description: 'Search thousands of listings from verified sellers across Pakistan',
              },
              {
                icon: '💬',
                title: 'Connect',
                description: 'Chat directly with sellers to negotiate price and arrange meetings',
              },
              {
                icon: '✅',
                title: 'Buy Safe',
                description: 'Meet in your city with seller verified details and buyer protection',
              },
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="text-2xl font-bold text-[#800020] mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#800020] to-[#e11d48]">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Save Big?</h2>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Join thousands of Pakistanis buying and selling wedding wear at the best prices
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/search"
              className="px-8 py-3 bg-white text-[#800020] font-bold rounded-lg hover:bg-[#d4a853] hover:text-white transition-all flex items-center gap-2"
            >
              Start Browsing <ShoppingBag size={20} />
            </Link>
            <Link
              href="/signup"
              className="px-8 py-3 bg-transparent text-white font-bold rounded-lg border-2 border-white hover:bg-white hover:text-[#800020] transition-all"
            >
              List Your Item
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
