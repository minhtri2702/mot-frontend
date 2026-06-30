import Link from "next/link";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Eye, Star, Clock, Heart, Users } from "lucide-react";
import { getCoverImageUrl, formatNumber } from "@/lib/api";
import type { MangaCardData } from "@/lib/types";

interface MangaCardProps {
  manga: MangaCardData;
  showBadge?: "rating" | "views" | "time" | "followers" | "likes" | "none";
}

/**
 * MangaCard - Optimized with React.memo to prevent re-renders
 */
const MangaCard = memo(function MangaCard({ manga, showBadge = "none" }: MangaCardProps) {
  return (
    <Link href={`/truyen/${manga.id}`} className="group block">
      <div className="relative mb-2 aspect-[2/3] overflow-hidden rounded-xl bg-white/[0.04] border border-white/[0.06] transition-all duration-250 group-hover:-translate-y-[6px] group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] group-hover:border-white/[0.15] group-hover:bg-white/[0.06]">
        <img
          src={getCoverImageUrl(manga.cover)}
          alt={manga.title}
          width="300"
          height="450"
          className="absolute inset-0 w-full h-full object-cover transition-all duration-250 group-hover:scale-[1.06]"
          loading="eager"
          onError={(e) => { e.currentTarget.src = "/placeholder-cover.svg"; }}
        />

        {/* Badge - only render the active one */}
        {showBadge === "rating" && manga.likes != null && (
          <div className="absolute top-0 right-0 m-2">
            <Badge variant="secondary" className="bg-primary/80 text-white">
              <Star className="h-3 w-3 mr-1 text-yellow-400" />
              {manga.likes}
            </Badge>
          </div>
        )}

        {showBadge === "views" && manga.views != null && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
            <div className="flex items-center text-white">
              <Eye className="h-3 w-3 mr-1" />
              <span className="text-xs">{formatNumber(manga.views)}</span>
            </div>
          </div>
        )}

        {showBadge === "followers" && manga.followers != null && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
            <div className="flex items-center text-white">
              <Users className="h-3 w-3 mr-1" />
              <span className="text-xs">{formatNumber(manga.followers)}</span>
            </div>
          </div>
        )}

        {showBadge === "likes" && manga.likes != null && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
            <div className="flex items-center text-white">
              <Heart className="h-3 w-3 mr-1" />
              <span className="text-xs">{formatNumber(manga.likes)}</span>
            </div>
          </div>
        )}

        {showBadge === "time" && manga.updatedAt && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
            <div className="flex items-center text-white">
              <Clock className="h-3 w-3 mr-1" />
              <span className="text-xs">{manga.updatedAt}</span>
            </div>
          </div>
        )}
      </div>

      <h3 className="font-medium line-clamp-1 text-sm md:text-base group-hover:text-primary transition-colors duration-300">{manga.title}</h3>

      {manga.chapter != null && (
        <p className="text-xs text-muted-foreground">Chapter {manga.chapter}</p>
      )}

      {manga.status && (
        <p className={`text-xs mt-0.5 ${
          manga.status === "Đang tiến hành"
            ? "text-green-600"
            : manga.status === "Hoàn thành"
            ? "text-blue-600"
            : "text-muted-foreground"
        }`}>
          {manga.status}
        </p>
      )}
    </Link>
  );
});

export default MangaCard;
