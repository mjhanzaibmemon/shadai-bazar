'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ListingCard } from '@/components/ListingCard';
import { CITIES, CONDITIONS, PRICE_RANGES, FABRICS } from '@/lib/constants';
import { Filter, X } from 'lucide-react';

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
  };
  featured?: boolean;
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    condition: searchParams.get('condition') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

  useEffect(() => {
    fetchListings();
  }, [params.slug, filters]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        category: params.slug,
        ...(filters.city && { city: filters.city }),
        ...(filters.condition && { condition: filters.condition }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      });

      const response = await fetch(`/api/listings?${queryParams}`);
      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key as keyof typeof filters] === value ? '' : value,
    }));
  };

  const clearFilters = () => {
    setFilters({ city: '', condition: '', minPrice: '', maxPrice: '' });
  };

  const categoryLabel = params.slug.replace('-', ' ').toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 gradient-gold">{categoryLabel}</h1>
        <p className="text-gray-600 mb-8">
          {listings.length} listings found {Object.values(filters).some((f) => f) && 'with selected filters'}
        </p>

        <div className="flex gap-8">
          {/* Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-md sticky top-20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Filters</h3>
                {Object.values(filters).some((f) => f) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[#800020] hover:underline flex items-center gap-1"
                  >
                    <X size={14} /> Clear
                  </button>
                )}
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-800">Price Range</h4>
                <div className="space-y-2">
                  {PRICE_RANGES.map((range) => (
                    <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.minPrice === String(range.min) && filters.maxPrice === String(range.max)}
                        onChange={() => {
                          setFilters({
                            ...filters,
                            minPrice: String(range.min),
                            maxPrice: String(range.max),
                          });
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-800">Condition</h4>
                <div className="space-y-2">
                  {CONDITIONS.map((cond) => (
                    <label key={cond.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.condition === cond.id}
                        onChange={() => handleFilterChange('condition', cond.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{cond.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* City */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-800">City</h4>
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                >
                  <option value="">All Cities</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 text-[#800020] font-semibold mb-4"
          >
            <Filter size={20} /> Filters
          </button>

          {/* Mobile Filters Modal */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 bg-black/50 z-40 flex items-end">
              <div className="bg-white w-full rounded-t-2xl p-6 max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="text-gray-500">
                    <X size={24} />
                  </button>
                </div>
                {/* Filter content for mobile */}
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-xl h-64 animate-shimmer"></div>
                ))}
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
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
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No listings found in this category.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-[#800020] text-white rounded-lg hover:bg-[#e11d48]"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
