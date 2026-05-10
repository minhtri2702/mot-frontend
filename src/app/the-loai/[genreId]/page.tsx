"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ChevronLeft, Tag } from "lucide-react";
import MangaCard from "@/components/manga-card";
import { MangaGridSkeleton } from "@/components/manga-card-skeleton";
import { getMangaByGenre, getGenres } from "@/lib/api";
import type { MangaSummaryDTO, GenreDTO } from "@/lib/api";
import type { MangaCardData } from "@/lib/types";

// Bản đồ màu sắc theo slug
const genreColors: Record<string, string> = {
  action: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-800",
  adventure: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800",
  comedy: "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-800",
  drama: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800",
  fantasy: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800",
  romance: "bg-pink-500/10 text-pink-600 border-pink-200 dark:border-pink-800",
};

export default function GenrePage() {
  const params = useParams();
  const genreSlug = params.genreId as string;

  const [genre, setGenre] = useState<GenreDTO | null>(null);
  const [mangaList, setMangaList] = useState<MangaCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch genres to find the current one
        const genres = await getGenres();
        const found = genres.find(g => g.slug === genreSlug);
        setGenre(found || { id: 0, name: genreSlug, slug: genreSlug });

        // Fetch manga by genre
        if (found) {
          const data = await getMangaByGenre(found.id, page, 12);
          setMangaList(
            data.content.map((m: MangaSummaryDTO) => ({
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
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
        }
      } catch (error) {
        console.error("Failed to load genre data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [genreSlug, page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <div className="h-9 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-5 w-96 bg-muted rounded animate-pulse" />
        </div>
        <MangaGridSkeleton count={12} />
      </div>
    );
  }

  const genreName = genre?.name || genreSlug.charAt(0).toUpperCase() + genreSlug.slice(1);
  const colorClass = genreColors[genreSlug] || "bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800";

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/the-loai">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Thể loại
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <div className={`py-1 px-3 rounded-full ${colorClass}`}>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>{genreName}</span>
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Thể Loại: {genreName}</h1>
        <p className="text-muted-foreground">
          Tìm thấy {totalElements} truyện thuộc thể loại {genreName.toLowerCase()}
        </p>
      </div>

      {/* Manga Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 mb-8 grid-fade-in">
        {mangaList.length > 0 ? (
          mangaList.map((manga) => (
            <MangaCard key={manga.id} manga={manga} showBadge="rating" />
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <p className="text-muted-foreground">Không có truyện nào trong thể loại này.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i}
                  onClick={(e) => { e.preventDefault(); handlePageChange(i); }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
