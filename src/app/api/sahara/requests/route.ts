import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import { DonationRequest } from '@/models/Donation';
import User from '@/models/User';
import { verifyAuth } from '@/lib/authMiddleware';

const createSchema = z.object({
  fullName: z.string().min(2),
  cnicNumber: z.string().regex(/^[0-9]{5}-?[0-9]{7}-?[0-9]$/),
  phone: z.string().min(10),
  city: z.string(),
  fullAddress: z.string().min(10),
  story: z.string().min(50).max(2000),
  weddingDate: z.string(),                  // ISO date string
  monthlyIncome: z.number().optional(),
  familySize: z.number().optional(),
  referenceNgo: z.enum(['edhi', 'jdc', 'akhuwat', 'other', 'none']).optional(),
  referenceContact: z.string().optional(),
  supportingDocuments: z.array(z.string()).optional(),
  neededCategories: z.array(z.string()),
  sizePreferences: z
    .object({
      sizeLabel: z.string().optional(),
      bust: z.number().optional(),
      waist: z.number().optional(),
      hip: z.number().optional(),
    })
    .optional(),
  colorPreferences: z.array(z.string()).optional(),
  isPubliclyVisible: z.boolean().optional(),
});

// POST: Apply for a donation
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const user = await User.findById(auth.user?.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await request.json();
    const data = createSchema.parse(body);

    // Prevent multiple active requests per user
    const existing = await DonationRequest.findOne({
      applicant: user._id,
      status: { $in: ['pending_review', 'approved', 'matched'] },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'You already have an active request. Admin will review it soon.' },
        { status: 400 }
      );
    }

    const req = await DonationRequest.create({
      ...data,
      applicant: user._id,
      weddingDate: new Date(data.weddingDate),
      cnicNumber: data.cnicNumber.replace(/-/g, ''),
    });

    return NextResponse.json(
      { message: 'Aapki request submit ho gayi. Admin 48 hours mein review karega aur aapko phone par contact karega.', request: req },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Create donation request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Public list of approved stories (anonymized) + admin sees full
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const adminView = searchParams.get('admin') === 'true';

    let user = null;
    if (adminView) {
      const auth = await verifyAuth(request);
      if (!auth.isValid) return auth.response;
      user = await User.findById(auth.user?.userId);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Admin only' }, { status: 403 });
      }
    }

    const filter: Record<string, unknown> = adminView
      ? { status: searchParams.get('status') || 'pending_review' }
      : { status: { $in: ['approved', 'matched'] }, isPubliclyVisible: true };

    const requests = await DonationRequest.find(filter)
      .populate('applicant', 'name')
      .sort({ weddingDate: 1 })
      .limit(100);

    // Strip sensitive fields for public view
    const safe = adminView
      ? requests
      : requests.map((r) => ({
          _id: r._id,
          fullName: r.fullName.split(' ')[0] + ' ' + (r.fullName.split(' ')[1]?.[0] || '') + '.',
          city: r.city,
          story: r.story,
          weddingDate: r.weddingDate,
          neededCategories: r.neededCategories,
          status: r.status,
          referenceNgo: r.referenceNgo,
        }));

    return NextResponse.json({ requests: safe });
  } catch (error) {
    console.error('Get donation requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
