import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/authMiddleware';

const toggleSchema = z.object({
  listingId: z.string(),
});

// POST: Toggle a listing in wishlist
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const body = await request.json();
    const { listingId } = toggleSchema.parse(body);

    const user = await User.findById(auth.user?.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const idx = user.wishlist.findIndex((id: { toString: () => string }) => id.toString() === listingId);
    let added = false;
    if (idx === -1) {
      user.wishlist.push(listingId as never);
      added = true;
    } else {
      user.wishlist.splice(idx, 1);
    }
    await user.save();

    return NextResponse.json({
      message: added ? 'Added to wishlist' : 'Removed from wishlist',
      added,
      count: user.wishlist.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Wishlist toggle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Full wishlist (with listing details)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const user = await User.findById(auth.user?.userId).populate({
      path: 'wishlist',
      select: 'title price originalPrice images city status seller',
      populate: { path: 'seller', select: 'name' },
    });

    return NextResponse.json({ wishlist: user?.wishlist || [] });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
