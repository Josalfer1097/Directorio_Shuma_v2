"use client";
import { useId } from "react";

/** Papel picado strip: a solid band with cut-outs and teeth hanging down. */
export function PicadoBand({
  color,
  holeColor,
  height = 8,
}: {
  color: string;
  holeColor: string;
  height?: number;
}) {
  const id = `picado-${useId().replace(/:/g, "")}`;
  const h = height;
  const mid = h / 2;
  return (
    <svg aria-hidden="true" focusable="false" width="100%" height={h + 6} style={{ display: "block" }}>
      <defs>
        <pattern id={id} width="40" height={h + 6} patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="40" height={h} style={{ fill: color }} />
          <polygon points={`0,${h} 10,${h + 6} 20,${h} 30,${h + 6} 40,${h}`} style={{ fill: color }} />
          <polygon points={`10,${mid - 2.5} 12.5,${mid} 10,${mid + 2.5} 7.5,${mid}`} style={{ fill: holeColor }} />
          <circle cx="30" cy={mid} r="1.8" style={{ fill: holeColor }} />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height={h + 6} fill={`url(#${id})`} />
    </svg>
  );
}

/** Thin marigold teeth for the bottom edge of the detail views. */
export function MarigoldZigzag() {
  const id = `zigzag-${useId().replace(/:/g, "")}`;
  return (
    <svg aria-hidden="true" focusable="false" width="100%" height="6" style={{ display: "block" }}>
      <defs>
        <pattern id={id} width="10" height="6" patternUnits="userSpaceOnUse">
          <polygon points="0,6 5,0 10,6" style={{ fill: "#F28C1B" }} />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="6" fill={`url(#${id})`} opacity="0.85" />
    </svg>
  );
}
