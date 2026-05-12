import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import { DonationListing } from '@/models/Donation';
import User from '@/models/User';
import { verifyAuth } from '@/lib/authMiddleware';

const createSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  category: z.string(),
  subCategory: z.string().optional(),
  sizeLabel: z.string().optional(),
  images: z.array(z.string()).min(1).max(10),
  city: z.string(),
  estimatedValue: z.number().min(0).optional(),
});

// POST: Donate a dress
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const user = await User.findById(auth.user?.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await request.json();
    const data = createSchema.parse(body);

    const donation = await DonationListing.create({
      ...data,
      donor: user._id,
      estimatedValue: data.estimatedValue || 0,
    });

    return NextResponse.json(
      { message: 'Thank you for donating! Admin will match it to a recipient.', donation },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Create donation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Browse available donations (anyone can view)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'available';

    const filter: Record<string, unknown> = { status };
    if (city) filter.city = city;
    if (category) filter.category = category;

    const donations = await DonationListing.find(filter)
      .populate('donor', 'name city')
      .sort({ createdAt: -1 })
      .limit(60);

    return NextResponse.json({ donations });
  } catch (error) {
    console.error('Get donations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
