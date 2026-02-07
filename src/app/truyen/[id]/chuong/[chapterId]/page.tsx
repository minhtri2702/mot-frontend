import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Home,
  Settings,
  ZoomIn,
  ZoomOut,
  MonitorPlay,
  Image as ImageIcon,
} from "lucide-react";

// Mock data for manga and chapter
const getMangaWithChapter = (mangaId: string, chapterId: string) => {
  const chapterNumber = parseInt(chapterId);
  return {
    manga: {
      id: parseInt(mangaId),
      title: "One Piece",
      cover: "https://ext.same-assets.com/4185522578/4110211349.jpg",
    },
    chapter: {
      id: chapterNumber,
      number: chapterNumber,
      title: `Chapter ${chapterNumber}`,
      prevChapter: chapterNumber < 1112 ? chapterNumber + 1 : null,
      nextChapter: chapterNumber > 1 ? chapterNumber - 1 : null,
      images: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        url: `https://ext.same-assets.com/4185522578/${3000000000 + i * 123456}.jpg`,
        width: 800,
        height: 1200,
      })),
    },
  };
};

type ChapterReaderPageProps = {
  params: {
    id: string;
    chapterId: string;
  };
};

export default function ChapterReaderPage({
  params,
}: ChapterReaderPageProps) {
  const { manga, chapter } = getMangaWithChapter(params.id, params.chapterId);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Reader Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container flex h-14 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href={`/truyen/${manga.id}`}>
              <Button variant="ghost" size="icon" className="text-white">
                <Home className="h-5 w-5" />
                <span className="sr-only">Trang chủ</span>
              </Button>
            </Link>
            <Link href={`/truyen/${manga.id}`}>
              <Button variant="ghost" className="text-white">
                {manga.title}
              </Button>
            </Link>
            <span className="text-white/70">/</span>
            <span className="text-white">Chapter {chapter.number}</span>
          </div>

        </div>
      </header>

      {/* Reader Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto py-4 px-4 space-y-4">
        {chapter.images.map((image) => (
          <div key={image.id} className="w-full mx-auto">
            <div className="relative w-full" style={{ aspectRatio: `${image.width}/${image.height}` }}>
              <Image
                src={image.url}
                alt={`${manga.title} - Chapter ${chapter.number} - Page ${image.id}`}
                fill
                style={{ objectFit: "contain" }}
                className="rounded"
                priority={image.id <= 3} // Prioritize loading first 3 images
              />
            </div>
          </div>
        ))}
      </main>

      {/* Reader Controls */}
      <div className="sticky bottom-0 left-0 right-0 bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/60 border-t border-white/10 py-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/truyen/${manga.id}`}>
              <Button variant="outline" size="sm" className="bg-transparent border-white/30 text-white hover:bg-white/10">
                <ListOrdered className="h-4 w-4 mr-2" />
                Danh sách chương
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {chapter.prevChapter && (
              <Link href={`/truyen/${manga.id}/chuong/${chapter.prevChapter}`}>
                <Button variant="outline" size="sm" className="bg-transparent border-white/30 text-white hover:bg-white/10">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Chương trước
                </Button>
              </Link>
            )}
            <div className="bg-white/10 px-3 py-1 rounded text-sm">
              {chapter.number} / 1112
            </div>
            {chapter.nextChapter && (
              <Link href={`/truyen/${manga.id}/chuong/${chapter.nextChapter}`}>
                <Button variant="outline" size="sm" className="bg-transparent border-white/30 text-white hover:bg-white/10">
                  Chương sau
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
