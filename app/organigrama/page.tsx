"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { OrgChart } from "@/components/org-chart";
import { Skeleton } from "@/components/ui/skeleton";

function OrgChartLoading() {
  return (
    <div className="h-[calc(100vh-8rem)] w-full rounded-xl border border-border bg-card flex items-center justify-center">
      <div className="text-center">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
        <Skeleton className="w-48 h-4 mb-2" />
        <Skeleton className="w-32 h-3" />
      </div>
    </div>
  );
}

export default function OrganigramaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-8 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Organigrama
            </h1>
            <p className="text-muted-foreground">
              Estructura organizacional de Grupo Shuma y sus subsidiarias
            </p>
          </motion.div>

          {/* Org Chart */}
          <Suspense fallback={<OrgChartLoading />}>
            <OrgChart />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
