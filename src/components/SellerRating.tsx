'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';

interface Review {
  _id: string;
  reviewer: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface SellerRatingProps {
  sellerId: string;
  sellerName: string;
  listingId?: string;
}

export function SellerRating({ sellerId, sellerName, listingId }: SellerRatingProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [sellerId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?seller=${sellerId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-white rounded-lg p-8 shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Seller Ratings & Reviews</h2>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-[#800020] mb-2">{averageRating}</div>
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  size={20}
                  className={
                    value <= Math.round(parseFloat(averageRating.toString()))
                      ? 'fill-[#d4a853] text-[#d4a853]'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <p className="text-gray-600">Based on {reviews.length} reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="md:col-span-2 space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-600 w-12">{rating} ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#d4a853] transition-all"
                    style={{
                      width: `${reviews.length > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {ratingDistribution[rating as keyof typeof ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#800020] to-[#e11d48] text-white font-bold rounded-lg hover:shadow-lg transition-all"
          >
            Leave a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          sellerId={sellerId}
          listingId={listingId}
          onSuccess={() => {
            setShowForm(false);
            fetchReviews();
          }}
        />
      )}

      {/* Reviews List */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {reviews.length > 0 ? `Latest Reviews (${reviews.length})` : 'No reviews yet'}
        </h3>

        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading reviews...</div>
        ) : reviews.length > 0 ? (
          <div className="grid gap-4">
            {reviews.slice(0, 5).map((review) => (
              <ReviewCard
                key={review._id}
                id={review._id}
                reviewer={review.reviewer}
                rating={review.rating}
                comment={review.comment}
                createdAt={review.createdAt}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center text-gray-600">
            <p>No reviews yet. Be the first to review {sellerName}!</p>
          </div>
        )}
      </div>
    </div>
  );
}
