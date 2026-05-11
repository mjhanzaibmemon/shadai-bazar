import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';
import { verifyAuth } from '@/lib/authMiddleware';

const createListingSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  category: z.enum(['bridal', 'groom-wear', 'formal-party', 'casual-ethnic', 'kids', 'accessories']),
  price: z.number().min(100),
  originalPrice: z.number().optional(),
  condition: z.enum(['new_with_tags', 'worn_once', 'worn_few_times', 'minor_alterations']),
  fabric: z.string(),
  size: z.object({
    chest: z.number().optional(),
    waist: z.number().optional(),
    hip: z.number().optional(),
    length: z.number().optional(),
    shoulder: z.number().optional(),
  }).optional(),
  images: z.array(z.string()).min(1).max(10),
  defects: z.string().optional(),
  city: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const condition = searchParams.get('condition');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    const filter: any = { status: 'active' };

    if (category) filter.category = category;
    if (city) filter.city = city;
    if (condition) filter.condition = condition;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj: any = {};
    switch (sort) {
      case 'newest':
        sortObj.createdAt = -1;
        break;
      case 'oldest':
        sortObj.createdAt = 1;
        break;
      case 'price-low':
        sortObj.price = 1;
        break;
      case 'price-high':
        sortObj.price = -1;
        break;
      case 'popular':
        sortObj.views = -1;
        break;
      default:
        sortObj.createdAt = -1;
    }

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('seller', 'name avatar city'),
      Listing.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        listings,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get listings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return auth.response;
    }

    const body = await request.json();
    const validatedData = createListingSchema.parse(body);

    const listing = new Listing({
      ...validatedData,
      seller: auth.user?.userId,
      status: 'active',
      views: 0,
    });

    await listing.save();
    await listing.populate('seller', 'name avatar city');

    return NextResponse.json(
      {
        message: 'Listing created successfully',
        listing,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Create listing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
