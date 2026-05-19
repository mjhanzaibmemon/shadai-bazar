import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/email';
import { enforceRateLimit, getClientIp } from '@/lib/rateLimitMiddleware';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(/^(\+92|0)?[0-9]{10}$/, 'Invalid phone number'),
  city: z.string().min(2, 'City is required'),
});

export async function POST(request: NextRequest) {
  try {
    const limited = enforceRateLimit(request, {
      key: `signup:${getClientIp(request)}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    await connectDB();

    const body = await request.json();
    const { name, email, password, phone, city } = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      city,
      role: 'user',
    });

    await user.save();

    // Email verification token (24h)
    const verifyToken = crypto.randomBytes(32).toString('hex');
    user.emailVerifyToken = verifyToken;
    user.emailVerifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Fire-and-forget emails (never block response)
    const origin =
      process.env.NEXT_PUBLIC_BASE_URL ||
      request.headers.get('origin') ||
      'http://localhost:3000';
    const verifyLink = `${origin}/verify-email?token=${verifyToken}`;

    sendEmail({
      to: user.email,
      ...emailTemplates.verifyEmail(user.name, verifyLink),
    }).catch((err) => console.error('[signup] verify email failed:', err));

    // Do NOT set auth cookie — user must verify email first.
    return NextResponse.json(
      {
        message: 'Account created. Please check your email to verify and activate your account.',
        requiresEmailVerification: true,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
