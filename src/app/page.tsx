"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TrendingUp } from "lucide-react";
import FeaturedMangaCard from "@/components/featured-manga-card";
import MangaCard from "@/components/manga-card";
import { MangaGridSkeleton } from "@/components/manga-card-skeleton";
import { getFeaturedManga, getLatestUpdates, getHotManga, formatRelativeTime } from "@/lib/api";
import type { MangaSummaryDTO } from "@/lib/api";
import type { MangaCardData, FeaturedMangaData } from "@/lib/types";

export default function Home() {
  const [featuredManga, setFeaturedManga] = useState<FeaturedMangaData[]>([]);
  const [latestUpdates, setLatestUpdates] = useState<MangaCardData[]>([]);
  const [trendingManga, setTrendingManga] = useState<MangaCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [featuredRes, latestRes, hotRes] = await Promise.all([
          getFeaturedManga().catch(() => [] as MangaSummaryDTO[]),
          getLatestUpdates(0, 10).catch(() => ({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, last: true, first: true })),
          getHotManga(0, 6).catch(() => ({ content: [], page: 0, size: 6, totalElements: 0, totalPages: 0, last: true, first: true })),
        ]);

        if (cancelled) return;

        // Map featured
        setFeaturedManga(
          (featuredRes || []).map((m: MangaSummaryDTO) => ({
            id: m.id,
            stt: m.stt,
            title: m.title,
            cover: m.coverImagePath,
            description: "",
            genres: m.genres.map((g: string) => ({ id: 0, name: g, slug: g.toLowerCase() })),
            likes: m.likes,
            followers: m.followers,
            views: m.views,
            latestChapter: m.latestChapter,
          }))
        );

        // Map latest updates
        setLatestUpdates(
          (latestRes?.content || []).map((m: MangaSummaryDTO) => ({
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

        // Map trending
        setTrendingManga(
          (hotRes?.content || []).map((m: MangaSummaryDTO) => ({
            id: m.id,
            stt: m.stt,
            title: m.title,
            cover: m.coverImagePath,
            views: m.views,
            followers: m.followers,
            likes: m.likes,
            status: m.status,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="container py-8 space-y-10">
        <section>
          <h2 className="text-2xl font-bold mb-4">Truyện Đề Xuất</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[2/1] bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </section>
        <MangaGridSkeleton count={10} />
        <MangaGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-10">
      {/* Featured Manga Carousel */}
      {featuredManga.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Truyện Đề Xuất</h2>
          <Carousel className="w-full">
            <CarouselContent>
              {featuredManga.map((manga) => (
                <CarouselItem key={manga.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <FeaturedMangaCard manga={manga} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </section>
      )}

      {/* Latest Updates */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Mới Cập Nhật</h2>
          <Link href="/truyen-moi-cap-nhat" className="text-sm font-medium text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {latestUpdates.slice(0, 10).map((manga) => (
            <MangaCard key={manga.id} manga={manga} showBadge="time" />
          ))}
        </div>
      </section>

      {/* Trending Manga */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Xu Hướng</h2>
          </div>
          <Link href="/truyen-hot" className="text-sm font-medium text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {trendingManga.map((manga) => (
            <MangaCard key={manga.id} manga={manga} showBadge="views" />
          ))}
        </div>
      </section>
    </div>
  );
}
