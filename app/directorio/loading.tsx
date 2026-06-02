import { Skeleton } from "@/components/ui/skeleton";

export default function DirectorioLoading() {
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
          {/* Header skeleton */}
          <div className="mb-8">
            <Skeleton className="h-9 w-72 mb-2" />
            <Skeleton className="h-5 w-96 max-w-full" />
          </div>

          <div className="flex gap-8">
            {/* Sidebar skeleton - desktop only */}
            <aside className="hidden lg:block w-72 shrink-0">
              <Skeleton className="h-[400px] rounded-xl" />
            </aside>

            {/* Main content skeleton */}
            <div className="flex-1 min-w-0">
              {/* Search bar skeleton */}
              <div className="mb-6">
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              {/* Results count skeleton */}
              <Skeleton className="h-5 w-48 mb-4" />

              {/* Cards skeleton */}
              <div className="grid grid-cols-1 gap-4" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
              }}>
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
