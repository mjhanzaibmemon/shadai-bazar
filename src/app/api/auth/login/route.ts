import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, signToken, AUTH_COOKIE_OPTIONS } from '@/lib/auth';
import { enforceRateLimit, getClientIp } from '@/lib/rateLimitMiddleware';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const limited = enforceRateLimit(request, {
      key: `login:${getClientIp(request)}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (limited) return limited;

    await connectDB();

    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if account is suspended
    if (user.isSuspended) {
      return NextResponse.json({ error: 'Account is suspended' }, { status: 403 });
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Sign token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const response = NextResponse.json(
      {
        message: 'Logged in successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          city: user.city,
          role: user.role,
        },
      },
      { status: 200 }
    );

    response.cookies.set('auth_token', token, AUTH_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
