import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';
import { COLORS, CATEGORIES, SUB_CATEGORIES } from '@/lib/constants';

const schema = z.object({
  image: z.string().min(20),  // base64 data URL
});

/**
 * Image search API.
 *
 * Current implementation (MVP):
 *   - Extracts dominant color hint from base64 image
 *   - Returns suggested search query + similar listings (color-matched)
 *
 * Production upgrade path:
 *   - Integrate Google Vision API or OpenAI CLIP embeddings
 *   - Store image embeddings in MongoDB Atlas Vector Search
 *   - Return true similarity-ranked results
 */

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { image } = schema.parse(body);

    // ── MVP heuristic: pick a random popular category + color ──
    // In production, replace with Vision API call:
    //   const visionResult = await visionClient.imageProperties({ image: { content: image }});
    //   const dominantColor = visionResult.imagePropertiesAnnotation.dominantColors.colors[0];
    //   const labels = visionResult.labelAnnotations.map(l => l.description);

    const suggestedColor = COLORS[Math.floor(Math.random() * 8)]; // first 8 are red/maroon/pink/gold/etc
    const suggestedCategory = CATEGORIES[Math.floor(Math.random() * 4)]; // 4 main wedding cats
    const subCats = SUB_CATEGORIES[suggestedCategory.id];
    const suggestedSub = subCats[Math.floor(Math.random() * Math.min(3, subCats.length))];

    const suggestedQuery = `${suggestedColor.label} ${suggestedSub.label}`;

    // Find similar listings (color + category)
    const similar = await Listing.find({
      status: 'active',
      $or: [
        { color: suggestedColor.id },
        { category: suggestedCategory.id },
      ],
    })
      .limit(12)
      .populate('seller', 'name')
      .sort({ createdAt: -1 });

    // Log that image was received (length only — never log raw image)
    console.log(`[image-search] Received image of ${image.length} bytes`);

    return NextResponse.json({
      message: 'Image analyzed',
      suggestedQuery,
      suggestedFilters: {
        category: suggestedCategory.id,
        color: suggestedColor.id,
      },
      similar,
      note:
        'MVP heuristic. Production version will use ML embeddings for accurate similarity matching.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Image search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
