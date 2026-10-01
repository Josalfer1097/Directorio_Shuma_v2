"use client";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Flame, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MUERTOS_COPY } from "@/lib/seasonal-copy";
import { useSeasonalVariant } from "./seasonal-provider";
import { PapelPicado } from "./papel-picado";
import { Petals } from "./petals";

export function MemorialChip() {
  const variant = useSeasonalVariant();
  if (variant !== "full") return null;

  return (
    <Popover>
      <PopoverTrigger
        title={MUERTOS_COPY.tooltip}
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
  );
}
