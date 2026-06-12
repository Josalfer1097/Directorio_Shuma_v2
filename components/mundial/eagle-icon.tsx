/**
 * Minimalist original eagle silhouette — simple line-art, side profile.
 * An original stylized design; NOT a reproduction of Mexico's official
 * coat of arms or any federation emblem.
 */
export function EagleIcon({
  size = 14,
  strokeWidth = 1.6,
  className,
}: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
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
      {/* Head + open beak (side profile, facing right) */}
      <path d="M14 7.5c1.6-1.4 3.6-1.6 5-.6l-1.8 1 1.2.8c-.8.9-2.2 1.2-3.4.8" />
      {/* Eye */}
      <circle cx="15.6" cy="7.6" r="0.4" fill="currentColor" stroke="none" />
      {/* Back, body and tail */}
      <path d="M14.6 9.4c.4 2.6-.6 5.2-2.6 7l-1 3.1-1.4-2.3" />
      {/* Raised wing arc */}
      <path d="M14 8.2C10.5 6 6.5 6.6 4 9.6c1.6.2 2.8.9 3.6 2" />
      {/* Wing feathers */}
      <path d="M7.6 11.6c1.8.4 3.2 1.4 4 3" />
      <path d="M9.8 11.2c1.2.5 2.2 1.4 2.8 2.6" />
    </svg>
  );
}
