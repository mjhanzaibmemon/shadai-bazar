'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ListingCard } from '@/components/ListingCard';
import { CATEGORIES, CITIES, CONDITIONS, PRICE_RANGES } from '@/lib/constants';

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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    condition: searchParams.get('condition') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  useEffect(() => {
    fetchListings();
  }, [query, filters]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(query && { search: query }),
        ...(filters.category && { category: filters.category }),
        ...(filters.city && { city: filters.city }),
        ...(filters.condition && { condition: filters.condition }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.sort && { sort: filters.sort }),
      });

      const response = await fetch(`/api/listings?${params}`);
      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      city: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {query ? `Search Results for "${query}"` : 'All Listings'}
          </h1>
          <p className="text-gray-600">Found {listings.length} listings</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-md sticky top-20 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Filters</h3>
                {Object.values(filters).some((f) => f && f !== 'newest') && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[#800020] hover:underline font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-800">Category</h4>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-800">Price Range</h4>
                <div className="space-y-2">
                  {PRICE_RANGES.map((range) => (
                    <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="price"
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
                <select
                  value={filters.condition}
                  onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                >
                  <option value="">All Conditions</option>
                  {CONDITIONS.map((cond) => (
                    <option key={cond.id} value={cond.id}>
                      {cond.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-800">City</h4>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
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

              {/* Sort */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-800">Sort By</h4>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </aside>

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
              <div className="text-center py-16 bg-white rounded-xl">
                <p className="text-2xl font-bold text-gray-800 mb-4">No results found</p>
                <p className="text-gray-600 mb-6">
                  {query
                    ? `No listings match "${query}". Try different keywords or adjust your filters.`
                    : 'No listings available. Try browsing by category.'}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-[#800020] text-white rounded-lg hover:bg-[#e11d48]"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
