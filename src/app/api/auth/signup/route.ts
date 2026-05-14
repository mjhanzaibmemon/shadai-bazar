import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, signToken, AUTH_COOKIE_OPTIONS } from '@/lib/auth';
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

    // Sign JWT
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Fire-and-forget emails (never block response)
    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'http://localhost:3000';
    const verifyLink = `${origin}/verify-email?token=${verifyToken}`;

    sendEmail({
      to: user.email,
      ...emailTemplates.verifyEmail(user.name, verifyLink),
    }).catch((err) => console.error('[signup] verify email failed:', err));

    sendEmail({
      to: user.email,
      ...emailTemplates.welcome(user.name),
    }).catch((err) => console.error('[signup] welcome email failed:', err));

    // Set auth cookie
    const response = NextResponse.json(
      {
        message: 'User registered successfully',
        requiresEmailVerification: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          city: user.city,
        },
      },
      { status: 201 }
    );

    response.cookies.set('auth_token', token, AUTH_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
