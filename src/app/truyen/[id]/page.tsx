import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Clock,
  Eye,
  Heart,
  HeartOff,
  ChevronRight,
  Star
} from "lucide-react";
import MangaCard from "@/components/manga-card";

// Mock data for manga details
const getMangaById = (id: string) => {
  return {
    id: parseInt(id),
    title: "One Piece",
    altTitles: ["Vua Hải Tặc", "ワンピース"],
    cover: "https://ext.same-assets.com/4185522578/4110211349.jpg",
    description: "Theo sát cuộc phiêu lưu của Luffy và băng Mũ Rơm trên hành trình khám phá kho báu vĩ đại One Piece. Luffy, chàng trai với ước mơ trở thành Vua Hải Tặc, đã vô tình ăn phải trái ác quỷ Gomu Gomu, khiến cơ thể cậu có thể co giãn như cao su nhưng đánh đổi lại là không bao giờ có thể bơi được nữa. Cùng với các đồng đội, Luffy đã cùng nhau vượt qua bao khó khăn, đương đầu với những thế lực hùng mạnh của thế giới hải tặc...",
    status: "Đang tiến hành",
    author: "Oda Eiichiro",
    artist: "Oda Eiichiro",
    genres: ["Action", "Adventure", "Comedy", "Fantasy", "Shounen", "Super Power"],
    releaseYear: 1997,
    rating: 4.9,
    views: "12.5M",
    chapters: Array.from({ length: 30 }, (_, i) => ({
      id: 1000 + i,
      number: 1112 - i,
      title: `Chapter ${1112 - i}`,
      updatedAt: `${i} ngày trước`,
      views: `${Math.floor(100000 / (i + 1))}`,
    })),
  };
};

// Mock data for related manga
const relatedManga = [
  {
    id: 101,
    title: "Naruto",
    cover: "https://ext.same-assets.com/4185522578/3174823561.jpg",
    rating: 4.7,
  },
  {
    id: 102,
    title: "Bleach",
    cover: "https://ext.same-assets.com/4185522578/3761293864.jpg",
    rating: 4.6,
  },
  {
    id: 103,
    title: "Dragon Ball Super",
    cover: "https://ext.same-assets.com/4185522578/2184428774.jpg",
    rating: 4.8,
  },
  {
    id: 104,
    title: "Fairy Tail",
    cover: "https://ext.same-assets.com/4185522578/2635819367.jpg",
    rating: 4.5,
  },
];

type MangaDetailPageProps = {
  params: {
    id: string;
  };
};

  export default async function MangaDetailPage({ params }: MangaDetailPageProps) {
    const manga = await getMangaById(params.id);
    
    return (
    <div className="container py-8">
      {/* Manga Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Cover Image */}
        <div className="md:col-span-1">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
            <Image
              src={manga.cover}
              alt={manga.title}
              fill
              style={{ objectFit: "cover" }}
              priority
              className="transition-transform hover:scale-105 duration-300"
            />
          </div>
        </div>

        {/* Info */}
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl font-bold">{manga.title}</h1>

          {/* Alt titles */}
          <div className="text-sm text-muted-foreground">
            {manga.altTitles.map((title, index) => (
              <span key={index}>
                {title}
                {index < manga.altTitles.length - 1 && " / "}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{manga.views}</span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-400" />
              <span>{manga.rating}</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{manga.chapters.length} chapters</span>
            </div>
            <Badge variant="outline" className={manga.status === "Đang tiến hành" ? "text-green-600 border-green-600" : "text-blue-600 border-blue-600"}>
              {manga.status}
            </Badge>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {manga.genres.map((genre) => (
              <Link href={`/the-loai/${genre.toLowerCase()}`} key={genre}>
                <Badge variant="secondary" className="hover:bg-secondary-foreground hover:text-secondary transition-colors">
                  {genre}
                </Badge>
              </Link>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{manga.description}</p>

          {/* Author & Artist */}
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium">Tác giả:</span>{" "}
              <Link href={`/tac-gia/${manga.author}`} className="hover:text-primary">
                {manga.author}
              </Link>
            </div>
            <div>
              <span className="font-medium">Họa sĩ:</span>{" "}
              <Link href={`/hoa-si/${manga.artist}`} className="hover:text-primary">
                {manga.artist}
              </Link>
            </div>
            <div>
              <span className="font-medium">Năm xuất bản:</span> {manga.releaseYear}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button className="flex gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Đọc từ đầu</span>
            </Button>
            <Button className="flex gap-2" variant="outline">
              <BookOpen className="h-4 w-4" />
              <span>Đọc mới nhất</span>
            </Button>
            <Button className="flex gap-2" variant="outline">
              <Heart className="h-4 w-4" />
              <span>Theo dõi</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="chapters">
        <TabsList>
          <TabsTrigger value="chapters">Danh sách chương</TabsTrigger>
          <TabsTrigger value="comments">Bình luận</TabsTrigger>
          <TabsTrigger value="related">Truyện liên quan</TabsTrigger>
        </TabsList>

        {/* Chapters Tab */}
        <TabsContent value="chapters" className="mt-4">
          <Card className="p-4">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">Chapters ({manga.chapters.length})</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Mới nhất
                </Button>
                <Button variant="outline" size="sm">
                  Cũ nhất
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {manga.chapters.map((chapter) => (
                <div key={chapter.id} className="rounded-md border p-3 hover:bg-muted transition-colors">
                  <Link href={`/truyen/${manga.id}/chuong/${chapter.number}`} className="flex justify-between items-center">
                    <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                      <span className="font-medium">{chapter.title}</span>
                      <span className="text-xs text-muted-foreground hidden md:inline">- Cập nhật {chapter.updatedAt}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground md:hidden">{chapter.updatedAt}</span>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Eye className="h-3 w-3 mr-1" />
                        <span>{chapter.views}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="mt-4">
          <Card className="p-4">
            <h3 className="font-bold text-lg mb-4">Bình luận</h3>
            <div className="p-6 text-center text-muted-foreground">
              <p>Tính năng bình luận sẽ sớm được ra mắt!</p>
            </div>
          </Card>
        </TabsContent>

        {/* Related Tab */}
        <TabsContent value="related" className="mt-4">
          <Card className="p-4">
            <h3 className="font-bold text-lg mb-4">Truyện cùng thể loại</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedManga.map((manga) => (
                <MangaCard key={manga.id} manga={manga} showBadge="rating" />
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
