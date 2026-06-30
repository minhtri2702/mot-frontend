/**
 * Type definitions matching the crawler database models.
 * These types represent the data structure from the backend API.
 */

// ==================== Manga Types ====================

export interface Manga {
  id: string; // UUID
  stt: number;
  title: string;
  url: string;
  cover_image_path: string | null;
  status: string | null;
  description: string | null;
  author: string | null;
  alternative_titles: string | null;
  created_date: string | null;
  translation_team: string | null;
  age_rating: string | null;
  likes: number | null;
  followers: number | null;
  views: number | null;
  max_chapter_crawled: number | null;
  created_at: string;
  updated_at: string;
  genres: Genre[];
  chapters: Chapter[];
}

export interface MangaListItem {
  id: string; // UUID
  stt: number;
  title: string;
  url: string;
  cover_image_path: string | null;
  status: string | null;
  author: string | null;
  likes: number | null;
  followers: number | null;
  views: number | null;
  max_chapter_crawled: number | null;
  updated_at: string;
  genres: Genre[];
  latest_chapter?: {
    chapter_number: number;
    chapter_name: string;
    url: string;
  };
}

// ==================== Chapter Types ====================

export interface Chapter {
  id: number;
  manga_id: string; // UUID
  chapter_number: number;
  chapter_name: string | null;
  url: string;
  created_at: string;
  images: ChapterImage[];
}

export interface ChapterImage {
  id: number;
  chapter_id: number;
  image_url: string;
  image_path: string | null;
  page_order: number;
  created_at: string;
}

// ==================== Genre Types ====================

export interface Genre {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

// Simplified genre type for API responses that may not include created_at
export interface GenreSimple {
  id: number;
  name: string;
  slug: string;
}

// ==================== Crawl Error Log Types ====================

export interface CrawlErrorLog {
  id: string; // UUID
  manga_id: string; // UUID
  chapter_id: number | null;
  chapter_number: number;
  chapter_url: string;
  error_type: string;
  error_message: string | null;
  retry_count: number;
  last_attempt: string;
  resolved: number; // 0=unresolved, 1=resolved
  created_at: string;
}

// ==================== API Response Types ====================

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // current page (0-based)
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

// ==================== Frontend Display Types ====================

export interface MangaCardData {
  id: string;
  stt: number;
  title: string;
  cover: string;
  description?: string;
  author?: string;
  views: number | null;
  followers: number | null;
  likes: number | null;
  chapter?: number | null;
  updatedAt?: string;
  status?: string | null;
  genres?: GenreSimple[];
}

export interface FeaturedMangaData {
  id: string;
  stt: number;
  title: string;
  cover: string;
  description: string;
  genres: GenreSimple[];
  likes: number | null;
  followers: number | null;
  views: number | null;
  latestChapter: number | null;
}

export interface MangaDetailData {
  id: string;
  stt: number;
  title: string;
  altTitles: string[];
  cover: string;
  description: string;
  status: string;
  author: string;
  translation_team: string | null;
  age_rating: string | null;
  created_date: string | null;
  genres: GenreSimple[];
  likes: number | null;
  followers: number | null;
  views: number | null;
  chapters: ChapterListItem[];
}

export interface ChapterListItem {
  id: number;
  chapter_number: number;
  chapter_name: string;
  url: string;
  created_at: string;
}

export interface ChapterReaderData {
  manga: {
    id: string;
    title: string;
    cover: string;
  };
  chapter: {
    id: number;
    number: number;
    title: string;
    prevChapter: number | null;
    nextChapter: number | null;
    images: ChapterImageData[];
  };
}

export interface ChapterImageData {
  id: number;
  url: string;
  width: number;
  height: number;
  page_order: number;
}
