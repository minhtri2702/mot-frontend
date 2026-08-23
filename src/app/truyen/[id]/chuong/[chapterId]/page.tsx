"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { ChevronLeft, ChevronRight, Sun, Moon, Bookmark, BookmarkCheck, Maximize, Minimize, Rows3, PanelsTopLeft, Scaling, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChapterReaderSkeleton } from "@/components/manga-card-skeleton";
import { getChapterDetail, getMangaDetail } from "@/lib/api";
import type { ChapterDetailDTO, MangaDetailDTO } from "@/lib/api";
import { saveReadingHistory } from "@/lib/reading-history";

type ReadingMode = "scroll" | "page";
type ReaderWidth = "compact" | "comfortable" | "full";

interface SavedReadingPosition {
  pageIndex: number;
  offset: number;
  scrollY: number;
  updatedAt: string;
}

function withRetryToken(src: string, retryCount: number) {
  if (retryCount === 0) return src;
  return `${src}${src.includes("?") ? "&" : "?"}retry=${retryCount}`;
}

function reportImageError(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify({ ...payload, occurredAt: new Date().toISOString() });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/image-errors", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/image-errors", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    }
  } catch {}
}

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
  index,
  onNearViewport,
  onLoaded,
}: {
  src: string;
  alt: string;
  priority: boolean;
  index: number;
  onNearViewport: (index: number) => void;
  onLoaded: (index: number) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [failed, setFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || !wrapperRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true);
        onNearViewport(index);
        observer.disconnect();
      }
    }, { rootMargin: "1400px 0px" });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [index, onNearViewport, priority]);

  return (
    <div ref={wrapperRef} data-page-index={index} className={`relative w-full ${isLoaded ? "" : "aspect-[3/4]"}`}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />
      )}
      {shouldLoad && !failed && (
        <img
          src={withRetryToken(src, retryCount)}
          alt={alt}
          className={`h-auto w-full transition-opacity duration-200 ${isLoaded ? "opacity-100" : "absolute inset-0 opacity-0"}`}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onLoad={() => {
            setIsLoaded(true);
            onLoaded(index);
          }}
          onError={() => {
            setFailed(true);
            reportImageError({ src, pageIndex: index, retryCount, mode: "scroll", page: window.location.pathname });
          }}
        />
      )}
      {failed && (
        <button
          type="button"
          className="absolute inset-0 grid w-full place-items-center bg-muted px-4 text-sm text-muted-foreground"
          onClick={() => { setRetryCount((value) => value + 1); setFailed(false); setShouldLoad(true); }}
        >
          Ảnh tải lỗi, nhấn để thử lại
        </button>
      )}
    </div>
  );
});

export default function ChapterReaderPage() {
  const params = useParams();
  const id = params.id as string;
  const chapterId = params.chapterId as string;

  const [chapter, setChapter] = useState<ChapterDetailDTO | null>(null);
  const [manga, setManga] = useState<MangaDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingMode, setReadingMode] = useState<ReadingMode>("scroll");
  const [currentPage, setCurrentPage] = useState(0);
  const [visiblePage, setVisiblePage] = useState(0);
  const [readingBg, setReadingBg] = useState<"black" | "white" | "gray">("black");
  const [progress, setProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readerWidth, setReaderWidth] = useState<ReaderWidth>("comfortable");
  const [loadedPages, setLoadedPages] = useState(() => new Set<number>());
  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null);
  const [autoNextCancelled, setAutoNextCancelled] = useState(false);
  const [pageImageFailed, setPageImageFailed] = useState(false);
  const [pageImageRetry, setPageImageRetry] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const progressRAFRef = useRef<number>();
  const savedPositionRef = useRef<SavedReadingPosition | null>(null);
  const exactResumeDoneRef = useRef(false);
  const preloadedImagesRef = useRef(new Set<string>());
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const readerEndRef = useRef<HTMLDivElement>(null);

  const positionKey = `reading-position-${id}-${chapterId}`;
  const bookmarkKey = `reading-bookmark-${id}-${chapterId}`;

  const getCurrentPosition = useCallback((): SavedReadingPosition => {
    const anchorY = window.innerHeight * 0.28;
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-page-index]"));
    let active = elements[0];
    for (const element of elements) {
      if (element.getBoundingClientRect().top <= anchorY) active = element;
      else break;
    }
    const rect = active?.getBoundingClientRect();
    const pageIndex = active ? Number(active.dataset.pageIndex || 0) : 0;
    const offset = rect && rect.height > 0 ? Math.min(1, Math.max(0, (anchorY - rect.top) / rect.height)) : 0;
    return { pageIndex, offset, scrollY: window.scrollY, updatedAt: new Date().toISOString() };
  }, []);

  const restorePosition = useCallback((position: SavedReadingPosition, smooth = false) => {
    const target = document.querySelector<HTMLElement>(`[data-page-index="${position.pageIndex}"]`);
    if (!target) return;
    const top = window.scrollY + target.getBoundingClientRect().top + target.offsetHeight * position.offset - window.innerHeight * 0.28;
    window.scrollTo({ top: Math.max(0, top), behavior: smooth ? "smooth" : "instant" });
  }, []);

  const preloadAround = useCallback((index: number) => {
    if (!chapter) return;
    chapter.imageUrls.slice(index + 1, index + 3).forEach((url) => {
      if (preloadedImagesRef.current.has(url)) return;
      preloadedImagesRef.current.add(url);
      const image = new window.Image();
      image.decoding = "async";
      image.src = url;
    });
  }, [chapter]);

  const handleImageLoaded = useCallback((index: number) => {
    setLoadedPages((current) => {
      if (current.has(index)) return current;
      const next = new Set(current);
      next.add(index);
      return next;
    });
    preloadAround(index);
    const saved = savedPositionRef.current;
    if (saved && saved.pageIndex === index && !exactResumeDoneRef.current) {
      exactResumeDoneRef.current = true;
      requestAnimationFrame(() => restorePosition(saved));
    }
  }, [preloadAround, restorePosition]);

  const cycleReaderWidth = useCallback(() => {
    setReaderWidth((current) => current === "compact" ? "comfortable" : current === "comfortable" ? "full" : "compact");
  }, []);

  const toggleBookmark = useCallback(() => {
    try {
      if (isBookmarked) {
        localStorage.removeItem(bookmarkKey);
        setIsBookmarked(false);
      } else {
        const position = readingMode === "page"
          ? { pageIndex: currentPage, offset: 0, scrollY: 0, updatedAt: new Date().toISOString() }
          : getCurrentPosition();
        localStorage.setItem(bookmarkKey, JSON.stringify(position));
        setIsBookmarked(true);
      }
    } catch {}
  }, [bookmarkKey, currentPage, getCurrentPosition, isBookmarked, readingMode]);

  const cycleReadingBackground = useCallback(() => {
    const modes: ("black" | "white" | "gray")[] = ["black", "gray", "white"];
    setReadingBg((current) => modes[(modes.indexOf(current) + 1) % modes.length]);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("mot-reader-background", readingBg); } catch {}
  }, [readingBg]);

  useEffect(() => {
    try {
      localStorage.setItem("mot-reader-mode", readingMode);
      localStorage.setItem("mot-reader-width", readerWidth);
    } catch {}
  }, [readerWidth, readingMode]);

  useEffect(() => {
    const handleFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => document.removeEventListener("fullscreenchange", handleFullscreen);
  }, []);

  // Load saved reading position
  useEffect(() => {
    if (!chapter || loading) return;
    try {
      const saved = localStorage.getItem(positionKey);
      if (saved) {
        const position = JSON.parse(saved) as SavedReadingPosition;
        savedPositionRef.current = position;
        setVisiblePage(position.pageIndex);
        setCurrentPage(position.pageIndex);
        requestAnimationFrame(() => restorePosition(position));
      }
      setIsBookmarked(localStorage.getItem(bookmarkKey) != null);
      const savedBg = localStorage.getItem("mot-reader-background");
      if (savedBg === "black" || savedBg === "white" || savedBg === "gray") setReadingBg(savedBg);
      const savedMode = localStorage.getItem("mot-reader-mode");
      if (savedMode === "scroll" || savedMode === "page") setReadingMode(savedMode);
      const savedWidth = localStorage.getItem("mot-reader-width");
      if (savedWidth === "compact" || savedWidth === "comfortable" || savedWidth === "full") setReaderWidth(savedWidth);
    } catch {}
  }, [bookmarkKey, chapter, loading, positionKey, restorePosition]);

  // Save reading position on scroll (throttled with RAF)
  useEffect(() => {
    if (!chapter || loading || readingMode !== "scroll") return;
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
        setVisiblePage(getCurrentPosition().pageIndex);
      });

      // Throttle localStorage writes (500ms debounce)
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        localStorage.setItem(positionKey, JSON.stringify(getCurrentPosition()));
      }, 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (progressRAFRef.current) cancelAnimationFrame(progressRAFRef.current);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      try { localStorage.setItem(positionKey, JSON.stringify(getCurrentPosition())); } catch {}
    };
  }, [chapter, getCurrentPosition, loading, positionKey, readingMode]);

  // Keyboard navigation
  useEffect(() => {
    if (!chapter || loading) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (readingMode === "page" && e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentPage((page) => Math.max(0, page - 1));
      } else if (readingMode === "page" && e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentPage((page) => Math.min(chapter.imageUrls.length - 1, page + 1));
      } else if (e.key === "ArrowLeft" && chapter.navigation.prevChapterId) {
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

  useEffect(() => {
    if (!chapter) return;
    setCurrentPage((page) => Math.min(Math.max(0, page), Math.max(0, chapter.imageUrls.length - 1)));
  }, [chapter]);

  useEffect(() => {
    setPageImageFailed(false);
    setPageImageRetry(0);
  }, [currentPage]);

  useEffect(() => {
    if (readingMode !== "page" || !chapter) return;
    setVisiblePage(currentPage);
    setProgress(chapter.imageUrls.length > 1 ? Math.round((currentPage / (chapter.imageUrls.length - 1)) * 100) : 100);
    try {
      localStorage.setItem(positionKey, JSON.stringify({
        pageIndex: currentPage,
        offset: 0,
        scrollY: 0,
        updatedAt: new Date().toISOString(),
      } satisfies SavedReadingPosition));
    } catch {}
  }, [chapter, currentPage, positionKey, readingMode]);

  useEffect(() => {
    setLoadedPages(new Set());
    setAutoNextCountdown(null);
    setAutoNextCancelled(false);
    setPageImageFailed(false);
    setPageImageRetry(0);
  }, [chapterId]);

  useEffect(() => {
    if (!chapter?.navigation.nextChapterId || autoNextCancelled) return;

    if (readingMode === "page") {
      if (currentPage === chapter.imageUrls.length - 1) {
        setAutoNextCountdown((value) => value ?? 8);
      }
      return;
    }

    const target = readerEndRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setAutoNextCountdown((value) => value ?? 8);
    }, { rootMargin: "0px 0px 160px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [autoNextCancelled, chapter, currentPage, readingMode]);

  useEffect(() => {
    if (autoNextCountdown == null || !chapter?.navigation.nextChapterId) return;
    if (autoNextCountdown <= 0) {
      window.location.href = `/truyen/${id}/chuong/${chapter.navigation.nextChapterId}`;
      return;
    }
    const timer = window.setTimeout(() => setAutoNextCountdown((value) => value == null ? null : value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [autoNextCountdown, chapter, id]);

  // Fetch data + save reading history
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Chapter payload is critical for first render; manga metadata is not.
        // Avoid holding the first image behind the slower detail request.
        const chapterData = await getChapterDetail(id, parseInt(chapterId));
        setChapter(chapterData);
        setLoading(false);

        void getMangaDetail(id).then((mangaData) => {
          setManga(mangaData);
          const chapterTitle = chapterData.chapterName || `Chương ${chapterData.chapterNumber}`;
          return saveReadingHistory({
            mangaId: chapterData.mangaId || id,
            mangaTitle: mangaData.title || chapterData.mangaTitle || id,
            coverImagePath: mangaData.coverImagePath || "",
            stt: mangaData.stt || 0,
            chapterId: chapterData.id,
            chapterNumber: chapterData.chapterNumber,
            chapterName: chapterTitle,
            lastReadDate: new Date().toISOString(),
          });
        }).catch((error) => console.error("Failed to load manga metadata:", error));
      } catch (error) {
        console.error("Failed to load chapter:", error);
        setLoading(false);
      }
    }
    fetchData();
  }, [id, chapterId]);

  // Warm the image origin and opening page as soon as chapter metadata arrives.
  useEffect(() => {
    const firstImage = chapter?.imageUrls[0];
    if (!firstImage) return;
    const links: HTMLLinkElement[] = [];
    try {
      const origin = new URL(firstImage).origin;
      const preconnect = document.createElement("link");
      preconnect.rel = "preconnect";
      preconnect.href = origin;
      preconnect.crossOrigin = "anonymous";
      document.head.appendChild(preconnect);
      links.push(preconnect);
    } catch {}
    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "image";
    preload.href = firstImage;
    document.head.appendChild(preload);
    links.push(preload);
    preloadAround(0);
    return () => links.forEach((link) => link.remove());
  }, [chapter, preloadAround]);

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

  const bgClass = readingBg === "black" ? "bg-[#11110f]" : readingBg === "white" ? "bg-[#f5f2eb]" : "bg-[#272624]";
  const chapterTitle = chapter.chapterName || `Chương ${chapter.chapterNumber}`;
  const readerWidthClass = readerWidth === "compact" ? "max-w-2xl" : readerWidth === "comfortable" ? "max-w-4xl" : "max-w-[1200px]";

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (readingMode !== "page" || !touchStartRef.current) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
    setCurrentPage((page) => dx < 0 ? Math.min(chapter.imageUrls.length - 1, page + 1) : Math.max(0, page - 1));
  };

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Top Navigation - auto hide on scroll down */}
      <div
        className={`sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b transition-transform duration-300 ${
          headerHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="container flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={`/truyen/${id}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors hover:bg-muted hover:text-primary" aria-label="Quay lại trang truyện">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <Link href={`/truyen/${id}`} className="block max-w-[46vw] truncate text-sm font-medium transition-colors hover:text-primary sm:max-w-xs">
                {chapter.mangaTitle || id.slice(0, 8) + "..."}
              </Link>
              <p className="truncate text-xs text-muted-foreground">{chapterTitle} · Trang {visiblePage + 1}/{chapter.imageUrls.length}</p>
            </div>
          </div>

          {manga?.chapters && manga.chapters.length > 0 && (
            <select
              value={chapter.id}
              onChange={(event) => { window.location.href = `/truyen/${id}/chuong/${event.target.value}`; }}
              aria-label="Chọn chương"
              className="hidden h-10 max-w-44 rounded-xl border border-border bg-muted px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring md:block"
            >
              {manga.chapters.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.chapterName || `Chương ${item.chapterNumber}`}
                </option>
              ))}
            </select>
          )}

          <div className="hidden items-center gap-1 sm:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setReadingMode(readingMode === "scroll" ? "page" : "scroll")}
              title={readingMode === "scroll" ? "Chế độ lật trang" : "Chế độ cuộn"}
            >
              {readingMode === "scroll" ? <PanelsTopLeft className="h-4 w-4" /> : <Rows3 className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={cycleReaderWidth} title="Đổi chiều rộng trang">
              <Scaling className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={cycleReadingBackground}
              title="Đổi màu nền"
            >
              {readingBg === "black" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={toggleBookmark} title={isBookmarked ? "Bỏ đánh dấu" : "Đánh dấu vị trí này"}>
              {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={toggleFullscreen} title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>

            {chapter.navigation.prevChapterId ? (
              <Button variant="outline" size="icon" asChild title="Chương trước">
                <Link href={`/truyen/${id}/chuong/${chapter.navigation.prevChapterId}`}>
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="icon" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {chapter.navigation.nextChapterId ? (
              <Button variant="outline" size="icon" asChild title="Chương sau">
                <Link href={`/truyen/${id}/chuong/${chapter.navigation.nextChapterId}`}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="icon" disabled>
                <ChevronRight className="h-4 w-4" />
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
      <div className="pb-20 sm:pb-0">
        <div ref={contentRef} className={`mx-auto w-full ${readerWidthClass} sm:px-4`}>
          {readingMode === "scroll" ? (
            chapter.imageUrls.length > 0 ? (
              chapter.imageUrls.map((imageUrl, index) => (
                <ChapterImage
                  key={index}
                  src={imageUrl}
                  alt={`${chapterTitle} - Trang ${index + 1}`}
                  priority={index < 2}
                  index={index}
                  onNearViewport={preloadAround}
                  onLoaded={handleImageLoaded}
                />
              ))
            ) : (
              <div className="mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center px-5 py-16 text-center">
                <p className="text-lg font-semibold text-foreground">Chương này chưa có ảnh</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Dữ liệu ảnh đang được cập nhật. Bạn có thể chuyển sang chương khác hoặc quay lại danh sách chương.
                </p>
                {manga?.chapters && manga.chapters.length > 0 && (
                  <select
                    value={chapter.id}
                    onChange={(event) => { window.location.href = `/truyen/${id}/chuong/${event.target.value}`; }}
                    aria-label="Chọn chương khác"
                    className="mt-5 h-11 w-full rounded-xl border border-border bg-muted px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  >
                    {manga.chapters.map((item) => (
                      <option key={item.id} value={item.id}>{item.chapterName || `Chương ${item.chapterNumber}`}</option>
                    ))}
                  </select>
                )}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button variant="outline" asChild><Link href={`/truyen/${id}`}>Danh sách chương</Link></Button>
                  {chapter.navigation.nextChapterId && (
                    <Button asChild><Link href={`/truyen/${id}/chuong/${chapter.navigation.nextChapterId}`}>Chương sau <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              {chapter.imageUrls.length > 0 ? (
                <>
                  <div className="relative w-full max-w-3xl">
                    {!pageImageFailed ? <img
                      key={`${currentPage}-${pageImageRetry}`}
                      src={withRetryToken(chapter.imageUrls[currentPage], pageImageRetry)}
                      alt={`${chapterTitle} - Trang ${currentPage + 1}`}
                      className="w-full h-auto rounded-lg shadow-lg"
                      loading="eager"
                      decoding="async"
                      onLoad={() => setPageImageFailed(false)}
                      onError={() => {
                        setPageImageFailed(true);
                        reportImageError({ src: chapter.imageUrls[currentPage], pageIndex: currentPage, retryCount: pageImageRetry, mode: "page", page: window.location.pathname });
                      }}
                    /> : (
                      <button
                        type="button"
                        className="grid min-h-[55vh] w-full place-items-center rounded-xl bg-muted px-5 text-sm font-medium text-muted-foreground"
                        onClick={() => { setPageImageRetry((value) => value + 1); setPageImageFailed(false); }}
                      >
                        Ảnh tải lỗi, nhấn để thử lại
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
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
                      onClick={() => setCurrentPage((page) => Math.min(chapter.imageUrls.length - 1, page + 1))}
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

      <div ref={readerEndRef} className="h-px" aria-hidden="true" />

      {chapter.imageUrls.length > 0 && (
        <div className="fixed bottom-4 left-4 z-40 hidden rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur sm:block">
          Đã tải {loadedPages.size}/{chapter.imageUrls.length} trang
        </div>
      )}

      {readingMode === "page" && autoNextCountdown != null && (
        <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-background/95 px-4 py-2.5 text-sm text-muted-foreground shadow-xl">
          <span>Chuyển chương sau trong {autoNextCountdown}s</span>
          <Button variant="ghost" size="sm" onClick={() => { setAutoNextCountdown(null); setAutoNextCancelled(true); }}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Hủy
          </Button>
        </div>
      )}

      {/* Mobile reader controls stay reachable with one thumb. */}
      <div className={`fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-border bg-background/95 p-1.5 shadow-2xl backdrop-blur transition-transform duration-300 sm:hidden ${headerHidden ? "translate-y-24" : "translate-y-0"}`}>
        <div className="grid grid-cols-6 gap-1">
          {chapter.navigation.prevChapterId ? (
            <Button variant="ghost" size="icon" asChild aria-label="Chương trước">
              <Link href={`/truyen/${id}/chuong/${chapter.navigation.prevChapterId}`}><ChevronLeft className="h-4 w-4" /></Link>
            </Button>
          ) : <Button variant="ghost" size="icon" disabled><ChevronLeft className="h-4 w-4" /></Button>}
          <Button variant="ghost" size="icon" onClick={() => setReadingMode(readingMode === "scroll" ? "page" : "scroll")} aria-label="Đổi chế độ đọc">
            {readingMode === "scroll" ? <PanelsTopLeft className="h-4 w-4" /> : <Rows3 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleBookmark} aria-label={isBookmarked ? "Bỏ đánh dấu" : "Đánh dấu vị trí"}>
            {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={cycleReadingBackground} aria-label="Đổi màu nền">
            {readingBg === "black" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          {chapter.navigation.nextChapterId ? (
            <Button variant="ghost" size="icon" asChild aria-label="Chương sau">
              <Link href={`/truyen/${id}/chuong/${chapter.navigation.nextChapterId}`}><ChevronRight className="h-4 w-4" /></Link>
            </Button>
          ) : <Button variant="ghost" size="icon" disabled><ChevronRight className="h-4 w-4" /></Button>}
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
          {chapter.navigation.nextChapterId && (
            <div className="container flex justify-center pb-5">
              {autoNextCountdown == null ? (
                <Button variant="ghost" size="sm" onClick={() => { setAutoNextCancelled(false); setAutoNextCountdown(8); }}>
                  {autoNextCancelled ? "Bật lại tự chuyển chương" : "Tự chuyển khi đọc đến cuối"}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  Chuyển chương sau trong {autoNextCountdown}s
                  <Button variant="ghost" size="sm" onClick={() => { setAutoNextCountdown(null); setAutoNextCancelled(true); }}>
                    <RotateCcw className="mr-1 h-3.5 w-3.5" /> Hủy
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
