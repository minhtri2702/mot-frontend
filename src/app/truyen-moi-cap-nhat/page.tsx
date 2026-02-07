"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import MangaCard from "@/components/manga-card";

interface BackendData {
  iorder: number;
  seriName?: string;
  url_seri_avatar?: string;
  last_chapter?: number;
  updated_at?: string;
}

interface FrontendData {
  id: number;
  title: string;
  cover: string;
  chapter: number;
  updatedAt: string;
}

function calculateTimeAgo(updatedAt?: string): string {
  if (!updatedAt) return "Chưa cập nhật";

  const updatedDate = new Date(updatedAt);
  const now = new Date("2025-05-08"); // Ngày hiện tại
  const diffMs = now.getTime() - updatedDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} phút trước`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  }
}

function mapBackendToFrontend(backendData: BackendData): FrontendData {
  return {
    id: backendData.iorder,
    title: backendData.seriName || "Untitled",
    cover: backendData.url_seri_avatar
      ? `https://motdataimage.s3.ap-southeast-2.amazonaws.com/downloaded_images/${backendData.url_seri_avatar.split("../downloaded_images/")[1] || backendData.url_seri_avatar}`
      : "",
    chapter: backendData.last_chapter || 0,
    updatedAt: calculateTimeAgo(backendData.updated_at),
  };
}

export default function Home() {
  // Đọc giá trị p từ URL khi trang tải
  const getInitialPage = () => {
    if (typeof window === "undefined") return 1; // Tránh lỗi phía server
    const urlParams = new URLSearchParams(window.location.search);
    const pageFromUrl = parseInt(urlParams.get("p") || "1", 10);
    return pageFromUrl > 0 ? pageFromUrl : 1; // Đảm bảo page không nhỏ hơn 1
  };

  const [latestUpdates, setLatestUpdates] = useState<FrontendData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(getInitialPage());
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Đồng bộ currentPage với URL khi người dùng thay đổi URL hoặc nhấn Back/Forward
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const pageFromUrl = parseInt(params.get("p") || "1", 10);
      setCurrentPage(pageFromUrl > 0 ? pageFromUrl : 1);
      console.log(`Popstate: Navigated to page ${pageFromUrl}`); // Debug
    };

    window.addEventListener("popstate", handlePopState);

    // Đồng bộ ngay khi trang tải
    handlePopState();

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Gọi API để lấy dữ liệu
  useEffect(() => {
    async function fetchLatestUpdates() {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:9090/api/v1/moi-cap-nhat?page=${currentPage - 1}`);
        if (!response.ok) {
          throw new Error("Failed to fetch latest updates");
        }
        const data = await response.json();
        console.log("API Response:", data);
        if (!data.data?.content || !Array.isArray(data.data.content)) {
          throw new Error("Invalid data format from API");
        }
        const mappedData = data.data.content.map(mapBackendToFrontend);
        console.log("Mapped Data:", mappedData);
        setLatestUpdates(mappedData);
        setTotalPages(data.data.totalPages || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchLatestUpdates();
  }, [currentPage]);

  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.history.pushState({}, "", `?p=${page}`);
    console.log(`Navigated to page: ${page}, URL updated to: ?p=${page}`);
  };

  return (
    <div className="container py-8 space-y-10">
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Mới Cập Nhật</h2>
          <Link href="/latest-updates" className="text-blue-500 hover:underline">
            Xem tất cả
          </Link>
        </div>
        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className="text-red-500">Lỗi: {error}</p>
        ) : (
          <div>
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {latestUpdates.length > 0 ? (
                latestUpdates.map((manga) => (
                  <MangaCard
                    key={manga.id}
                    manga={manga}
                    showBadge="time"
                  />
                ))
              ) : (
                <p>Không có dữ liệu để hiển thị.</p>
              )}
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={`?p=${currentPage > 1 ? currentPage - 1 : 1}`}
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {pageNumbers.map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href={`?p=${page}`}
                      isActive={currentPage === page}
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href={`?p=${currentPage < totalPages ? currentPage + 1 : totalPages}`}
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>
    </div>
  );
}