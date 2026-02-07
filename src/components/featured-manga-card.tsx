import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
const nextConfig = {
  images: {
    domains: ['motdataimage.s3.ap-southeast-2.amazonaws.com'],
  },
};

module.exports = nextConfig;

interface FeaturedMangaCardProps {
  manga: {
    id: number;
    title: string;
    cover: string;
    description: string;
    genre: string[];
    rating: number;
    latestChapter: number;
  };
}

export default function FeaturedMangaCard({ manga }: FeaturedMangaCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className="p-0 relative aspect-[2/1] md:aspect-[2/1.2]">
        <Link href={`/truyen/${manga.id}`}>
          <Image
            src={manga.cover}
            alt={manga.title}
            fill
            style={{ objectFit: "cover" }}
            className="hover:opacity-90 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 p-4 text-white">
            <h3 className="font-bold text-lg md:text-xl">{manga.title}</h3>
            <p className="text-sm mt-1 line-clamp-2">{manga.description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {manga.genre.slice(0, 2).map((g) => (
                <Badge key={g} variant="secondary" className="bg-primary/30 hover:bg-primary/50">
                  {g}
                </Badge>
              ))}
            </div>
            <div className="flex items-center mt-2">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-sm mr-3">{manga.rating}</span>
              <Button size="sm" variant="secondary" className="text-xs ml-auto">
                Đọc ngay
              </Button>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
