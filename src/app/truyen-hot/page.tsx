"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { TrendingUp, Loader2 } from "lucide-react";
import MangaCard from "@/components/manga-card";
import { MangaGridSkeleton } from "@/components/manga-card-skeleton";
import { getHotManga } from "@/lib/api";
import type { MangaSummaryDTO } from "@/lib/api";
import type { MangaCardData } from "@/lib/types";

function toCardData(m: MangaSummaryDTO): MangaCardData {
  return {
    id: m.id,
    stt: m.stt,
    title: m.title,
    cover: m.coverImagePath,
    views: m.views,
    followers: m.followers,
    likes: m.likes,
    status: m.status,
  };
}

export default function TrendingPage() {
  const [items, setItems] = useState<MangaCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);

  // Initial load
  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      try {
        const data = await getHotManga(0, 10);
        setItems(data.content.map(toCardData));
        pageRef.current = 0;
        hasMoreRef.current = !data.last;
        setHasMore(!data.last);
      } catch (error) {
        console.error("Failed to load hot manga:", error);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Load more pages - uses refs to avoid stale closure
  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const data = await getHotManga(nextPage, 10);
      const newItems = data.content.map(toCardData);
      if (newItems.length === 0) {
        hasMoreRef.current = false;
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
        pageRef.current = nextPage;
        hasMoreRef.current = !data.last;
        setHasMore(!data.last);
      }
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, []); // No dependencies - all state via refs

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingMoreRef.current) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]); // Only depends on loadMore (which is stable now)

  return (
    <div className="container py-8 space-y-10">
      <section>
        <div className="flex items-center mb-4">
          <TrendingUp className="mr-2 h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Xu Hướng</h2>
        </div>

        {loading ? (
          <MangaGridSkeleton count={10} />
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 grid-fade-in">
              {items.length > 0 ? (
                items.map((manga) => (
                  <MangaCard key={manga.id} manga={manga} showBadge="views" />
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <p className="text-muted-foreground">Không có dữ liệu để hiển thị.</p>
                </div>
              )}
            </div>

            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-8">
                {loadingMore ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Đang tải thêm...</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Cuộn xuống để xem thêm</p>
                )}
              </div>
            )}

            {!hasMore && items.length > 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Đã hiển thị tất cả truyện</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
