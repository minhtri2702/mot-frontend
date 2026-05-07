"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { TrendingUp, Loader2 } from "lucide-react";
import MangaCard from "@/components/manga-card";
import { MangaGridSkeleton } from "@/components/manga-card-skeleton";
import type { MangaCardData } from "@/lib/types";

// Mock data generator - returns a page of results
const generateMockPage = (page: number): MangaCardData[] => {
  const allItems: MangaCardData[] = [
    { id: "201", stt: 201, title: "Demon Slayer", cover: "https://ext.same-assets.com/4185522578/2551993677.jpg", views: 15000000, followers: 2000000, likes: 4.9 },
    { id: "202", stt: 202, title: "Jujutsu Kaisen", cover: "https://ext.same-assets.com/4185522578/2908889711.jpg", views: 8900000, followers: 980000, likes: 4.8 },
    { id: "203", stt: 203, title: "Chainsaw Man", cover: "https://ext.same-assets.com/4185522578/3267442566.jpg", views: 10500000, followers: 1200000, likes: 4.7 },
    { id: "204", stt: 204, title: "One Piece", cover: "https://ext.same-assets.com/4185522578/4110211349.jpg", views: 12500000, followers: 1500000, likes: 4.9 },
    { id: "205", stt: 205, title: "Spy x Family", cover: "https://ext.same-assets.com/4185522578/1173669990.jpg", views: 6800000, followers: 750000, likes: 4.5 },
    { id: "206", stt: 206, title: "Tokyo Revengers", cover: "https://ext.same-assets.com/4185522578/3081776352.jpg", views: 7200000, followers: 800000, likes: 4.6 },
    { id: "207", stt: 207, title: "One Punch Man", cover: "https://ext.same-assets.com/4185522578/1945673209.jpg", views: 8500000, followers: 950000, likes: 4.7 },
    { id: "208", stt: 208, title: "Attack on Titan", cover: "https://ext.same-assets.com/4185522578/2815673297.jpg", views: 18000000, followers: 2500000, likes: 4.9 },
    { id: "209", stt: 209, title: "My Hero Academia", cover: "https://ext.same-assets.com/4185522578/1481122338.jpg", views: 9200000, followers: 1100000, likes: 4.7 },
    { id: "210", stt: 210, title: "Dragon Ball Super", cover: "https://ext.same-assets.com/4185522578/2184428774.jpg", views: 7500000, followers: 850000, likes: 4.6 },
    { id: "211", stt: 211, title: "Naruto Shippuden", cover: "https://ext.same-assets.com/4185522578/4110211349.jpg", views: 20000000, followers: 3000000, likes: 4.9 },
    { id: "212", stt: 212, title: "Bleach TYBW", cover: "https://ext.same-assets.com/4185522578/2908889711.jpg", views: 11000000, followers: 1300000, likes: 4.7 },
    { id: "213", stt: 213, title: "Hunter x Hunter", cover: "https://ext.same-assets.com/4185522578/2184428774.jpg", views: 9500000, followers: 1050000, likes: 4.8 },
    { id: "214", stt: 214, title: "Fullmetal Alchemist", cover: "https://ext.same-assets.com/4185522578/1481122338.jpg", views: 8500000, followers: 950000, likes: 4.9 },
    { id: "215", stt: 215, title: "Death Note", cover: "https://ext.same-assets.com/4185522578/3947723584.jpg", views: 12000000, followers: 1400000, likes: 4.8 },
  ];

  const perPage = 10;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return allItems.slice(start, end);
};

const TOTAL_PAGES = 12;

export default function TrendingPage() {
  const [items, setItems] = useState<MangaCardData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 400));
      const data = generateMockPage(1);
      setItems(data);
      setPage(1);
      setHasMore(TOTAL_PAGES > 1);
      setLoading(false);
    }
    loadInitial();
  }, []);

  // Load more pages
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    const nextPage = page + 1;
    const data = generateMockPage(nextPage);
    if (data.length === 0) {
      setHasMore(false);
    } else {
      setItems(prev => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(nextPage < TOTAL_PAGES);
    }
    setLoadingMore(false);
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
