"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PapelPicado } from "@/components/seasonal/papel-picado";
import { useSeasonalVariant } from "@/components/seasonal/seasonal-provider";
import { MUERTOS_COPY } from "@/lib/seasonal-copy";

const BASE = {
  bg: "#07070e",
  accent: "#00C9A7",
  brandGradient: "linear-gradient(90deg, #00C9A7, #845EC2, #00C2FF, #00C9A7)",
  wash:
    "radial-gradient(ellipse 60% 50% at 20% 30%, rgba(0,201,167,0.08), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(0,194,255,0.07), transparent 60%)",
  searchBorder: "rgba(0,201,167,0.35)",
  searchGlow: "rgba(0,201,167,0.12)",
};

const MUERTOS: typeof BASE = {
  bg: "#140C1E",
  accent: "#FFB347",
  brandGradient: "linear-gradient(90deg, #FFB347, #E4007C, #8E4FC0, #FFB347)",
  wash:
    "radial-gradient(ellipse 60% 50% at 20% 30%, rgba(228,0,124,0.09), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(242,140,27,0.08), transparent 60%)",
  searchBorder: "rgba(255,179,71,0.35)",
  searchGlow: "rgba(255,179,71,0.12)",
};

export type KioskPalette = typeof BASE;

export function useKioskPalette(): KioskPalette {
  return useSeasonalVariant() ? MUERTOS : BASE;
}

// A decoration must never take the kiosk down: on any error, render nothing.
class SeasonalGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.error("[quiosco] capa estacional desactivada:", err);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function useCycle(enabled: boolean, onMs: number, offMs: number) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const run = (show: boolean) => {
      setOn(show);
      t = setTimeout(() => run(!show), show ? onMs : offMs);
    };
    if (enabled) t = setTimeout(() => run(true), 5000);
    return () => {
      if (t) clearTimeout(t);
    };
  }, [enabled, onMs, offMs]);
  return enabled && on;
}

function StaticGarland({ dim }: { dim: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-[72px] z-10 px-10"
      style={{ opacity: dim ? 0.3 : 1, transition: "opacity 320ms ease" }}
    >
      <PapelPicado className="papel-static mx-auto block max-w-3xl" />
    </div>
  );
}

function KioskPetals() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {Array.from({ length: 6 }, (_, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${8 + i * 16}%`,
            background: i % 2 ? "#F28C1B" : "#FFB347",
            animationDuration: `${16 + (i % 3) * 4}s`,
            animationDelay: `-${i * 3.1}s`,
          }}
        />
      ))}
    </div>
  );
}

function KioskMessage({ searchActive }: { searchActive: boolean }) {
  const visible = useCycle(true, 10_000, 50_000) && !searchActive;
  return (
    <div className="pointer-events-none absolute bottom-28 left-1/2 z-10 w-[min(36rem,90vw)] -translate-x-1/2">
      <AnimatePresence>
        {visible && (
          <motion.p
            key="muertos-message"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              margin: 0,
              textAlign: "center",
              color: "#F6EBDD",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              textShadow: "0 1px 12px rgba(20,12,30,0.9)",
            }}
          >
            {MUERTOS_COPY.popoverMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// "light" variant: palette + garland only. "full" variant: + petals + periodic message.
export function KioskSeasonalLayer({ searchActive }: { searchActive: boolean }) {
  const variant = useSeasonalVariant();
  if (!variant) return null;
  return (
    <SeasonalGuard>
      {variant === "full" && <KioskPetals />}
      <StaticGarland dim={searchActive} />
      {variant === "full" && <KioskMessage searchActive={searchActive} />}
    </SeasonalGuard>
  );
}
