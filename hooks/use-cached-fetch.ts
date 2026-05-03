"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const globalCache = new Map<string, { data: unknown; timestamp: number }>();
const STALE_TIME = 60_000;

export function useCachedFetch<T>(url: string | null) {
  const cached = url ? globalCache.get(url) : null;
  const [data, setData] = useState<T | null>(cached ? (cached.data as T) : null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!url) return;
    
    const existing = globalCache.get(url);
    if (existing && Date.now() - existing.timestamp < STALE_TIME) {
      setData(existing.data as T);
      setLoading(false);
      return;
    }

    if (showLoading && !existing) setLoading(true);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();

      globalCache.set(url, { data: result, timestamp: Date.now() });

      if (mountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [url]);

  const refetch = useCallback(() => {
    if (url) globalCache.delete(url);
    return fetchData(false);
  }, [url, fetchData]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  return { data, loading, error, refetch };
}

export function invalidateAll() {
  globalCache.clear();
}
