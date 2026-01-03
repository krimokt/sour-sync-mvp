import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export type RateLimitKeyParts = {
  ip?: string | null;
  userId?: string | null;
  route: string;
};

export function getClientIp(req: Request): string | null {
  // Works behind common proxies (Netlify/Vercel/Cloudflare)
  const h = req.headers;
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    h.get('cf-connecting-ip') ||
    null
  );
}

export async function rateLimit(
  parts: RateLimitKeyParts,
  config: { limit: number; window: `${number} s` | `${number} m` | `${number} h` }
) {
  const redis = getRedis();
  if (!redis) {
    // If not configured, do not block (safe default for dev), but caller can log.
    return { ok: true as const, reset: 0, remaining: 0 };
  }

  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.limit, config.window),
    analytics: true,
  });

  const key = [
    parts.route,
    parts.userId ? `u:${parts.userId}` : null,
    parts.ip ? `ip:${parts.ip}` : null,
  ]
    .filter(Boolean)
    .join('|');

  const res = await rl.limit(key);
  return { ok: res.success, reset: res.reset, remaining: res.remaining };
}


