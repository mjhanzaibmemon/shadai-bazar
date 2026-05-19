import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import User from '@/models/User';
import Listing from '@/models/Listing';
import { verifyAuth } from '@/lib/authMiddleware';
import { enforceRateLimit, getClientIp } from '@/lib/rateLimitMiddleware';
import { sendEmail, emailTemplates } from '@/lib/email';

const sendMessageSchema = z.object({
  receiver: z.string(),
  message: z.string().min(1).max(5000),
  listing: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const limited = enforceRateLimit(request, {
      key: `chat:${getClientIp(request)}`,
      limit: 60,
      windowMs: 60 * 1000,
    });
    if (limited) return limited;

    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return auth.response;
    }

    const body = await request.json();
    const { receiver, message, listing } = sendMessageSchema.parse(body);

    if (!mongoose.isValidObjectId(receiver)) {
      return NextResponse.json({ error: 'Invalid receiver ID' }, { status: 400 });
    }
    if (listing && !mongoose.isValidObjectId(listing)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }
    if (receiver === auth.user?.userId) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    }

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

    // Push notification dispatch.
    // TODO: Wire web-push library — VAPID keys via VAPID_PUBLIC_KEY/PRIVATE_KEY/SUBJECT env
    try {
      const receiverUser = await User.findById(receiver)
        .select('pushSubscriptions pushSubscription')
        .lean<any>();
      const subs: any[] = Array.isArray(receiverUser?.pushSubscriptions)
        ? receiverUser.pushSubscriptions
        : receiverUser?.pushSubscription
          ? [receiverUser.pushSubscription]
          : [];
      if (subs.length > 0) {
        console.log(`[push] ${subs.length} subscription(s) for receiver ${receiver}`, subs);
      }
    } catch (pushErr) {
      console.error('[push] lookup failed:', pushErr);
    }

    // Email notification (fire-and-forget)
    try {
      const [receiverUser, senderUser, listingDoc] = await Promise.all([
        User.findById(receiver).select('name email').lean<any>(),
        User.findById(auth.user?.userId).select('name').lean<any>(),
        listing ? Listing.findById(listing).select('title').lean<any>() : Promise.resolve(null),
      ]);

      if (receiverUser?.email && senderUser?.name) {
        const origin =
          process.env.NEXT_PUBLIC_BASE_URL ||
          request.headers.get('origin') ||
          'http://localhost:3000';
        const chatLink = `${origin}/chat`;
        sendEmail({
          to: receiverUser.email,
          ...emailTemplates.newMessage(
            receiverUser.name,
            senderUser.name,
            listingDoc?.title || null,
            message,
            chatLink
          ),
        }).catch((err) => console.error('[chat] new-message email failed:', err));
      }
    } catch (emailErr) {
      console.error('[chat] email lookup failed:', emailErr);
    }

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
