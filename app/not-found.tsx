'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 gap-6 text-center">
      <div>
        <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Página no encontrada
        </p>
        <p className="text-sm text-muted-foreground max-w-md">
          La página que buscas no existe o fue movida. Intenta recargar o vuelve al inicio.
        </p>
      </div>

      <div className="flex gap-3 flex-col sm:flex-row">
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium text-sm"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors font-medium text-sm"
        >
          <Home size={16} />
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
