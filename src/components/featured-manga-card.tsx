import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Eye, Play, BookmarkPlus, ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="relative w-full h-[334px] md:h-[352px] lg:h-[370px] overflow-hidden rounded-xl bg-muted group">
      {/* Background Image */}
      <img
        src={getCoverImageUrl(manga.cover)}
        alt={manga.title}
        width="1200"
        height="420"
        loading="eager"
        fetchPriority={isFirst ? "high" : "auto"}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(e) => { e.currentTarget.src = "/placeholder-cover.svg"; }}
      />

      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#09090B]/90 via-[#09090B]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090B]/60 via-transparent to-transparent" />

      {/* Navigation Arrows */}
      {onPrev && onNext && totalSlides > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200 opacity-0 group-hover:opacity-100"
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
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentIndex ? "w-6 bg-[#EF4444]" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-0 flex items-end lg:items-center">
        <div className="w-full lg:w-[60%] p-6 md:p-8 lg:p-10 animate-slide-in-left">
          {/* Rating & Meta */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold text-white">{manga.likes ?? 9.5}</span>
            </div>
            <div className="flex items-center gap-1 text-white/60 text-xs">
              <Eye className="h-3.5 w-3.5" />
              <span>{formatNumber(manga.views)}</span>
            </div>
            <Badge className="bg-[#EF4444]/80 text-white border border-white/[0.15] text-[10px] font-semibold px-2.5 py-0.5 backdrop-blur-sm">
              {manga.latestChapter ? `Ch. ${manga.latestChapter}` : "Mới"}
            </Badge>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
            {manga.title}
          </h2>

          {/* Description */}
          <p className="text-xs md:text-sm text-white/50 mb-3 line-clamp-2 max-w-xl leading-relaxed">
            {manga.description || "Một tác phẩm đầy cuốn hút với cốt truyện sâu sắc và hình ảnh tuyệt đẹp."}
          </p>

          {/* Genre Badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {manga.genres.slice(0, 3).map((g) => (
              <Badge
                key={g.id}
                variant="secondary"
                className="bg-white/10 backdrop-blur-sm text-white/70 border border-white/15 hover:bg-white/20 transition-colors text-[10px] font-medium px-2 py-0.5"
              >
                {g.name}
              </Badge>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 animate-slide-in-up">
            <Link href={`/truyen/${manga.id}`}>
              <Button asChild className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 shadow-lg shadow-[#EF4444]/20 hover:shadow-[#EF4444]/30 hover:scale-105 active:scale-95">
                <a>
                  <Play className="h-4 w-4 mr-1.5 fill-current" />
                  Đọc ngay
                </a>
              </Button>
            </Link>
            <Link href={`/truyen/${manga.id}`}>
              <Button asChild
                variant="outline"
                className="border-white/25 text-white/80 hover:bg-white/10 hover:text-white px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <a>
                  <BookmarkPlus className="h-4 w-4 mr-1.5" />
                  Theo dõi
                </a>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
