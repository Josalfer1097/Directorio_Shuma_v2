"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, MapPin, Building2, X } from "lucide-react";
import { getEmployees, getCompanies, getCompanyColors } from "@/lib/data";

const ROTATION_INTERVAL_MS = 9000;
const TRANSITION_DURATION = 0.55;

// Company color map for monogram backgrounds
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

function Monogram({ name, company, size = 120 }: { name: string; company: string; size?: number }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

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
        fontSize: size * 0.33,
        fontWeight: 700,
        color: COMPANY_TEXT_COLOR[company] ?? "#fff",
        fontFamily: "var(--font-neuropol), var(--font-orbitron), monospace",
        flexShrink: 0,
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
      }}
    >
      {initials}
    </div>
  );
}

// Flip + blur transition variants
const cardVariants = {
  enter: {
    rotateY: 25,
    opacity: 0,
    filter: "blur(8px)",
    scale: 0.96,
  },
  center: {
    rotateY: 0,
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: TRANSITION_DURATION,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    rotateY: -25,
    opacity: 0,
    filter: "blur(8px)",
    scale: 0.96,
    transition: {
      duration: TRANSITION_DURATION * 0.8,
      ease: [0.64, 0, 0.78, 0],
    },
  },
};

// Light scan "reveal" overlay that sweeps across the entering card
const scanVariants = {
  enter: { x: "-110%", opacity: 0.0 },
  animate: {
    x: "110%",
    opacity: [0, 0.18, 0.18, 0],
    transition: { duration: TRANSITION_DURATION + 0.1, ease: "linear" },
  },
};

export default function QuioscoPage() {
  const allEmployees = getEmployees().filter((e) => {
    const companies = getCompanies();
    const company = companies.find((c) => c.id === e.company);
    return company && !company.disabled;
  });
  const companies = getCompanies();

  const [index, setIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    setIndex((prev) => (prev + 1) % allEmployees.length);
  }, [allEmployees.length]);

  // Auto-rotation
  useEffect(() => {
    intervalRef.current = setInterval(advance, ROTATION_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [advance]);

  // Escape key exits kiosk mode
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        window.location.href = "/";
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const employee = allEmployees[index];
  const company = companies.find((c) => c.id === employee?.company);
  const colors = getCompanyColors(employee?.company ?? "");

  if (!employee) return null;

  return (
    <div
      className="fixed inset-0 overflow-hidden flex flex-col"
      style={{ background: "#08080f", fontFamily: "var(--font-dm-sans, sans-serif)" }}
    >
      {/* Background ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${colors.glow} 0%, transparent 70%)`,
          transition: "background 1.2s ease",
        }}
      />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Branding header */}
      <div className="relative z-10 flex items-center justify-between px-8 pt-6 pb-4 shrink-0">
        <span
          style={{
            fontFamily: "var(--font-neuropol), var(--font-orbitron), monospace",
            fontSize: "1.4rem",
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
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            color: "#555570",
            textTransform: "uppercase",
          }}
        >
          Directorio Corporativo
        </span>
        <a
          href="/"
          title="Salir del modo quiosco (también: tecla Esc)"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            color: "#555570",
            transition: "all 150ms",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#F2F0EC";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#555570";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          <X size={16} />
        </a>
      </div>

      {/* Main card area */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div style={{ perspective: "1200px", width: "100%", maxWidth: 520 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={employee.id}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{
                transformStyle: "preserve-3d",
                willChange: "transform, filter, opacity",
                position: "relative",
                overflow: "hidden",
                borderRadius: 20,
                border: `1px solid ${colors.primary}30`,
                background: "rgba(15,15,26,0.92)",
                backdropFilter: "blur(20px)",
                boxShadow: `0 0 0 1px ${colors.primary}18, 0 32px 80px rgba(0,0,0,0.6), 0 0 80px ${colors.glow}`,
              }}
            >
              {/* Light scan effect */}
              <motion.div
                variants={scanVariants}
                initial="enter"
                animate="animate"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%)",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              />

              {/* Company accent top bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent ?? colors.secondary})`,
                }}
              />

              <div className="p-8 pt-10">
                {/* Avatar + name */}
                <div className="flex items-center gap-6 mb-8">
                  <Monogram name={employee.name} company={employee.company} size={96} />
                  <div className="flex-1 min-w-0">
                    <h2
                      style={{
                        fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
                        fontWeight: 700,
                        color: "#F2F0EC",
                        lineHeight: 1.15,
                        marginBottom: 6,
                        fontFamily: "var(--font-neuropol), var(--font-orbitron), monospace",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {employee.name}
                    </h2>
                    <p
                      style={{
                        fontSize: "0.925rem",
                        color: colors.accent ?? colors.primary,
                        fontWeight: 600,
                        letterSpacing: "0.01em",
                        marginBottom: 4,
                      }}
                    >
                      {employee.position}
                    </p>
                    {employee.department && (
                      <p style={{ fontSize: "0.8rem", color: "#7070A0", letterSpacing: "0.02em" }}>
                        {employee.department}
                      </p>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginBottom: 20 }} />

                {/* Contact info */}
                <div className="grid grid-cols-2 gap-3">
                  {company && (
                    <div className="flex items-center gap-2.5 col-span-2" style={{ color: "#9090B8" }}>
                      <Building2 size={15} style={{ flexShrink: 0, color: colors.primary }} />
                      <span style={{ fontSize: "0.82rem" }}>{company.shortName ?? company.name}</span>
                    </div>
                  )}
                  {employee.location && (
                    <div className="flex items-center gap-2.5 col-span-2" style={{ color: "#9090B8" }}>
                      <MapPin size={15} style={{ flexShrink: 0, color: colors.primary }} />
                      <span style={{ fontSize: "0.82rem" }}>{employee.location}</span>
                    </div>
                  )}
                  {employee.extension && (
                    <div className="flex items-center gap-2.5" style={{ color: "#9090B8" }}>
                      <Phone size={15} style={{ flexShrink: 0, color: colors.primary }} />
                      <span style={{ fontSize: "0.82rem" }}>Ext. {employee.extension}</span>
                    </div>
                  )}
                  {employee.email && (
                    <div className="flex items-center gap-2.5 overflow-hidden" style={{ color: "#9090B8" }}>
                      <Mail size={15} style={{ flexShrink: 0, color: colors.primary }} />
                      <span style={{ fontSize: "0.82rem" }} className="truncate">{employee.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress dots */}
      <div className="relative z-10 flex items-center justify-center gap-1.5 py-6 shrink-0">
        {allEmployees.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            style={{
              width: i === index ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === index ? colors.primary : "rgba(255,255,255,0.12)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "all 300ms ease",
            }}
            aria-label={`Ver empleado ${i + 1}`}
          />
        ))}
      </div>

      {/* Auto-advance progress bar */}
      <ProgressBar key={index} durationMs={ROTATION_INTERVAL_MS} color={colors.primary} onComplete={advance} />

      {/* Esc hint */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
        style={{ color: "#333355", fontSize: "0.65rem", letterSpacing: "0.1em" }}
      >
        Presiona ESC para salir
      </div>
    </div>
  );
}

function ProgressBar({
  durationMs,
  color,
  onComplete,
}: {
  durationMs: number;
  color: string;
  onComplete: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        background: "rgba(255,255,255,0.06)",
        zIndex: 20,
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: durationMs / 1000, ease: "linear" }}
        onAnimationComplete={onComplete}
        style={{ height: "100%", background: color, originX: 0 }}
      />
    </div>
  );
}
