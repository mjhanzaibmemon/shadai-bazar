import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from './rateLimit';

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return 'unknown';
}

export function enforceRateLimit(
  request: NextRequest,
  opts: { key: string; limit: number; windowMs: number }
): NextResponse | null {
  const result = rateLimit(opts);
  if (result.ok) return null;

  const msUntilReset = Math.max(0, result.resetAt - Date.now());
  const seconds = Math.ceil(msUntilReset / 1000);

  return NextResponse.json(
    { error: 'Too many requests', retryAfter: msUntilReset },
    {
      status: 429,
      headers: { 'Retry-After': String(seconds) },
    }
  );
}
