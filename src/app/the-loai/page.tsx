"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

type Genre = {
  id: number;
  name: string;
  slug: string;
  color: string;
  count: number;
};

// Bản đồ màu sắc theo slug
const genreColors: Record<string, string> = {
  action: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-800",
  adventure: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800",
  comedy: "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-800",
  drama: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800",
  fantasy: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800",
  horror: "bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800",
  mystery: "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800",
  romance: "bg-pink-500/10 text-pink-600 border-pink-200 dark:border-pink-800",
  "school-life": "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800",
  "sci-fi": "bg-cyan-500/10 text-cyan-600 border-cyan-200 dark:border-cyan-800",
  seinen: "bg-teal-500/10 text-teal-600 border-teal-200 dark:border-teal-800",
  shoujo: "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800",
  shounen: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800",
  "slice-of-life": "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800",
  sports: "bg-lime-500/10 text-lime-600 border-lime-200 dark:border-lime-800",
  supernatural: "bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-800",
  tragedy: "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800",
  webtoon: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800",
};

// Mock genres data
const mockGenres: Genre[] = [
  { id: 1, name: "Action", slug: "action", color: genreColors.action, count: 1250 },
  { id: 2, name: "Adventure", slug: "adventure", color: genreColors.adventure, count: 890 },
  { id: 3, name: "Comedy", slug: "comedy", color: genreColors.comedy, count: 1100 },
  { id: 4, name: "Drama", slug: "drama", color: genreColors.drama, count: 760 },
  { id: 5, name: "Fantasy", slug: "fantasy", color: genreColors.fantasy, count: 980 },
  { id: 6, name: "Horror", slug: "horror", color: genreColors.horror, count: 450 },
  { id: 7, name: "Mystery", slug: "mystery", color: genreColors.mystery, count: 320 },
  { id: 8, name: "Romance", slug: "romance", color: genreColors.romance, count: 870 },
  { id: 9, name: "School Life", slug: "school-life", color: genreColors["school-life"], count: 540 },
  { id: 10, name: "Sci-fi", slug: "sci-fi", color: genreColors["sci-fi"], count: 410 },
  { id: 11, name: "Seinen", slug: "seinen", color: genreColors.seinen, count: 380 },
  { id: 12, name: "Shoujo", slug: "shoujo", color: genreColors.shoujo, count: 620 },
  { id: 13, name: "Shounen", slug: "shounen", color: genreColors.shounen, count: 1350 },
  { id: 14, name: "Slice of Life", slug: "slice-of-life", color: genreColors["slice-of-life"], count: 490 },
  { id: 15, name: "Sports", slug: "sports", color: genreColors.sports, count: 280 },
  { id: 16, name: "Supernatural", slug: "supernatural", color: genreColors.supernatural, count: 560 },
  { id: 17, name: "Tragedy", slug: "tragedy", color: genreColors.tragedy, count: 190 },
  { id: 18, name: "Webtoon", slug: "webtoon", color: genreColors.webtoon, count: 720 },
];

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGenres() {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      setGenres(mockGenres);
      setLoading(false);
    }
    fetchGenres();
  }, []);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <div className="h-9 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-5 w-96 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Thể Loại Truyện</h1>
        <p className="text-muted-foreground">
          Khám phá tất cả thể loại truyện tranh và manga trên Mot Truyện
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {genres.map((genre) => (
          <Link href={`/the-loai/${genre.slug}`} key={genre.id}>
            <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${genre.color}`}>
                    <Tag className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="font-normal">
                    {genre.count.toLocaleString()} truyện
                  </Badge>
                </div>
                <h2 className="text-xl font-semibold mb-1">{genre.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Khám phá các truyện thể loại {genre.name.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
