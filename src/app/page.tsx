"use client";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TrendingUp, Clock, Flame, Tag, Eye, ChevronRight, History } from "lucide-react";
import FeaturedMangaCard from "@/components/featured-manga-card";
import MangaCard from "@/components/manga-card";
import { MangaGridSkeleton } from "@/components/manga-card-skeleton";
import { getFeaturedManga, getLatestUpdates, getHotManga, getGenres, getReadingHistory, formatRelativeTime, formatNumber } from "@/lib/api";
import type { MangaSummaryDTO, GenreDTO, ReadingHistoryDTO } from "@/lib/api";
import type { MangaCardData, FeaturedMangaData } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

// ===== Custom hooks =====

function useFeaturedManga() {
  return useQuery({
    queryKey: ["featured-manga"],
    queryFn: () => getFeaturedManga().catch(() => [] as MangaSummaryDTO[]),
    staleTime: 5 * 60 * 1000,
  });
}

function useLatestUpdates() {
  return useQuery({
    queryKey: ["latest-updates"],
    queryFn: () => getLatestUpdates(0, 12).catch(() => ({ content: [], page: 0, size: 12, totalElements: 0, totalPages: 0, last: true, first: true })),
    staleTime: 2 * 60 * 1000,
  });
}

function useHotManga() {
  return useQuery({
    queryKey: ["hot-manga"],
    queryFn: () => getHotManga(0, 12).catch(() => ({ content: [], page: 0, size: 12, totalElements: 0, totalPages: 0, last: true, first: true })),
    staleTime: 2 * 60 * 1000,
  });
}

function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: () => getGenres().catch(() => [] as GenreDTO[]),
    staleTime: 10 * 60 * 1000,
  });
}

function useReadingHistory(userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["reading-history", userId],
    queryFn: () => getReadingHistory(userId!, 8).catch(() => [] as ReadingHistoryDTO[]),
    enabled: enabled && !!userId,
    staleTime: 1 * 60 * 1000,
  });
}

// ===== Mappers =====

function toFeaturedData(m: MangaSummaryDTO): FeaturedMangaData {
  return {
    id: m.id,
    stt: m.stt,
    title: m.title,
    cover: m.coverImagePath,
    description: "",
    genres: m.genres.map((g: string, idx: number) => ({ id: idx, name: g, slug: g.toLowerCase() })),
    likes: m.likes,
    followers: m.followers,
    views: m.views,
    latestChapter: m.latestChapter,
  };
}

function toCardData(m: MangaSummaryDTO): MangaCardData {
  return {
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
  };
}

// ===== Component =====

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const { data: featuredRes = [] } = useFeaturedManga();
  const { data: latestRes } = useLatestUpdates();
  const { data: hotRes } = useHotManga();
  const { data: genres = [] } = useGenres();
  const { data: readingHistory = [] } = useReadingHistory(user?.id, isAuthenticated);

  const isLoading = !featuredRes.length && !latestRes && !hotRes;

  // Map data
  const featuredManga = featuredRes.map(toFeaturedData);
  const latestUpdates = (latestRes?.content || []).map(toCardData);
  const trendingManga = (hotRes?.content || []).map(toCardData);
  const topViews = [...(hotRes?.content || [])]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map(toCardData);

  if (isLoading) {
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
        <MangaGridSkeleton count={12} />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-8">
      {/* ===== HERO CAROUSEL ===== */}
      {featuredManga.length > 0 && (
        <section className="relative">
          <Carousel className="w-full" opts={{ loop: true, align: "start" }}>
            <CarouselContent>
              {featuredManga.slice(0, 5).map((manga, index) => (
                <CarouselItem key={manga.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <FeaturedMangaCard manga={manga} isFirst={index === 0} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </section>
      )}

      {/* ===== LAYOUT 2 CỘT ===== */}
      <div className="flex flex-col lg:flex-row gap-8">

        {/* ===== MAIN CONTENT (LEFT) ===== */}
        <div className="flex-1 min-w-0 space-y-10">

          {/* Mới Cập Nhật */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Mới Cập Nhật
              </h2>
              <Link href="/truyen-moi-cap-nhat" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {latestUpdates.slice(0, 10).map((manga) => (
                <MangaCard key={manga.id} manga={manga} showBadge="time" />
              ))}
            </div>
          </section>

          {/* Xu Hướng */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Xu Hướng</h2>
              </div>
              <Link href="/truyen-hot" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {trendingManga.slice(0, 10).map((manga) => (
                <MangaCard key={manga.id} manga={manga} showBadge="views" />
              ))}
            </div>
          </section>

          {/* Truyện Hoàn Thành */}
          {trendingManga.filter(m => m.status === "Hoàn thành").length > 0 && (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Truyện Hoàn Thành
                </h2>
                <Link href="/truyen-full" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                  Xem tất cả <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {trendingManga.filter(m => m.status === "Hoàn thành").slice(0, 10).map((manga) => (
                  <MangaCard key={manga.id} manga={manga} showBadge="rating" />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ===== SIDEBAR (RIGHT) ===== */}
        <aside className="w-full lg:w-80 shrink-0 space-y-6">
          {/* Top Views Ranking */}
          {topViews.length > 0 && (
            <div className="rounded-xl border bg-card p-4">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                Top Lượt Xem
              </h3>
              <div className="space-y-2">
                {topViews.map((manga, index) => (
                  <Link
                    key={manga.id}
                    href={`/truyen/${manga.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      index === 0 ? "bg-yellow-500 text-white" :
                      index === 1 ? "bg-gray-400 text-white" :
                      index === 2 ? "bg-amber-700 text-white" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {manga.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(manga.views)} lượt xem
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Thể Loại */}
          {genres.length > 0 && (
            <div className="rounded-xl border bg-card p-4">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Thể Loại
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {genres.slice(0, 12).map((genre) => (
                  <Link key={genre.id} href={`/the-loai/${genre.slug}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs">
                      {genre.name}
                    </Badge>
                  </Link>
                ))}
                <Link href="/the-loai">
                  <Badge variant="outline" className="cursor-pointer text-xs">
                    Xem thêm...
                  </Badge>
                </Link>
              </div>
            </div>
          )}

          {/* Lịch Sử Đọc Truyện */}
          {isAuthenticated && readingHistory.length > 0 ? (
            <div className="rounded-xl border bg-card p-4">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Lịch Sử Đọc
              </h3>
              <div className="space-y-2">
                {readingHistory.map((item) => (
                  <Link
                    key={`${item.mangaId}-${item.chapterId}`}
                    href={`/truyen/${item.mangaId}/chuong/${item.chapterId}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-10 h-14 rounded overflow-hidden shrink-0 bg-muted">
                      {item.coverImagePath ? (
                        <img
                          src={item.coverImagePath}
                          alt={item.mangaTitle}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          {item.mangaTitle?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {item.mangaTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Chương {item.chapterNumber}
                        {item.chapterName ? `: ${item.chapterName}` : ""}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60">
                        {formatRelativeTime(item.lastReadDate)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : isAuthenticated ? (
            <div className="rounded-xl border bg-card p-4">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Lịch Sử Đọc
              </h3>
              <p className="text-sm text-muted-foreground text-center py-4">
                Bạn chưa đọc truyện nào
              </p>
            </div>
          ) : (
            <div className="rounded-xl border bg-card p-4">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Lịch Sử Đọc
              </h3>
              <p className="text-sm text-muted-foreground text-center py-4">
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Đăng nhập
                </Link>{" "}
                để xem lịch sử đọc truyện
              </p>
            </div>
          )}

          {/* Đề Xuất */}
          {trendingManga.length > 0 && (
            <div className="rounded-xl border bg-card p-4">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Đề Xuất
              </h3>
              <div className="space-y-2">
                {trendingManga.slice(0, 4).map((manga) => (
                  <Link
                    key={manga.id}
                    href={`/truyen/${manga.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {manga.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {manga.status || "Đang tiến hành"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Eye className="h-3 w-3" />
                      {formatNumber(manga.views)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
