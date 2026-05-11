'use client';

import { Star, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

interface ReviewCardProps {
  id: string;
  reviewer: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  onDelete?: (id: string) => Promise<void>;
}

export function ReviewCard({ id, reviewer, rating, comment, createdAt, onDelete }: ReviewCardProps) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (onDelete && confirm('Delete this review?')) {
      setDeleting(true);
      try {
        await onDelete(id);
      } finally {
        setDeleting(false);
      }
    }
  };

  const isOwner = user?.id === reviewer._id;

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#800020] to-[#d4a853] flex items-center justify-center text-white font-bold text-sm">
            {reviewer.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{reviewer.name}</p>
            <p className="text-xs text-gray-500">
              {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
            title="Delete review"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Rating */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            size={16}
            className={value <= rating ? 'fill-[#d4a853] text-[#d4a853]' : 'text-gray-300'}
          />
        ))}
        <span className="text-sm font-semibold text-gray-700 ml-2">{rating}/5</span>
      </div>

      {/* Comment */}
      <p className="text-gray-700 leading-relaxed">{comment}</p>
    </div>
  );
}
