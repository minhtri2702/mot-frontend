"use client";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChapterReaderSkeleton } from "@/components/manga-card-skeleton";

// Mock chapter images
const mockChapterImages = [
  "https://ext.same-assets.com/4185522578/4110211349.jpg",
  "https://ext.same-assets.com/4185522578/2908889711.jpg",
  "https://ext.same-assets.com/4185522578/3267442566.jpg",
  "https://ext.same-assets.com/4185522578/1173669990.jpg",
  "https://ext.same-assets.com/4185522578/2551993677.jpg",
  "https://ext.same-assets.com/4185522578/2815673297.jpg",
  "https://ext.same-assets.com/4185522578/1945673209.jpg",
  "https://ext.same-assets.com/4185522578/3081776352.jpg",
  "https://ext.same-assets.com/4185522578/1481122338.jpg",
  "https://ext.same-assets.com/4185522578/2184428774.jpg",
];

// Mock chapter info
const mockChapterInfo = {
  mangaId: "1",
  mangaTitle: "One Piece",
  chapterId: "ch1",
  chapterNumber: 1112,
  chapterTitle: "Chương 1112",
  prevChapterId: null,
  nextChapterId: "ch2",
};

type ReadingMode = "scroll" | "page";

// ============================================
// Lazy Image Component with IntersectionObserver
// ============================================
const LazyChapterImage = memo(function LazyChapterImage({
  src,
  alt,
  index,
}: {
  src: string;
  alt: string;
  index: number;
}) {
  const imgRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    // Preload first 3 images immediately
    if (index < 3) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={imgRef}
      className="w-full"
      style={{ minHeight: isVisible ? "auto" : "300px" }}
    >
      {isVisible && (
        <div
          className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        >
          <Image
            src={src}
            alt={alt}
            width={800}
            height={1200}
            className="w-full h-auto"
            priority={index < 2}
            loading={index < 3 ? undefined : "lazy"}
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      )}
    </div>
  );
});

export default function ChapterReaderPage() {
  const params = useParams();
  const id = params.id as string;
  const chapterId = params.chapterId as string;

  const [images, setImages] = useState<string[]>([]);
  const [chapterInfo, setChapterInfo] = useState<typeof mockChapterInfo | null>(null);
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
    if (!chapterInfo || loading) return;
    const savedKey = `reading-${id}-${chapterId}`;
    try {
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        const pos = parseInt(saved, 10);
        if (!isNaN(pos) && scrollRef.current) {
          requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ top: pos, behavior: "instant" });
          });
        }
      }
    } catch {}
  }, [chapterInfo, loading, id, chapterId]);

  // Save reading position on scroll (throttled with RAF)
  useEffect(() => {
    if (!chapterInfo || loading) return;
    const savedKey = `reading-${id}-${chapterId}`;

    const handleScroll = () => {
      if (!scrollRef.current || !contentRef.current) return;

      // Use requestAnimationFrame for smooth progress updates
      if (progressRAFRef.current) cancelAnimationFrame(progressRAFRef.current);
      progressRAFRef.current = requestAnimationFrame(() => {
        if (!scrollRef.current || !contentRef.current) return;
        const scrollTop = scrollRef.current.scrollTop;
        const scrollHeight = contentRef.current.scrollHeight - scrollRef.current.clientHeight;
        const pct = scrollHeight > 0 ? Math.min(100, Math.round((scrollTop / scrollHeight) * 100)) : 0;
        setProgress(pct);
      });

      // Throttle localStorage writes (500ms debounce)
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        localStorage.setItem(savedKey, scrollRef.current!.scrollTop.toString());
      }, 500);
    };

    const ref = scrollRef.current;
    ref?.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      ref?.removeEventListener("scroll", handleScroll);
      if (progressRAFRef.current) cancelAnimationFrame(progressRAFRef.current);
    };
  }, [chapterInfo, loading, id, chapterId]);

  // Keyboard navigation
  useEffect(() => {
    if (!chapterInfo || loading) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && chapterInfo.prevChapterId) {
        e.preventDefault();
        window.location.href = `/truyen/${id}/chuong/${chapterInfo.prevChapterId}`;
      } else if (e.key === "ArrowRight" && chapterInfo.nextChapterId) {
        e.preventDefault();
        window.location.href = `/truyen/${id}/chuong/${chapterInfo.nextChapterId}`;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        scrollRef.current?.scrollBy({ top: -window.innerHeight * 0.8, behavior: "smooth" });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        scrollRef.current?.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
      } else if (e.key === " " && readingMode === "scroll") {
        e.preventDefault();
        scrollRef.current?.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chapterInfo, loading, id, readingMode]);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      setChapterInfo({
        ...mockChapterInfo,
        mangaId: id,
        chapterId: chapterId,
      });
      setImages(mockChapterImages);
      setLoading(false);
    }
    fetchData();
  }, [id, chapterId]);

  if (loading) {
    return <ChapterReaderSkeleton />;
  }

  if (!chapterInfo) {
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

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Link href={`/truyen/${chapterInfo.mangaId}`} className="hover:text-primary transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <Link href={`/truyen/${chapterInfo.mangaId}`} className="text-sm font-medium hover:text-primary transition-colors">
                {chapterInfo.mangaTitle}
              </Link>
              <p className="text-xs text-muted-foreground">{chapterInfo.chapterTitle}</p>
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

            {chapterInfo.prevChapterId ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/truyen/${chapterInfo.mangaId}/chuong/${chapterInfo.prevChapterId}`}>
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
            {chapterInfo.nextChapterId ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/truyen/${chapterInfo.mangaId}/chuong/${chapterInfo.nextChapterId}`}>
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

      {/* Chapter Content */}
      <div
        ref={scrollRef}
        className={readingMode === "scroll" ? "overflow-y-auto" : ""}
        style={readingMode === "scroll" ? { height: "calc(100vh - 57px)" } : {}}
      >
        <div ref={contentRef} className="max-w-4xl mx-auto">
          {readingMode === "scroll" ? (
            images.length > 0 ? (
              images.map((image, index) => (
                <LazyChapterImage
                  key={index}
                  src={image}
                  alt={`${chapterInfo.chapterTitle} - Trang ${index + 1}`}
                  index={index}
                />
              ))
            ) : (
              <div className="flex justify-center py-20">
                <p className="text-muted-foreground">Không có hình ảnh để hiển thị.</p>
              </div>
            )
          ) : (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
              {images.length > 0 ? (
                <>
                  <div className="relative w-full max-w-3xl">
                    <Image
                      src={images[currentPage]}
                      alt={`${chapterInfo.chapterTitle} - Trang ${currentPage + 1}`}
                      width={800}
                      height={1200}
                      className="w-full h-auto rounded-lg shadow-lg"
                      priority
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
                      {currentPage + 1} / {images.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(images.length - 1, currentPage + 1))}
                      disabled={currentPage === images.length - 1}
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

      {/* Bottom Navigation */}
      {readingMode === "scroll" && (
        <div className="bg-background border-t">
          <div className="container flex items-center justify-center gap-4 py-4">
            {chapterInfo.prevChapterId ? (
              <Button variant="outline" asChild>
                <Link href={`/truyen/${chapterInfo.mangaId}/chuong/${chapterInfo.prevChapterId}`}>
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
              <Link href={`/truyen/${chapterInfo.mangaId}`}>
                Danh sách chương
              </Link>
            </Button>
            {chapterInfo.nextChapterId ? (
              <Button variant="outline" asChild>
                <Link href={`/truyen/${chapterInfo.mangaId}/chuong/${chapterInfo.nextChapterId}`}>
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
