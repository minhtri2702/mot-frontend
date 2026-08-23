"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import MangaCard from "@/components/manga-card";
import { MangaGridSkeleton } from "@/components/manga-card-skeleton";
import { searchManga, getGenres } from "@/lib/api";
import type { MangaSummaryDTO, GenreDTO } from "@/lib/api";
import type { MangaCardData } from "@/lib/types";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MangaCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [genres, setGenres] = useState<GenreDTO[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("relevance");

  // Load genres for filter
  useEffect(() => {
    getGenres().then(setGenres).catch(() => {});
  }, []);

  // Search function
  const doSearch = useCallback(async (q: string, p: number) => {
    if (!q.trim()) {
      setResults([]);
      setTotalPages(0);
      setTotalElements(0);
      return;
    }

    setLoading(true);
    try {
      const data = await searchManga(q.trim(), p, 24);
      setResults(
        data.content.map((m: MangaSummaryDTO) => ({
          id: m.id,
          stt: m.stt,
          title: m.title,
          cover: m.coverImagePath,
          views: m.views,
          followers: m.followers,
          likes: m.likes,
          status: m.status,
          chapter: m.latestChapter,
          updatedAt: m.latestChapterUpdatedAt || undefined,
          author: m.author,
          genres: m.genres.map((name, id) => ({ id, name, slug: name.toLowerCase() })),
        }))
      );
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const visibleResults = results
    .filter((manga) => selectedGenre === "all" || manga.genres?.some((genre) => genre.slug === selectedGenre || genre.name.toLowerCase() === selectedGenre))
    .sort((a, b) => {
      if (sortBy === "views") return (b.views || 0) - (a.views || 0);
      if (sortBy === "newest") return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      if (sortBy === "oldest") return new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
      return 0;
    });

  // Search when query or page changes
  useEffect(() => {
    doSearch(query, page);
  }, [query, page, doSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setPage(0);
      router.push(`/tim-kiem?q=${encodeURIComponent(query)}`, { scroll: false });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Tìm kiếm truyện</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Nhập tên truyện, tác giả..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-11"
              autoFocus
            />
          </div>
          <Button type="submit" size="lg" className="h-11">
            Tìm kiếm
          </Button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Thể loại:</span>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {genres.map((g) => (
                  <SelectItem key={g.id} value={g.slug}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sắp xếp:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Mặc định" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Liên quan nhất</SelectItem>
                <SelectItem value="views">Lượt xem</SelectItem>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {query.trim() && !loading && (
        <p className="text-sm text-muted-foreground">
          Tìm thấy <strong>{totalElements}</strong> kết quả cho &ldquo;{query}&rdquo;
        </p>
      )}

      {/* Results Grid */}
      {loading ? (
        <MangaGridSkeleton count={12} />
      ) : visibleResults.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {visibleResults.map((manga) => (
              <MangaCard key={manga.id} manga={manga} showBadge="views" />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }}
                    className={page <= 0 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                  const start = Math.max(0, Math.min(page - 3, totalPages - 7));
                  const pageNum = start + i;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        isActive={page === pageNum}
                        onClick={(e) => { e.preventDefault(); handlePageChange(pageNum); }}
                      >
                        {pageNum + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }}
                    className={page >= totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : query.trim() ? (
        <div className="text-center py-20">
          <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Không tìm thấy kết quả</h2>
          <p className="text-muted-foreground">
            Không có truyện nào phù hợp với &ldquo;{query}&rdquo;
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả
          </p>
        </div>
      ) : (
        <div className="text-center py-20">
          <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Tìm kiếm truyện yêu thích</h2>
          <p className="text-muted-foreground">
            Nhập tên truyện hoặc tác giả vào ô tìm kiếm bên trên
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <MangaGridSkeleton count={12} />
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
