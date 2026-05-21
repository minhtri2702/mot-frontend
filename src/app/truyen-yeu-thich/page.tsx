"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, BookOpen, Eye, Trash2, ChevronLeft, ChevronRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { getFavorites, removeFavorite, formatNumber, formatRelativeTime, getCoverImageUrl } from "@/lib/api";
import type { FavoriteDTO, PagedResponseDTO } from "@/lib/api";

export default function FavoritesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<PagedResponseDTO<FavoriteDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const fetchFavorites = useCallback(async (pageNum: number) => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getFavorites(user.id, pageNum, 20);
      setFavorites(data);
    } catch (err) {
      console.error("Failed to load favorites:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchFavorites(page);
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user, page, fetchFavorites]);

  const handleRemove = async (mangaId: string) => {
    if (!user) return;
    setRemovingIds((prev) => new Set(prev).add(mangaId));
    try {
      await removeFavorite(user.id, mangaId);
      // Refresh current page
      fetchFavorites(page);
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(mangaId);
        return next;
      });
    }
  };

  // Not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container py-20">
        <div className="text-center max-w-md mx-auto space-y-6">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Truyện yêu thích</h1>
          <p className="text-muted-foreground">
            Vui lòng đăng nhập để xem danh sách truyện yêu thích của bạn.
          </p>
          <Button size="lg" asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Đăng nhập
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Loading
  if (authLoading || loading) {
    return (
      <div className="container py-8 space-y-6">
        <h1 className="text-2xl font-bold">Truyện yêu thích</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border rounded-lg">
              <Skeleton className="w-16 h-24 rounded-md flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!favorites || favorites.content.length === 0) {
    return (
      <div className="container py-20">
        <div className="text-center max-w-md mx-auto space-y-6">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Truyện yêu thích</h1>
          <p className="text-muted-foreground">
            Bạn chưa có truyện yêu thích nào. Hãy khám phá và thêm truyện vào danh sách yêu thích nhé!
          </p>
          <Button size="lg" asChild>
            <Link href="/truyen-moi-cap-nhat">
              <BookOpen className="mr-2 h-4 w-4" />
              Khám phá truyện
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Truyện yêu thích</h1>
          <p className="text-sm text-muted-foreground">
            Tổng số: {favorites.totalElements} truyện
          </p>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {favorites.content.map((fav) => (
          <div
            key={fav.mangaId}
            className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors group relative"
          >
            {/* Cover */}
            <Link href={`/truyen/${fav.mangaId}`} className="flex-shrink-0">
              <div className="w-16 h-24 rounded-md overflow-hidden relative">
                <Image
                  src={getCoverImageUrl(fav.coverImagePath)}
                  alt={fav.title}
                  fill
                  sizes="64px"
                  style={{ objectFit: "cover" }}
                  loading="eager"
                  priority
                />
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link href={`/truyen/${fav.mangaId}`}>
                <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                  {fav.title}
                </h3>
              </Link>

              {fav.author && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {fav.author}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatNumber(fav.views)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {formatNumber(fav.followers)}
                </span>
              </div>

              {fav.status && (
                <Badge
                  variant="outline"
                  className={`mt-2 text-[10px] px-1.5 py-0 ${
                    fav.status === "Hoàn thành"
                      ? "border-blue-500 text-blue-500"
                      : fav.status === "Đang tiến hành"
                      ? "border-green-500 text-green-500"
                      : ""
                  }`}
                >
                  {fav.status}
                </Badge>
              )}

              {fav.latestChapter != null && (
                <Link
                  href={`/truyen/${fav.mangaId}/chuong/${fav.latestChapter}`}
                  className="block mt-2 text-xs text-primary hover:underline"
                >
                  Chương {fav.latestChapter}
                  {fav.latestChapterUpdatedAt && (
                    <span className="text-muted-foreground ml-1">
                      ({formatRelativeTime(fav.latestChapterUpdatedAt)})
                    </span>
                  )}
                </Link>
              )}
            </div>

            {/* Remove button */}
            <button
              onClick={() => handleRemove(fav.mangaId)}
              disabled={removingIds.has(fav.mangaId)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
              title="Xoá khỏi yêu thích"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {favorites.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={favorites.first}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm text-muted-foreground px-4">
            Trang {favorites.page + 1} / {favorites.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={favorites.last}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
