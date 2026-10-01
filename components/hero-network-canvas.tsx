"use client";

import { useEffect, useRef } from "react";
import { useSeasonalVariant } from "@/components/seasonal/seasonal-provider";

/**
 * Subtle animated node/network canvas for the hero section.
 * Renders thin connecting lines between slowly drifting dots, evoking
 * organizational connection. Completely client-side, runs after mount.
 * Performance: 30 fps cap, reduced node count on mobile.
 */
export function HeroNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const variant = useSeasonalVariant();
  const rgbRef = useRef("0,201,167");
  rgbRef.current = variant ? "255,179,71" : "0,201,167";

  useEffect(() => {
    // Defensive: this is a purely decorative background. If ANY part of it
    // fails (e.g. getContext returns null, ResizeObserver unavailable), it must
    // fail silently and NOT take down the rest of /quiosco. Everything is
    // wrapped so a canvas problem can never throw during the kiosk's render.
    let animId: number | undefined;
    let ro: ResizeObserver | undefined;

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("[quiosco] HeroNetworkCanvas: getContext('2d') devolvió null; se omite el fondo.");
        return;
      }

      const isMobile = window.innerWidth < 768;
      const NODE_COUNT = isMobile ? 18 : 38;
      const CONNECT_DIST = isMobile ? 90 : 130;
      const NODE_SPEED = 0.18;
      const TARGET_FPS = 30;

      type Node = {
        x: number;
        y: number;
        vx: number;
        vy: number;
        r: number;
        alpha: number;
      };

      const resize = () => {
        // parentElement can be null on the very first tick in some engines.
        const rect = canvas.parentElement?.getBoundingClientRect();
        canvas.width = rect?.width ?? window.innerWidth;
        canvas.height = rect?.height ?? window.innerHeight ?? 600;
      };
      resize();

      if (typeof ResizeObserver !== "undefined" && canvas.parentElement) {
        ro = new ResizeObserver(resize);
        ro.observe(canvas.parentElement);
      }

      const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * NODE_SPEED,
        vy: (Math.random() - 0.5) * NODE_SPEED,
        r: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.35 + 0.12,
      }));

      let lastFrame = 0;

      const draw = (ts: number) => {
        animId = requestAnimationFrame(draw);
        if (ts - lastFrame < 1000 / TARGET_FPS) return;
        lastFrame = ts;

        try {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Update positions with soft boundary bounce
          for (const n of nodes) {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
            if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
            n.x = Math.max(0, Math.min(canvas.width, n.x));
            n.y = Math.max(0, Math.min(canvas.height, n.y));
          }

          // Draw connections
          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const dx = nodes[i].x - nodes[j].x;
              const dy = nodes[i].y - nodes[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < CONNECT_DIST) {
                const lineAlpha = (1 - dist / CONNECT_DIST) * 0.18;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.strokeStyle = `rgba(${rgbRef.current},${lineAlpha})`;
                ctx.lineWidth = 0.7;
                ctx.stroke();
              }
            }
          }

          // Draw nodes
          for (const n of nodes) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgbRef.current},${n.alpha})`;
            ctx.fill();
          }
        } catch (drawErr) {
          // Stop the loop on the first draw error rather than spamming.
          console.error("[quiosco] HeroNetworkCanvas: error en el bucle de dibujo, se detiene:", drawErr);
          if (animId !== undefined) cancelAnimationFrame(animId);
        }
      };

      animId = requestAnimationFrame(draw);
    } catch (setupErr) {
      console.error("[quiosco] HeroNetworkCanvas: fallo de inicialización, se omite el fondo:", setupErr);
    }

    return () => {
      if (animId !== undefined) cancelAnimationFrame(animId);
      ro?.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        // Fade out at the bottom so it blends smoothly into content
        maskImage:
          "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
      }}
    />
  );
}
