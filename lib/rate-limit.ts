import { prisma } from "./db";

/**
 * In-memory rate limiter (fast, used as first layer).
 * Works within a single process — effective on traditional hosting.
 * On serverless, acts as a quick reject for obvious abuse within
 * the same warm function instance.
 */
const rateMap = new Map<string, { count: number; resetAt: number }>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  rateMap.forEach((val, key) => {
    if (val.resetAt < now) rateMap.delete(key);
  });
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  cleanup();
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count };
}

/**
 * Database-backed rate limiter for critical security paths (login, OTP).
 * Persists across serverless invocations.
 * Use for: login attempts, OTP sends, password resets.
 */
export async function rateLimitDb(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number }> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    const entry = await prisma.rateLimitEntry.findUnique({ where: { key } });

    if (!entry || entry.resetAt < now) {
      await prisma.rateLimitEntry.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      return { success: true, remaining: limit - 1 };
    }

    if (entry.count >= limit) {
      return { success: false, remaining: 0 };
    }

    await prisma.rateLimitEntry.update({
      where: { key },
      data: { count: entry.count + 1 },
    });

    return { success: true, remaining: limit - (entry.count + 1) };
  } catch {
    // If DB is down, fall back to in-memory
    return rateLimit(key, limit, windowMs);
  }
}
