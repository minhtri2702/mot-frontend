"use client";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Heart, Eye, BookOpen, Clock, Star, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import MangaCard from "@/components/manga-card";
import { MangaDetailSkeleton } from "@/components/manga-card-skeleton";
import type { MangaCardData } from "@/lib/types";

// Mock manga detail data
const mockMangaDetail = {
  id: "1",
  title: "One Piece",
  cover: "https://ext.same-assets.com/4185522578/4110211349.jpg",
  description: "One Piece là câu chuyện hải tặc được sáng tác bởi Oda Eiichiro, bắt đầu từ năm 1997. Câu chuyện kể về cuộc phiêu lưu của Monkey D. Luffy và băng hải tặc Mũ Rơm trên hành trình tìm kiếm kho báu One Piece để trở thành Vua Hải Tặc. Với hơn 1000 chương truyện, One Piece đã trở thành một trong những bộ manga nổi tiếng và bán chạy nhất mọi thời đại.",
  author: "Oda Eiichiro",
  status: "Đang tiến hành",
  views: 12500000,
  likes: 4.8,
  followers: 1500000,
  genres: [
    { id: 1, name: "Action", slug: "action" },
    { id: 2, name: "Adventure", slug: "adventure" },
    { id: 3, name: "Comedy", slug: "comedy" },
    { id: 4, name: "Fantasy", slug: "fantasy" },
    { id: 8, name: "Shounen", slug: "shounen" },
  ],
  chapters: [
    { id: "ch1", number: 1112, title: "Chương 1112", updatedAt: "2 giờ trước" },
    { id: "ch2", number: 1111, title: "Chương 1111", updatedAt: "1 tuần trước" },
    { id: "ch3", number: 1110, title: "Chương 1110", updatedAt: "2 tuần trước" },
    { id: "ch4", number: 1109, title: "Chương 1109", updatedAt: "3 tuần trước" },
    { id: "ch5", number: 1108, title: "Chương 1108", updatedAt: "1 tháng trước" },
    { id: "ch6", number: 1107, title: "Chương 1107", updatedAt: "1 tháng trước" },
    { id: "ch7", number: 1106, title: "Chương 1106", updatedAt: "1 tháng trước" },
    { id: "ch8", number: 1105, title: "Chương 1105", updatedAt: "2 tháng trước" },
    { id: "ch9", number: 1104, title: "Chương 1104", updatedAt: "2 tháng trước" },
    { id: "ch10", number: 1103, title: "Chương 1103", updatedAt: "2 tháng trước" },
  ],
};

// Mock related manga
const mockRelatedManga: MangaCardData[] = [
  { id: "2", stt: 2, title: "Jujutsu Kaisen", cover: "https://ext.same-assets.com/4185522578/2908889711.jpg", views: 8900000, followers: 980000, likes: 4.7 },
  { id: "3", stt: 3, title: "Chainsaw Man", cover: "https://ext.same-assets.com/4185522578/3267442566.jpg", views: 10500000, followers: 1200000, likes: 4.7 },
  { id: "4", stt: 4, title: "Spy x Family", cover: "https://ext.same-assets.com/4185522578/1173669990.jpg", views: 6800000, followers: 750000, likes: 4.5 },
  { id: "5", stt: 5, title: "Demon Slayer", cover: "https://ext.same-assets.com/4185522578/2551993677.jpg", views: 15000000, followers: 2000000, likes: 4.9 },
  { id: "6", stt: 6, title: "Attack on Titan", cover: "https://ext.same-assets.com/4185522578/2815673297.jpg", views: 18000000, followers: 2500000, likes: 4.9 },
];

export default function MangaDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [manga, setManga] = useState<typeof mockMangaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllChapters, setShowAllChapters] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setManga(mockMangaDetail);
      setLoading(false);
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
              src={manga.cover}
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
              <Link key={genre.id} href={`/the-loai/${genre.slug}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  {genre.name}
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
              <span>{manga.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{manga.followers.toLocaleString()}</span>
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
              <span className="text-green-500 font-medium">{manga.status}</span>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {manga.description}
          </p>

          <div className="flex gap-3 pt-2">
            <Button size="lg" asChild>
              <Link href={`/truyen/${manga.id}/chuong/${manga.chapters[0].id}`}>
                Đọc từ đầu
              </Link>
            </Button>
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
        <div className="border rounded-lg divide-y">
          {displayedChapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/truyen/${manga.id}/chuong/${chapter.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{chapter.title}</span>
              </div>
              <span className="text-sm text-muted-foreground">{chapter.updatedAt}</span>
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
      </section>

      {/* Related Manga */}
      <section>
        <h2 className="text-xl font-bold mb-4">Truyện cùng thể loại</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {mockRelatedManga.map((manga) => (
            <MangaCard key={manga.id} manga={manga} showBadge="views" />
          ))}
        </div>
      </section>
    </div>
  );
}
