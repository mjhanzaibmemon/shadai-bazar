import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';
import { verifyAuth } from '@/lib/authMiddleware';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      Listing.find({ seller: auth.user?.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Listing.countDocuments({ seller: auth.user?.userId }),
    ]);

    return NextResponse.json(
      {
        listings,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get my listings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
