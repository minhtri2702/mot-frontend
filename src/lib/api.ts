import { getFromCache, setToCache, generateCacheKey } from "./cache";

/**
 * Format large numbers to readable format (e.g., 1.5M, 200K)
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

/**
 * Format ISO date string to relative time (e.g., "2 giờ trước")
 */
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return date.toLocaleDateString("vi-VN");
}

// ============================================
// API Configuration
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Cache TTLs
const CACHE_TTL = {
  LISTING: 2 * 60 * 1000,      // 2 minutes for listing pages
  DETAIL: 5 * 60 * 1000,       // 5 minutes for manga detail
  CHAPTER: 10 * 60 * 1000,     // 10 minutes for chapter content
  SEARCH: 1 * 60 * 1000,       // 1 minute for search results
};

interface FetchOptions extends RequestInit {
  skipCache?: boolean;
  cacheTtl?: number;
}

/**
 * Generic fetch wrapper with caching
 */
async function cachedFetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { skipCache = false, cacheTtl, ...fetchOptions } = options;

  // Try cache first (unless skipCache is true)
  if (!skipCache) {
    const cacheKey = generateCacheKey(url);
    const cached = getFromCache<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Fetch from API
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();

  // Unwrap BaseResponse: { success, data, message } -> data
  const data = raw?.success === true ? raw.data : raw;

  // Cache the result
  if (!skipCache) {
    const cacheKey = generateCacheKey(url);
    setToCache(cacheKey, data, cacheTtl);
  }

  return data;
}

// ============================================
// Types matching Product Services DTOs
// ============================================

export interface MangaSummaryDTO {
  id: string;
  stt: number;
  title: string;
  coverImagePath: string;
  status: string;
  author: string;
  views: number;
  likes: number;
  followers: number;
  latestChapter: number;
  latestChapterUpdatedAt: string | null;
  genres: string[];
}

export interface MangaDetailDTO {
  id: string;
  stt: number;
  title: string;
  coverImagePath: string;
  status: string;
  description: string;
  author: string;
  alternativeTitles: string;
  createdDate: string;
  translationTeam: string;
  ageRating: string;
  likes: number;
  followers: number;
  views: number;
  realViews: number;
  latestChapter: number;
  latestChapterUpdatedAt: string;
  genres: string[];
  chapters: ChapterSummaryDTO[];
}

export interface ChapterSummaryDTO {
  id: number;
  chapterNumber: number;
  chapterName: string;
  viewCount: number;
  createdAt: string;
}

export interface ChapterDetailDTO {
  id: number;
  chapterNumber: number;
  chapterName: string;
  viewCount: number;
  createdAt: string;
  imageUrls: string[];
  navigation: ChapterNavigationDTO;
  mangaTitle?: string;
  mangaId?: string;
}

export interface ChapterNavigationDTO {
  prevChapterId: number | null;
  prevChapterNumber: number | null;
  nextChapterId: number | null;
  nextChapterNumber: number | null;
}

export interface GenreDTO {
  id: number;
  name: string;
  slug: string;
}

export interface PagedResponseDTO<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// ============================================
// Manga Listing APIs
// ============================================

/**
 * Get featured manga (for carousel)
 */
export async function getFeaturedManga(): Promise<MangaSummaryDTO[]> {
  const url = `${API_BASE_URL}/manga/featured`;
  return cachedFetch<MangaSummaryDTO[]>(url, { cacheTtl: CACHE_TTL.LISTING });
}

/**
 * Get latest updated manga
 */
export async function getLatestUpdates(page: number = 0, size: number = 20): Promise<PagedResponseDTO<MangaSummaryDTO>> {
  const url = `${API_BASE_URL}/manga/latest-updated?page=${page}&size=${size}`;
  // Skip cache for page 0 to always get fresh data, cache subsequent pages
  return cachedFetch<PagedResponseDTO<MangaSummaryDTO>>(url, { skipCache: page === 0, cacheTtl: CACHE_TTL.LISTING });
}

/**
 * Get hot/trending manga
 */
export async function getHotManga(page: number = 0, size: number = 20): Promise<PagedResponseDTO<MangaSummaryDTO>> {
  const url = `${API_BASE_URL}/manga/hot?page=${page}&size=${size}`;
  return cachedFetch<PagedResponseDTO<MangaSummaryDTO>>(url, { cacheTtl: CACHE_TTL.LISTING });
}

/**
 * Get new manga
 */
export async function getNewManga(page: number = 0, size: number = 20): Promise<PagedResponseDTO<MangaSummaryDTO>> {
  const url = `${API_BASE_URL}/manga/new?page=${page}&size=${size}`;
  return cachedFetch<PagedResponseDTO<MangaSummaryDTO>>(url, { cacheTtl: CACHE_TTL.LISTING });
}

/**
 * Get completed manga
 */
export async function getCompletedManga(page: number = 0, size: number = 20): Promise<PagedResponseDTO<MangaSummaryDTO>> {
  const url = `${API_BASE_URL}/manga/completed?page=${page}&size=${size}`;
  return cachedFetch<PagedResponseDTO<MangaSummaryDTO>>(url, { cacheTtl: CACHE_TTL.LISTING });
}

// ============================================
// Manga Detail APIs
// ============================================

/**
 * Get manga detail by ID
 */
export async function getMangaDetail(id: string): Promise<MangaDetailDTO> {
  const url = `${API_BASE_URL}/manga/${id}`;
  return cachedFetch<MangaDetailDTO>(url, { cacheTtl: CACHE_TTL.DETAIL });
}

// ============================================
// Chapter APIs
// ============================================

/**
 * Get chapter detail with images
 */
export async function getChapterDetail(mangaId: string, chapterId: number): Promise<ChapterDetailDTO> {
  const url = `${API_BASE_URL}/manga/${mangaId}/chapters/${chapterId}`;
  return cachedFetch<ChapterDetailDTO>(url, { cacheTtl: CACHE_TTL.CHAPTER });
}

// ============================================
// Search APIs
// ============================================

/**
 * Search manga by title
 */
export async function searchManga(keyword: string, page: number = 0, size: number = 20): Promise<PagedResponseDTO<MangaSummaryDTO>> {
  if (!keyword.trim()) {
    return { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true, first: true };
  }
  const url = `${API_BASE_URL}/manga/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`;
  return cachedFetch<PagedResponseDTO<MangaSummaryDTO>>(url, { cacheTtl: CACHE_TTL.SEARCH });
}

// ============================================
// Genre APIs
// ============================================

/**
 * Get all genres
 */
export async function getGenres(): Promise<GenreDTO[]> {
  const url = `${API_BASE_URL}/genres`;
  return cachedFetch<GenreDTO[]>(url, { cacheTtl: CACHE_TTL.DETAIL });
}

/**
 * Get manga by genre
 */
export async function getMangaByGenre(genreId: number, page: number = 0, size: number = 20): Promise<PagedResponseDTO<MangaSummaryDTO>> {
  const url = `${API_BASE_URL}/manga/genre/${genreId}?page=${page}&size=${size}`;
  return cachedFetch<PagedResponseDTO<MangaSummaryDTO>>(url, { cacheTtl: CACHE_TTL.LISTING });
}

// ============================================
// Related Manga API
// ============================================

/**
 * Get related manga by genre (for manga detail page)
 */
export async function getRelatedManga(id: string, page: number = 0, size: number = 12): Promise<PagedResponseDTO<MangaSummaryDTO>> {
  const url = `${API_BASE_URL}/manga/${id}/related?page=${page}&size=${size}`;
  return cachedFetch<PagedResponseDTO<MangaSummaryDTO>>(url, { cacheTtl: CACHE_TTL.LISTING });
}

// ============================================
// Reading History API
// ============================================

export interface ReadingHistoryDTO {
  mangaId: string;
  mangaTitle: string;
  coverImagePath: string;
  stt: number;
  chapterId: number;
  chapterNumber: number;
  chapterName: string;
  lastReadDate: string;
}

/**
 * Get reading history for a user
 */
export async function getReadingHistory(userId: string, limit: number = 10): Promise<ReadingHistoryDTO[]> {
  const url = `${API_BASE_URL}/user/${userId}/reading-history?limit=${limit}`;
  return cachedFetch<ReadingHistoryDTO[]>(url, { skipCache: true });
}

// ============================================
// Favorites API
// ============================================

export interface FavoriteDTO {
  mangaId: string;
  stt: number;
  title: string;
  coverImagePath: string;
  author: string;
  status: string;
  views: number;
  likes: number;
  followers: number;
  latestChapter: number | null;
  latestChapterUpdatedAt: string | null;
}

/**
 * Add manga to user's favorites
 */
export async function addFavorite(userId: string, mangaId: string): Promise<void> {
  const url = `${API_BASE_URL}/user/${userId}/favorites/${mangaId}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Failed to add favorite: ${response.status}`);
  }
}

/**
 * Remove manga from user's favorites
 */
export async function removeFavorite(userId: string, mangaId: string): Promise<void> {
  const url = `${API_BASE_URL}/user/${userId}/favorites/${mangaId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Failed to remove favorite: ${response.status}`);
  }
}

/**
 * Check if manga is in user's favorites
 */
export async function checkFavorite(userId: string, mangaId: string): Promise<boolean> {
  const url = `${API_BASE_URL}/user/${userId}/favorites/${mangaId}/check`;
  return cachedFetch<boolean>(url, { skipCache: true });
}

/**
 * Get user's favorite manga list
 */
export async function getFavorites(userId: string, page: number = 0, size: number = 20): Promise<PagedResponseDTO<FavoriteDTO>> {
  const url = `${API_BASE_URL}/user/${userId}/favorites?page=${page}&size=${size}`;
  return cachedFetch<PagedResponseDTO<FavoriteDTO>>(url, { cacheTtl: CACHE_TTL.LISTING });
}

// ============================================
// Image URL Helper
// ============================================


/**
 * Get cover image URL
 * Backend returns presigned URLs directly from MinIO/S3
 */
export function getCoverImageUrl(cover: string): string {
  if (!cover) return "/placeholder-cover.svg";
  return cover;
}

/**
 * Prefetch and cache data for a page
 */
export function prefetchMangaDetail(id: string): void {
  const url = `${API_BASE_URL}/manga/${id}`;
  cachedFetch(url, { cacheTtl: CACHE_TTL.DETAIL }).catch(() => {
    // Silent fail for prefetch
  });
}
