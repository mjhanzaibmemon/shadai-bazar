import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { verifyAuth } from '@/lib/authMiddleware';
import { isCloudinaryEnabled, uploadToCloudinary } from '@/lib/cloudinary';
import { optimizeImage } from '@/lib/imageOptimize';
import { enforceRateLimit, getClientIp } from '@/lib/rateLimitMiddleware';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Image upload — accepts JPEG/PNG/WebP/GIF, runs each file through sharp
// (resize + WebP encode), then either uploads to Cloudinary (when configured
// via env vars) or saves to public/uploads/ and returns /api/uploads/<name>.
export async function POST(request: NextRequest) {
  try {
    const limited = enforceRateLimit(request, {
      key: `upload:${getClientIp(request)}`,
      limit: 30,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    const auth = await verifyAuth(request);
    if (!auth.isValid) return auth.response;

    const formData = await request.formData();
    // Support both `file` (single) and `files` (multiple) field names
    const single = formData.get('file') as File | null;
    const multiple = formData.getAll('files') as File[];
    const files = [...(single ? [single] : []), ...multiple].filter(Boolean);

    if (files.length === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Only create the local uploads dir if we're actually going to use it.
    const useCloudinary = isCloudinaryEnabled();
    if (!useCloudinary && !existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const optimized = await optimizeImage(buffer);

      const filename = `${Date.now()}-${randomBytes(8).toString('hex')}.webp`;

      let url: string;
      if (useCloudinary) {
        url = await uploadToCloudinary(optimized.buffer, filename);
      } else {
        const filepath = path.join(UPLOAD_DIR, filename);
        await writeFile(filepath, optimized.buffer);
        url = `/api/uploads/${filename}`;
      }

      urls.push(url);
    }

    // Return single `url` for backward-compat AND `urls` array
    return NextResponse.json(
      { url: urls[0], urls, count: urls.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
