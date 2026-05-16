import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import { verifyAuth } from '@/lib/authMiddleware';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return auth.response;
    }

    const userIdStr = auth.user?.userId;
    const { id: otherUserIdStr } = await params;

    if (!userIdStr || !mongoose.isValidObjectId(userIdStr)) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 400 });
    }
    if (!mongoose.isValidObjectId(otherUserIdStr)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const userId = new mongoose.Types.ObjectId(userIdStr);
    const otherUserId = new mongoose.Types.ObjectId(otherUserIdStr);

    const messages = await Chat.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .populate('listing', 'title images');

    await Chat.updateMany(
      {
        sender: otherUserId,
        receiver: userId,
        isRead: false,
      },
      { isRead: true }
    );

    return NextResponse.json(
      {
        messages,
        otherUser: {
          id: otherUserIdStr,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
