import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import { verifyAuth } from '@/lib/authMiddleware';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return auth.response;
    }

    const userId = auth.user?.userId;
    const otherUserId = params.id;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Get all messages between the two users
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

    // Mark messages as read
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
          id: otherUserId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
