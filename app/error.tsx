'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0C0E11',
        color: 'white',
        fontFamily: 'DM Sans, sans-serif',
        gap: '16px',
        padding: '24px',
      }}
    >
      <div
        style={{
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase',
        }}
      >
        Error del sistema
      </div>
      <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)' }}>
        Algo salio mal. Por favor intenta de nuevo.
      </div>
      <button
        onClick={reset}
        style={{
          marginTop: '8px',
          padding: '10px 24px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '10px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '0.85rem',
        }}
      >
        Reintentar
      </button>
    </div>
  );
}
