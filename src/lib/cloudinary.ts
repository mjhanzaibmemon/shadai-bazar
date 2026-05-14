import { createHash } from 'crypto';

// Cloudinary cloud upload via REST API.
// We avoid the SDK (extra dep, extra cold-start cost) and just hit
// https://api.cloudinary.com/v1_1/{cloud_name}/image/upload directly with
// a signed upload. Signed uploads are more reliable than unsigned because
// they don't require pre-configuring an upload preset in the dashboard.
//
// Required env vars (when enabled):
//   CLOUDINARY_CLOUD_NAME  - your cloud name (e.g. "shaadibazaar")
//   CLOUDINARY_API_KEY     - the public API key
//   CLOUDINARY_API_SECRET  - the secret used to sign the request
//
// If any of these are missing the upload route falls back to local-disk
// storage (which already exists and works) so dev / local setups still
// function without configuring Cloudinary.

const CLOUD_FOLDER = 'shaadi-bazaar/listings';

export function isCloudinaryEnabled(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

interface CloudinaryUploadResponse {
  secure_url?: string;
  url?: string;
  error?: { message: string };
}

// Build the SHA-1 signature Cloudinary expects.
// Algorithm: sort params alphabetically, join as `k=v&k=v`, append api_secret,
// then SHA-1 hash. The `file`, `api_key`, `resource_type`, `cloud_name`, and
// `signature` params themselves are NEVER part of the signed string.
function buildSignature(
  params: Record<string, string | number>,
  apiSecret: string
): string {
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
  return createHash('sha1').update(toSign + apiSecret).digest('hex');
}

export async function uploadToCloudinary(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary env vars not configured');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  // public_id is the filename without extension — Cloudinary derives the
  // extension from the binary's format. We pass folder as a separate param
  // (so it shows up correctly in the dashboard) and let Cloudinary build
  // the final public_id as `${folder}/${public_id}`.
  const publicId = filename.replace(/\.[^.]+$/, '');

  // Only these params participate in the signature. `file`, `api_key`, and
  // `resource_type` must be omitted from the signed string per Cloudinary's
  // signing spec.
  const signedParams: Record<string, string | number> = {
    folder: CLOUD_FOLDER,
    public_id: publicId,
    timestamp,
  };
  const signature = buildSignature(signedParams, apiSecret);

  const form = new FormData();
  // Convert Buffer -> Blob so undici's FormData accepts it cleanly.
  // Using `as unknown as Uint8Array` because Node's Buffer is a Uint8Array
  // subclass but TS types for the global Blob constructor don't always agree.
  const blob = new Blob([new Uint8Array(buffer)]);
  form.append('file', blob, filename);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder', CLOUD_FOLDER);
  form.append('public_id', publicId);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const res = await fetch(endpoint, {
    method: 'POST',
    body: form,
  });

  // Read body once; useful for error reporting whether status is ok or not.
  const data = (await res.json().catch(() => ({}))) as CloudinaryUploadResponse;

  if (!res.ok) {
    const msg = data?.error?.message || `Cloudinary upload failed: ${res.status}`;
    throw new Error(msg);
  }

  const url = data.secure_url || data.url;
  if (!url) {
    throw new Error('Cloudinary response missing secure_url');
  }
  return url;
}
