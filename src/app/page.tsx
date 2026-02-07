import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp } from "lucide-react";
import FeaturedMangaCard from "@/components/featured-manga-card";
import MangaCard from "@/components/manga-card";

export default function Home() {
  // Mock data for featured manga
  const featuredManga = [
    {
      id: 1,
      title: "One Piece",
      cover: "https://motdataimage.s3.ap-southeast-2.amazonaws.com/lao-ba-cho-toi-lua-mot-trong-muoi-nu-than-de-ket-hon.jpeg",
      description: "Theo sát cuộc phiêu lưu của Luffy và băng Mũ Rơm trên hành trình khám phá kho báu vĩ đại One Piece",
      genre: ["Action", "Adventure", "Comedy", "Fantasy"],
      rating: 4.8,
      latestChapter: 1112,
    },
    {
      id: 2,
      title: "Jujutsu Kaisen",
      cover: "https://motdataimage.s3.ap-southeast-2.amazonaws.com/downloaded_images/ac-quy-tro-lai-hoc-duong/ac-quy-tro-lai-hoc-duong",
      description: "Yuuji Itadori và hành trình chống lại các thế lực siêu nhiên sau khi anh nuốt ngón tay của Sukuna",
      genre: ["Action", "Horror", "Supernatural"],
      rating: 4.7,
      latestChapter: 256,
    },
    {
      id: 3,
      title: "Chainsaw Man",
      cover: "https://ext.same-assets.com/4185522578/3267442566.jpg",
      description: "Denji, một cậu bé nghèo khổ biến thành người lai quỷ cưa xích để tiêu diệt quỷ dữ",
      genre: ["Action", "Horror", "Supernatural"],
      rating: 4.9,
      latestChapter: 172,
    },
    {
      id: 4,
      title: "Spy x Family",
      cover: "https://ext.same-assets.com/4185522578/1173669990.jpg",
      description: "Câu chuyện về gia đình kỳ lạ gồm điệp viên, sát thủ và nhà ngoại cảm",
      genre: ["Action", "Comedy", "Slice of Life"],
      rating: 4.6,
      latestChapter: 98,
    },
  ];

  // Mock data for latest updates
  const latestUpdates = [
    {
      id: 101,
      title: "One Piece",
      cover: "https://ext.same-assets.com/4185522578/4110211349.jpg",
      chapter: 1112,
      updatedAt: "2 giờ trước",
    },
    {
      id: 102,
      title: "Jujutsu Kaisen",
      cover: "https://ext.same-assets.com/4185522578/2908889711.jpg",
      chapter: 256,
      updatedAt: "3 giờ trước",
    },
    {
      id: 103,
      title: "Dragon Ball Super",
      cover: "https://ext.same-assets.com/4185522578/2184428774.jpg",
      chapter: 102,
      updatedAt: "4 giờ trước",
    },
    {
      id: 104,
      title: "My Hero Academia",
      cover: "https://ext.same-assets.com/4185522578/1481122338.jpg",
      chapter: 420,
      updatedAt: "5 giờ trước",
    },
    {
      id: 105,
      title: "Black Clover",
      cover: "https://ext.same-assets.com/4185522578/3947723584.jpg",
      chapter: 368,
      updatedAt: "6 giờ trước",
    },
    {
      id: 106,
      title: "Demon Slayer",
      cover: "https://ext.same-assets.com/4185522578/2551993677.jpg",
      chapter: 205,
      updatedAt: "6 giờ trước",
    },
    {
      id: 107,
      title: "Tokyo Revengers",
      cover: "https://ext.same-assets.com/4185522578/3081776352.jpg",
      chapter: 278,
      updatedAt: "7 giờ trước",
    },
    {
      id: 108,
      title: "One Punch Man",
      cover: "https://ext.same-assets.com/4185522578/1945673209.jpg",
      chapter: 200,
      updatedAt: "8 giờ trước",
    },
    {
      id: 109,
      title: "Haikyuu!!",
      cover: "https://ext.same-assets.com/4185522578/3518337924.jpg",
      chapter: 402,
      updatedAt: "9 giờ trước",
    },
    {
      id: 110,
      title: "Attack on Titan",
      cover: "https://ext.same-assets.com/4185522578/2815673297.jpg",
      chapter: 139,
      updatedAt: "10 giờ trước",
    },
  ];

  // Mock data for trending manga
  const trendingManga = [
    {
      id: 201,
      title: "Demon Slayer",
      cover: "https://ext.same-assets.com/4185522578/2551993677.jpg",
      views: "1.2M",
      rating: 4.9,
    },
    {
      id: 202,
      title: "Jujutsu Kaisen",
      cover: "https://ext.same-assets.com/4185522578/2908889711.jpg",
      views: "980K",
      rating: 4.8,
    },
    {
      id: 203,
      title: "Chainsaw Man",
      cover: "https://ext.same-assets.com/4185522578/3267442566.jpg",
      views: "890K",
      rating: 4.7,
    },
    {
      id: 204,
      title: "One Piece",
      cover: "https://ext.same-assets.com/4185522578/4110211349.jpg",
      views: "1.5M",
      rating: 4.9,
    },
    {
      id: 205,
      title: "Spy x Family",
      cover: "https://ext.same-assets.com/4185522578/1173669990.jpg",
      views: "750K",
      rating: 4.5,
    },
    {
      id: 206,
      title: "Tokyo Revengers",
      cover: "https://ext.same-assets.com/4185522578/3081776352.jpg",
      views: "680K",
      rating: 4.6,
    },
  ];

  return (
    <div className="container py-8 space-y-10">
      {/* Featured Manga Carousel */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Truyện Đề Xuất</h2>
        <Carousel className="w-full">
          <CarouselContent>
            {featuredManga.map((manga) => (
              <CarouselItem key={manga.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <FeaturedMangaCard manga={manga} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </section>

      {/* Latest Updates */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Mới Cập Nhật</h2>
          <Link href="/truyen-moi-cap-nhat" className="text-sm font-medium text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {latestUpdates.slice(0, 10).map((manga) => (
            <MangaCard key={manga.id} manga={manga} showBadge="time" />
          ))}
        </div>
      </section>

      {/* Trending Manga */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Xu Hướng</h2>
          </div>
          <Link href="/truyen-hot" className="text-sm font-medium text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {trendingManga.map((manga) => (
            <MangaCard key={manga.id} manga={manga} showBadge="rating" />
          ))}
        </div>
      </section>

      {/* Browse by Category */}
      
    </div>
  );
}

