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

    // Remove old entry for the same manga (if exists)
    const filtered = history.filter((h) => h.mangaId !== entry.mangaId);

    // Convert cover image to small base64 thumbnail
    let coverData = entry.coverImagePath;
    if (coverData && !coverData.startsWith("data:")) {
      coverData = await urlToThumbnailBase64(coverData);
    }

    const cleanEntry = {
      ...entry,
      coverImagePath: coverData,
    };

    // Add new entry to the top
    filtered.unshift(cleanEntry);

    // Limit max items
    const trimmed = filtered.slice(0, MAX_ITEMS);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
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
