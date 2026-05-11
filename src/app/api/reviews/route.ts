import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { verifyAuth } from '@/lib/authMiddleware';

const createReviewSchema = z.object({
  seller: z.string(),
  listing: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(2000),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('seller');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter: any = { isVerified: true };
    if (sellerId) filter.seller = sellerId;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reviewer', 'name avatar')
        .populate('seller', 'name'),
      Review.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        reviews,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return auth.response;
    }

    const body = await request.json();
    const { seller, listing, rating, comment } = createReviewSchema.parse(body);

    // Check if user already reviewed this seller
    const existingReview = await Review.findOne({
      seller,
      reviewer: auth.user?.userId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this seller' },
        { status: 400 }
      );
    }

    const review = new Review({
      seller,
      reviewer: auth.user?.userId,
      listing: listing || null,
      rating,
      comment,
      isVerified: true, // In production, should be verified after purchase
    });

    await review.save();
    await review.populate('reviewer', 'name avatar');
    await review.populate('seller', 'name');

    return NextResponse.json(
      {
        message: 'Review created successfully',
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Create review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
