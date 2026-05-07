import Link from "next/link";
import Image from "next/image";
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
 * when parent grid re-renders (e.g., infinite scroll adding new items)
 */
const MangaCard = memo(function MangaCard({ manga, showBadge = "none" }: MangaCardProps) {
  return (
    <Link href={`/truyen/${manga.id}`} className="group">
      <div className="relative mb-2 aspect-[2/3] overflow-hidden rounded-md shadow">
        <Image
          src={getCoverImageUrl(manga.cover)}
          alt={manga.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          style={{ objectFit: "cover" }}
          className="group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
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

      <h3 className="font-medium line-clamp-1 text-sm md:text-base">{manga.title}</h3>

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
