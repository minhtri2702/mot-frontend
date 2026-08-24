/**
 * Reading history stored in localStorage (no login required)
 * Syncs to server when user is logged in
 */

export interface ReadingHistoryEntry {
  mangaId: string;
  mangaTitle: string;
  /** Base64 data URL of cover image (thumbnail, ~5-10KB) */
  coverImagePath: string;
  stt: number;
  chapterId: number;
  chapterNumber: number;
  chapterName: string;
  lastReadDate: string;
}

const HISTORY_KEY = "mot_reading_history";
const MAX_ITEMS = 50;

/**
 * Fetch an image and convert it to a small base64 thumbnail (~5-10KB).
 * This ensures the image is stored permanently in localStorage without taking too much space.
 */
async function urlToThumbnailBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Use canvas to resize to thumbnail (80px width)
    const img = await createImageBitmap(blob);
    const maxWidth = 80;
    const scale = maxWidth / img.width;
    const width = maxWidth;
    const height = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, width, height);
    img.close();

    // Export as JPEG with 60% quality (small file size)
    return canvas.toDataURL("image/jpeg", 0.6);
  } catch {
    return imageUrl; // fallback: keep original URL
  }
}

/**
 * Save a reading history entry to localStorage.
 * Automatically converts cover image to small base64 thumbnail for permanent storage.
 */
export async function saveReadingHistory(entry: ReadingHistoryEntry): Promise<void> {
  try {
    const history = getReadingHistory();
    const previous = history.find((item) => item.mangaId === entry.mangaId);
    const filtered = history.filter((h) => h.mangaId !== entry.mangaId);

    // Persist the chapter immediately. Thumbnail conversion may take seconds
    // and must never delay or overwrite a newer reading position.
    const immediateEntry = {
      ...entry,
      coverImagePath: entry.coverImagePath || previous?.coverImagePath || "",
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify([immediateEntry, ...filtered].slice(0, MAX_ITEMS)));

    if (entry.coverImagePath && !entry.coverImagePath.startsWith("data:")) {
      const coverData = await urlToThumbnailBase64(entry.coverImagePath);
      const latest = getReadingHistory();
      const latestEntry = latest.find((item) => item.mangaId === entry.mangaId);
      if (latestEntry?.chapterId !== entry.chapterId || latestEntry.lastReadDate !== entry.lastReadDate) return;
      localStorage.setItem(HISTORY_KEY, JSON.stringify(latest.map((item) =>
        item.mangaId === entry.mangaId ? { ...item, coverImagePath: coverData } : item
      )));
    }
  } catch {
    // localStorage might be full or unavailable
  }
}

/**
 * Get all reading history from localStorage
 */
export function getReadingHistory(): ReadingHistoryEntry[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Get reading history for a specific manga
 */
export function getMangaReadingHistory(mangaId: string): ReadingHistoryEntry | null {
  const history = getReadingHistory();
  return history.find((h) => h.mangaId === mangaId) ?? null;
}

/**
 * Clear all reading history
 */
export function clearReadingHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Remove a specific manga from reading history
 */
export function removeFromHistory(mangaId: string): void {
  try {
    const history = getReadingHistory();
    const filtered = history.filter((h) => h.mangaId !== mangaId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore
  }
}
