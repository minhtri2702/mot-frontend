"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, BookOpen, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getReadingHistory, clearReadingHistory, type ReadingHistoryEntry } from "@/lib/reading-history";

export default function LichSuDocPage() {
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHistory(getReadingHistory());
  }, []);

  const handleClear = () => {
    if (confirm("Bạn có chắc muốn xóa toàn bộ lịch sử đọc?")) {
      clearReadingHistory();
      setHistory([]);
    }
  };

  if (!mounted) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Lịch sử đọc truyện
          </h1>
          <p className="text-muted-foreground mt-1">
            Những truyện bạn đã đọc gần đây
          </p>
        </div>
        {history.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-1" />
            Xóa lịch sử
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Chưa có lịch sử đọc</h3>
          <p className="text-muted-foreground mb-6">
            Bạn chưa đọc truyện nào. Hãy khám phá và đọc ngay!
          </p>
          <Link href="/">
            <Button>
              <BookOpen className="h-4 w-4 mr-2" />
              Khám phá truyện
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <Link
              key={`${item.mangaId}-${item.chapterId}`}
              href={`/truyen/${item.mangaId}/chuong/${item.chapterId}`}
              className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors group"
            >
              <div className="h-16 w-12 rounded overflow-hidden shrink-0 bg-muted">
                {item.coverImagePath ? (
                  <img
                    src={item.coverImagePath}
                    alt={item.mangaTitle}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                  {item.mangaTitle}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  Chapter {item.chapterNumber}{item.chapterName ? `: ${item.chapterName}` : ""}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  {new Date(item.lastReadDate).toLocaleDateString("vi-VN", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
