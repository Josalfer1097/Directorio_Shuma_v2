"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Calendar, MapPin } from "lucide-react";
import { mexicoMatches, type MatchResult } from "@/data/mundial-mexico";
import { useMundialTheme } from "@/lib/MundialThemeContext";
import { fireMundialConfetti } from "./mundial-confetti";
import { SoccerBallIcon } from "./soccer-ball-icon";
import { EagleIcon } from "./eagle-icon";

const GREEN = "#1FA85C";
const RED = "#CE1126";

type Outcome = "V" | "E" | "D";

function getOutcome(match: MatchResult): Outcome | null {
  if (match.status !== "played" || !match.result) return null;
  if (match.result.mexico > match.result.opponent) return "V";
  if (match.result.mexico === match.result.opponent) return "E";
  return "D";
}

const OUTCOME_STYLES: Record<Outcome, { bg: string; color: string; label: string }> = {
  V: { bg: "rgba(31,168,92,0.18)", color: GREEN, label: "Victoria" },
  E: { bg: "rgba(128,128,128,0.18)", color: "var(--muted-foreground)", label: "Empate" },
  D: { bg: "rgba(206,17,38,0.18)", color: RED, label: "Derrota" },
};

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

/** Whole days from today until the given ISO date (local midnights). */
function daysUntil(iso: string): number {
  const target = new Date(`${iso}T00:00:00`);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - todayMidnight.getTime()) / 86_400_000);
}

function MatchRow({ match, isNextUpcoming }: { match: MatchResult; isNextUpcoming?: boolean }) {
  const outcome = getOutcome(match);
  const remaining = isNextUpcoming ? daysUntil(match.date) : null;

  return (
    <div
      className="flex flex-col gap-1.5 rounded-lg p-3"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
          {match.round}
        </span>
        {outcome ? (
          <span
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: OUTCOME_STYLES[outcome].bg, color: OUTCOME_STYLES[outcome].color }}
            title={OUTCOME_STYLES[outcome].label}
          >
            {outcome}
            <span className="font-semibold">{OUTCOME_STYLES[outcome].label}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 shrink-0">
            {remaining !== null && remaining > 0 && (
              <span className="text-[10px] font-medium whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                {remaining === 1 ? "Falta 1 día" : `Faltan ${remaining} días`}
              </span>
            )}
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{
                background: "rgba(31,168,92,0.10)",
                border: "1px solid rgba(31,168,92,0.30)",
                color: GREEN,
              }}
            >
              Próximo
            </span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          México vs {match.flag ? `${match.flag} ` : ""}{match.opponent}
        </span>
        {match.status === "played" && match.result && (
          <span className="text-sm font-bold tabular-nums" style={{ color: "var(--foreground)" }}>
            {match.result.mexico} - {match.result.opponent}
          </span>
        )}
      </div>

      {match.status === "played" && match.result?.scorers && match.result.scorers.length > 0 && (
        <div className="flex items-start gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <SoccerBallIcon size={12} strokeWidth={1.6} className="mt-0.5 shrink-0" />
          <span>{match.result.scorers.join(", ")}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(match.date)}
          {match.time ? ` · ${match.time} hrs` : ""}
        </span>
        {match.venue && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {match.venue}
          </span>
        )}
      </div>
    </div>
  );
}

export function MundialMatchTracker() {
  const { trackerOpen, closeTracker } = useMundialTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Celebratory burst when opening with at least one win (subtle, forced past
  // the session guard; reduced-motion is respected inside the helper)
  useEffect(() => {
    if (trackerOpen && mexicoMatches.some((m) => getOutcome(m) === "V")) {
      fireMundialConfetti({ force: true, subtle: true });
    }
  }, [trackerOpen]);

  // Dismiss on outside click
  useEffect(() => {
    if (!trackerOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closeTracker();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTracker();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [trackerOpen, closeTracker]);

  return (
    <AnimatePresence>
      {trackerOpen && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Partidos de México en el Mundial 2026"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed z-[70] inset-x-0 top-14 w-full px-3 pt-2 md:inset-x-auto md:right-4 md:top-16 md:w-[360px] md:px-0 md:pt-0"
          style={{ paddingLeft: "max(12px, env(safe-area-inset-left))", paddingRight: "max(12px, env(safe-area-inset-right))" }}
        >
          <div
            className="rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {/* Tricolor top accent (vertical stripes, Mexican flag order) */}
            <div className="flex h-1" aria-hidden="true">
              <span className="flex-1" style={{ background: GREEN }} />
              <span className="flex-1" style={{ background: "#F4F4F4" }} />
              <span className="flex-1" style={{ background: RED }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex items-center gap-2" style={{ color: GREEN }}>
                <EagleIcon size={18} strokeWidth={1.5} className="shrink-0" />
                <h2
                  className="text-sm font-bold tracking-wide"
                  style={{ color: "var(--foreground)" }}
                >
                  México en el Mundial 2026
                </h2>
              </div>
              <button
                onClick={closeTracker}
                aria-label="Cerrar"
                className="p-1.5 rounded-md transition-colors hover:bg-white/10 active:scale-95"
                style={{ color: "var(--muted-foreground)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Matches */}
            <div className="flex flex-col gap-2 px-4 pb-4 max-h-[60vh] overflow-y-auto">
              {(() => {
                // First upcoming match chronologically gets the countdown
                const nextUpcoming = mexicoMatches
                  .filter((m) => m.status === "upcoming")
                  .sort((a, b) => a.date.localeCompare(b.date))[0];
                return mexicoMatches.map((match) => (
                  <MatchRow
                    key={`${match.round}-${match.date}`}
                    match={match}
                    isNextUpcoming={match === nextUpcoming}
                  />
                ));
              })()}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
