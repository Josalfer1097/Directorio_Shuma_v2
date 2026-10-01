"use client";
import { useSeasonalVariant } from "./seasonal-provider";

export function Petals() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {Array.from({ length: 12 }, (_, i) => (
        <span
          key={i}
          className={`petal ${i >= 6 ? "hidden md:block" : ""}`}
          style={{
            left: `${4 + i * 8}%`,
            background: i % 2 ? "#F28C1B" : "#FFB347",
            animationDuration: `${12 + (i % 4) * 3}s`,
            animationDelay: `-${i * 2.3}s`,
          }}
        />
      ))}
    </div>
  );
}

export function SeasonalPetals() {
  const variant = useSeasonalVariant();
  return variant === "full" ? <Petals /> : null;
}
