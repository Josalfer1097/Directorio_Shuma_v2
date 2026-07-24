"use client";

import { useEffect } from "react";
import { KioskErrorView } from "@/components/quiosco/kiosk-error-view";

/**
 * Next.js App Router error boundary for the /quiosco route segment.
 * Renders a dependency-free full-screen diagnostic so any failure is visible
 * on screen (message + stack), even on Safari/macOS where the console has been
 * silent.
 */
export default function QuioscoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[quiosco] error.tsx capturó:", error);
  }, [error]);

  return (
    <KioskErrorView
      title="Error en el modo quiosco (route boundary)"
      message={error.message}
      stack={error.stack ?? String(error)}
      digest={error.digest ?? null}
      onRetry={reset}
    />
  );
}
