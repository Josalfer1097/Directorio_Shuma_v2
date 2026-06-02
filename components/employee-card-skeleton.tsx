import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton placeholders that mirror the real employee views.
 * Theme-aware (Skeleton uses bg-accent) and animated with animate-pulse.
 */

export function EmployeeCardSkeletonGrid() {
  return (
    <div
      className="rounded-xl border border-border bg-card p-4"
      aria-hidden="true"
    >
      {/* Header row: name + company badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <Skeleton className="h-5 w-2/3 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-full shrink-0" />
      </div>
      {/* Position */}
      <Skeleton className="h-4 w-1/2 rounded-md mb-5" />
      {/* Contact rows */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-md shrink-0" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-md shrink-0" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-md shrink-0" />
          <Skeleton className="h-4 w-1/3 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function EmployeeCardSkeletonList() {
  return (
    <div
      className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3"
      aria-hidden="true"
    >
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <Skeleton className="h-4 w-1/3 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full shrink-0" />
    </div>
  );
}

export function ExtensionRowSkeleton() {
  return (
    <div
      className="flex items-center gap-4 border-b border-border-subtle px-4 py-3"
      aria-hidden="true"
    >
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <Skeleton className="h-4 w-1/3 rounded-md" />
      <Skeleton className="h-4 w-1/4 rounded-md ml-auto" />
      <Skeleton className="h-4 w-12 rounded-md shrink-0" />
    </div>
  );
}

interface EmployeeSkeletonGroupProps {
  view?: "grid" | "list" | "extensions";
  count?: number;
}

export function EmployeeSkeletonGroup({
  view = "grid",
  count = 6,
}: EmployeeSkeletonGroupProps) {
  if (view === "extensions") {
    return (
      <div
        className="rounded-xl border border-border bg-card overflow-hidden"
        role="status"
        aria-label="Cargando directorio"
      >
        {Array.from({ length: count }).map((_, i) => (
          <ExtensionRowSkeleton key={i} />
        ))}
        <span className="sr-only">Cargando directorio...</span>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="flex flex-col gap-3" role="status" aria-label="Cargando empleados">
        {Array.from({ length: count }).map((_, i) => (
          <EmployeeCardSkeletonList key={i} />
        ))}
        <span className="sr-only">Cargando empleados...</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Cargando empleados"
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fill, minmax(calc(280px * var(--font-scale, 1)), 1fr))",
        gap: "calc(16px * var(--font-scale, 1))",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <EmployeeCardSkeletonGrid key={i} />
      ))}
      <span className="sr-only">Cargando empleados...</span>
    </div>
  );
}
