"use client";
import type { ReactNode } from "react";
import { useSeasonalVariant } from "./seasonal-provider";

/**
 * Wraps an avatar. During the season it lays a marigold garland over the avatar
 * edge. The ring extends 23% beyond the avatar on every side, while the wrapper
 * keeps the avatar's own size, so the layout does not shift.
 */
export function MarigoldWreath({ children, className = "" }: { children: ReactNode; className?: string }) {
  const variant = useSeasonalVariant();
  return (
    <div className={`relative ${className}`}>
      {children}
      {variant ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/seasonal/corona-cempasuchil.svg"
          alt=""
          aria-hidden="true"
          draggable={false}
          decoding="async"
          className="pointer-events-none absolute select-none"
          style={{ top: "-23%", left: "-23%", width: "146%", height: "146%", maxWidth: "none" }}
        />
      ) : null}
    </div>
  );
}
