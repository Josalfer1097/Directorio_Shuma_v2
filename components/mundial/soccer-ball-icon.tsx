"use client";

interface SoccerBallIconProps {
  className?: string;
  size?: number;
}

/**
 * Original, generic stylized soccer ball icon.
 * Not based on any official mascot, branded ball, or trademarked design.
 */
export function SoccerBallIcon({ className, size = 20 }: SoccerBallIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Outer ball */}
      <circle cx="12" cy="12" r="9.25" />
      {/* Center pentagon */}
      <path d="M12 7.6 L15.6 10.3 L14.2 14.6 L9.8 14.6 L8.4 10.3 Z" fill="currentColor" stroke="none" opacity="0.85" />
      {/* Seams radiating to the edge */}
      <path d="M12 7.6 L12 2.9" />
      <path d="M15.6 10.3 L20.6 8.8" />
      <path d="M14.2 14.6 L17.4 18.6" />
      <path d="M9.8 14.6 L6.6 18.6" />
      <path d="M8.4 10.3 L3.4 8.8" />
    </svg>
  );
}
