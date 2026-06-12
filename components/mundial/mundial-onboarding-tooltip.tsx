"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useMundialTheme } from "@/lib/MundialThemeContext";

const GREEN = "#1FA85C";
const RED = "#CE1126";

interface MundialOnboardingTooltipProps {
  /**
   * "navbar": anchored below the navbar ball icon, desktop only (md+).
   * "hero": anchored below the decorative ball near the search bar,
   *          mobile only (< md) since that's the mobile entry point.
   */
  placement: "navbar" | "hero";
}

/**
 * One-time speech-bubble tooltip pointing at the soccer ball icon that opens
 * the match tracker. Shown a couple of seconds after load, dismissed by
 * clicking the ball (opens the tracker) or the X. Persisted via localStorage
 * so returning visitors don't see it again.
 */
export function MundialOnboardingTooltip({ placement }: MundialOnboardingTooltipProps) {
  const { tooltipVisible, dismissTooltip } = useMundialTheme();
  const reducedMotion = useReducedMotion();
  const isNavbar = placement === "navbar";

  // Render only the instance matching the viewport so screen readers don't
  // get a duplicate (CSS-hidden) announcement from the other entry point.
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (isDesktop === null || isDesktop !== isNavbar) {
    return null;
  }

  return (
    <AnimatePresence>
      {tooltipVisible && (
        <motion.div
          role="status"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={
            isNavbar
              ? "hidden md:block absolute top-full right-0 mt-2.5 z-[80] w-max"
              : "md:hidden absolute top-full right-0 mt-2.5 z-[40] w-max max-w-[230px]"
          }
        >
          {/* Arrow pointing up at the ball icon */}
          <span
            aria-hidden="true"
            className="absolute -top-[5px] right-5 w-2.5 h-2.5 rotate-45"
            style={{
              background: "var(--bg-surface)",
              borderTop: `1px solid ${GREEN}`,
              borderLeft: `1px solid ${GREEN}`,
            }}
          />

          <div
            className="relative flex items-center gap-2 rounded-lg py-2 pl-3 pr-2 shadow-xl"
            style={{
              background: "var(--bg-surface)",
              border: `1px solid ${GREEN}`,
            }}
          >
            {/* Tricolor left accent */}
            <span
              aria-hidden="true"
              className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full overflow-hidden flex flex-col"
            >
              <span className="flex-1" style={{ background: GREEN }} />
              <span className="flex-1" style={{ background: "#F4F4F4" }} />
              <span className="flex-1" style={{ background: RED }} />
            </span>

            <p
              className="text-xs font-medium leading-snug text-pretty"
              style={{ color: "var(--foreground)" }}
            >
              {"\u00A1Da clic para ver los partidos de M\u00E9xico! \u26BD"}
            </p>

            <button
              onClick={dismissTooltip}
              aria-label="Cerrar aviso"
              className="p-1 rounded-md transition-colors hover:bg-white/10 active:scale-95 shrink-0"
              style={{ color: "var(--muted-foreground)" }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
