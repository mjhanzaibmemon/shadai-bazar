import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Listing from '@/models/Listing';
import { verifyAuth } from '@/lib/authMiddleware';

const PLATFORM_FEE_PCT = 0.05;     // 5% commission

const createOrderSchema = z.object({
  listingId: z.string(),
  paymentMethod: z.enum(['jazzcash', 'easypaisa', 'bank_transfer', 'cod']),
  shippingAddress: z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
    city: z.string(),
    area: z.string(),
    fullAddress: z.string().min(10),
  }),
  shippingFee: z.number().min(0).optional(),
});

// POST: Buyer creates a new order (payment held in escrow)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const body = await request.json();
    const data = createOrderSchema.parse(body);

    const listing = await Listing.findById(data.listingId);
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'Listing is no longer available' }, { status: 400 });
    }
    if (listing.seller.toString() === auth.user?.userId) {
      return NextResponse.json({ error: 'You cannot buy your own listing' }, { status: 400 });
    }

    const amount = listing.price;
    const shippingFee = data.shippingFee || 0;
    const platformFee = Math.round(amount * PLATFORM_FEE_PCT);
    const totalAmount = amount + shippingFee;       // buyer pays this; commission deducted from seller payout

    const order = await Order.create({
      buyer: auth.user?.userId,
      seller: listing.seller,
      listing: listing._id,
      amount,
      platformFee,
      shippingFee,
      totalAmount,
      paymentMethod: data.paymentMethod,
      shippingAddress: data.shippingAddress,
      status: data.paymentMethod === 'cod' ? 'paid' : 'pending_payment',
      paidAt: data.paymentMethod === 'cod' ? new Date() : null,
    });

    return NextResponse.json(
      { message: 'Order created. Awaiting payment confirmation.', order },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: List orders for current user (as buyer or seller)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'buyer';

    const filter =
      role === 'seller'
        ? { seller: auth.user?.userId }
        : { buyer: auth.user?.userId };

    const orders = await Order.find(filter)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('listing', 'title images price')
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
