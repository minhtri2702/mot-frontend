import type { Metadata } from "next";

type Props = { children: React.ReactNode; params: Promise<{ id: string; chapterId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, chapterId } = await params;
  const api = process.env.INTERNAL_API_URL || "http://product-services:8080/api/v1";
  try {
    const response = await fetch(`${api}/manga/${id}/chapters/${chapterId}`, { next: { revalidate: 600 } });
    if (!response.ok) return { robots: { index: false, follow: true } };
    const payload = await response.json();
    const chapter = payload?.success ? payload.data : payload;
    const title = `${chapter.mangaTitle} - ${chapter.chapterName || `Chương ${chapter.chapterNumber}`}`;
    const hasImages = Array.isArray(chapter.imageUrls) && chapter.imageUrls.length > 0;
    return {
      title,
      description: `Đọc ${title} online tại Mọt Truyện.`,
      alternates: { canonical: `/truyen/${id}/chuong/${chapterId}` },
      robots: { index: hasImages, follow: true },
    };
  } catch {
    return { robots: { index: false, follow: true } };
  }
}

export default function ChapterLayout({ children }: Props) {
  return children;
}
