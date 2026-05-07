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


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

  const data = await response.json();

  // Cache the result
  if (!skipCache) {
    const cacheKey = generateCacheKey(url);
    setToCache(cacheKey, data, cacheTtl);
  }

  return data;
}

// ============================================
// Manga Listing APIs
// ============================================

export interface MangaListParams {
  page?: number;
  limit?: number;
  sort?: "latest" | "views" | "likes" | "followers";
  genre?: string;
  status?: string;
  country?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiData = any;

export interface MangaListResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any[];
  totalPages: number;
  totalElements: number;
  page: number;
  limit: number;
}

/**
 * Get manga listing with pagination
 */
export async function getMangaList(params: MangaListParams = {}): Promise<MangaListResponse> {
  const { page = 1, limit = 24, sort = "latest", genre, status, country } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort,
  });

  if (genre) queryParams.set("genre", genre);
  if (status) queryParams.set("status", status);
  if (country) queryParams.set("country", country);

  const url = `${API_BASE_URL}/api/manga?${queryParams.toString()}`;

  return cachedFetch<MangaListResponse>(url, { cacheTtl: CACHE_TTL.LISTING });
}

/**
 * Get latest updated manga
 */
export async function getLatestUpdates(page: number = 1): Promise<MangaListResponse> {
  return getMangaList({ page, sort: "latest" });
}

/**
 * Get trending manga
 */
export async function getTrendingManga(page: number = 1): Promise<MangaListResponse> {
  return getMangaList({ page, sort: "views" });
}

/**
 * Get featured manga (for carousel)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getFeaturedManga(): Promise<any[]> {
  const url = `${API_BASE_URL}/api/manga/featured`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return cachedFetch<any[]>(url, { cacheTtl: CACHE_TTL.LISTING });
}

// ============================================
// Manga Detail APIs
// ============================================

export interface MangaDetail {
  id: string;
  title: string;
  cover: string;
  description: string;
  author: string;
  status: string;
  views: number;
  likes: number;
  followers: number;
  genres: { id: number; name: string; slug: string }[];
  chapters: { id: string; number: number; title: string; updatedAt: string }[];
}

/**
 * Get manga detail by ID
 */
export async function getMangaDetail(id: string): Promise<MangaDetail> {
  const url = `${API_BASE_URL}/api/manga/${id}`;
  return cachedFetch<MangaDetail>(url, { cacheTtl: CACHE_TTL.DETAIL });
}

/**
 * Get related manga by genre
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getRelatedManga(mangaId: string, limit: number = 6): Promise<any[]> {
  const url = `${API_BASE_URL}/api/manga/${mangaId}/related?limit=${limit}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return cachedFetch<any[]>(url, { cacheTtl: CACHE_TTL.DETAIL });
}

// ============================================
// Chapter APIs
// ============================================

export interface ChapterDetail {
  mangaId: string;
  mangaTitle: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  images: string[];
  prevChapterId: string | null;
  nextChapterId: string | null;
}

/**
 * Get chapter images and info
 */
export async function getChapterDetail(mangaId: string, chapterId: string): Promise<ChapterDetail> {
  const url = `${API_BASE_URL}/api/manga/${mangaId}/chuong/${chapterId}`;
  return cachedFetch<ChapterDetail>(url, { cacheTtl: CACHE_TTL.CHAPTER });
}

// ============================================
// Search APIs
// ============================================

export interface SearchResult {
  id: string;
  title: string;
  cover: string;
  chapter?: number | null;
}

/**
 * Search manga by title
 */
export async function searchManga(query: string, limit: number = 8): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const url = `${API_BASE_URL}/api/manga/search?q=${encodeURIComponent(query)}&limit=${limit}`;
  return cachedFetch<SearchResult[]>(url, { cacheTtl: CACHE_TTL.SEARCH });
}

// ============================================
// Genre APIs
// ============================================

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

/**
 * Get all genres
 */
export async function getGenres(): Promise<Genre[]> {
  const url = `${API_BASE_URL}/api/genres`;
  return cachedFetch<Genre[]>(url, { cacheTtl: CACHE_TTL.DETAIL });
}

// ============================================
// Image URL Helper
// ============================================

/**
 * Get optimized cover image URL
 * Falls back to original if no optimization needed
 */
export function getCoverImageUrl(cover: string): string {
  if (!cover) return "/placeholder-cover.svg";
  if (cover.startsWith("http")) return cover;
  return `${API_BASE_URL}/images/${cover}`;
}

/**
 * Prefetch and cache data for a page
 * Useful for hover/prefetch optimization
 */
export function prefetchMangaDetail(id: string): void {
  const url = `${API_BASE_URL}/api/manga/${id}`;
  // Just trigger the fetch, result will be cached automatically
  cachedFetch(url, { cacheTtl: CACHE_TTL.DETAIL }).catch(() => {
    // Silent fail for prefetch
  });
}
