"use client";

import { useEffect, useState } from "react";
import { SoccerBallIcon } from "./soccer-ball-icon";

// World Cup 2026 opening match: June 11, 2026 (local time)
const OPENING_DATE = new Date(2026, 5, 11);

/**
 * Small countdown chip showing days remaining until the World Cup 2026
 * opening match. Renders nothing once the date has passed.
 * Visibility is also gated by the .theme-mundial root class via CSS.
 */
export function MundialCountdown() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    const diffMs = OPENING_DATE.getTime() - now.getTime();
    if (diffMs <= 0) {
      setDaysLeft(null);
      return;
    }
    setDaysLeft(Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, []);

  // Hide automatically once the opening match date has passed
  if (daysLeft === null) return null;

  return (
    <div
      className="mundial-only items-center justify-center gap-2 mx-auto mt-4 px-4 py-1.5 rounded-full w-fit"
      style={{
        background: "rgba(31,168,92,0.10)",
        border: "1px solid rgba(31,168,92,0.30)",
      }}
    >
      <SoccerBallIcon size={14} className="text-[#1FA85C]" />
      <span className="font-dm-sans text-scale-sm" style={{ color: "var(--muted-foreground)" }}>
        Faltan{" "}
        <strong style={{ color: "#1FA85C", fontWeight: 700 }}>
          {daysLeft} {daysLeft === 1 ? "día" : "días"}
        </strong>{" "}
        para el Mundial 2026
      </span>
    </div>
  );
}
