// In-memory sliding-window rate limiter.
// Suitable for single-instance deployments; for multi-instance use Redis.
const buckets = new Map<string, number[]>();

export function rateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const cutoff = now - windowMs;
  const timestamps = (buckets.get(key) || []).filter((t) => t > cutoff);

  if (timestamps.length >= limit) {
    return { ok: false, remaining: 0, resetAt: timestamps[0] + windowMs };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);

  // Opportunistic GC: if Map grows too large, prune empty/expired entries.
  if (buckets.size > 10000) {
    for (const [k, v] of buckets) {
      if (v.filter((t) => t > cutoff).length === 0) buckets.delete(k);
    }
  }

  return { ok: true, remaining: limit - timestamps.length, resetAt: now + windowMs };
}
