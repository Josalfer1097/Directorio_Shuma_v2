"use client";

export function AmbientGlows() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Top-left glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20vh',
          left: '-10vw',
          width: '60vw',
          height: '60vh',
          background: 'radial-gradient(ellipse, var(--theme-bg-glow-a, rgba(0,201,167,0.06)), transparent 70%)',
          transition: 'background 800ms ease',
          filter: 'blur(60px)',
        }}
      />
      {/* Bottom-right glow */}
      <div
        style={{
          position: 'absolute',
          bottom: '-20vh',
          right: '-10vw',
          width: '50vw',
          height: '50vh',
          background: 'radial-gradient(ellipse, var(--theme-bg-glow-b, rgba(132,94,194,0.05)), transparent 70%)',
          transition: 'background 800ms ease',
          filter: 'blur(80px)',
        }}
      />
    </div>
  );
}
