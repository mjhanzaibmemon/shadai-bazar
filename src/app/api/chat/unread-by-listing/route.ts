import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import { verifyAuth } from '@/lib/authMiddleware';
import { enforceRateLimit, getClientIp } from '@/lib/rateLimitMiddleware';

export async function GET(request: NextRequest) {
  try {
    const limited = enforceRateLimit(request, {
      key: `unread:${getClientIp(request)}`,
      limit: 120,
      windowMs: 60 * 1000,
    });
    if (limited) return limited;

    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return auth.response;
    }

    const userIdStr = auth.user?.userId;
    if (!userIdStr || !mongoose.isValidObjectId(userIdStr)) {
      return NextResponse.json({ unreadByListing: {}, totalUnread: 0 });
    }
    const userId = new mongoose.Types.ObjectId(userIdStr);

    const groups = await Chat.aggregate([
      { $match: { receiver: userId, isRead: false } },
      { $group: { _id: '$listing', count: { $sum: 1 } } },
    ]);

    const unreadByListing: Record<string, number> = {};
    let totalUnread = 0;
    for (const g of groups) {
      totalUnread += g.count;
      if (g._id) unreadByListing[g._id.toString()] = g.count;
    }

    return NextResponse.json({ unreadByListing, totalUnread }, { status: 200 });
  } catch (error) {
    console.error('Unread by listing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
