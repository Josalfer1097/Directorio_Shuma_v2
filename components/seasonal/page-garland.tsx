"use client";
import { usePathname } from "next/navigation";
import { PapelPicado } from "./papel-picado";
import { useSeasonalVariant } from "./seasonal-provider";

// "/" has its own hero garland, /quiosco has its own static garland, /print must stay clean.
const SKIP = ["/", "/quiosco", "/print"];

export function SeasonalPageGarland() {
  const variant = useSeasonalVariant();
  const pathname = usePathname();
  if (!variant || SKIP.includes(pathname)) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-[56px] z-[11] flex justify-center print:hidden md:top-[64px]"
    >
      <PapelPicado className="papel-slim" />
    </div>
  );
}
