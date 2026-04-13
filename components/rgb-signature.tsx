"use client";

import React from "react";

const SIGNATURE_TEXT = "DESIGNED & POWERED BY SHUMA SISTEMAS IT";
const VERSION = "v1.2.1";

export function RgbSignature() {
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 flex flex-col items-center justify-center pointer-events-none"
      style={{
        height: '44px',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        zIndex: 40,
      }}
    >
      {/* Line 1: RGB animated signature */}
      <p 
        className="m-0 p-0"
        style={{
          fontFamily: "'Neuropol', monospace",
          fontSize: '0.55rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        {SIGNATURE_TEXT.split('').map((char, index) => {
          // Skip animation for spaces
          if (char === ' ') {
            return <span key={index}>&nbsp;</span>;
          }
          
          return (
            <span
              key={index}
              className="rgb-letter"
              style={{
                animationDelay: `${index * 0.08}s`,
              }}
            >
              {char}
            </span>
          );
        })}
      </p>

      {/* Line 2: Version watermark */}
      <p
        className="m-0 p-0"
        style={{
          fontFamily: "var(--font-neuropol), monospace",
          fontSize: '0.5rem',
          letterSpacing: '0.3em',
          color: 'rgba(255,255,255,0.25)',
          marginTop: '1px',
        }}
      >
        {VERSION}
      </p>

      <style jsx>{`
        @keyframes rgbCycle {
          0%   { color: hsl(0,   100%, 65%); }
          16%  { color: hsl(60,  100%, 65%); }
          33%  { color: hsl(120, 100%, 65%); }
          50%  { color: hsl(180, 100%, 65%); }
          66%  { color: hsl(240, 100%, 65%); }
          83%  { color: hsl(300, 100%, 65%); }
          100% { color: hsl(360, 100%, 65%); }
        }

        .rgb-letter {
          animation: rgbCycle 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
