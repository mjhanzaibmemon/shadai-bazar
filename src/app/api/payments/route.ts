import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Listing from '@/models/Listing';
import { verifyAuth } from '@/lib/authMiddleware';

const createPaymentSchema = z.object({
  listingId: z.string(),
  amount: z.number().min(50),
  type: z.enum(['featured_listing']),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return auth.response;
    }

    const body = await request.json();
    const { listingId, amount, type } = createPaymentSchema.parse(body);

    // Verify listing exists and belongs to user
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.seller.toString() !== auth.user?.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Create payment record
    const payment = new Payment({
      user: auth.user?.userId,
      listing: listingId,
      amount,
      type,
      status: 'pending',
      transactionId: `TXN_${Date.now()}`,
      paymentMethod: 'jazzcash', // Default to JazzCash
    });

    await payment.save();

    // In production, redirect to JazzCash payment gateway
    // For now, return payment details
    return NextResponse.json(
      {
        message: 'Payment initiated',
        payment,
        // In production:
        // redirectUrl: jazzcash.initiate(payment)
        redirectUrl: '/payments/pending',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return auth.response;
    }

    const payments = await Payment.find({ user: auth.user?.userId })
      .sort({ createdAt: -1 })
      .populate('listing', 'title');

    return NextResponse.json({ payments }, { status: 200 });
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
