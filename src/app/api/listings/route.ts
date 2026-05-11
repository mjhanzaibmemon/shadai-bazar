import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';
import { verifyAuth } from '@/lib/authMiddleware';
import {
  ALL_CATEGORY_IDS,
  ALL_SUB_CATEGORY_IDS,
  OCCASIONS,
  FABRICS,
  BRANDS,
  WORK_TYPES,
  SIZE_LABELS,
} from '@/lib/constants';

const sizeSchema = z
  .object({
    bust: z.number().optional(),
    chest: z.number().optional(),
    waist: z.number().optional(),
    hip: z.number().optional(),
    shoulder: z.number().optional(),
    sleeve: z.number().optional(),
    length: z.number().optional(),
    bottomLength: z.number().optional(),
    armhole: z.number().optional(),
    neckDepth: z.number().optional(),
    neck: z.number().optional(),
    inseam: z.number().optional(),
  })
  .optional();

const createListingSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),

  // Categorization
  category: z.enum(ALL_CATEGORY_IDS as unknown as [string, ...string[]]),
  subCategory: z
    .enum(ALL_SUB_CATEGORY_IDS as unknown as [string, ...string[]])
    .optional(),
  occasion: z
    .array(z.enum(OCCASIONS.map((o) => o.id) as unknown as [string, ...string[]]))
    .optional(),
  gender: z.enum(['women', 'men', 'kids', 'unisex']).optional(),

  // Pricing
  price: z.number().min(100),
  originalPrice: z.number().optional(),
  listingType: z.enum(['sell', 'rent', 'both']).optional(),
  rentPricePerDay: z.number().optional(),
  rentDuration: z.number().optional(),

  // Product details
  condition: z.enum([
    'new_with_tags',
    'unworn_no_tags',
    'worn_once',
    'worn_few_times',
    'minor_alterations',
  ]),
  fabric: z.enum(FABRICS as unknown as [string, ...string[]]),
  workType: z.enum(WORK_TYPES as unknown as [string, ...string[]]).optional(),
  brand: z.enum(BRANDS as unknown as [string, ...string[]]).optional(),
  color: z.string().optional(),
  sizeLabel: z
    .enum(SIZE_LABELS.map((s) => s.id) as unknown as [string, ...string[]])
    .optional(),
  size: sizeSchema,

  // Media
  images: z.array(z.string()).min(1).max(10),

  // Disclosure
  defects: z.string().optional(),
  damageDisclosed: z.boolean(),
  hasOriginalReceipt: z.boolean().optional(),

  // Location & delivery
  city: z.string(),
  area: z.string().optional(),
  deliveryOptions: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category    = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const city        = searchParams.get('city');
    const minPrice    = searchParams.get('minPrice');
    const maxPrice    = searchParams.get('maxPrice');
    const condition   = searchParams.get('condition');
    const color       = searchParams.get('color');
    const brand       = searchParams.get('brand');
    const occasion    = searchParams.get('occasion');
    const sizeLabel   = searchParams.get('sizeLabel');
    const listingType = searchParams.get('listingType');
    const search      = searchParams.get('search');
    const sort        = searchParams.get('sort') || 'newest';
    const page        = parseInt(searchParams.get('page') || '1');
    const limit       = 20;
    const skip        = (page - 1) * limit;

    const filter: Record<string, unknown> = { status: 'active' };

    if (category)    filter.category    = category;
    if (subCategory) filter.subCategory = subCategory;
    if (city)        filter.city        = city;
    if (condition)   filter.condition   = condition;
    if (color)       filter.color       = color;
    if (brand)       filter.brand       = brand;
    if (occasion)    filter.occasion    = occasion;
    if (sizeLabel)   filter.sizeLabel   = sizeLabel;
    if (listingType) filter.listingType = listingType;

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = parseInt(minPrice);
      if (maxPrice) priceFilter.$lte = parseInt(maxPrice);
      filter.price = priceFilter;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj: Record<string, 1 | -1> = {};
    switch (sort) {
      case 'newest':     sortObj.createdAt = -1; break;
      case 'oldest':     sortObj.createdAt =  1; break;
      case 'price-low':  sortObj.price     =  1; break;
      case 'price-high': sortObj.price     = -1; break;
      case 'popular':    sortObj.views     = -1; break;
      default:           sortObj.createdAt = -1;
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

    // TRUST GATE: seller MUST confirm damage disclosure
    if (!validatedData.damageDisclosed) {
      return NextResponse.json(
        {
          error:
            'Please confirm damage disclosure — buyers need to know about any defects.',
        },
        { status: 400 }
      );
    }

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
