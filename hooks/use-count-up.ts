"use client";

import { useEffect, useState } from "react";

/**
 * Animates a number from 0 to `target` after mount.
 * Uses requestAnimationFrame with ease-out for smooth animation.
 * Starts only client-side to avoid SSR hydration mismatches.
 */
export function useCountUp(target: number, durationMs = 1000): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target <= 0) return;

    let startTime: number | null = null;
    let rafId: number;

    const step = (ts: number) => {
      if (startTime === null) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs]);

  return count;
}
