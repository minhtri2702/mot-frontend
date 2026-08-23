"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getFavorites, getReadingHistory, getUserComments, getCoverImageUrl, formatRelativeTime, formatNumber } from "@/lib/api";
import { getReadingHistory as getLocalReadingHistory } from "@/lib/reading-history";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Heart,
  MessageSquare,
  BookOpen,
  ChevronRight,
  Clock,
  LogOut,
} from "lucide-react";

// ===== Tab: Thông tin cá nhân =====

function ProfileInfo({ user }: { user: NonNullable<ReturnType<typeof useAuth>["user"]> }) {
  const initials = (user.username || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Avatar + Info Card */}
      <div id="account" className="scroll-mt-24 flex flex-col items-center gap-5 rounded-xl border bg-card/50 p-6 backdrop-blur-sm sm:flex-row sm:items-start">
        <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-primary/20">
          <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left space-y-2">
          <h1 className="text-2xl font-bold">{user.username}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
            {user.roles.map((role) => (
              <Badge key={role} variant="secondary" className="text-xs">
                {role === "ROLE_ADMIN" ? "Quản trị viên" : "Thành viên"}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Tab: Tổng quan =====

function OverviewTab({
  user,
  onOpenComments,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  onOpenComments: () => void;
}) {
  const [localHistory, setLocalHistory] = useState(() => getLocalReadingHistory());
  const { data: serverHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["profile-reading-history", user.id],
    queryFn: () => getReadingHistory(user.id, 6),
    staleTime: 60 * 1000,
  });
  const { data: favorites } = useQuery({
    queryKey: ["profile-favorites-count", user.id],
    queryFn: () => getFavorites(user.id, 0, 1),
    staleTime: 2 * 60 * 1000,
  });
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["profile-comments-preview", user.id],
    queryFn: () => getUserComments(user.id, 0, 3),
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    const refreshHistory = () => setLocalHistory(getLocalReadingHistory());
    window.addEventListener("focus", refreshHistory);
    return () => window.removeEventListener("focus", refreshHistory);
  }, []);

  const recentReading = serverHistory.length > 0
    ? serverHistory.map((item) => ({
        mangaId: item.mangaId,
        mangaTitle: item.mangaTitle,
        coverImagePath: item.coverImagePath,
        chapterId: item.chapterId,
        chapterLabel: `Chương ${item.chapterNumber}`,
        lastReadDate: item.lastReadDate,
      }))
    : localHistory.slice(0, 6).map((item) => ({
        mangaId: item.mangaId,
        mangaTitle: item.mangaTitle,
        coverImagePath: item.coverImagePath,
        chapterId: item.chapterId,
        chapterLabel: `Chương ${item.chapterNumber}`,
        lastReadDate: item.lastReadDate,
      }));

  return (
    <div className="space-y-8">
      <ProfileInfo user={user} />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card/50 p-4">
          <Heart className="mb-3 h-5 w-5 text-red-500" />
          <p className="text-2xl font-bold">{favorites?.totalElements ?? "—"}</p>
          <p className="text-sm text-muted-foreground">Truyện yêu thích</p>
        </div>
        <div className="rounded-xl border bg-card/50 p-4">
          <MessageSquare className="mb-3 h-5 w-5 text-blue-500" />
          <p className="text-2xl font-bold">{comments?.totalElements ?? "—"}</p>
          <p className="text-sm text-muted-foreground">Bình luận đã viết</p>
        </div>
      </div>

      <section aria-labelledby="recent-reading-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="recent-reading-title" className="flex items-center gap-2 text-lg font-semibold">
              <BookOpen className="h-5 w-5" />
              Đọc gần đây
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Tiếp tục từ chương bạn đang đọc dở.</p>
          </div>
        </div>

        {historyLoading && recentReading.length === 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : recentReading.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {recentReading.map((item) => (
              <Link
                key={`${item.mangaId}-${item.chapterId}`}
                href={`/truyen/${item.mangaId}/chuong/${item.chapterId}`}
                className="group flex min-w-0 gap-3 rounded-xl border bg-card/50 p-3 transition-colors hover:bg-card"
              >
                <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                  <img
                    src={getCoverImageUrl(item.coverImagePath)}
                    alt={item.mangaTitle}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    onError={(event) => { event.currentTarget.src = "/placeholder-cover.svg"; }}
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <p className="line-clamp-2 text-sm font-medium group-hover:text-primary">{item.mangaTitle}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.chapterLabel}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(item.lastReadDate)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 self-center text-muted-foreground" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed px-4 py-10 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Bạn chưa đọc truyện nào.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/truyen-moi-cap-nhat">Tìm truyện để đọc</Link>
            </Button>
          </div>
        )}
      </section>

      <section aria-labelledby="recent-comments-title">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="recent-comments-title" className="flex items-center gap-2 text-lg font-semibold">
            <MessageSquare className="h-5 w-5" />
            Bình luận mới nhất
          </h2>
          {(comments?.totalElements ?? 0) > 3 && (
            <Button variant="ghost" size="sm" onClick={onOpenComments}>
              Xem tất cả <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {commentsLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-muted" />)}</div>
        ) : comments?.content.length ? (
          <div className="space-y-3">
            {comments.content.map((comment) => (
              <Link
                key={comment.id}
                href={`/truyen/${comment.mangaId}`}
                className="block rounded-xl border bg-card/50 p-4 transition-colors hover:bg-card"
              >
                <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>{formatRelativeTime(comment.createdAt)}</span>
                  <span>{comment.likeCount} lượt thích · {comment.replyCount} phản hồi</span>
                </div>
                <p className="line-clamp-3 text-sm leading-6">{comment.content}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            Bạn chưa viết bình luận nào.
          </div>
        )}
      </section>
    </div>
  );
}

// ===== Tab: Truyện yêu thích =====

function FavoritesTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useQuery({
    queryKey: ["profile-favorites", userId, page],
    queryFn: () => getFavorites(userId, page, 12),
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || data.content.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">Bạn chưa yêu thích truyện nào</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/truyen-moi-cap-nhat">Khám phá truyện</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {data.content.map((fav) => (
          <Link
            key={fav.mangaId}
            href={`/truyen/${fav.mangaId}`}
            className="group block"
          >
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
              <img
                src={getCoverImageUrl(fav.coverImagePath)}
                alt={fav.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = "/placeholder-cover.svg"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-white text-xs font-medium truncate">
                  {fav.latestChapter ? `Ch. ${fav.latestChapter}` : "Mới"}
                </p>
              </div>
            </div>
            <p className="text-sm font-medium mt-1.5 line-clamp-2 group-hover:text-primary transition-colors">
              {fav.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatNumber(fav.views)} lượt xem
            </p>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={data.first}
            onClick={() => setPage((p) => p - 1)}
          >
            Trước
          </Button>
          <span className="flex items-center text-sm text-muted-foreground px-3">
            {data.page + 1} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={data.last}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}

// ===== Tab: Bình luận =====

function CommentsTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useQuery({
    queryKey: ["profile-comments", userId, page],
    queryFn: () => getUserComments(userId, page, 10),
    staleTime: 30 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg border bg-card/50 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-2" />
            <div className="h-3 bg-muted rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.content.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">Bạn chưa có bình luận nào</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/truyen-moi-cap-nhat">Khám phá truyện</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.content.map((comment) => (
        <div
          key={comment.id}
          className="p-4 rounded-lg border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors"
        >
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={comment.avatarUrl || undefined} alt={comment.username} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {(comment.username || "U")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{comment.username}</span>
          <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-foreground/80 line-clamp-3">
                {comment.content}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {comment.likeCount}
                </span>
                {comment.replyCount > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {comment.replyCount} phản hồi
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={data.first}
            onClick={() => setPage((p) => p - 1)}
          >
            Trước
          </Button>
          <span className="flex items-center text-sm text-muted-foreground px-3">
            {data.page + 1} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={data.last}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}

// ===== Main Profile Page =====

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, authLoading, isAuthenticated, router]);

  if (!mounted || authLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-32 bg-muted rounded-xl" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  return (
    <div className="container py-6 md:py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Trang cá nhân</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý thông tin và hoạt động của bạn
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-destructive hover:text-destructive gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
            <TabsTrigger value="overview" className="gap-1.5">
              <User className="h-4 w-4" />
              <span>Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-1.5">
              <Heart className="h-4 w-4" />
              <span>Yêu thích</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-1.5">
              <MessageSquare className="h-4 w-4" />
              <span>Bình luận</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab user={user} onOpenComments={() => setActiveTab("comments")} />
          </TabsContent>

          <TabsContent value="favorites">
            <FavoritesTab userId={user.id} />
          </TabsContent>

          <TabsContent value="comments">
            <CommentsTab userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
