"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { ChevronLeft, ChevronRight, Sun, Moon, Bookmark, BookmarkCheck, Maximize, Minimize, Rows3, PanelsTopLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChapterReaderSkeleton } from "@/components/manga-card-skeleton";
import { getChapterDetail, getMangaDetail } from "@/lib/api";
import type { ChapterDetailDTO, MangaDetailDTO } from "@/lib/api";
import { saveReadingHistory } from "@/lib/reading-history";

type ReadingMode = "scroll" | "page";

interface SavedReadingPosition {
  pageIndex: number;
  offset: number;
  scrollY: number;
  updatedAt: string;
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
          src={src}
          alt={alt}
          className={`h-auto w-full transition-opacity duration-200 ${isLoaded ? "opacity-100" : "absolute inset-0 opacity-0"}`}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onLoad={() => {
            setIsLoaded(true);
            onLoaded(index);
          }}
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <button
          type="button"
          className="absolute inset-0 grid w-full place-items-center bg-muted px-4 text-sm text-muted-foreground"
          onClick={() => { setFailed(false); setShouldLoad(true); }}
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
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const progressRAFRef = useRef<number>();
  const savedPositionRef = useRef<SavedReadingPosition | null>(null);
  const exactResumeDoneRef = useRef(false);
  const preloadedImagesRef = useRef(new Set<string>());

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
    preloadAround(index);
    const saved = savedPositionRef.current;
    if (saved && saved.pageIndex === index && !exactResumeDoneRef.current) {
      exactResumeDoneRef.current = true;
      requestAnimationFrame(() => restorePosition(saved));
    }
  }, [preloadAround, restorePosition]);

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
        <div ref={contentRef} className="mx-auto w-full max-w-4xl sm:px-4">
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
        </div>
      )}
    </div>
  );
}
