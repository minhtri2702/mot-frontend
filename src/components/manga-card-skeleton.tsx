import { Skeleton } from "@/components/ui/skeleton";

export function MangaCardSkeleton() {
  return (
    <div className="group">
      <div className="relative mb-2 aspect-[2/3] overflow-hidden rounded-md shadow">
        <Skeleton className="w-full h-full" />
      </div>
      <Skeleton className="h-4 w-3/4 mb-1" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function MangaGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MangaCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FeaturedMangaSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg shadow-lg">
      <div className="relative aspect-[2/1] md:aspect-[2/1.2]">
        <Skeleton className="w-full h-full" />
        <div className="absolute bottom-0 p-4 w-full space-y-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function MangaDetailSkeleton() {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="aspect-[3/4] rounded-lg overflow-hidden">
            <Skeleton className="w-full h-full" />
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          <div className="flex gap-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-28 rounded-md" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

export function ChapterReaderSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 z-50 bg-background/95 border-b">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-5" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto">
        <Skeleton className="w-full aspect-[3/4]" />
        <Skeleton className="w-full aspect-[3/4]" />
        <Skeleton className="w-full aspect-[3/4]" />
      </div>
    </div>
  );
}
