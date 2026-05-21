"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import Link from "next/link";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchManga, getCoverImageUrl } from "@/lib/api";
import type { MangaSummaryDTO } from "@/lib/api";

interface SearchResult {
  id: string;
  title: string;
  cover: string;
  chapter?: number | null;
  author?: string;
  views?: number;
  genres?: string[];
}

// Memoized search result item
const SearchResultItem = memo(function SearchResultItem({
  item,
  isSelected,
  onSelect,
}: {
  item: SearchResult;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Link
      href={`/truyen/${item.id}`}
      onClick={onSelect}
      className={`flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors ${
        isSelected ? "bg-muted" : ""
      }`}
    >
      <div className="relative w-10 h-14 rounded overflow-hidden shrink-0 bg-muted">
        <img
          src={getCoverImageUrl(item.cover)}
          alt={item.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-cover.svg";
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {item.author && <span className="truncate max-w-[120px]">{item.author}</span>}
          {item.chapter && <span>• Chương {item.chapter}</span>}
          {item.views && item.views > 0 && <span>• {item.views >= 1000 ? `${(item.views / 1000).toFixed(1)}K` : item.views} lượt xem</span>}
        </div>
        {item.genres && item.genres.length > 0 && (
          <div className="flex gap-1 mt-0.5">
            {item.genres.slice(0, 3).map((g) => (
              <span key={g} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
});

export default function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Open dialog on Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "/" && !isOpen && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Search logic with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    setLoading(true);

    // Debounce search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchManga(query.trim(), 0, 8);
        setResults(
          data.content.map((m: MangaSummaryDTO) => ({
            id: m.id,
            title: m.title,
            cover: m.coverImagePath,
            chapter: m.latestChapter,
            author: m.author,
            views: m.views,
            genres: m.genres,
          }))
        );
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          window.location.href = `/truyen/${selected.id}`;
          setIsOpen(false);
        }
      }
    },
    [results, selectedIndex]
  );

  const closeDialog = useCallback(() => setIsOpen(false), []);

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
        title="Tìm kiếm"
      >
        <Search className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm">
      <div
        ref={dialogRef}
        className="w-full max-w-lg mx-4 bg-background rounded-xl shadow-2xl border overflow-hidden"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Tìm truyện... (gõ để tìm kiếm)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 p-0 shadow-none focus-visible:ring-0 text-base"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">ESC</span>
          </kbd>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={closeDialog}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : query.trim() && results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Không tìm thấy truyện &ldquo;{query}&rdquo;</p>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((item, index) => (
                <SearchResultItem
                  key={item.id}
                  item={item}
                  isSelected={index === selectedIndex}
                  onSelect={closeDialog}
                />
              ))}
              {/* Xem tất cả kết quả */}
              <Link
                href={`/tim-kiem?q=${encodeURIComponent(query)}`}
                onClick={closeDialog}
                className="flex items-center justify-center gap-1 px-4 py-2.5 text-sm text-primary hover:bg-muted/50 transition-colors border-t mt-1"
              >
                Xem tất cả kết quả cho &ldquo;{query}&rdquo;
              </Link>
            </div>
          ) : !query.trim() ? (
            <div className="px-4 py-3">
              <p className="text-xs text-muted-foreground mb-2">Gợi ý:</p>
              <div className="flex flex-wrap gap-2">
                {["One Piece", "Jujutsu Kaisen", "Chainsaw Man", "Demon Slayer"].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setQuery(suggestion)}
                      className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer hint */}
        <div className="border-t px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground">
          <span>↑↓ Điều hướng</span>
          <span>↵ Chọn</span>
          <span>Esc Đóng</span>
        </div>
      </div>
    </div>
  );
}
