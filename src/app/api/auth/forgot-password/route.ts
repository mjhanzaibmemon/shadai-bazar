import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendEmail, emailTemplates } from '@/lib/email';
import { enforceRateLimit, getClientIp } from '@/lib/rateLimitMiddleware';

const forgotSchema = z.object({
  email: z.string().email('Invalid email'),
});

const GENERIC_RESPONSE = { message: 'If account exists, reset link sent' };

export async function POST(request: NextRequest) {
  try {
    const limited = enforceRateLimit(request, {
      key: `forgot:${getClientIp(request)}`,
      limit: 3,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    await connectDB();

    const body = await request.json();
    const { email } = forgotSchema.parse(body);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = token;
      user.passwordResetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1h
      await user.save();

      const origin =
        process.env.NEXT_PUBLIC_BASE_URL ||
        request.headers.get('origin') ||
        'http://localhost:3000';
      const resetLink = `${origin}/reset-password?token=${token}`;

      sendEmail({
        to: user.email,
        ...emailTemplates.passwordReset(user.name, resetLink),
      }).catch((err) => console.error('[forgot-password] email failed:', err));
    }

    // Always return 200 with generic message — don't leak account existence.
    return NextResponse.json(GENERIC_RESPONSE);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Still respond generically so we don't differentiate based on input shape.
      return NextResponse.json(GENERIC_RESPONSE);
    }
    console.error('Forgot password error:', error);
    return NextResponse.json(GENERIC_RESPONSE);
  }
}
