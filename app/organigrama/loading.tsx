import { Skeleton } from "@/components/ui/skeleton";

export default function OrganigramaLoading() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 py-20">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-30"
           style={{
             backgroundImage: `
               linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)`,
             backgroundSize: '40px 40px'
           }} />

      {/* Main content skeleton */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        {/* Badge skeleton */}
        <Skeleton className="h-7 w-40 rounded-full mb-6" />
        
        {/* Title skeleton */}
        <Skeleton className="h-9 w-64 mb-3" />
        
        {/* Description skeleton */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-8" />

        {/* Progress bar skeleton */}
        <div className="w-full mb-6">
          <div className="flex justify-between mb-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1 w-full rounded-full" />
        </div>

        {/* Task list skeleton */}
        <div className="w-full flex flex-col gap-2 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>

        {/* Back button skeleton */}
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
    </main>
  );
}
