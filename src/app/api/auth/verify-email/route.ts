import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, AUTH_COOKIE_OPTIONS } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const user = await User.findOne({
      emailVerifyToken: token,
      emailVerifyTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const wasAlreadyVerified = user.isEmailVerified;
    user.isEmailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyTokenExpiry = undefined;
    await user.save();

    if (!wasAlreadyVerified) {
      sendEmail({
        to: user.email,
        ...emailTemplates.welcome(user.name),
      }).catch((err) => console.error('[verify-email] welcome email failed:', err));
    }

    const jwt = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const response = NextResponse.json({ verified: true });
    response.cookies.set('auth_token', jwt, AUTH_COOKIE_OPTIONS);
    return response;
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
