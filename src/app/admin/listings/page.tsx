'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';

interface Listing {
  _id: string;
  title: string;
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  category: string;
  price: number;
  city: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
  views: number;
}

export default function AdminListingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchListings();
  }, [isAuthenticated, user, router, filter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockListings: Listing[] = [
        {
          _id: '1',
          title: 'Red Bridal Lehenga - Unused',
          seller: {
            _id: 'seller1',
            name: 'Ayesha Khan',
            email: 'ayesha@example.com',
          },
          category: 'Bridal',
          price: 35000,
          city: 'Karachi',
          status: 'pending',
          createdAt: new Date().toISOString(),
          views: 0,
        },
        {
          _id: '2',
          title: 'Designer Groom Sherwani',
          seller: {
            _id: 'seller2',
            name: 'Fatima Ali',
            email: 'fatima@example.com',
          },
          category: 'Groom',
          price: 28000,
          city: 'Lahore',
          status: 'pending',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          views: 0,
        },
        {
          _id: '3',
          title: 'Green Formal Saree',
          seller: {
            _id: 'seller3',
            name: 'Hira Ahmad',
            email: 'hira@example.com',
          },
          category: 'Formal',
          price: 12000,
          city: 'Islamabad',
          status: 'approved',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          views: 45,
        },
      ];

      const filtered = filter === 'all'
        ? mockListings
        : mockListings.filter(l => l.status === filter);

      setListings(filtered);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (listingId: string) => {
    try {
      // API call would go here
      setListings(listings.map(l =>
        l._id === listingId ? { ...l, status: 'approved' as const } : l
      ));
    } catch (error) {
      console.error('Failed to approve listing:', error);
    }
  };

  const handleReject = async (listingId: string) => {
    try {
      // API call would go here
      setListings(listings.map(l =>
        l._id === listingId ? { ...l, status: 'rejected' as const } : l
      ));
    } catch (error) {
      console.error('Failed to reject listing:', error);
    }
  };

  const handleDelete = async (listingId: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      try {
        // API call would go here
        setListings(listings.filter(l => l._id !== listingId));
      } catch (error) {
        console.error('Failed to delete listing:', error);
      }
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#800020] to-[#e11d48] text-white py-8 shadow">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">📋 Listing Moderation</h1>
          <p className="text-gray-100 mt-2">Approve or reject user listings</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === status
                  ? 'bg-[#800020] text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#800020]'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No {filter === 'all' ? 'listings' : filter + ' listings'} found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Seller</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">City</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {listings.map((listing) => (
                  <tr key={listing._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{listing.title}</p>
                      <p className="text-xs text-gray-500">{listing.category}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-800">{listing.seller.name}</p>
                      <p className="text-xs text-gray-500">{listing.seller.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-semibold">Rs. {listing.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{listing.city}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        listing.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : listing.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {listing.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(listing._id)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleReject(listing._id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(listing._id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
