"use client";

interface SoccerBallIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * Minimalist line-art soccer ball: circle outline + classic central
 * pentagon panel + five seams radiating to the rim, where each seam
 * forks into the adjacent hexagon edges. Generic design — not based
 * on any official mascot, branded ball, or trademarked artwork.
 * Stroke weight matches the lucide icons used elsewhere in the navbar.
 */
export function SoccerBallIcon({ className, size = 20, strokeWidth = 2 }: SoccerBallIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Ball outline */}
      <circle cx="12" cy="12" r="9" />
      {/* Central pentagon panel (outline, not filled) */}
      <path d="M12 8 L15.8 10.76 L14.35 15.24 L9.65 15.24 L8.2 10.76 Z" />
      {/* Seams from each pentagon vertex to the rim */}
      <path d="M12 8 V3" />
      <path d="M15.8 10.76 L20.56 9.22" />
      <path d="M14.35 15.24 L17.29 19.28" />
      <path d="M9.65 15.24 L6.71 19.28" />
      <path d="M8.2 10.76 L3.44 9.22" />
    </svg>
  );
}
