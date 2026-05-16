'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { Edit2, Trash2, Eye, EyeOff, Plus, MessageCircle } from 'lucide-react';

interface Listing {
  _id: string;
  title: string;
  price: number;
  images: string[];
  views: number;
  status: 'active' | 'paused' | 'sold';
  category: string;
  createdAt: string;
}

export default function MyListingsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [unreadByListing, setUnreadByListing] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'sold'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchListings();
    fetchUnread();
  }, [isAuthenticated, router]);

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/listings/my');
      if (response.ok) {
        const data = await response.json();
        setListings(data.listings || []);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnread = async () => {
    try {
      const response = await fetch('/api/chat/unread-by-listing');
      if (response.ok) {
        const data = await response.json();
        setUnreadByListing(data.unreadByListing || {});
      }
    } catch {}
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const response = await fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setListings((prev) =>
          prev.map((listing) =>
            listing._id === id ? { ...listing, status: newStatus as any } : listing
          )
        );
      }
    } catch (error) {
      console.error('Failed to update listing status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setListings((prev) => prev.filter((listing) => listing._id !== id));
        setDeleteId(null);
      }
    } catch (error) {
      console.error('Failed to delete listing:', error);
    } finally {
      setDeleting(false);
    }
  };

  const filteredListings = listings.filter((listing) => {
    if (filter === 'all') return true;
    return listing.status === filter;
  });

  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.status === 'active').length,
    views: listings.reduce((sum, l) => sum + l.views, 0),
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-gold mb-2">My Listings</h1>
            <p className="text-gray-600">Manage your posted items</p>
          </div>
          <Link
            href="/sell"
            className="px-6 py-3 bg-gradient-to-r from-[#800020] to-[#e11d48] text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={20} /> Post New Item
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-gray-600 text-sm mb-2">Total Listings</p>
            <p className="text-4xl font-bold text-[#800020]">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-gray-600 text-sm mb-2">Active</p>
            <p className="text-4xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-gray-600 text-sm mb-2">Total Views</p>
            <p className="text-4xl font-bold text-blue-600">👁 {stats.views}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-8 shadow">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'active', 'paused', 'sold'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === status
                    ? 'bg-gradient-to-r from-[#800020] to-[#e11d48] text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Listings' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your listings...</p>
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Item</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Views</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Messages</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Posted</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredListings.map((listing) => (
                    <tr key={listing._id} className="hover:bg-gray-50 transition-colors">
                      {/* Item Column */}
                      <td className="px-6 py-4">
                        <Link href={`/listing/${listing._id}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                              {listing.images[0] && (
                                <Image
                                  src={listing.images[0]}
                                  alt={listing.title}
                                  width={50}
                                  height={50}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 hover:text-[#800020] line-clamp-2">
                                {listing.title}
                              </p>
                              <p className="text-sm text-gray-500">{listing.category}</p>
                            </div>
                          </div>
                        </Link>
                      </td>

                      {/* Price Column */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#800020] text-lg">
                          Rs. {listing.price.toLocaleString()}
                        </p>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            listing.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : listing.status === 'paused'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                        </span>
                      </td>

                      {/* Views Column */}
                      <td className="px-6 py-4">
                        <p className="text-gray-800 font-semibold">👁 {listing.views}</p>
                      </td>

                      {/* Messages Column */}
                      <td className="px-6 py-4">
                        {unreadByListing[listing._id] > 0 ? (
                          <Link
                            href={`/chat?listingId=${listing._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 font-bold text-sm transition-colors"
                            title="View unread messages"
                          >
                            <MessageCircle size={14} /> {unreadByListing[listing._id]}
                          </Link>
                        ) : (
                          <Link
                            href={`/chat?listingId=${listing._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 text-sm transition-colors"
                            title="View chat"
                          >
                            <MessageCircle size={14} /> 0
                          </Link>
                        )}
                      </td>

                      {/* Posted Column */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </p>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/listing/${listing._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View listing"
                          >
                            <Eye size={18} />
                          </Link>

                          <button
                            onClick={() => handleToggleStatus(listing._id, listing.status)}
                            className={`p-2 rounded-lg transition-colors ${
                              listing.status === 'active'
                                ? 'text-yellow-600 hover:bg-yellow-100'
                                : 'text-green-600 hover:bg-green-100'
                            }`}
                            title={listing.status === 'active' ? 'Pause listing' : 'Activate listing'}
                          >
                            {listing.status === 'active' ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>

                          <Link
                            href={`/sell?edit=${listing._id}`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit listing"
                          >
                            <Edit2 size={18} />
                          </Link>

                          <button
                            onClick={() => setDeleteId(listing._id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete listing"
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
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">No listings found</p>
            <p className="text-gray-500 mb-6">
              {filter === 'all'
                ? "You haven't posted any items yet. Start by creating your first listing!"
                : `No ${filter} listings at the moment.`}
            </p>
            <Link
              href="/sell"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#800020] to-[#e11d48] text-white font-bold rounded-lg hover:shadow-lg transition-all"
            >
              Post Your First Item
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Delete Listing?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this listing? This action cannot be undone.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteId && handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
