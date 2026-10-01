import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/authMiddleware';

const MAX_DEVICES = 10;

const subscriptionSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url().max(2048),
    keys: z.object({ p256dh: z.string().max(256), auth: z.string().max(256) }),
  }),
});

// Public VAPID key so the browser can subscribe.
export async function GET() {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || null;
  return NextResponse.json({ publicKey: key, enabled: Boolean(key && process.env.VAPID_PRIVATE_KEY) });
}

// Save (or refresh) this device's Web Push subscription.
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const parsed = subscriptionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }
    const { subscription } = parsed.data;

    // Drop any older copy of this endpoint, then add the fresh one (cap per user).
    await User.updateOne(
      { _id: auth.user?.userId },
      { $pull: { pushSubscriptions: { endpoint: subscription.endpoint } } }
    );
    await User.updateOne(
      { _id: auth.user?.userId },
      { $push: { pushSubscriptions: { $each: [subscription], $slice: -MAX_DEVICES } } }
    );

    return NextResponse.json({ message: 'Push subscription saved' });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Remove this device's subscription (or all when no endpoint is given).
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const body = await request.json().catch(() => ({}));
    const endpoint = typeof body?.endpoint === 'string' ? body.endpoint : null;

    await User.updateOne(
      { _id: auth.user?.userId },
      endpoint
        ? { $pull: { pushSubscriptions: { endpoint } } }
        : { $set: { pushSubscriptions: [], pushSubscription: null } }
    );
    return NextResponse.json({ message: 'Push subscription removed' });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
