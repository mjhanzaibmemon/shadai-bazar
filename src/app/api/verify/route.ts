import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/authMiddleware';

const submitSchema = z.object({
  cnicNumber: z
    .string()
    .regex(/^[0-9]{5}-?[0-9]{7}-?[0-9]$/, 'CNIC format invalid (e.g. 42101-1234567-1)'),
  cnicFrontImage: z.string().min(20, 'Front CNIC image is required'),
  cnicBackImage: z.string().min(20, 'Back CNIC image is required'),
  selfieWithCnic: z.string().min(20, 'Selfie with CNIC is required'),
});

// Submit verification documents
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const body = await request.json();
    const data = submitSchema.parse(body);

    const user = await User.findById(auth.user?.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (user.verification?.status === 'approved') {
      return NextResponse.json({ error: 'You are already verified' }, { status: 400 });
    }

    user.verification = {
      ...user.verification,
      cnicNumber: data.cnicNumber.replace(/-/g, ''),
      cnicFrontImage: data.cnicFrontImage,
      cnicBackImage: data.cnicBackImage,
      selfieWithCnic: data.selfieWithCnic,
      status: 'pending',
      submittedAt: new Date(),
      rejectionReason: undefined,
    };
    await user.save();

    return NextResponse.json(
      {
        message: 'Verification submitted. Admin will review within 24-48 hours.',
        status: user.verification.status,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Verification submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get current verification status
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const user = await User.findById(auth.user?.userId).select('isVerified verification');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({
      isVerified: user.isVerified,
      status: user.verification?.status || 'unverified',
      rejectionReason: user.verification?.rejectionReason || null,
      submittedAt: user.verification?.submittedAt || null,
    });
  } catch (error) {
    console.error('Get verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
