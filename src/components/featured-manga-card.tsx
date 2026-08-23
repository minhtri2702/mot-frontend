"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
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

function getBannerImageUrl(coverUrl: string) {
  const separatorIndex = coverUrl.lastIndexOf("/");
  if (separatorIndex < 0) return coverUrl;
  return `${coverUrl.slice(0, separatorIndex)}/banner.jpg`;
}

export default function FeaturedMangaCard({
  manga,
  isFirst,
  onPrev,
  onNext,
  currentIndex = 0,
  totalSlides = 1
}: FeaturedMangaCardProps) {
  const coverUrl = getCoverImageUrl(manga.cover);
  const bannerUrl = getBannerImageUrl(coverUrl);
  const [bannerFailed, setBannerFailed] = useState(false);

  useEffect(() => {
    setBannerFailed(false);
  }, [manga.id]);

  return (
    <div className="group relative h-[390px] w-full overflow-hidden rounded-[18px] bg-muted ring-1 ring-border md:h-[440px] lg:h-[480px]">
      {/* The low-detail cover becomes an atmospheric backdrop, never the focal artwork. */}
      <Image
        src={coverUrl}
        alt=""
        fill
        priority={isFirst}
        sizes="(max-width: 1024px) 100vw, 75vw"
        className={`absolute inset-0 h-full w-full scale-110 object-cover transition-opacity duration-200 ${bannerFailed ? "opacity-55 blur-xl" : "opacity-30 blur-lg"}`}
      />

      {/* Optional hand-curated artwork: {manga-folder}/banner.jpg */}
      {!bannerFailed && (
        <Image
          key={bannerUrl}
          src={bannerUrl}
          alt={manga.title}
          fill
          priority={isFirst}
          sizes="(max-width: 1024px) 100vw, 75vw"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setBannerFailed(true)}
        />
      )}

      {/* Preserve the original portrait cover when no dedicated banner exists. */}
      {bannerFailed && (
        <div className="absolute right-[7%] top-1/2 hidden h-[86%] aspect-[2/3] -translate-y-1/2 overflow-hidden rounded-xl shadow-[0_24px_60px_rgba(0,0,0,0.42)] ring-1 ring-white/15 lg:block">
          <Image
            src={coverUrl}
            alt={`Bìa ${manga.title}`}
            fill
            priority={isFirst}
            sizes="320px"
            className="object-cover"
          />
        </div>
      )}

      {/* Contrast layers protect copy with either user-supplied banners or fallback covers. */}
      <div className={`absolute inset-0 ${bannerFailed ? "bg-gradient-to-r from-[#151515]/95 via-[#151515]/82 to-[#151515]/30" : "bg-gradient-to-r from-[#151515]/94 via-[#151515]/58 to-[#151515]/12"}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#151515]/72 via-transparent to-[#151515]/10" />

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
        <div className={`w-full p-6 md:p-10 lg:p-12 ${bannerFailed ? "lg:w-[58%]" : "lg:w-[55%]"}`}>
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
          <p className="mb-4 line-clamp-1 max-w-lg text-sm leading-relaxed text-white/65 md:text-base">
            {manga.description || "Một tác phẩm đầy cuốn hút với cốt truyện sâu sắc và hình ảnh tuyệt đẹp."}
          </p>

          {/* Genre Badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {manga.genres.slice(0, 2).map((g) => (
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
            <Button asChild className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_10px_28px_hsl(var(--primary)/0.25)] transition-colors duration-200 hover:bg-primary/90">
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
