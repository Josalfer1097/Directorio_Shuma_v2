import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[56px] md:h-[64px] bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between h-full">
          <Skeleton className="h-6 w-24" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </div>
      
      <main className="pt-24 pb-24 md:pb-16 px-4">
        <div className="container mx-auto">
          {/* Hero skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-80 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 max-w-full mx-auto" />
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
