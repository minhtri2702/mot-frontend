import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Play, Heart, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { getCoverImageUrl, formatNumber } from "@/lib/api";
import type { FeaturedMangaData } from "@/lib/types";

interface FeaturedMangaCardProps {
  manga: FeaturedMangaData;
  isFirst?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalSlides?: number;
}

export default function FeaturedMangaCard({
  manga,
  isFirst,
  onPrev,
  onNext,
  currentIndex = 0,
  totalSlides = 1
}: FeaturedMangaCardProps) {
  return (
    <div className="group relative h-[360px] w-full overflow-hidden rounded-[18px] bg-muted ring-1 ring-border md:h-[390px] lg:h-[420px]">
      {/* Background Image */}
      <img
        src={getCoverImageUrl(manga.cover)}
        alt={manga.title}
        width="1200"
        height="420"
        loading="eager"
        fetchPriority={isFirst ? "high" : "auto"}
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => { e.currentTarget.src = "/placeholder-cover.svg"; }}
      />

      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#151515]/95 via-[#151515]/72 to-[#151515]/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#151515]/75 via-transparent to-[#151515]/10" />

      {/* Navigation Arrows */}
      {onPrev && onNext && totalSlides > 1 && (
        <>
          <button
            onClick={onPrev}
            aria-label="Truyện đề xuất trước"
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 bg-[#151515]/85 text-white/80 transition-colors duration-200 hover:bg-[#272522] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onNext}
            aria-label="Truyện đề xuất tiếp theo"
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 bg-[#151515]/85 text-white/80 transition-colors duration-200 hover:bg-[#272522] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {totalSlides > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-0 flex items-end lg:items-center">
        <div className="w-full p-6 md:p-9 lg:w-[62%] lg:p-12">
          {/* Rating & Meta */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 fill-red-400 text-red-400" />
              <span className="text-sm font-semibold text-white">{formatNumber(manga.likes)}</span>
            </div>
            <div className="flex items-center gap-1 text-white/60 text-xs">
              <Eye className="h-3.5 w-3.5" />
              <span>{formatNumber(manga.views)}</span>
            </div>
            <Badge className="border-0 bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {manga.latestChapter ? `Chương ${manga.latestChapter}` : "Mới"}
            </Badge>
          </div>

          {/* Title */}
          <h2 className="mb-2 text-3xl font-semibold leading-[1.08] tracking-tight text-[#f8f5ef] md:text-4xl lg:text-5xl">
            {manga.title}
          </h2>

          {/* Description */}
          <p className="mb-4 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/65 md:text-base">
            {manga.description || "Một tác phẩm đầy cuốn hút với cốt truyện sâu sắc và hình ảnh tuyệt đẹp."}
          </p>

          {/* Genre Badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {manga.genres.slice(0, 3).map((g) => (
              <Link key={g.id} href={`/the-loai/${g.slug}`}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/75 transition-colors hover:bg-white/15"
                >
                  {g.name}
                </Badge>
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button asChild className="h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90">
              <Link href={`/truyen/${manga.id}`}>
                  <Play className="h-4 w-4 mr-1.5 fill-current" />
                  Đọc ngay
              </Link>
            </Button>
            <Button asChild
                variant="outline"
                className="h-10 rounded-xl border-white/25 bg-transparent px-5 text-sm font-semibold text-white/85 transition-colors duration-200 hover:bg-white/10 hover:text-white"
              >
              <Link href={`/truyen/${manga.id}`}>
                <Info className="h-4 w-4 mr-1.5" />
                Chi tiết
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
