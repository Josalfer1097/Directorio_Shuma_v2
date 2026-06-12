/**
 * Subtle football pitch line pattern rendered as a fixed background layer.
 * Pure CSS — only visible when the .theme-mundial class is on the root
 * element (gated via the .mundial-pitch rules in globals.css).
 */
export function PitchPattern() {
  return <div className="mundial-pitch" aria-hidden="true" />;
}
