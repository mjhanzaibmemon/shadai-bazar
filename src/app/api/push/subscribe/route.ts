import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/authMiddleware';

// Save the user's Web Push subscription so the server can send notifications.
// Production: install web-push npm package and use it to send actual push messages.
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const body = await request.json();
    if (!body?.subscription) {
      return NextResponse.json({ error: 'Missing subscription' }, { status: 400 });
    }

    const user = await User.findById(auth.user?.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.pushSubscription = JSON.stringify(body.subscription);
    await user.save();

    return NextResponse.json({ message: 'Push subscription saved' });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    await User.findByIdAndUpdate(auth.user?.userId, { pushSubscription: null });
    return NextResponse.json({ message: 'Push subscription removed' });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
