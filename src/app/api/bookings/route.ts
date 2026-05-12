import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Listing from '@/models/Listing';
import { verifyAuth } from '@/lib/authMiddleware';

const PLATFORM_FEE_PCT = 0.05;
const DEFAULT_DEPOSIT_MULTIPLIER = 2;   // deposit = 2x daily rate

const createSchema = z.object({
  listingId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  deliveryAddress: z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
    city: z.string(),
    area: z.string(),
    fullAddress: z.string().min(10),
  }),
  paymentMethod: z.enum(['jazzcash', 'easypaisa', 'bank_transfer', 'cod']),
  renterNote: z.string().optional(),
});

// POST: Renter requests a booking
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const body = await request.json();
    const data = createSchema.parse(body);

    const listing = await Listing.findById(data.listingId);
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (!['rent', 'both'].includes(listing.listingType || 'sell')) {
      return NextResponse.json({ error: 'This listing is not available for rent' }, { status: 400 });
    }
    if (listing.seller.toString() === auth.user?.userId) {
      return NextResponse.json({ error: 'You cannot rent your own listing' }, { status: 400 });
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });

    const numberOfDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const rentPricePerDay = listing.rentPricePerDay || Math.round(listing.price * 0.1);
    const subtotal = numberOfDays * rentPricePerDay;
    const securityDeposit = rentPricePerDay * DEFAULT_DEPOSIT_MULTIPLIER;
    const platformFee = Math.round(subtotal * PLATFORM_FEE_PCT);
    const totalAmount = subtotal + securityDeposit + platformFee;

    // Check for overlapping booking on same listing
    const conflict = await Booking.findOne({
      listing: listing._id,
      status: { $in: ['confirmed', 'active'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });
    if (conflict) {
      return NextResponse.json(
        { error: 'These dates are already booked. Please choose different dates.' },
        { status: 400 }
      );
    }

    const booking = await Booking.create({
      renter: auth.user?.userId,
      owner: listing.seller,
      listing: listing._id,
      startDate: start,
      endDate: end,
      numberOfDays,
      rentPricePerDay,
      subtotal,
      securityDeposit,
      platformFee,
      totalAmount,
      deliveryAddress: data.deliveryAddress,
      paymentMethod: data.paymentMethod,
      renterNote: data.renterNote,
      status: 'requested',
    });

    return NextResponse.json(
      { message: 'Booking request sent. Seller will confirm shortly.', booking },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: List bookings for current user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'renter';

    const filter = role === 'owner'
      ? { owner: auth.user?.userId }
      : { renter: auth.user?.userId };

    const bookings = await Booking.find(filter)
      .populate('renter', 'name phone')
      .populate('owner', 'name phone')
      .populate('listing', 'title images rentPricePerDay')
      .sort({ createdAt: -1 });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
