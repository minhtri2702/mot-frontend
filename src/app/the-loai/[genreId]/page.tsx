import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import MangaCard from "@/components/manga-card";

// Mock data for genres
const genres = {
  "action": { id: "action", name: "Action", color: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-800" },
  "adventure": { id: "adventure", name: "Adventure", color: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800" },
  "comedy": { id: "comedy", name: "Comedy", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-800" },
  "drama": { id: "drama", name: "Drama", color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800" },
  "fantasy": { id: "fantasy", name: "Fantasy", color: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800" },
  "romance": { id: "romance", name: "Romance", color: "bg-pink-500/10 text-pink-600 border-pink-200 dark:border-pink-800" },
};

// Mock data for manga by genre
const getMangaByGenre = (genreId: string) => {
  return [
    { id: "1", stt: 1, title: "One Piece", cover: "https://ext.same-assets.com/4185522578/4110211349.jpg", views: 12500000, followers: 1500000, likes: 4.8 },
    { id: "2", stt: 2, title: "Jujutsu Kaisen", cover: "https://ext.same-assets.com/4185522578/2908889711.jpg", views: 8900000, followers: 980000, likes: 4.7 },
    { id: "3", stt: 3, title: "Chainsaw Man", cover: "https://ext.same-assets.com/4185522578/3267442566.jpg", views: 10500000, followers: 1200000, likes: 4.9 },
    { id: "4", stt: 4, title: "Spy x Family", cover: "https://ext.same-assets.com/4185522578/1173669990.jpg", views: 6800000, followers: 750000, likes: 4.6 },
    { id: "5", stt: 5, title: "Demon Slayer", cover: "https://ext.same-assets.com/4185522578/2551993677.jpg", views: 15000000, followers: 2000000, likes: 4.9 },
    { id: "6", stt: 6, title: "My Hero Academia", cover: "https://ext.same-assets.com/4185522578/1481122338.jpg", views: 9200000, followers: 1100000, likes: 4.6 },
    { id: "7", stt: 7, title: "Tokyo Revengers", cover: "https://ext.same-assets.com/4185522578/3081776352.jpg", views: 7200000, followers: 800000, likes: 4.5 },
    { id: "8", stt: 8, title: "Black Clover", cover: "https://ext.same-assets.com/4185522578/3947723584.jpg", views: 6800000, followers: 720000, likes: 4.4 },
    { id: "9", stt: 9, title: "One Punch Man", cover: "https://ext.same-assets.com/4185522578/1945673209.jpg", views: 8500000, followers: 950000, likes: 4.8 },
    { id: "10", stt: 10, title: "Dragon Ball Super", cover: "https://ext.same-assets.com/4185522578/2184428774.jpg", views: 7500000, followers: 850000, likes: 4.7 },
    { id: "11", stt: 11, title: "Naruto", cover: "https://ext.same-assets.com/4185522578/3174823561.jpg", views: 20000000, followers: 3000000, likes: 4.7 },
    { id: "12", stt: 12, title: "Bleach", cover: "https://ext.same-assets.com/4185522578/3761293864.jpg", views: 11000000, followers: 1300000, likes: 4.6 },
  ];
};

type GenrePageProps = {
  params: Promise<{
    genreId: string;
  }>;
};

export default async function GenrePage({ params }: GenrePageProps) {
  const { genreId } = await params;
  const genre = genres[genreId as keyof typeof genres] || {
    id: genreId,
    name: genreId.charAt(0).toUpperCase() + genreId.slice(1),
    color: "bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800"
  };
  const mangaList = getMangaByGenre(genreId);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/the-loai">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Thể loại
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <div className={`py-1 px-3 rounded-full ${genre.color}`}>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>{genre.name}</span>
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Thể Loại: {genre.name}</h1>
        <p className="text-muted-foreground">
          Tìm thấy {mangaList.length} truyện thuộc thể loại {genre.name.toLowerCase()}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b pb-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1">Tất cả</Button>
          <Button variant="outline" size="sm" className="gap-1">Đang tiến hành</Button>
          <Button variant="outline" size="sm" className="gap-1">Hoàn thành</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select defaultValue="latest">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Mới cập nhật</SelectItem>
              <SelectItem value="popularity">Phổ biến</SelectItem>
              <SelectItem value="rating">Đánh giá</SelectItem>
              <SelectItem value="name_asc">Tên A-Z</SelectItem>
              <SelectItem value="name_desc">Tên Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Manga Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 mb-8 grid-fade-in">
        {mangaList.map((manga) => (
          <MangaCard key={manga.id} manga={manga} showBadge="rating" />
        ))}
      </div>

      {/* Pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">4</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">5</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
