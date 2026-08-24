"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Heart, Eye, BookOpen, Clock, Star, ChevronDown, ChevronRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MangaCard from "@/components/manga-card";
import { MangaDetailSkeleton } from "@/components/manga-card-skeleton";
import { getMangaDetail, getFavorites, getRelatedManga, formatNumber, formatRelativeTime, getCoverImageUrl } from "@/lib/api";
import FavoriteButton from "@/components/favorite-button";
import CommentSection from "@/components/comment-section";
import { useAuth } from "@/lib/auth";
import type { MangaDetailDTO, FavoriteDTO, MangaSummaryDTO } from "@/lib/api";
import type { MangaCardData } from "@/lib/types";
import { getMangaReadingHistory, getReadingHistory } from "@/lib/reading-history";
import type { ReadingHistoryEntry } from "@/lib/reading-history";

export default function MangaDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, isAuthenticated } = useAuth();
  const mountedRef = useRef(true);

  const [manga, setManga] = useState<MangaDetailDTO | null>(null);
  const [relatedManga, setRelatedManga] = useState<MangaCardData[]>([]);
  const [favorites, setFavorites] = useState<FavoriteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllChapters, setShowAllChapters] = useState(false);
  const [lastReadChapterId, setLastReadChapterId] = useState<number | null>(null);
  const [lastReadChapterNumber, setLastReadChapterNumber] = useState<number | null>(null);
  const [localHistory, setLocalHistory] = useState<ReadingHistoryEntry[]>([]);

  useEffect(() => {
    mountedRef.current = true;
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch main data first (critical for LCP)
        const detail = await getMangaDetail(id);
        if (!mountedRef.current) return;
        setManga(detail);
        setLoading(false);

        // Fetch secondary data in parallel (non-blocking)
        const [related, favData] = await Promise.all([
          getRelatedManga(id, 0, 10),
          user ? getFavorites(user.id, 0, 5) : Promise.resolve(null),
        ]);

        if (!mountedRef.current) return;
        setRelatedManga(
          related.content.map((m: MangaSummaryDTO) => ({
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
        if (favData) {
          setFavorites(favData.content);
        }
      } catch (error) {
        console.error("Failed to load manga detail:", error);
        setLoading(false);
      }
    }

    fetchData();
    return () => { mountedRef.current = false; };
  }, [id, user]);

  // Lấy chapter đã đọc gần nhất từ localStorage
  useEffect(() => {
    const history = getMangaReadingHistory(id);
    if (history) {
      setLastReadChapterId(history.chapterId);
      setLastReadChapterNumber(history.chapterNumber);
    }
  }, [id]);

  // Lấy lịch sử đọc từ localStorage
  useEffect(() => {
    setLocalHistory(getReadingHistory());
  }, []);

  if (loading) {
    return <MangaDetailSkeleton />;
  }

  if (!manga) {
    return (
      <div className="container py-8">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Không tìm thấy truyện.</p>
          <Link href="/" className="text-primary hover:underline mt-4 inline-block">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const lastReadChapterIndex = lastReadChapterId == null
    ? -1
    : manga.chapters.findIndex((chapter) => chapter.id === lastReadChapterId);
  const nearbyStart = Math.max(0, Math.min(lastReadChapterIndex - 2, manga.chapters.length - 5));
  const displayedChapters = showAllChapters
    ? manga.chapters
    : lastReadChapterIndex >= 0
      ? manga.chapters.slice(nearbyStart, nearbyStart + 5)
      : manga.chapters.slice(0, 5);

  return (
    <div className="container py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-8 min-w-0">
          {/* Manga Detail Header */}
          <div className="flex flex-col gap-6 md:flex-row md:gap-8">
            {/* Cover Image - optimized for LCP */}
            <div className="mx-auto w-48 flex-shrink-0 sm:w-56 md:mx-0 md:w-64">
              <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-lg relative bg-muted" style={{ minHeight: '256px' }}>
                {/* Preload hint for LCP image */}
                <link rel="preload" as="image" href={getCoverImageUrl(manga.coverImagePath)} />
                <img
                  src={getCoverImageUrl(manga.coverImagePath)}
                  alt={manga.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  width="256"
                  height="341"
                  onError={(e) => { e.currentTarget.src = "/placeholder-cover.svg"; }}
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <h1 className="text-3xl font-bold">{manga.title}</h1>

              <div className="flex flex-wrap gap-2">
                {manga.genres.map((genre) => (
                  <Link key={genre} href={`/the-loai/${genre.toLowerCase()}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      {genre}
                    </Badge>
                  </Link>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-foreground">{manga.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{formatNumber(manga.views)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{formatNumber(manga.followers)}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Tác giả:</span>
                  <span>{manga.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <span className={`font-medium ${
                    manga.status === "Đang tiến hành" ? "text-green-500" :
                    manga.status === "Hoàn thành" ? "text-blue-500" : ""
                  }`}>
                    {manga.status}
                  </span>
                </div>
              </div>

              {manga.alternativeTitles && (
                <p className="text-sm text-muted-foreground">
                  Tên khác: {manga.alternativeTitles}
                </p>
              )}

              <p className="text-muted-foreground leading-relaxed">
                {manga.description}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                {manga.chapters.length > 0 && (
                  <>
                    {lastReadChapterId != null && lastReadChapterNumber != null && (
                      <Button size="lg" asChild>
                        <Link href={`/truyen/${manga.id}/chuong/${lastReadChapterId}`}>
                          Đọc tiếp Chương {lastReadChapterNumber}
                        </Link>
                      </Button>
                    )}
                    <Button size="lg" variant={lastReadChapterId != null ? "outline" : "default"} asChild>
                      <Link href={`/truyen/${manga.id}/chuong/${manga.chapters[0].id}`}>
                        Đọc từ đầu
                      </Link>
                    </Button>
                  </>
                )}
                <FavoriteButton mangaId={manga.id} size="lg" />
              </div>
            </div>
          </div>

          {/* Chapter List */}
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Danh sách chương</h2>
                {!showAllChapters && lastReadChapterIndex >= 0 && (
                  <p className="mt-1 text-sm text-muted-foreground">Các chương gần Chương {lastReadChapterNumber} bạn đang đọc</p>
                )}
              </div>
            </div>
            {manga.chapters.length > 0 ? (
              <>
                <div className="border rounded-lg divide-y">
                  {displayedChapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={`/truyen/${manga.id}/chuong/${chapter.id}`}
                      aria-current={chapter.id === lastReadChapterId ? "page" : undefined}
                      className={`flex items-center justify-between px-4 py-3 transition-colors ${chapter.id === lastReadChapterId ? "bg-primary/10" : "hover:bg-muted/50"}`}
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {chapter.chapterName || `Chương ${chapter.chapterNumber}`}
                        </span>
                        {chapter.id === lastReadChapterId && (
                          <Badge variant="secondary" className="border border-primary/30 bg-primary/10 text-primary">Đang đọc</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatRelativeTime(chapter.createdAt)}
                      </span>
                    </Link>
                  ))}
                </div>
                {manga.chapters.length > 5 && (
                  <Button
                    variant="ghost"
                    className="w-full mt-2"
                    onClick={() => setShowAllChapters(!showAllChapters)}
                  >
                    <ChevronDown className={`mr-2 h-4 w-4 transition-transform ${showAllChapters ? "rotate-180" : ""}`} />
                    {showAllChapters ? "Thu gọn" : `Xem tất cả ${manga.chapters.length} chương`}
                  </Button>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có chương nào
              </div>
            )}
          </section>

          {/* Related Manga */}
          {relatedManga.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Truyện cùng thể loại</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {relatedManga.map((m) => (
                  <MangaCard key={m.id} manga={m} showBadge="views" />
                ))}
              </div>
            </section>
          )}

          {/* Comments Section */}
          <CommentSection mangaId={id} />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="sticky top-24 space-y-4">
            {/* Truyện yêu thích */}
            <div className="border rounded-lg p-4">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Truyện yêu thích
              </h3>
              {isAuthenticated && user ? (
                favorites.length > 0 ? (
                  <div className="space-y-2">
                    {favorites.map((fav) => (
                      <Link
                        key={fav.mangaId}
                        href={`/truyen/${fav.mangaId}`}
                        className="flex items-center gap-2 group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium line-clamp-1 group-hover:text-primary transition-colors">
                            {fav.title}
                          </p>
                          {fav.latestChapter != null && (
                            <p className="text-[10px] text-muted-foreground">
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
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Chưa có truyện nào
                  </p>
                )
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  <Link href="/login" className="text-primary hover:underline">Đăng nhập</Link> để theo dõi truyện
                </p>
              )}
            </div>

            {/* Lịch sử đọc truyện */}
            <div className="border rounded-lg p-4">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Lịch sử đọc truyện
              </h3>
              {localHistory.length > 0 ? (
                <div className="space-y-2">
                  {localHistory.slice(0, 5).map((item) => (
                    <Link
                      key={`${item.mangaId}-${item.chapterId}`}
                      href={`/truyen/${item.mangaId}/chuong/${item.chapterId}`}
                      className="flex items-center gap-2 group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-1 group-hover:text-primary transition-colors">
                          {item.mangaTitle}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.chapterName || `Chương ${item.chapterNumber}`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Bạn chưa đọc truyện nào
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
