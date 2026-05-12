import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Public endpoint — family/friends use this to view bride's shared wishlist
type RouteParams = { params: Promise<{ token: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { token } = await params;

    const user = await User.findOne({ 'weddingProfile.shareToken': token })
      .select('name city weddingProfile wishlist')
      .populate({
        path: 'wishlist',
        select: 'title price originalPrice images city status seller',
        populate: { path: 'seller', select: 'name' },
      });

    if (!user) return NextResponse.json({ error: 'Invalid share link' }, { status: 404 });

    return NextResponse.json({
      bride: {
        name: user.name,
        city: user.city,
        weddingDate: user.weddingProfile?.weddingDate,
        role: user.weddingProfile?.role,
      },
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error('Shared wishlist error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
