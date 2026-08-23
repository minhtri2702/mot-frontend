"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Heart, Reply, Edit2, Trash2, Send, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  toggleLikeComment,
  formatRelativeTime,
  type CommentDTO,
  type CommentRequest,
  type PagedResponseDTO,
} from "@/lib/api";
import Link from "next/link";

interface CommentSectionProps {
  mangaId: string;
}

export default function CommentSection({ mangaId }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [markAsSpoiler, setMarkAsSpoiler] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState(() => new Set<string>());

  const { data, isLoading } = useQuery({
    queryKey: ["comments", mangaId, page],
    queryFn: () => getComments(mangaId, page, 10, user?.id),
    staleTime: 30 * 1000,
  });

  const addMutation = useMutation({
    mutationFn: (req: CommentRequest) =>
      addComment(mangaId, req, user!.id, user!.username || user!.email || "User", user?.avatarUrl ?? undefined),
    onMutate: async (req) => {
      await queryClient.cancelQueries({ queryKey: ["comments", mangaId] });

      // Snapshot previous data for rollback
      const previousData = queryClient.getQueryData(["comments", mangaId, 0]);

      // Build optimistic comment
      const optimisticComment: CommentDTO = {
        id: "temp-" + Date.now(),
        mangaId,
        userId: user!.id,
        username: user!.username || user!.email || "User",
        avatarUrl: user?.avatarUrl ?? undefined,
        parentCommentId: req.parentCommentId || null,
        content: req.content,
        likeCount: 0,
        replyCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: [],
      };

      if (!req.parentCommentId) {
        // Root comment: add to page 0
        const oldData = queryClient.getQueryData<PagedResponseDTO<CommentDTO>>(["comments", mangaId, 0]);
        if (oldData) {
          queryClient.setQueryData<PagedResponseDTO<CommentDTO>>(["comments", mangaId, 0], {
            ...oldData,
            content: [optimisticComment, ...oldData.content],
            totalElements: oldData.totalElements + 1,
          });
        }
      } else {
        // Reply: add to parent's replies
        const allData = queryClient.getQueriesData<PagedResponseDTO<CommentDTO>>({ queryKey: ["comments", mangaId] });
        for (const [queryKey, data] of allData) {
          if (!data) continue;
          const updatedContent = data.content.map((c: CommentDTO) => {
            if (c.id === req.parentCommentId) {
              return {
                ...c,
                replies: [...(c.replies || []), optimisticComment],
                replyCount: c.replyCount + 1,
              };
            }
            return c;
          });
          queryClient.setQueryData(queryKey, { ...data, content: updatedContent });
        }
      }

      setNewComment("");
      setReplyContent("");
      setReplyTo(null);

      return { previousData };
    },
    onError: (_err, _req, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["comments", mangaId, 0], context.previousData);
      }
    },
    onSettled: () => {
      // Silently refetch in background to sync with server
      queryClient.invalidateQueries({ queryKey: ["comments", mangaId], refetchType: "none" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateComment(commentId, content, user!.id),
    onSuccess: () => {
      setEditingId(null);
      setEditContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", mangaId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId, user!.id),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments", mangaId] });
      const previousData = queryClient.getQueryData(["comments", mangaId, 0]);

      // Remove comment from all pages
      const allData = queryClient.getQueriesData<PagedResponseDTO<CommentDTO>>({ queryKey: ["comments", mangaId] });
      for (const [queryKey, data] of allData) {
        if (!data) continue;
        const filteredContent = data.content.filter((c: CommentDTO) => c.id !== commentId);
        queryClient.setQueryData(queryKey, { ...data, content: filteredContent, totalElements: data.totalElements - 1 });
      }

      return { previousData };
    },
    onError: (_err, _req, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["comments", mangaId, 0], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", mangaId], refetchType: "none" });
    },
  });

  const likeMutation = useMutation({
    mutationFn: (commentId: string) => toggleLikeComment(commentId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", mangaId] });
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim() || !isAuthenticated) return;
    addMutation.mutate({ content: markAsSpoiler ? `[spoiler]${newComment.trim()}[/spoiler]` : newComment.trim() });
    setMarkAsSpoiler(false);
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim() || !isAuthenticated) return;
    addMutation.mutate({ content: replyContent.trim(), parentCommentId: parentId });
  };

  const handleUpdateComment = (commentId: string) => {
    if (!editContent.trim()) return;
    updateMutation.mutate({ commentId, content: editContent.trim() });
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm("Bạn có chắc muốn xoá bình luận này?")) {
      deleteMutation.mutate(commentId);
    }
  };

  const handleLike = (commentId: string) => {
    if (!isAuthenticated) return;
    likeMutation.mutate(commentId);
  };

  const startEdit = (comment: CommentDTO) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const renderComment = (comment: CommentDTO, isReply = false) => {
    const isOwner = isAuthenticated && user?.id === comment.userId;
    const isEditing = editingId === comment.id;
    const isSpoiler = comment.content.startsWith("[spoiler]") && comment.content.endsWith("[/spoiler]");
    const visibleContent = isSpoiler ? comment.content.slice(9, -10) : comment.content;

    return (
      <div key={comment.id} className={`${isReply ? "ml-10 mt-3" : "border-b pb-4 mb-4 last:border-0"}`}>
        <div className="flex gap-3">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={comment.avatarUrl} />
            <AvatarFallback className="text-xs">
              {comment.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{comment.username}</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateComment(comment.id)}
                    disabled={updateMutation.isPending}
                  >
                    Lưu
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit}>
                    Huỷ
                  </Button>
                </div>
              </div>
            ) : (
              isSpoiler && !revealedSpoilers.has(comment.id) ? (
                <button
                  type="button"
                  onClick={() => setRevealedSpoilers((current) => new Set(current).add(comment.id))}
                  className="flex w-full items-center gap-2 rounded-lg bg-muted px-3 py-3 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <EyeOff className="h-4 w-4" /> Nội dung có spoiler, nhấn để xem
                </button>
              ) : <p className="whitespace-pre-wrap text-sm text-foreground/90">{visibleContent}</p>
            )}

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => handleLike(comment.id)}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  comment.isLiked
                    ? "text-red-500"
                    : "text-muted-foreground hover:text-red-500"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${comment.isLiked ? "fill-current" : ""}`} />
                {comment.likeCount > 0 && comment.likeCount}
              </button>

              {!isReply && (
                <button
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Reply className="h-3.5 w-3.5" />
                  Trả lời
                  {comment.replyCount > 0 && ` (${comment.replyCount})`}
                </button>
              )}

              {isOwner && !isEditing && (
                <>
                  <button
                    onClick={() => startEdit(comment)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xoá
                  </button>
                </>
              )}
            </div>

            {/* Reply form */}
            {replyTo === comment.id && isAuthenticated && (
              <div className="mt-3 flex gap-2">
                <Textarea
                  placeholder="Viết trả lời..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[40px] text-sm flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={addMutation.isPending || !replyContent.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2">
                {comment.replies.map((reply) => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-xl border bg-card p-4 mt-8">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        Bình luận
        {data && data.totalElements > 0 && (
          <span className="text-sm font-normal text-muted-foreground">
            ({data.totalElements})
          </span>
        )}
      </h3>

      {/* Comment form */}
      {isAuthenticated ? (
        <div className="flex gap-3 mb-6">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="text-xs">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Viết bình luận..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
              maxLength={2000}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={markAsSpoiler} onChange={(event) => setMarkAsSpoiler(event.target.checked)} className="accent-primary" />
                Che nội dung spoiler
              </label>
              <span className="ml-auto text-xs text-muted-foreground">{newComment.length}/2000</span>
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={addMutation.isPending || !newComment.trim()}
              >
                {addMutation.isPending ? "Đang gửi..." : "Gửi bình luận"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 mb-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline font-medium">
              Đăng nhập
            </Link>{" "}
            để bình luận
          </p>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-24" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : data && data.content.length > 0 ? (
        <>
          <div>
            {data.content.map((comment) => renderComment(comment))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={data.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Trước
              </Button>
              <span className="flex items-center text-sm text-muted-foreground px-2">
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
        </>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-8">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </p>
      )}
    </div>
  );
}
