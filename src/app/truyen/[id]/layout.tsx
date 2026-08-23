import type { Metadata } from "next";

type Props = { children: React.ReactNode; params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const api = process.env.INTERNAL_API_URL || "http://product-services:8080/api/v1";
  try {
    const response = await fetch(`${api}/manga/${id}`, { next: { revalidate: 300 } });
    if (!response.ok) return {};
    const payload = await response.json();
    const manga = payload?.success ? payload.data : payload;
    const description = (manga.description || `Đọc ${manga.title} tại Mọt Truyện`).replace(/<[^>]+>/g, "").slice(0, 155);
    return {
      title: manga.title,
      description,
      alternates: { canonical: `/truyen/${id}` },
      openGraph: {
        type: "article",
        title: manga.title,
        description,
        url: `/truyen/${id}`,
        images: manga.coverImagePath ? [{ url: manga.coverImagePath, alt: manga.title }] : [],
      },
    };
  } catch {
    return { title: "Đọc truyện" };
  }
}

export default function MangaLayout({ children }: Props) {
  return children;
}
