"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { TrendingUp, Clock, Flame, Tag, Eye, ChevronRight, History, Heart } from "lucide-react";
import FeaturedMangaCard from "@/components/featured-manga-card";
import MangaCard from "@/components/manga-card";
import { MangaGridSkeleton } from "@/components/manga-card-skeleton";
import { getFeaturedManga, getLatestUpdates, getHotManga, getGenres, getReadingHistory, getFavorites, formatRelativeTime, formatNumber, getCoverImageUrl } from "@/lib/api";
import type { FavoriteDTO } from "@/lib/api";
import type { MangaSummaryDTO, GenreDTO, ReadingHistoryDTO } from "@/lib/api";
import type { MangaCardData, FeaturedMangaData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getReadingHistory as getLocalReadingHistory, removeFromHistory as removeLocalHistory } from "@/lib/reading-history";
import type { ReadingHistoryEntry } from "@/lib/reading-history";
import Image from "next/image";

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
    queryFn: () => getLatestUpdates(0, 24).catch(() => ({ content: [], page: 0, size: 24, totalElements: 0, totalPages: 0, last: true, first: true })),
    staleTime: 2 * 60 * 1000,
  });
}

function useHotManga() {
  return useQuery({
    queryKey: ["hot-manga"],
    queryFn: () => getHotManga(0, 24).catch(() => ({ content: [], page: 0, size: 24, totalElements: 0, totalPages: 0, last: true, first: true })),
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
    description: m.description || "",
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
    description: m.description || "",
    author: m.author || "",
    views: m.views,
    followers: m.followers,
    likes: m.likes,
    chapter: m.latestChapter,
    updatedAt: formatRelativeTime(m.latestChapterUpdatedAt),
    status: m.status,
  };
}

// ===== Reading History Item (with cover image) =====

function ReadingHistoryItem({ item, onRemove }: { item: ReadingHistoryEntry; onRemove: (mangaId: string) => void }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl bg-muted/55 p-3 ring-1 ring-border/70 transition-colors hover:bg-muted">
      <Link
        href={`/truyen/${item.mangaId}/chuong/${item.chapterId}`}
        className="flex min-w-0 flex-1 gap-3"
      >
        <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
          <img
            src={getCoverImageUrl(item.coverImagePath)}
            alt={item.mangaTitle}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = "/placeholder-cover.svg"; }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary">
            {item.mangaTitle}
          </p>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            Chương {item.chapterNumber}
            {item.chapterName ? `: ${item.chapterName}` : ""}
            <span className="ml-2 text-xs text-muted-foreground/70">
              {formatRelativeTime(item.lastReadDate)}
            </span>
          </p>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          onRemove(item.mangaId);
        }}
        className="shrink-0 rounded-md p-2 text-xs text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label={`Xoá ${item.mangaTitle} khỏi lịch sử`}
        title="Xoá khỏi lịch sử"
      >
        ✕
      </button>
    </div>
  );
}

// ===== Favorites Sidebar Component =====

function FavoritesSidebar({ userId }: { userId: string }) {
  const { data: favorites, isLoading } = useQuery({
    queryKey: ["favorites-sidebar", userId],
    queryFn: () => getFavorites(userId, 0, 5).then(res => res.content),
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-10 h-14 bg-muted rounded" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-2 bg-muted rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Chưa có truyện nào
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {favorites.map((fav) => (
        <Link
          key={fav.mangaId}
          href={`/truyen/${fav.mangaId}`}
          className="flex gap-3 group"
        >
          <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0 relative">
            <Image
              src={getCoverImageUrl(fav.coverImagePath)}
              alt={fav.title}
              fill
              sizes="40px"
              style={{ objectFit: "cover" }}
              loading="eager"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
              {fav.title}
            </p>
            {fav.latestChapter != null && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Chương {fav.latestChapter}
              </p>
            )}
          </div>
        </Link>
      ))}
      <Button variant="outline" size="sm" className="w-full mt-2" asChild>
        <Link href="/truyen-yeu-thich">
          Xem thêm
          <ChevronRight className="h-3 w-3 ml-1" />
        </Link>
      </Button>
    </div>
  );
}

// ===== Component =====

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [heroIndex, setHeroIndex] = useState(0);

  const { data: featuredRes = [], isPending: featuredLoading } = useFeaturedManga();
  const { data: latestRes, isPending: latestLoading } = useLatestUpdates();
  const { data: hotRes, isPending: hotLoading } = useHotManga();
  const { data: genres = [] } = useGenres();
  const { data: readingHistory = [] } = useReadingHistory(user?.id, isAuthenticated);

  // Lấy lịch sử đọc từ localStorage (cho cả user chưa login)
  const [localHistory, setLocalHistory] = useState<ReadingHistoryEntry[]>([]);

  useEffect(() => {
    setLocalHistory(getLocalReadingHistory());
  }, []);

  const removeFromHistory = (mangaId: string) => {
    removeLocalHistory(mangaId);
    setLocalHistory(getLocalReadingHistory());
  };

  const isLoading = featuredLoading || latestLoading || hotLoading;

  // Map data
  const featuredManga = featuredRes.map(toFeaturedData);
  const latestUpdates = (latestRes?.content || []).map(toCardData);
  const trendingManga = (hotRes?.content || []).map(toCardData);
  const topViews = [...(hotRes?.content || [])]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map(toCardData);

  // Hero navigation
  const heroSlides = featuredManga.slice(0, 5);
  const currentHero = heroSlides[heroIndex] || heroSlides[0];

  const prevHero = useCallback(() => {
    setHeroIndex((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  }, [heroSlides.length]);

  const nextHero = useCallback(() => {
    setHeroIndex((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  }, [heroSlides.length]);

  if (isLoading) {
    return (
      <div className="container space-y-12 py-8">
        <section>
          <div className="mb-4 h-7 w-40 animate-pulse rounded-md bg-muted" />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="h-[360px] animate-pulse rounded-[18px] bg-muted ring-1 ring-border md:h-[390px] lg:h-[420px]" />
            <div className="hidden h-[420px] animate-pulse rounded-[18px] bg-muted ring-1 ring-border lg:block" />
          </div>
        </section>
        <MangaGridSkeleton count={12} />
      </div>
    );
  }

  return (
    <div className="container space-y-10 py-5 md:py-8">
      {/* ===== FEATURED STAGE + COMPACT RANKING ===== */}
      {currentHero && (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]" aria-label="Truyện nổi bật">
          <div className="min-w-0">
            <FeaturedMangaCard
              manga={currentHero}
              isFirst={heroIndex === 0}
              onPrev={prevHero}
              onNext={nextHero}
              currentIndex={heroIndex}
              totalSlides={heroSlides.length}
            />
          </div>

          {topViews.length > 0 && (
            <div className="min-w-0 rounded-[18px] bg-card p-4 ring-1 ring-border lg:h-[420px]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Bảng xếp hạng</p>
                  <h2 className="mt-0.5 text-lg font-semibold">Đang được săn đón</h2>
                </div>
                <Link href="/truyen-hot" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Xem tất cả truyện hot">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
                {topViews.map((manga, index) => (
                  <Link
                    key={manga.id}
                    href={`/truyen/${manga.id}`}
                    className="group flex min-w-[220px] snap-start items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted lg:min-w-0"
                  >
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold ${
                      index === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/70">
                      <Image
                        src={getCoverImageUrl(manga.cover)}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                        priority={index < 2}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold transition-colors group-hover:text-primary">{manga.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {formatNumber(manga.views)} lượt đọc
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ===== QUICK GENRE DISCOVERY ===== */}
      {genres.length > 0 && (
        <nav
          aria-label="Khám phá truyện theo thể loại"
          className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-center"
        >
          <div className="flex shrink-0 items-center gap-2 text-sm font-semibold">
            <Tag className="h-4 w-4 text-primary" />
            Khám phá thể loại
          </div>
          <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/the-loai"
              className="min-h-10 shrink-0 snap-start rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Tất cả
            </Link>
            {genres.slice(0, 10).map((genre) => (
              <Link
                key={genre.id}
                href={`/the-loai/${genre.slug}`}
                className="min-h-10 shrink-0 snap-start rounded-full border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {genre.name}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* ===== CONTINUE READING ===== */}
      {localHistory.length > 0 && (
        <section aria-labelledby="continue-reading-title">
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 id="continue-reading-title" className="flex items-center gap-2 text-xl font-semibold md:text-2xl">
                <History className="h-5 w-5 text-primary" />
                Đọc tiếp
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Quay lại đúng chương bạn đang đọc dở.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {localHistory.slice(0, 4).map((item) => (
              <ReadingHistoryItem
                key={`${item.mangaId}-${item.chapterId}`}
                item={item}
                onRemove={removeFromHistory}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===== TWO-COLUMN LAYOUT: Main + Sidebar ===== */}
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">

        {/* ===== MAIN CONTENT (LEFT) ===== */}
        <div className="min-w-0 flex-1 space-y-14">

          {/* ===== Được đọc nhiều ===== */}
          <section>
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold md:text-2xl">Được đọc nhiều</h2>
              </div>
              <Link href="/truyen-hot" className="flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Xem tất cả <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {trendingManga.slice(0, 12).map((manga) => (
                <MangaCard key={manga.id} manga={manga} showBadge="views" />
              ))}
            </div>
          </section>

          {/* ===== Mới cập nhật ===== */}
          <section>
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold md:text-2xl">
                <Clock className="h-5 w-5 text-primary" />
                Mới cập nhật
              </h2>
              <Link href="/truyen-moi-cap-nhat" className="flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Xem tất cả <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-x-6 md:grid-cols-2">
              {latestUpdates.slice(0, 12).map((manga) => (
                <Link
                  key={manga.id}
                  href={`/truyen/${manga.id}`}
                  className="group flex min-h-24 items-center gap-3 border-b border-border/70 py-3 transition-colors hover:border-primary/40"
                >
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/70">
                    <Image
                      src={getCoverImageUrl(manga.cover)}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
                      {manga.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {manga.chapter != null && (
                        <span className="rounded-md bg-accent px-2 py-1 font-semibold text-accent-foreground">
                          Chương {manga.chapter}
                        </span>
                      )}
                      {manga.updatedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {manga.updatedAt}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </section>

          {/* ===== Truyện Hoàn Thành ===== */}
          {trendingManga.filter(m => m.status === "Hoàn thành").length > 0 && (
            <section>
              <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-4">
                <h2 className="flex items-center gap-2 text-xl font-semibold md:text-2xl">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Truyện Hoàn Thành
                </h2>
                <Link href="/truyen-full" className="flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  Xem tất cả <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {trendingManga.filter(m => m.status === "Hoàn thành").slice(0, 24).map((manga) => (
                  <MangaCard key={manga.id} manga={manga} showBadge="rating" />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ===== SIDEBAR (RIGHT) ===== */}
        <aside className="w-full lg:w-72 shrink-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
          {/* Truyện đang theo dõi */}
          <div className="border-b border-border pb-5">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <Heart className="h-3.5 w-3.5 text-red-500" />
              Truyện đang theo dõi
            </h3>
            {isAuthenticated && user ? (
              <FavoritesSidebar userId={user.id} />
            ) : (
              <p className="text-xs text-muted-foreground text-center py-3">
                <Link href="/login" className="text-primary hover:underline">Đăng nhập</Link> để theo dõi truyện
              </p>
            )}
          </div>

          {/* Thể Loại */}
          {genres.length > 0 && (
            <div className="pb-5">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
                <Tag className="h-3.5 w-3.5 text-primary" />
                Thể Loại
              </h3>
              <div className="flex flex-wrap gap-1">
                {genres.slice(0, 12).map((genre) => (
                  <Link key={genre.id} href={`/the-loai/${genre.slug}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-[10px] px-1.5 py-0">
                      {genre.name}
                    </Badge>
                  </Link>
                ))}
                <Link href="/the-loai">
                  <Badge variant="outline" className="cursor-pointer text-[10px] px-1.5 py-0">
                    Xem thêm...
                  </Badge>
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
