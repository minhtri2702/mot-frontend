import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Eye, Star, Clock } from "lucide-react";

interface MangaCardProps {
  manga: {
    id: number;
    title: string;
    cover: string;
    views?: string;
    rating?: number;
    chapter?: number;
    updatedAt?: string;
  };
  showBadge?: "rating" | "views" | "time" | "none";
}

export default function MangaCard({ manga, showBadge = "none" }: MangaCardProps) {
  return (
    <Link href={`/truyen/${manga.id}`} className="group">
      <div className="relative mb-2 aspect-[2/3] overflow-hidden rounded-md shadow">
        <Image
          src={manga.cover}
          alt={manga.title}
          fill
          style={{ objectFit: "cover" }}
          className="group-hover:scale-105 transition-transform duration-300"
        />

        {/* Rating Badge */}
        {showBadge === "rating" && manga.rating && (
          <div className="absolute top-0 right-0 m-2">
            <Badge variant="secondary" className="bg-primary/80 text-white">
              <Star className="h-3 w-3 mr-1 text-yellow-400" />
              {manga.rating}
            </Badge>
          </div>
        )}

        {/* Views Badge */}
        {showBadge === "views" && manga.views && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
            <div className="flex items-center text-white">
              <Eye className="h-3 w-3 mr-1" />
              <span className="text-xs">{manga.views}</span>
            </div>
          </div>
        )}

        {/* Time Badge */}
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

      {manga.chapter && (
        <p className="text-xs text-muted-foreground">Chapter {manga.chapter}</p>
      )}
    </Link>
  );
}
