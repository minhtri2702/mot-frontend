"use client";

import { useState } from "react";
import MangaCard from "@/components/manga-card";
import { MangaGridSkeleton } from "@/components/manga-card-skeleton";
import { formatRelativeTime, getCompletedManga } from "@/lib/api";
import type { MangaSummaryDTO } from "@/lib/api";
import type { MangaCardData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 24;

function toCardData(manga: MangaSummaryDTO): MangaCardData {
  return {
    id: manga.id,
    stt: manga.stt,
    title: manga.title,
    cover: manga.coverImagePath,
    description: manga.description || "",
    author: manga.author || "",
    views: manga.views,
    followers: manga.followers,
    likes: manga.likes,
    chapter: manga.latestChapter,
    updatedAt: formatRelativeTime(manga.latestChapterUpdatedAt),
    status: manga.status,
  };
}

export default function CompletedMangaPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["completed-manga", page],
    queryFn: () => getCompletedManga(page, ITEMS_PER_PAGE),
    staleTime: 2 * 60 * 1000,
  });

  const mangaList = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="container py-8">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Truyện Hoàn Thành</h1>
          <p className="text-sm text-muted-foreground">
            Tổng hợp những bộ truyện đã hoàn thành
          </p>
        </div>
      </div>

      {isLoading ? (
        <MangaGridSkeleton />
      ) : mangaList.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Chưa có truyện nào</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {mangaList.map((manga: MangaSummaryDTO) => (
              <MangaCard key={manga.id} manga={toCardData(manga)} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(Math.max(0, page - 1))}
                    className={page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setPage(i)}
                      isActive={page === i}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    className={page >= totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
