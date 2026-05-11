import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { verifyAuth } from '@/lib/authMiddleware';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return auth.response;
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
    }

    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.reviewer.toString() !== auth.user?.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await Review.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Review deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
