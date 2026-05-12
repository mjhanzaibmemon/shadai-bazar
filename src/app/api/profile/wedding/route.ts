import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/authMiddleware';

const updateSchema = z.object({
  weddingDate: z.string().optional(),
  role: z.enum(['bride', 'groom', 'family', 'guest', 'none']).optional(),
  budget: z.number().min(0).optional(),
  spent: z.number().min(0).optional(),
});

// GET: Current user's wedding profile
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const user = await User.findById(auth.user?.userId).select('weddingProfile wishlist').populate({
      path: 'wishlist',
      select: 'title price images city status',
    });

    return NextResponse.json({
      profile: user?.weddingProfile || null,
      wishlist: user?.wishlist || [],
    });
  } catch (error) {
    console.error('Get wedding profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update profile + generate share token if not exists
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const body = await request.json();
    const data = updateSchema.parse(body);

    const user = await User.findById(auth.user?.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.weddingProfile = {
      ...user.weddingProfile,
      weddingDate: data.weddingDate ? new Date(data.weddingDate) : user.weddingProfile?.weddingDate,
      role: data.role ?? user.weddingProfile?.role ?? 'none',
      budget: data.budget ?? user.weddingProfile?.budget ?? 0,
      spent: data.spent ?? user.weddingProfile?.spent ?? 0,
      shareToken: user.weddingProfile?.shareToken || crypto.randomBytes(12).toString('hex'),
    };
    await user.save();

    return NextResponse.json({ profile: user.weddingProfile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Update wedding profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
