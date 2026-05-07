import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TrendingUp } from "lucide-react";
import FeaturedMangaCard from "@/components/featured-manga-card";
import MangaCard from "@/components/manga-card";

export default function Home() {
  // Mock data for featured manga
  const featuredManga = [
    {
      id: "1",
      stt: 1,
      title: "One Piece",
      cover: "https://motdataimage.s3.ap-southeast-2.amazonaws.com/lao-ba-cho-toi-lua-mot-trong-muoi-nu-than-de-ket-hon.jpeg",
      description: "Theo sát cuộc phiêu lưu của Luffy và băng Mũ Rơm trên hành trình khám phá kho báu vĩ đại One Piece",
      genres: [
        { id: 1, name: "Action", slug: "action" },
        { id: 2, name: "Adventure", slug: "adventure" },
        { id: 3, name: "Comedy", slug: "comedy" },
        { id: 4, name: "Fantasy", slug: "fantasy" },
      ],
      likes: 4.8,
      followers: 1500000,
      views: 12500000,
      latestChapter: 1112,
    },
    {
      id: "2",
      stt: 2,
      title: "Jujutsu Kaisen",
      cover: "https://motdataimage.s3.ap-southeast-2.amazonaws.com/downloaded_images/ac-quy-tro-lai-hoc-duong/ac-quy-tro-lai-hoc-duong",
      description: "Yuuji Itadori và hành trình chống lại các thế lực siêu nhiên sau khi anh nuốt ngón tay của Sukuna",
      genres: [
        { id: 1, name: "Action", slug: "action" },
        { id: 5, name: "Horror", slug: "horror" },
        { id: 6, name: "Supernatural", slug: "supernatural" },
      ],
      likes: 4.7,
      followers: 980000,
      views: 8900000,
      latestChapter: 256,
    },
    {
      id: "3",
      stt: 3,
      title: "Chainsaw Man",
      cover: "https://ext.same-assets.com/4185522578/3267442566.jpg",
      description: "Denji, một cậu bé nghèo khổ biến thành người lai quỷ cưa xích để tiêu diệt quỷ dữ",
      genres: [
        { id: 1, name: "Action", slug: "action" },
        { id: 5, name: "Horror", slug: "horror" },
        { id: 6, name: "Supernatural", slug: "supernatural" },
      ],
      likes: 4.9,
      followers: 1200000,
      views: 10500000,
      latestChapter: 172,
    },
    {
      id: "4",
      stt: 4,
      title: "Spy x Family",
      cover: "https://ext.same-assets.com/4185522578/1173669990.jpg",
      description: "Câu chuyện về gia đình kỳ lạ gồm điệp viên, sát thủ và nhà ngoại cảm",
      genres: [
        { id: 1, name: "Action", slug: "action" },
        { id: 3, name: "Comedy", slug: "comedy" },
        { id: 7, name: "Slice of Life", slug: "slice-of-life" },
      ],
      likes: 4.6,
      followers: 750000,
      views: 6800000,
      latestChapter: 98,
    },
  ];

  // Mock data for latest updates
  const latestUpdates = [
    {
      id: "101",
      stt: 101,
      title: "One Piece",
      cover: "https://ext.same-assets.com/4185522578/4110211349.jpg",
      views: 12500000,
      followers: 1500000,
      likes: 4.8,
      chapter: 1112,
      updatedAt: "2 giờ trước",
    },
    {
      id: "102",
      stt: 102,
      title: "Jujutsu Kaisen",
      cover: "https://ext.same-assets.com/4185522578/2908889711.jpg",
      views: 8900000,
      followers: 980000,
      likes: 4.7,
      chapter: 256,
      updatedAt: "3 giờ trước",
    },
    {
      id: "103",
      stt: 103,
      title: "Dragon Ball Super",
      cover: "https://ext.same-assets.com/4185522578/2184428774.jpg",
      views: 7500000,
      followers: 850000,
      likes: 4.6,
      chapter: 102,
      updatedAt: "4 giờ trước",
    },
    {
      id: "104",
      stt: 104,
      title: "My Hero Academia",
      cover: "https://ext.same-assets.com/4185522578/1481122338.jpg",
      views: 9200000,
      followers: 1100000,
      likes: 4.7,
      chapter: 420,
      updatedAt: "5 giờ trước",
    },
    {
      id: "105",
      stt: 105,
      title: "Black Clover",
      cover: "https://ext.same-assets.com/4185522578/3947723584.jpg",
      views: 6800000,
      followers: 720000,
      likes: 4.5,
      chapter: 368,
      updatedAt: "6 giờ trước",
    },
    {
      id: "106",
      stt: 106,
      title: "Demon Slayer",
      cover: "https://ext.same-assets.com/4185522578/2551993677.jpg",
      views: 15000000,
      followers: 2000000,
      likes: 4.9,
      chapter: 205,
      updatedAt: "6 giờ trước",
    },
    {
      id: "107",
      stt: 107,
      title: "Tokyo Revengers",
      cover: "https://ext.same-assets.com/4185522578/3081776352.jpg",
      views: 7200000,
      followers: 800000,
      likes: 4.6,
      chapter: 278,
      updatedAt: "7 giờ trước",
    },
    {
      id: "108",
      stt: 108,
      title: "One Punch Man",
      cover: "https://ext.same-assets.com/4185522578/1945673209.jpg",
      views: 8500000,
      followers: 950000,
      likes: 4.7,
      chapter: 200,
      updatedAt: "8 giờ trước",
    },
    {
      id: "109",
      stt: 109,
      title: "Haikyuu!!",
      cover: "https://ext.same-assets.com/4185522578/3518337924.jpg",
      views: 6200000,
      followers: 700000,
      likes: 4.5,
      chapter: 402,
      updatedAt: "9 giờ trước",
    },
    {
      id: "110",
      stt: 110,
      title: "Attack on Titan",
      cover: "https://ext.same-assets.com/4185522578/2815673297.jpg",
      views: 18000000,
      followers: 2500000,
      likes: 4.9,
      chapter: 139,
      updatedAt: "10 giờ trước",
    },
  ];

  // Mock data for trending manga
  const trendingManga = [
    {
      id: "201",
      stt: 201,
      title: "Demon Slayer",
      cover: "https://ext.same-assets.com/4185522578/2551993677.jpg",
      views: 15000000,
      followers: 2000000,
      likes: 4.9,
    },
    {
      id: "202",
      stt: 202,
      title: "Jujutsu Kaisen",
      cover: "https://ext.same-assets.com/4185522578/2908889711.jpg",
      views: 8900000,
      followers: 980000,
      likes: 4.8,
    },
    {
      id: "203",
      stt: 203,
      title: "Chainsaw Man",
      cover: "https://ext.same-assets.com/4185522578/3267442566.jpg",
      views: 10500000,
      followers: 1200000,
      likes: 4.7,
    },
    {
      id: "204",
      stt: 204,
      title: "One Piece",
      cover: "https://ext.same-assets.com/4185522578/4110211349.jpg",
      views: 12500000,
      followers: 1500000,
      likes: 4.9,
    },
    {
      id: "205",
      stt: 205,
      title: "Spy x Family",
      cover: "https://ext.same-assets.com/4185522578/1173669990.jpg",
      views: 6800000,
      followers: 750000,
      likes: 4.5,
    },
    {
      id: "206",
      stt: 206,
      title: "Tokyo Revengers",
      cover: "https://ext.same-assets.com/4185522578/3081776352.jpg",
      views: 7200000,
      followers: 800000,
      likes: 4.6,
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
            <MangaCard key={manga.id} manga={manga} showBadge="views" />
          ))}
        </div>
      </section>
    </div>
  );
}
