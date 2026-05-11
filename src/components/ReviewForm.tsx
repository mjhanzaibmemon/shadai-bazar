'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ReviewFormProps {
  sellerId: string;
  listingId?: string;
  onSuccess: () => void;
}

export function ReviewForm({ sellerId, listingId, onSuccess }: ReviewFormProps) {
  const { isAuthenticated, user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('You must be logged in to leave a review');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Comment must be at least 10 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller: sellerId,
          listing: listingId,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to post review');
      }

      // Reset form
      setRating(0);
      setComment('');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post review');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-blue-800">
          <a href="/login" className="font-semibold hover:underline">
            Login
          </a>{' '}
          to leave a review
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Leave a Review</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-colors"
            >
              <Star
                size={32}
                className={`${
                  value <= (hoverRating || rating)
                    ? 'fill-[#d4a853] text-[#d4a853]'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1]}
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this seller..."
          rows={4}
          maxLength={2000}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/2000 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-gradient-to-r from-[#800020] to-[#e11d48] text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
      >
        {loading ? 'Posting Review...' : 'Post Review'}
      </button>
    </form>
  );
}
