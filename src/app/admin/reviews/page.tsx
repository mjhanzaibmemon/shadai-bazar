'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Flag } from 'lucide-react';
import { Star } from 'lucide-react';

interface Review {
  _id: string;
  reviewer: {
    _id: string;
    name: string;
    email: string;
  };
  seller: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  status: 'approved' | 'flagged' | 'rejected';
  createdAt: string;
}

export default function AdminReviewsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'flagged' | 'rejected'>('flagged');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchReviews();
  }, [isAuthenticated, user, router, filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockReviews: Review[] = [
        {
          _id: '1',
          reviewer: {
            _id: 'user1',
            name: 'Ahmed Khan',
            email: 'ahmed@example.com',
          },
          seller: {
            _id: 'seller1',
            name: 'Fatima Ali',
          },
          rating: 5,
          comment: 'Excellent quality! Very satisfied with my purchase. The dress was exactly as described.',
          status: 'approved',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          reviewer: {
            _id: 'user2',
            name: 'Hira Ahmad',
            email: 'hira@example.com',
          },
          seller: {
            _id: 'seller2',
            name: 'Ayesha Khan',
          },
          rating: 1,
          comment: 'Very poor quality. Item was damaged and seller refused to help. SCAM!!!',
          status: 'flagged',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          _id: '3',
          reviewer: {
            _id: 'user3',
            name: 'Sara Hassan',
            email: 'sara@example.com',
          },
          seller: {
            _id: 'seller3',
            name: 'Zainab Malik',
          },
          rating: 2,
          comment: 'False advertising. Photos did not match actual item. Very disappointed.',
          status: 'flagged',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];

      const filtered = filter === 'all'
        ? mockReviews
        : mockReviews.filter(r => r.status === filter);

      setReviews(filtered);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      // API call would go here
      setReviews(reviews.map(r =>
        r._id === reviewId ? { ...r, status: 'approved' as const } : r
      ));
    } catch (error) {
      console.error('Failed to approve review:', error);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        // API call would go here
        setReviews(reviews.filter(r => r._id !== reviewId));
      } catch (error) {
        console.error('Failed to delete review:', error);
      }
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#800020] to-[#e11d48] text-white py-8 shadow">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">⭐ Review Moderation</h1>
          <p className="text-gray-100 mt-2">Review and manage user feedback</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'approved', 'flagged', 'rejected'] as const).map(status => (
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
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No {filter === 'all' ? 'reviews' : filter + ' reviews'} found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      {review.reviewer.name} → {review.seller.name}
                    </p>
                    <div className="mt-2">{renderStars(review.rating)}</div>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    review.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : review.status === 'flagged'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                  </span>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    {review.status === 'flagged' && (
                      <button
                        onClick={() => handleApprove(review._id)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-200 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
