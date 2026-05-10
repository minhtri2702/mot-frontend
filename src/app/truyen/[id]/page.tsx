"use client";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Heart, Eye, BookOpen, Clock, Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MangaCard from "@/components/manga-card";
import { MangaDetailSkeleton } from "@/components/manga-card-skeleton";
import { getMangaDetail, getRelatedManga, formatNumber, formatRelativeTime, getCoverImageUrl } from "@/lib/api";
import type { MangaDetailDTO, MangaSummaryDTO } from "@/lib/api";
import type { MangaCardData } from "@/lib/types";

export default function MangaDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [manga, setManga] = useState<MangaDetailDTO | null>(null);
  const [relatedManga, setRelatedManga] = useState<MangaCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllChapters, setShowAllChapters] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [detail, related] = await Promise.all([
          getMangaDetail(id),
          getRelatedManga(id, 0, 12),
        ]);
        setManga(detail);
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
      } catch (error) {
        console.error("Failed to load manga detail:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

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

  const displayedChapters = showAllChapters ? manga.chapters : manga.chapters.slice(0, 5);

  return (
    <div className="container py-8 space-y-8">
      {/* Manga Detail Header */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Cover Image */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-lg relative">
            <Image
              src={getCoverImageUrl(manga.coverImagePath)}
              alt={manga.title}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              style={{ objectFit: "cover" }}
              priority
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

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
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

          <div className="flex items-center gap-4 text-sm">
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

          <div className="flex gap-3 pt-2">
            {manga.chapters.length > 0 && (
              <Button size="lg" asChild>
                <Link href={`/truyen/${manga.id}/chuong/${manga.chapters[0].id}`}>
                  Đọc từ đầu
                </Link>
              </Button>
            )}
            <Button size="lg" variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              Theo dõi
            </Button>
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <section>
        <h2 className="text-xl font-bold mb-4">Danh sách chương</h2>
        {manga.chapters.length > 0 ? (
          <>
            <div className="border rounded-lg divide-y">
              {displayedChapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/truyen/${manga.id}/chuong/${chapter.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {chapter.chapterName || `Chương ${chapter.chapterNumber}`}
                    </span>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {relatedManga.map((m) => (
              <MangaCard key={m.id} manga={m} showBadge="views" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
