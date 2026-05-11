import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';
import { verifyAuth } from '@/lib/authMiddleware';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }

    const listing = await Listing.findByIdAndUpdate(
      params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('seller', 'name avatar city phone email');

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({ listing }, { status: 200 });
  } catch (error) {
    console.error('Get listing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return auth.response;
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }

    const listing = await Listing.findById(params.id);

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.seller.toString() !== auth.user?.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    Object.assign(listing, body);
    await listing.save();

    return NextResponse.json(
      {
        message: 'Listing updated successfully',
        listing,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update listing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return auth.response;
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }

    const listing = await Listing.findById(params.id);

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.seller.toString() !== auth.user?.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await Listing.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Listing deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete listing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
