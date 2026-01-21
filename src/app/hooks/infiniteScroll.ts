"use client";

import { useEffect, useRef } from "react";

export function useInfiniteScroll(
  loadMore: () => void,
  hasMore: boolean,
  loading: boolean
) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [loadMore, hasMore, loading]);

  return ref;
}
