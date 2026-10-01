"use client";
import { useCallback, useEffect, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Flame, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MUERTOS_COPY } from "@/lib/seasonal-copy";
import { useSeasonalVariant } from "./seasonal-provider";
import { PapelPicado } from "./papel-picado";
import { Petals } from "./petals";

const SEEN_KEY = "shuma-muertos-tooltip-seen";

export function MemorialChip() {
  const variant = useSeasonalVariant();
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (variant === "full") {
      try {
        if (!localStorage.getItem(SEEN_KEY)) {
          timer = setTimeout(() => setShowTip(true), 2000);
        }
      } catch {}
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [variant]);

  const dismissTip = useCallback(() => {
    setShowTip(false);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
  }, []);

  if (variant !== "full") return null;

  return (
    <div className="relative">
      <Popover onOpenChange={(open) => { if (open) dismissTip(); }}>
        <PopoverTrigger
          className="flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2"
          style={{
            background: "rgba(242,140,27,0.12)",
            borderColor: "rgba(242,140,27,0.45)",
            color: "#FFB347",
          }}
        >
          <Flame className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{MUERTOS_COPY.chipLabel}</span>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="relative w-[min(20rem,calc(100vw-24px))] overflow-hidden border p-0"
          style={{ background: "var(--muertos-bg)", borderColor: "rgba(142,79,192,0.5)", color: "#F5EDE0" }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden [&>div]:absolute">
            <Petals />
          </div>
          <PapelPicado className="relative block" />
          <div className="relative flex flex-col gap-2 px-5 pb-5 pt-2">
            <p className="font-semibold" style={{ color: "#FFB347" }}>
              {MUERTOS_COPY.chipLabel}
            </p>
            <p className="text-sm leading-relaxed text-pretty">{MUERTOS_COPY.popoverMessage}</p>
          </div>
          <PopoverPrimitive.Close
            aria-label="Cerrar"
            className="absolute right-2 top-2 rounded-md p-1 opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </PopoverPrimitive.Close>
        </PopoverContent>
      </Popover>

      {showTip && (
        <div
          role="status"
          className="absolute right-0 top-full z-[70] mt-2 flex items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs"
          style={{ background: "#FFB347", color: "#2A1200" }}
        >
          <span aria-hidden="true" className="absolute -top-1 right-4 h-2 w-2 rotate-45" style={{ background: "#FFB347" }} />
          <span className="relative">{MUERTOS_COPY.tooltip}</span>
          <button type="button" onClick={dismissTip} aria-label="Cerrar" className="relative">
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
