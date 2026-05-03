const cache = new Map<string, { data: unknown; timestamp: number }>();

const STALE_TIME = 30_000; // 30 seconds

export async function cachedFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const key = url;
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < STALE_TIME) {
    return cached.data as T;
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  const data = await response.json();
  cache.set(key, { data, timestamp: now });
  return data as T;
}

export function invalidateCache(url?: string) {
  if (url) {
    cache.delete(url);
  } else {
    cache.clear();
  }
}

export function prefetchUrl(url: string) {
  cachedFetch(url).catch(() => {});
}
