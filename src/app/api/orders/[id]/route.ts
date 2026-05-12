import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyAuth } from '@/lib/authMiddleware';

const INSPECTION_WINDOW_DAYS = 3;

const updateSchema = z.object({
  action: z.enum([
    'mark_paid',
    'mark_shipped',
    'mark_delivered',
    'buyer_confirm',
    'open_dispute',
    'cancel',
  ]),
  trackingNumber: z.string().optional(),
  courier: z.enum(['tcs', 'leopards', 'mnp', 'pickup']).optional(),
  disputeReason: z.string().optional(),
  disputeImages: z.array(z.string()).optional(),
  paymentTransactionId: z.string().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

// GET: Get one order (buyer or seller only)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const { id } = await params;
    const order = await Order.findById(id)
      .populate('buyer', 'name email phone')
      .populate('seller', 'name email phone')
      .populate('listing', 'title images price');

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const userId = auth.user?.userId;
    if (
      order.buyer._id.toString() !== userId &&
      order.seller._id.toString() !== userId
    ) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update order state (escrow state machine)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const userId = auth.user?.userId;
    const isBuyer = order.buyer.toString() === userId;
    const isSeller = order.seller.toString() === userId;
    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    switch (data.action) {
      case 'mark_paid':
        if (!isBuyer) return NextResponse.json({ error: 'Only buyer can mark paid' }, { status: 403 });
        if (order.status !== 'pending_payment') {
          return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
        }
        order.status = 'paid';
        order.paidAt = new Date();
        order.paymentTransactionId = data.paymentTransactionId || `TXN_${Date.now()}`;
        break;

      case 'mark_shipped':
        if (!isSeller) return NextResponse.json({ error: 'Only seller can mark shipped' }, { status: 403 });
        if (order.status !== 'paid') {
          return NextResponse.json({ error: 'Order must be paid before shipping' }, { status: 400 });
        }
        order.status = 'shipped';
        order.shippedAt = new Date();
        order.trackingNumber = data.trackingNumber || null;
        order.courier = data.courier || null;
        break;

      case 'mark_delivered':
        if (order.status !== 'shipped') {
          return NextResponse.json({ error: 'Order is not shipped' }, { status: 400 });
        }
        order.status = 'delivered';
        order.deliveredAt = new Date();
        order.inspectionDeadline = new Date(Date.now() + INSPECTION_WINDOW_DAYS * 24 * 60 * 60 * 1000);
        break;

      case 'buyer_confirm':
        if (!isBuyer) return NextResponse.json({ error: 'Only buyer can confirm' }, { status: 403 });
        if (order.status !== 'delivered') {
          return NextResponse.json({ error: 'Order must be delivered first' }, { status: 400 });
        }
        order.status = 'completed';
        order.buyerConfirmedAt = new Date();
        // Seller payout queued (in production, JazzCash IBFT API call here)
        break;

      case 'open_dispute':
        if (!isBuyer) return NextResponse.json({ error: 'Only buyer can open dispute' }, { status: 403 });
        if (!['delivered', 'shipped'].includes(order.status)) {
          return NextResponse.json({ error: 'Cannot dispute at this stage' }, { status: 400 });
        }
        order.status = 'disputed';
        order.disputeReason = data.disputeReason || 'Buyer raised dispute';
        order.disputeImages = data.disputeImages || [];
        order.disputeOpenedAt = new Date();
        break;

      case 'cancel':
        if (!['pending_payment', 'paid'].includes(order.status)) {
          return NextResponse.json({ error: 'Cannot cancel at this stage' }, { status: 400 });
        }
        order.status = 'cancelled';
        break;
    }

    await order.save();
    return NextResponse.json({ message: 'Order updated', order });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
