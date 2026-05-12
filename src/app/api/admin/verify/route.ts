import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/authMiddleware';

const reviewSchema = z.object({
  userId: z.string(),
  decision: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
});

// GET: List pending verification requests (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const admin = await User.findById(auth.user?.userId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const users = await User.find({ 'verification.status': status })
      .select('name email phone city verification createdAt')
      .sort({ 'verification.submittedAt': 1 });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin verify list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Approve or reject a verification request
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const admin = await User.findById(auth.user?.userId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, decision, rejectionReason } = reviewSchema.parse(body);

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (decision === 'approve') {
      user.isVerified = true;
      user.verification = {
        ...user.verification,
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: admin._id,
        rejectionReason: undefined,
      };
    } else {
      user.isVerified = false;
      user.verification = {
        ...user.verification,
        status: 'rejected',
        rejectionReason: rejectionReason || 'Documents could not be verified',
      };
    }
    await user.save();

    return NextResponse.json({
      message: `Verification ${decision === 'approve' ? 'approved' : 'rejected'}`,
      status: user.verification.status,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Admin verify decide error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
