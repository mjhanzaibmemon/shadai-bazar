import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import { verifyAuth } from '@/lib/authMiddleware';

const sendMessageSchema = z.object({
  receiver: z.string(),
  message: z.string().min(1).max(5000),
  listing: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return auth.response;
    }

    const body = await request.json();
    const { receiver, message, listing } = sendMessageSchema.parse(body);

    const chat = new Chat({
      sender: auth.user?.userId,
      receiver,
      message,
      listing: listing || null,
      isRead: false,
    });

    await chat.save();
    await chat.populate('sender', 'name avatar');
    await chat.populate('receiver', 'name avatar');

    return NextResponse.json(
      {
        message: 'Message sent',
        chat,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
