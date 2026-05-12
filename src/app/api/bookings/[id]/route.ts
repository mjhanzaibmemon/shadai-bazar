import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { verifyAuth } from '@/lib/authMiddleware';

const updateSchema = z.object({
  action: z.enum([
    'confirm', 'decline', 'mark_paid', 'dispatch', 'mark_returned',
    'complete', 'damage_claim', 'cancel',
  ]),
  ownerResponse: z.string().optional(),
  damageClaim: z.string().optional(),
  damageDeduction: z.number().optional(),
  damageClaimImages: z.array(z.string()).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const { id } = await params;
    const b = await Booking.findById(id)
      .populate('renter', 'name email phone')
      .populate('owner', 'name email phone')
      .populate('listing', 'title images rentPricePerDay');
    if (!b) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const uid = auth.user?.userId;
    if (b.renter._id.toString() !== uid && b.owner._id.toString() !== uid) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    return NextResponse.json({ booking: b });
  } catch (e) {
    console.error('Get booking error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const b = await Booking.findById(id);
    if (!b) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const uid = auth.user?.userId;
    const isRenter = b.renter.toString() === uid;
    const isOwner = b.owner.toString() === uid;
    if (!isRenter && !isOwner) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    switch (data.action) {
      case 'confirm':
        if (!isOwner) return NextResponse.json({ error: 'Only owner can confirm' }, { status: 403 });
        if (b.status !== 'requested') return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
        b.status = 'confirmed';
        b.ownerResponse = data.ownerResponse;
        break;

      case 'decline':
        if (!isOwner) return NextResponse.json({ error: 'Only owner can decline' }, { status: 403 });
        b.status = 'declined';
        b.ownerResponse = data.ownerResponse;
        break;

      case 'mark_paid':
        if (!isRenter) return NextResponse.json({ error: 'Only renter can mark paid' }, { status: 403 });
        if (b.status !== 'confirmed') return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
        b.paidAt = new Date();
        b.paymentTransactionId = `TXN_${Date.now()}`;
        break;

      case 'dispatch':
        if (!isOwner) return NextResponse.json({ error: 'Only owner can dispatch' }, { status: 403 });
        if (b.status !== 'confirmed') return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
        b.status = 'active';
        b.dispatchedAt = new Date();
        break;

      case 'mark_returned':
        if (!isOwner) return NextResponse.json({ error: 'Only owner can mark returned' }, { status: 403 });
        if (b.status !== 'active') return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
        b.status = 'returned';
        b.returnedAt = new Date();
        break;

      case 'complete':
        if (!isOwner) return NextResponse.json({ error: 'Only owner can complete' }, { status: 403 });
        if (b.status !== 'returned') return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
        b.status = 'completed';
        // Refund full deposit to renter (in production: trigger payout)
        break;

      case 'damage_claim':
        if (!isOwner) return NextResponse.json({ error: 'Only owner can claim damage' }, { status: 403 });
        b.status = 'damage_claim';
        b.damageClaim = data.damageClaim;
        b.damageDeduction = data.damageDeduction || 0;
        b.damageClaimImages = data.damageClaimImages || [];
        break;

      case 'cancel':
        if (!['requested', 'confirmed'].includes(b.status)) {
          return NextResponse.json({ error: 'Cannot cancel at this stage' }, { status: 400 });
        }
        b.status = 'cancelled';
        break;
    }

    await b.save();
    return NextResponse.json({ message: 'Booking updated', booking: b });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Update booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
