"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { Inbox, Phone, Mail, MapPin, Search, X } from "lucide-react";
import { getEmployees, getCompanies, getCompanyColors } from "@/lib/data";
import type { Employee } from "@/types";
import { HeroNetworkCanvas } from "@/components/hero-network-canvas";
import { KioskErrorBoundary } from "@/components/quiosco/kiosk-error-boundary";
import { KioskErrorView } from "@/components/quiosco/kiosk-error-view";
import { getInitials } from "@/lib/utils";

// ── Config ──────────────────────────────────────────────────────────
const INACTIVITY_MS = 18000; // auto-return to carousel after inactivity
const ROW_COUNT = 3;

const COMPANY_GRADIENT: Record<string, string> = {
  comercializadora: "linear-gradient(135deg, #0047AB 0%, #002D6E 100%)",
  acabados: "linear-gradient(135deg, #C0152A 0%, #8B0000 100%)",
  ferrecapital: "linear-gradient(135deg, #4A525A 0%, #1A1A1A 100%)",
  arkiramica: "linear-gradient(135deg, #F5C400 0%, #C49A00 100%)",
};
const COMPANY_TEXT_COLOR: Record<string, string> = {
  comercializadora: "#fff",
  acabados: "#fff",
  ferrecapital: "#fff",
  arkiramica: "#0a0a0f",
};

function Monogram({ name, company, size }: { name: string; company: string; size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: COMPANY_GRADIENT[company] ?? "linear-gradient(135deg,#333,#111)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.34,
        fontWeight: 700,
        color: COMPANY_TEXT_COLOR[company] ?? "#fff",
        fontFamily: "var(--font-neuropol), var(--font-orbitron), monospace",
        flexShrink: 0,
        boxShadow: "0 6px 24px rgba(0,0,0,0.45)",
      }}
    >
      {getInitials(name) ?? <Inbox size={size * 0.34} aria-label="Sin nombre asignado" />}
    </div>
  );
}

// ── Compact carousel card ───────────────────────────────────────────
function CarouselCard({ employee, scale }: { employee: Employee; scale: number }) {
  const colors = getCompanyColors(employee.company);
  return (
    <div
      style={{
        width: 300,
        flexShrink: 0,
        borderRadius: 18,
        border: `1px solid ${colors.primary}26`,
        // Solid background instead of backdrop-filter: many cards each running
        // a live backdrop blur is expensive on low-power reception screens.
        background: "#12121e",
        boxShadow: `0 0 0 1px ${colors.primary}14, 0 18px 50px rgba(0,0,0,0.45), 0 0 44px ${colors.glow}`,
        padding: 20,
        transform: `scale(${scale})`,
        transformOrigin: "center",
      }}
    >
      {/* accent bar */}
      <div
        style={{
          height: 3,
          borderRadius: 3,
          marginBottom: 16,
          background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent ?? colors.secondary})`,
        }}
      />
      <div className="flex items-center gap-4 mb-4">
        <Monogram name={employee.name} company={employee.company} size={58} />
        <div className="min-w-0 flex-1">
          <div
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#F2F0EC",
              lineHeight: 1.2,
              fontFamily: "var(--font-neuropol), var(--font-orbitron), monospace",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {employee.name}
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: colors.accent ?? colors.primary,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {employee.position}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4" style={{ color: "#8888B0", fontSize: "0.75rem" }}>
        {employee.extension && (
          <span className="flex items-center gap-1.5">
            <Phone size={13} style={{ color: colors.primary }} />
            Ext. {employee.extension}
          </span>
        )}
        {employee.location && (
          <span className="flex items-center gap-1.5 min-w-0">
            <MapPin size={13} style={{ color: colors.primary, flexShrink: 0 }} />
            <span className="truncate">{employee.location}</span>
          </span>
        )}
      </div>
    </div>
  );
}

// ── Infinite conveyor row ───────────────────────────────────────────
// Pure CSS animation (quioscoScroll). Pausing is instant and free via
// animation-play-state — no per-frame JS, so it never competes with the
// search overlay entrance or a dark overlay on top of it.
function ConveyorRow({
  employees,
  direction,
  durationPerCard,
  scale,
  opacity,
  tilt,
  paused,
}: {
  employees: Employee[];
  direction: "left" | "right";
  durationPerCard: number;
  scale: number;
  opacity: number;
  tilt: number;
  paused: boolean;
}) {
  const duration = employees.length * durationPerCard;
  // Duplicate the set so translating by exactly -50% loops seamlessly
  const doubled = [...employees, ...employees];

  // Safari/WebKit fails to composite an element that combines overflow:hidden
  // + mask-image + a 3D transform (rotateX/preserve-3d) all at once, leaving a
  // blank screen. We split responsibilities across nested elements and use a
  // subtle 2D skewY for the tilt so no 3D context (perspective/preserve-3d) is
  // ever needed. skewY factor keeps the lean gentle (~0.2deg per tilt unit).
  const skew = tilt * 0.2;

  return (
    // Outer: tilt only (2D skew, no overflow, no mask, no 3D context)
    <div style={{ opacity, transform: `skewY(${skew}deg)` }}>
      {/* Middle: clipping + edge fade mask ONLY — no transform of any kind */}
      <div
        style={{
          overflow: "hidden",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        {/* Inner: horizontal scroll animation */}
        <div
          style={{
            display: "flex",
            gap: 20,
            width: "max-content",
            willChange: "transform",
            animation: `quioscoScroll ${duration}s linear infinite`,
            // "right" direction = reverse so it travels the opposite way
            animationDirection: direction === "right" ? "reverse" : "normal",
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {doubled.map((emp, i) => (
            <CarouselCard key={`${emp.id}-${i}`} employee={emp} scale={scale} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Search result card (grid reveal) ───────────────────────────────
function ResultCard({ employee }: { employee: Employee }) {
  const colors = getCompanyColors(employee.company);
  const companies = getCompanies();
  const company = companies.find((c) => c.id === employee.company);
  return (
    <div
      style={{
        borderRadius: 16,
        border: `1px solid ${colors.primary}30`,
        background: "rgba(18,18,30,0.95)",
        boxShadow: `0 0 32px ${colors.glow}`,
        padding: 20,
      }}
    >
      <div className="flex items-center gap-4 mb-4">
        <Monogram name={employee.name} company={employee.company} size={64} />
        <div className="min-w-0 flex-1">
          <div
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "#F2F0EC",
              lineHeight: 1.2,
              fontFamily: "var(--font-neuropol), var(--font-orbitron), monospace",
            }}
          >
            {employee.name}
          </div>
          <div style={{ fontSize: "0.85rem", color: colors.accent ?? colors.primary, fontWeight: 600 }}>
            {employee.position}
          </div>
          {employee.department && (
            <div style={{ fontSize: "0.75rem", color: "#7070A0" }}>{employee.department}</div>
          )}
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "0 0 14px" }} />
      <div className="grid gap-2" style={{ color: "#9090B8", fontSize: "0.82rem" }}>
        {company && (
          <span className="flex items-center gap-2.5">
            <span style={{ width: 8, height: 8, borderRadius: 2, background: colors.primary, flexShrink: 0 }} />
            {company.shortName ?? company.name}
          </span>
        )}
        {employee.extension && (
          <span className="flex items-center gap-2.5">
            <Phone size={14} style={{ color: colors.primary, flexShrink: 0 }} />
            Ext. {employee.extension}
          </span>
        )}
        {employee.location && (
          <span className="flex items-center gap-2.5">
            <MapPin size={14} style={{ color: colors.primary, flexShrink: 0 }} />
            {employee.location}
          </span>
        )}
        {employee.email && (
          <span className="flex items-center gap-2.5 overflow-hidden">
            <Mail size={14} style={{ color: colors.primary, flexShrink: 0 }} />
            <span className="truncate">{employee.email}</span>
          </span>
        )}
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────
// Outer export wraps the real content in a manual error boundary so any
// render/lifecycle failure paints a visible diagnostic instead of a black
// screen. This is in ADDITION to app/quiosco/error.tsx.
export default function QuioscoPage() {
  return (
    <KioskErrorBoundary>
      <QuioscoContent />
    </KioskErrorBoundary>
  );
}

function QuioscoContent() {
  // Visible init error state — set from the try/catch around the sensitive
  // derivations below. Because Safari's console has been silent, we surface
  // failures ON SCREEN, not only via console.error.
  const [initError, setInitError] = useState<Error | null>(null);

  const allEmployees = useMemo(() => {
    try {
      const companies = getCompanies();
      return getEmployees().filter((e) => {
        const company = companies.find((c) => c.id === e.company);
        return company && !company.disabled;
      });
    } catch (err) {
      console.error("[quiosco] fallo al cargar/filtrar empleados:", err);
      setInitError(err instanceof Error ? err : new Error(String(err)));
      return [] as Employee[];
    }
  }, []);

  const [searchActive, setSearchActive] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fuse index for fuzzy employee search (mirrors smart-search-bar config)
  const fuse = useMemo(() => {
    try {
      const searchable = allEmployees.map((emp) => ({
        nombreCompleto: emp.name,
        apellidos: emp.name.split(" ").slice(-2).join(" "),
        primerNombre: emp.name.split(" ")[0],
        puesto: emp.position,
        departamento: emp.department || "",
        empresa: emp.company,
        sucursal: emp.location || "",
        extension: emp.extension || "",
        data: emp,
      }));
      return new Fuse(searchable, {
        keys: [
          { name: "nombreCompleto", weight: 0.3 },
          { name: "apellidos", weight: 0.35 },
          { name: "primerNombre", weight: 0.15 },
          { name: "puesto", weight: 0.1 },
          { name: "departamento", weight: 0.05 },
          { name: "extension", weight: 0.05 },
        ],
        threshold: 0.3,
        distance: 100,
        minMatchCharLength: 1,
        shouldSort: true,
      });
    } catch (err) {
      console.error("[quiosco] fallo al construir el índice de Fuse.js:", err);
      setInitError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  }, [allEmployees]);

  const results = useMemo(() => {
    try {
      const q = query.trim();
      if (q.length < 1 || !fuse) return [];
      // numeric-only query → extension match
      const digits = q.replace(/\D/g, "");
      if (digits.length >= 2 && digits === q.replace(/\s/g, "")) {
        return allEmployees.filter((e) => e.extension?.includes(digits)).slice(0, 12);
      }
      return fuse
        .search(q)
        .slice(0, 12)
        .map((r) => r.item.data);
    } catch (err) {
      console.error("[quiosco] fallo al ejecutar la búsqueda:", err);
      return [] as Employee[];
    }
  }, [query, fuse, allEmployees]);

  // Split employees across rows (offset slices so rows differ)
  const rows = useMemo(() => {
    try {
      const perRow = Math.ceil(allEmployees.length / ROW_COUNT);
      return Array.from({ length: ROW_COUNT }, (_, r) => {
        const start = r * perRow;
        const slice = allEmployees.slice(start, start + perRow);
        // ensure each row has enough cards to fill wide screens
        return slice.length >= 6 ? slice : [...slice, ...allEmployees].slice(0, Math.max(8, slice.length));
      });
    } catch (err) {
      console.error("[quiosco] fallo al calcular las filas del carrusel:", err);
      setInitError(err instanceof Error ? err : new Error(String(err)));
      return [] as Employee[][];
    }
  }, [allEmployees]);

  const closeSearch = useCallback(() => {
    setSearchActive(false);
    setQuery("");
  }, []);

  const openSearch = useCallback((seed?: string) => {
    setSearchActive(true);
    if (seed) setQuery(seed);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  // Reset inactivity timer whenever search is active + user interacts
  const bumpInactivity = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => closeSearch(), INACTIVITY_MS);
  }, [closeSearch]);

  useEffect(() => {
    if (searchActive) bumpInactivity();
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [searchActive, query, bumpInactivity]);

  // Global interaction handling
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // First Escape closes search; a second (carousel visible) exits kiosk
        if (searchActive) {
          e.preventDefault();
          closeSearch();
        } else {
          window.location.href = "/";
        }
        return;
      }
      if (!searchActive) {
        // Seed the query with printable single characters
        const isPrintable = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
        openSearch(isPrintable ? e.key : undefined);
      } else {
        bumpInactivity();
      }
    };

    const onPointer = () => {
      if (!searchActive) openSearch();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onPointer, { passive: true });
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onPointer);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [searchActive, openSearch, closeSearch, bumpInactivity]);

  // Surface any captured init/derivation error ON SCREEN (not just console).
  if (initError) {
    return (
      <KioskErrorView
        title="Error de inicialización del modo quiosco"
        message={initError.message}
        stack={initError.stack ?? String(initError)}
        onRetry={() => setInitError(null)}
      />
    );
  }

  if (allEmployees.length === 0) return null;

  const rowConfigs = [
    { direction: "left" as const, durationPerCard: 4.6, scale: 0.86, opacity: 0.7, tilt: 6 },
    { direction: "right" as const, durationPerCard: 3.9, scale: 1, opacity: 1, tilt: 0 },
    { direction: "left" as const, durationPerCard: 4.2, scale: 0.86, opacity: 0.7, tilt: -6 },
  ];

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: "#07070e", fontFamily: "var(--font-dm-sans, sans-serif)" }}
    >
      {/* Emergency exit — bottom-right corner, away from the SHUMA logo.
          Rendered FIRST in the DOM tree so WebKit paints it even when other
          composited layers silently fail. Pure inline styles only: no Framer
          Motion, no backdrop-filter, no mask-image, no 3D transforms. */}
      <a
        href="/"
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 9999,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 20px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.10)",
          color: "rgba(255,255,255,0.55)",
          fontSize: "0.75rem",
          fontWeight: 500,
          letterSpacing: "0.08em",
          textDecoration: "none",
          textTransform: "uppercase",
          cursor: "pointer",
          userSelect: "none",
          transition: "color 200ms ease, border-color 200ms ease, background 200ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.90)";
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.28)";
          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,0,0,0.75)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)";
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.10)";
          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,0,0,0.55)";
        }}
        aria-label="Salir del modo quiosco"
      >
        {/* Inline SVG arrow — no external dependency, safe for WebKit */}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"
          style={{ opacity: 0.7 }}>
          <path d="M7 2L3 6L7 10" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Salir
      </a>

      {/* Animated node/network backdrop */}
      <HeroNetworkCanvas />

      {/* Slow animated gradient wash for a premium screensaver feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 20% 30%, rgba(0,201,167,0.08), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(0,194,255,0.07), transparent 60%)",
          animation: "quioscoWash 18s ease-in-out infinite alternate",
        }}
      />

      {/* Branding header */}
      <div className="relative z-10 flex items-center justify-between px-10 pt-7">
        <span
          style={{
            fontFamily: "var(--font-neuropol), var(--font-orbitron), monospace",
            fontSize: "1.5rem",
            fontWeight: 900,
            background: "linear-gradient(90deg, #00C9A7, #845EC2, #00C2FF, #00C9A7)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shimmerText 4s linear infinite",
            letterSpacing: "0.08em",
          }}
        >
          SHUMA
        </span>
        <span
          style={{
            fontFamily: "var(--font-neuropol), var(--font-orbitron), monospace",
            fontSize: "0.68rem",
            letterSpacing: "0.2em",
            color: "#55557a",
            textTransform: "uppercase",
          }}
        >
          Directorio Corporativo
        </span>
      </div>

      {/* Continuous conveyor carousel.
          When search is active the rows are truly PAUSED (animation-play-state)
          — not blurred while still moving — which is what caused the jank. */}
      <div
        className="absolute inset-0 flex flex-col justify-center gap-8 z-[1]"
        style={{
          // No `perspective` here anymore: rows use a 2D skew tilt, so no 3D
          // context is needed. Avoiding it prevents WebKit compositing bugs.
          pointerEvents: "none",
        }}
        aria-hidden={searchActive}
      >
        {rows.map((rowEmps, i) => (
          <ConveyorRow key={i} employees={rowEmps} {...rowConfigs[i]} paused={searchActive} />
        ))}
      </div>

      {/* Single cheap dimming overlay above the (now paused) carousel.
          Far cheaper than animating filter: blur() on many moving cards. */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: "rgba(6,6,14,0.78)",
          opacity: searchActive ? 1 : 0,
          transition: "opacity 320ms ease",
        }}
        aria-hidden="true"
      />

      {/* Idle hint (only when search hidden) */}
      <AnimatePresence>
        {!searchActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              color: "#8a8ab0",
              fontSize: "0.8rem",
              letterSpacing: "0.05em",
              background: "rgba(10,10,20,0.6)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Search size={15} />
            Toca la pantalla o escribe para buscar
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {searchActive && (
          <motion.div
            key="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20 flex flex-col items-center"
          >
            {/* Search bar — slides down from top */}
            <motion.div
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="w-full max-w-2xl px-6 pt-10"
            >
              <div
                className="flex items-center gap-3 px-5"
                style={{
                  height: 64,
                  borderRadius: 16,
                  background: "rgba(18,18,30,0.96)",
                  border: "1px solid rgba(0,201,167,0.35)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,201,167,0.12)",
                }}
              >
                <Search size={22} style={{ color: "#00C9A7", flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre, puesto o extensión..."
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: "#F2F0EC", fontSize: "1.15rem" }}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  onClick={closeSearch}
                  aria-label="Cerrar búsqueda"
                  className="flex items-center justify-center transition-colors"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#9090b8",
                    flexShrink: 0,
                  }}
                >
                  <X size={18} />
                </button>
              </div>
              <div
                className="text-center mt-3"
                style={{ color: "#55557a", fontSize: "0.72rem", letterSpacing: "0.05em" }}
              >
                ESC para volver al carrusel · ESC de nuevo para salir
              </div>
            </motion.div>

            {/* Results grid — staggered reveal */}
            <div className="flex-1 w-full overflow-y-auto px-6 pb-10 mt-6">
              <div className="max-w-5xl mx-auto">
                {query.trim().length >= 1 && results.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                    style={{ color: "#7070a0", fontSize: "1rem" }}
                  >
                    Sin resultados para &ldquo;{query}&rdquo;
                  </motion.div>
                )}
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
                >
                  <AnimatePresence mode="popLayout">
                    {results.map((emp, i) => (
                      <motion.div
                        key={emp.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <ResultCard employee={emp} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
