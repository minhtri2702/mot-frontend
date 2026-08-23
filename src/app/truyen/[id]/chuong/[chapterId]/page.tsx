"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { ChevronLeft, ChevronRight, Sun, Moon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChapterReaderSkeleton } from "@/components/manga-card-skeleton";
import { getChapterDetail, getMangaDetail } from "@/lib/api";
import type { ChapterDetailDTO, MangaDetailDTO } from "@/lib/api";
import { saveReadingHistory } from "@/lib/reading-history";

type ReadingMode = "scroll" | "page";

// ============================================
// Custom hook: hide header on scroll down, show on scroll up
// Listens on window scroll
// ============================================
function useHideOnScroll(threshold = 10) {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY.current;

      if (Math.abs(diff) < threshold) return;

      if (diff > 0 && currentScrollY > 80) {
        setIsHidden(true);
      } else if (diff < 0) {
        setIsHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return { isHidden };
}

// ============================================
// Chapter Image Component - eagerly loads the opening pages, then defers the rest.
// ============================================
const ChapterImage = memo(function ChapterImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative w-full ${isLoaded ? "" : "aspect-[3/4]"}`}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-auto transition-opacity duration-200 ${isLoaded ? "opacity-100" : "absolute inset-0 opacity-0"}`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
});

export default function ChapterReaderPage() {
  const params = useParams();
  const id = params.id as string;
  const chapterId = params.chapterId as string;

  const [chapter, setChapter] = useState<ChapterDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingMode, setReadingMode] = useState<ReadingMode>("scroll");
  const [currentPage, setCurrentPage] = useState(0);
  const [readingBg, setReadingBg] = useState<"black" | "white" | "gray">("black");
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const progressRAFRef = useRef<number>();

  // Load saved reading position
  useEffect(() => {
    if (!chapter || loading) return;
    const savedKey = `reading-${id}-${chapterId}`;
    try {
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        const pos = parseInt(saved, 10);
        if (!isNaN(pos)) {
          requestAnimationFrame(() => {
            window.scrollTo({ top: pos, behavior: "instant" });
          });
        }
      }
    } catch {}
  }, [chapter, loading, id, chapterId]);

  // Save reading position on scroll (throttled with RAF)
  useEffect(() => {
    if (!chapter || loading) return;
    const savedKey = `reading-${id}-${chapterId}`;

    const handleScroll = () => {
      if (!contentRef.current) return;

      // Use requestAnimationFrame for smooth progress updates
      if (progressRAFRef.current) cancelAnimationFrame(progressRAFRef.current);
      progressRAFRef.current = requestAnimationFrame(() => {
        if (!contentRef.current) return;
        const scrollTop = window.scrollY;
        const scrollHeight = contentRef.current.scrollHeight - window.innerHeight;
        const pct = scrollHeight > 0 ? Math.min(100, Math.round((scrollTop / scrollHeight) * 100)) : 0;
        setProgress(pct);
      });

      // Throttle localStorage writes (500ms debounce)
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        localStorage.setItem(savedKey, window.scrollY.toString());
      }, 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (progressRAFRef.current) cancelAnimationFrame(progressRAFRef.current);
    };
  }, [chapter, loading, id, chapterId]);

  // Keyboard navigation
  useEffect(() => {
    if (!chapter || loading) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && chapter.navigation.prevChapterId) {
        e.preventDefault();
        window.location.href = `/truyen/${id}/chuong/${chapter.navigation.prevChapterId}`;
      } else if (e.key === "ArrowRight" && chapter.navigation.nextChapterId) {
        e.preventDefault();
        window.location.href = `/truyen/${id}/chuong/${chapter.navigation.nextChapterId}`;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        window.scrollBy({ top: -window.innerHeight * 0.8, behavior: "smooth" });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
      } else if (e.key === " " && readingMode === "scroll") {
        e.preventDefault();
        window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chapter, loading, id, readingMode]);

  // Fetch data + save reading history
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [chapterData, mangaData] = await Promise.all([
          getChapterDetail(id, parseInt(chapterId)),
          getMangaDetail(id),
        ]);
        setChapter(chapterData);

        // Auto-save reading history to localStorage (no login required)
        const chapterTitle = chapterData.chapterName || `Chương ${chapterData.chapterNumber}`;
        await saveReadingHistory({
          mangaId: chapterData.mangaId || id,
          mangaTitle: mangaData.title || chapterData.mangaTitle || id,
          coverImagePath: mangaData.coverImagePath || "",
          stt: mangaData.stt || 0,
          chapterId: chapterData.id,
          chapterNumber: chapterData.chapterNumber,
          chapterName: chapterTitle,
          lastReadDate: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Failed to load chapter:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, chapterId]);

  // In page mode, warm only the next page so navigation feels instant without
  // downloading the whole chapter up front.
  useEffect(() => {
    if (readingMode !== "page" || !chapter) return;
    const nextImageUrl = chapter.imageUrls[currentPage + 1];
    if (!nextImageUrl) return;

    const nextImage = new window.Image();
    nextImage.src = nextImageUrl;
  }, [chapter, currentPage, readingMode]);

  // Auto-hide header on scroll down (must be before early returns)
  const { isHidden: headerHidden } = useHideOnScroll();

  if (loading) {
    return <ChapterReaderSkeleton />;
  }

  if (!chapter) {
    return (
      <div className="container py-8">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Không tìm thấy chương.</p>
          <Link href={`/truyen/${id}`} className="text-primary hover:underline mt-4 inline-block">
            Quay lại trang truyện
          </Link>
        </div>
      </div>
    );
  }

  const bgClass = readingBg === "black" ? "bg-black" : readingBg === "white" ? "bg-white" : "bg-zinc-800";
  const chapterTitle = chapter.chapterName || `Chương ${chapter.chapterNumber}`;

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Top Navigation - auto hide on scroll down */}
      <div
        className={`sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b transition-transform duration-300 ${
          headerHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Link href={`/truyen/${id}`} className="hover:text-primary transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <Link href={`/truyen/${id}`} className="text-sm font-medium hover:text-primary transition-colors">
                {chapter.mangaTitle || id.slice(0, 8) + "..."}
              </Link>
              <p className="text-xs text-muted-foreground">{chapterTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReadingMode(readingMode === "scroll" ? "page" : "scroll")}
              title={readingMode === "scroll" ? "Chế độ lật trang" : "Chế độ cuộn"}
              className="hidden sm:inline-flex text-xs"
            >
              {readingMode === "scroll" ? "📄 Lật trang" : "📜 Cuộn"}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const modes: ("black" | "white" | "gray")[] = ["black", "white", "gray"];
                const idx = modes.indexOf(readingBg);
                setReadingBg(modes[(idx + 1) % modes.length]);
              }}
              title="Đổi màu nền"
            >
              {readingBg === "black" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {chapter.navigation.prevChapterId ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/truyen/${id}/chuong/${chapter.navigation.prevChapterId}`}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Trước
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Trước
              </Button>
            )}
            {chapter.navigation.nextChapterId ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/truyen/${id}/chuong/${chapter.navigation.nextChapterId}`}>
                  Sau
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Sau
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Reading Progress Bar */}
        <div className="h-0.5 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Chapter Content - scroll on window */}
      <div>
        <div ref={contentRef} className="max-w-4xl mx-auto px-4 sm:px-6 w-[90%]">
          {readingMode === "scroll" ? (
            chapter.imageUrls.length > 0 ? (
              chapter.imageUrls.map((imageUrl, index) => (
                <ChapterImage
                  key={index}
                  src={imageUrl}
                  alt={`${chapterTitle} - Trang ${index + 1}`}
                  priority={index < 2}
                />
              ))
            ) : (
              <div className="flex justify-center py-20">
                <p className="text-muted-foreground">Không có hình ảnh để hiển thị.</p>
              </div>
            )
          ) : (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
              {chapter.imageUrls.length > 0 ? (
                <>
                  <div className="relative w-full max-w-3xl">
                    <img
                      src={chapter.imageUrls[currentPage]}
                      alt={`${chapterTitle} - Trang ${currentPage + 1}`}
                      className="w-full h-auto rounded-lg shadow-lg"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Trang trước
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentPage + 1} / {chapter.imageUrls.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(chapter.imageUrls.length - 1, currentPage + 1))}
                      disabled={currentPage === chapter.imageUrls.length - 1}
                    >
                      Trang sau
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Không có hình ảnh để hiển thị.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation - auto hide on scroll down */}
      {readingMode === "scroll" && (
        <div className={`bg-background border-t transition-transform duration-300 ${
          headerHidden ? "translate-y-full" : "translate-y-0"
        }`}>
          <div className="container flex items-center justify-center gap-4 py-4">
            {chapter.navigation.prevChapterId ? (
              <Button variant="outline" asChild>
                <Link href={`/truyen/${id}/chuong/${chapter.navigation.prevChapterId}`}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Chương trước
                </Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Chương trước
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={`/truyen/${id}`}>
                Danh sách chương
              </Link>
            </Button>
            {chapter.navigation.nextChapterId ? (
              <Button variant="outline" asChild>
                <Link href={`/truyen/${id}/chuong/${chapter.navigation.nextChapterId}`}>
                  Chương sau
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>
                Chương sau
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
