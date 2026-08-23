import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Eye, Star, Clock, Heart, Users, Play } from "lucide-react";
import { getCoverImageUrl, formatNumber } from "@/lib/api";
import type { MangaCardData } from "@/lib/types";

interface MangaCardProps {
  manga: MangaCardData;
  showBadge?: "rating" | "views" | "time" | "followers" | "likes" | "none";
  readingProgress?: number;
}

/**
 * MangaCard - Optimized with React.memo to prevent re-renders
 */
const MangaCard = memo(function MangaCard({ manga, showBadge = "none", readingProgress }: MangaCardProps) {
  const discoveryBadge = showBadge === "views" ? "HOT" : showBadge === "time" ? "NEW" : null;
  const progress = readingProgress == null
    ? null
    : Math.min(100, Math.max(2, Math.round(readingProgress)));

  return (
    <Link href={`/truyen/${manga.id}`} className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background">
      <div className="relative mb-2.5 aspect-[3/4] overflow-hidden rounded-xl bg-muted ring-1 ring-border/70 transition duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_12px_32px_rgba(18,14,10,0.28)] group-hover:ring-primary/35">
        <Image
          src={getCoverImageUrl(manga.cover)}
          alt={manga.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 180px"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.025]"
        />

        <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[#151515]/90 via-[#151515]/10 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="mb-1 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg">
            <Play className="h-3.5 w-3.5 fill-current" />
            Đọc ngay
          </span>
        </div>

        {discoveryBadge && (
          <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-1 text-[10px] font-bold tracking-wide text-primary-foreground shadow-sm">
            {discoveryBadge}
          </span>
        )}

        {/* Badge - only render the active one */}
        {showBadge === "rating" && manga.likes != null && (
          <div className="absolute top-0 right-0 m-2">
            <Badge variant="secondary" className="bg-primary text-primary-foreground shadow-sm">
              <Star className="h-3 w-3 mr-1 text-yellow-400" />
              {manga.likes}
            </Badge>
          </div>
        )}

        {showBadge === "views" && manga.views != null && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2.5">
            <div className="flex items-center text-white">
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs font-medium">{formatNumber(manga.views)}</span>
            </div>
          </div>
        )}

        {showBadge === "followers" && manga.followers != null && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2.5">
            <div className="flex items-center text-white">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs font-medium">{formatNumber(manga.followers)}</span>
            </div>
          </div>
        )}

        {showBadge === "likes" && manga.likes != null && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2.5">
            <div className="flex items-center text-white">
              <Heart className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs font-medium">{formatNumber(manga.likes)}</span>
            </div>
          </div>
        )}

        {showBadge === "time" && manga.updatedAt && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2.5">
            <div className="flex items-center text-white">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs font-medium">{manga.updatedAt}</span>
            </div>
          </div>
        )}
      </div>

      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary md:text-[0.9375rem]">{manga.title}</h3>

      {manga.chapter != null && (
        <p className="mt-1 text-xs font-medium text-muted-foreground">Chương {manga.chapter}</p>
      )}

      {manga.status && (
        <p className={`mt-1 text-[11px] ${
          manga.status === "Đang tiến hành"
            ? "text-emerald-600 dark:text-emerald-400"
            : manga.status === "Hoàn thành"
            ? "text-sky-600 dark:text-sky-400"
            : "text-muted-foreground"
        }`}>
          {manga.status}
        </p>
      )}

      {progress != null && (
        <div className="mt-2" aria-label={`Đã đọc ${progress}%`}>
          <div className="mb-1 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
            <span>Đang đọc</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </Link>
  );
});

export default MangaCard;
