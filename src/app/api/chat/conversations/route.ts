import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import { verifyAuth } from '@/lib/authMiddleware';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return auth.response;
    }

    const userId = auth.user?.userId;

    // Get unique conversations (latest message from each user)
    const conversations = await Chat.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender',
            ],
          },
          lastMessage: { $first: '$message' },
          lastMessageAt: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', userId] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          listing: { $first: '$listing' },
        },
      },
      {
        $sort: { lastMessageAt: -1 },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $lookup: {
          from: 'listings',
          localField: 'listing',
          foreignField: '_id',
          as: 'listingDetails',
        },
      },
    ]);

    return NextResponse.json(
      {
        conversations: conversations.map((conv) => ({
          userId: conv._id,
          userName: conv.user.name,
          userAvatar: conv.user.avatar,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount: conv.unreadCount,
          listing: conv.listingDetails[0] || null,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
