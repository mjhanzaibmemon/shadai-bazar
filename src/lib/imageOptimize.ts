import sharp from 'sharp';

// Server-side image optimization with sharp.
// Pipeline: read input → cap width at 1600px (preserve aspect) → encode WebP @ q=82.
// WebP at this quality is visually indistinguishable from JPEG q=90 but typically
// 25-35% smaller, which matters a lot for marketplace listing photos.

const MAX_WIDTH = 1600;
const WEBP_QUALITY = 82;

export async function optimizeImage(
  buffer: Buffer
): Promise<{ buffer: Buffer; format: 'webp'; size: number }> {
  try {
    const image = sharp(buffer, { failOn: 'truncated' });
    const metadata = await image.metadata();

    // Only resize when the source is wider than the cap; sharp's `withoutEnlargement`
    // would also work but reading the width explicitly makes the intent obvious.
    let pipeline = image;
    if (metadata.width && metadata.width > MAX_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }

    const out = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();

    return {
      buffer: out,
      format: 'webp',
      size: out.length,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Image optimization failed: ${message}`);
  }
}
