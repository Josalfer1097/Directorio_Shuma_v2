/**
 * Lightweight canvas-based confetti burst in green/white/red.
 * No external dependencies. Fired once per session when "Ver Directorio"
 * is clicked while Modo Mundial is active.
 */

const SESSION_KEY = "shuma-mundial-confetti-fired";
const COLORS = ["#1FA85C", "#FFFFFF", "#CE1126"];
const PARTICLE_COUNT = 90;
const DURATION_MS = 1400;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

export function fireMundialConfetti(): void {
  if (typeof window === "undefined") return;

  // Only once per session
  try {
    if (sessionStorage.getItem(SESSION_KEY) === "true") return;
    sessionStorage.setItem(SESSION_KEY, "true");
  } catch {
    return;
  }

  // Respect reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.cssText =
    "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.45;

  const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 9;
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 4 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
    };
  });

  const start = performance.now();

  function frame(now: number) {
    const elapsed = now - start;
    if (elapsed > DURATION_MS || !ctx) {
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const fade = 1 - elapsed / DURATION_MS;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.vx *= 0.985; // drag
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.globalAlpha = Math.max(fade, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
