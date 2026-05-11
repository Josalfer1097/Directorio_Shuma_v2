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
    // Error logging for production debugging
    if (process.env.NODE_ENV === 'production') {
      // Could send to error tracking service here
    }
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"
      style={{
        background: 'var(--bg-base)',
        color: 'var(--foreground)',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <div
        className="text-scale-xs uppercase tracking-widest"
        style={{ color: 'var(--muted-foreground)' }}
      >
        Error del sistema
      </div>
      <div className="text-scale-lg" style={{ color: 'var(--muted-foreground)' }}>
        Algo salio mal. Por favor intenta de nuevo.
      </div>
      <button
        onClick={reset}
        className="text-scale-base mt-2 px-6 py-2.5 rounded-xl cursor-pointer transition-colors hover:opacity-80"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--foreground)',
        }}
      >
        Reintentar
      </button>
    </div>
  );
}
