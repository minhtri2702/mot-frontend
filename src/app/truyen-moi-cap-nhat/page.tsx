"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import MangaCard from "@/components/manga-card";
import { MangaGridSkeleton } from "@/components/manga-card-skeleton";
import { getLatestUpdates, formatRelativeTime } from "@/lib/api";
import type { MangaSummaryDTO } from "@/lib/api";
import type { MangaCardData } from "@/lib/types";

export default function LatestUpdatesPage() {
  const [items, setItems] = useState<MangaCardData[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      try {
        const data = await getLatestUpdates(0, 10);
        setItems(
          data.content.map((m: MangaSummaryDTO) => ({
            id: m.id,
            stt: m.stt,
            title: m.title,
            cover: m.coverImagePath,
            views: m.views,
            followers: m.followers,
            likes: m.likes,
            chapter: m.latestChapter,
            updatedAt: formatRelativeTime(m.latestChapterUpdatedAt),
            status: m.status,
          }))
        );
        setPage(0);
        setHasMore(!data.last);
      } catch (error) {
        console.error("Failed to load latest updates:", error);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Load more pages
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await getLatestUpdates(nextPage, 10);
      const newItems = data.content.map((m: MangaSummaryDTO) => ({
        id: m.id,
        stt: m.stt,
        title: m.title,
        cover: m.coverImagePath,
        views: m.views,
        followers: m.followers,
        likes: m.likes,
        chapter: m.latestChapter,
        updatedAt: formatRelativeTime(m.latestChapterUpdatedAt),
        status: m.status,
      }));
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
        setPage(nextPage);
        setHasMore(!data.last);
      }
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  return (
    <div className="container py-8 space-y-10">
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Mới Cập Nhật</h2>
        </div>

        {loading ? (
          <MangaGridSkeleton count={10} />
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 grid-fade-in">
              {items.length > 0 ? (
                items.map((manga) => (
                  <MangaCard key={manga.id} manga={manga} showBadge="time" />
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
