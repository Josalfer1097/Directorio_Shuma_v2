"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { GitBranch, Maximize2 } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";

const OrgChart = dynamic(
  () => import("@/components/org-chart").then(mod => mod.OrgChart),
  { ssr: false, loading: () => <p className="text-text-muted font-dm-sans text-center py-20">Cargando...</p> }
);

function OrgChartLoading() {
  return (
    <div className="h-[calc(100vh-8rem)] w-full rounded-xl border border-border-subtle bg-bg-surface flex items-center justify-center">
      <div className="text-center">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4 bg-bg-elevated" />
        <Skeleton className="w-48 h-4 mb-2 bg-bg-elevated" />
        <Skeleton className="w-32 h-3 bg-bg-elevated" />
      </div>
    </div>
  );
}

export default function OrganigramaPage() {
  const [showMobileOrg, setShowMobileOrg] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base relative">
      <div className="dot-grid fixed inset-0" />
      
      <Navbar />

      <main className="md:pt-24 pt-20 pb-24 md:pb-8 px-4 relative z-10">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8 font-neuropol">
            <h1 className="font-neuropol text-2xl text-text-primary mb-2 font-neuropol">
              Organigrama
            </h1>
            <p className="font-dm-sans text-text-muted">
              Estructura organizacional de las empresas Shuma
            </p>
          </div>

          {/* Mobile restricted view */}
          <div className="md:hidden">
            {!showMobileOrg ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-bg-surface rounded-2xl border border-border-subtle shadow-xl">
                <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mb-6">
                  <GitBranch className="w-8 h-8 text-irid-a" />
                </div>
                <h3 className="font-neuropol text-lg text-text-primary mb-2">Experiencia Optimizada</h3>
                <p className="font-dm-sans text-sm text-text-muted mb-8">
                  El organigrama se visualiza mejor en pantallas grandes. ¿Deseas continuar en pantalla completa?
                </p>
                <button 
                  onClick={() => setShowMobileOrg(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-irid-a to-irid-b text-white font-neuropol text-xs tracking-wider"
                >
                  <Maximize2 className="w-4 h-4" />
                  Ver organigrama
                </button>
              </div>
            ) : (
              <div className="fixed inset-0 z-[60] bg-bg-base flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-surface/80 backdrop-blur-md">
                  <span className="font-neuropol text-xs uppercase tracking-widest text-text-primary">Vista Organigrama</span>
                  <button 
                    onClick={() => setShowMobileOrg(false)}
                    className="p-2 text-text-muted hover:text-text-primary"
                  >
                    Cerrar
                  </button>
                </div>
                <div className="flex-1">
                  <ErrorBoundary>
                    <Suspense fallback={<OrgChartLoading />}>
                      <OrgChart />
                    </Suspense>
                  </ErrorBoundary>
                </div>
              </div>
            )}
          </div>

          {/* Desktop view */}
          <div className="hidden md:block">
            <ErrorBoundary>
              <Suspense fallback={<OrgChartLoading />}>
                <OrgChart />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
}
