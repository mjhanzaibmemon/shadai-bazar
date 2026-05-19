import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendEmail, emailTemplates } from '@/lib/email';
import { enforceRateLimit, getClientIp } from '@/lib/rateLimitMiddleware';

const schema = z.object({
  email: z.string().email('Invalid email'),
});

const GENERIC = { message: 'If the account exists and needs verification, an email has been sent.' };

export async function POST(request: NextRequest) {
  try {
    const limited = enforceRateLimit(request, {
      key: `resend-verify:${getClientIp(request)}`,
      limit: 3,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    await connectDB();

    const body = await request.json();
    const { email } = schema.parse(body);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user && !user.isEmailVerified) {
      const verifyToken = crypto.randomBytes(32).toString('hex');
      user.emailVerifyToken = verifyToken;
      user.emailVerifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      const origin =
        process.env.NEXT_PUBLIC_BASE_URL ||
        request.headers.get('origin') ||
        'http://localhost:3000';
      const verifyLink = `${origin}/verify-email?token=${verifyToken}`;

      sendEmail({
        to: user.email,
        ...emailTemplates.verifyEmail(user.name, verifyLink),
      }).catch((err) => console.error('[resend-verify] email failed:', err));
    }

    return NextResponse.json(GENERIC);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(GENERIC);
    }
    console.error('Resend verification error:', error);
    return NextResponse.json(GENERIC);
  }
}
