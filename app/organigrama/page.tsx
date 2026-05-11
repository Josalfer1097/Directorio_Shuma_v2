"use client";

import { useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar";
import { ErrorBoundary } from "@/components/error-boundary";

const OrgChart = dynamic(
  () => import("@/components/org-chart").then(mod => mod.OrgChart),
  { ssr: false, loading: () => <OrgChartLoading /> }
);

function OrgChartLoading() {
  return (
    <div 
      className="h-[60vh] flex flex-col items-center justify-center gap-3"
      style={{ color: 'var(--muted-foreground)' }}
    >
      <div 
        style={{ 
          width: '32px', 
          height: '32px',
          border: '2px solid var(--border-subtle)',
          borderTop: '2px solid #0047AB',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} 
      />
      <span className="text-scale-sm tracking-widest">
        Cargando organigrama...
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

export default function OrganigramaPage() {
  // Check if we've shown the zoom hint before
  useEffect(() => {
    import("@/lib/localStorage").then(({ safeGetItem, safeSetItem }) => {
      const hasShownHint = safeGetItem("orgchart-zoom-hint-shown");
      if (!hasShownHint && typeof window !== "undefined" && window.innerWidth < 768) {
        // Import toast dynamically to avoid SSR issues
        import("sonner").then(({ toast }) => {
          setTimeout(() => {
            toast("Pellizca para hacer zoom", {
              description: "Usa dos dedos para navegar el organigrama",
              duration: 3000,
              position: "bottom-center",
            });
            safeSetItem("orgchart-zoom-hint-shown", "true");
          }, 500);
        });
      }
    });
  }, []);

  return (
    <div className="h-screen flex flex-col bg-bg-base relative overflow-hidden">
      <div className="dot-grid fixed inset-0" />
      
      {/* Navbar - fixed height */}
      <div className="relative z-20">
        <Navbar />
      </div>

      {/* Main content - fills remaining space */}
      <main className="flex-1 flex flex-col relative z-10 pt-16 md:pt-20 overflow-hidden">
        {/* Mobile Header - compact rows */}
        <div className="md:hidden flex flex-col shrink-0">
          {/* Row 1: Title */}
          <h1 
            className="font-neuropol text-text-primary px-4 pt-3 pb-1"
            style={{ fontSize: "clamp(1.2rem, 5vw, 1.5rem)" }}
          >
            Organigrama
          </h1>
          
          {/* Row 2: Subtitle */}
          <p 
            className="text-scale-xs text-muted-foreground px-4 pb-3 truncate"
          >
            Estructura organizacional de las empresas Shuma
          </p>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block px-6 pb-4">
          <h1 className="font-neuropol text-2xl text-text-primary mb-2">
            Organigrama
          </h1>
          <p className="font-dm-sans text-text-muted">
            Estructura organizacional de las empresas Shuma
          </p>
        </div>

        {/* Org Chart Container - takes remaining height */}
        <div className="flex-1 relative overflow-hidden md:px-6 md:pb-6">
          <ErrorBoundary>
            <Suspense fallback={<OrgChartLoading />}>
              <OrgChart />
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
