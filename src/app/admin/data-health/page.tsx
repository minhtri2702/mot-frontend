"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, BookImage, ChevronLeft, ChevronRight, Copy, ImageOff, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  getChaptersWithoutImages,
  getDataHealthSummary,
  enqueueCrawlRepair,
  getChapterReports,
  getCrawlRepairJob,
  type ChapterReportDTO,
  type DataHealthIssueDTO,
  type DataHealthSummaryDTO,
} from "@/lib/api";

const PAGE_SIZE = 25;

export default function DataHealthPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [summary, setSummary] = useState<DataHealthSummaryDTO | null>(null);
  const [issues, setIssues] = useState<DataHealthIssueDTO[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repairing, setRepairing] = useState<Record<number, string>>({});
  const [reports, setReports] = useState<ChapterReportDTO[]>([]);
  const pollTimers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const isAdmin = Boolean(user?.roles.includes("ROLE_ADMIN"));

  const loadHealth = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const [summaryData, issueData, reportData] = await Promise.all([
        getDataHealthSummary(),
        getChaptersWithoutImages(page, PAGE_SIZE),
        getChapterReports(),
      ]);
      setSummary(summaryData);
      setIssues(issueData.content);
      setTotalPages(issueData.totalPages);
      setTotalElements(issueData.totalElements);
      setReports(reportData.content);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể kiểm tra dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, page]);

  useEffect(() => { void loadHealth(); }, [loadHealth]);
  useEffect(() => () => { pollTimers.current.forEach(clearTimeout); }, []);

  if (authLoading) {
    return <div className="container py-16 text-sm text-muted-foreground">Đang kiểm tra quyền truy cập...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center">
        <ShieldCheck className="mx-auto h-8 w-8 text-primary" />
        <h1 className="mt-4 text-2xl font-semibold">Khu vực quản trị</h1>
        <p className="mt-2 text-sm text-muted-foreground">Bạn cần đăng nhập bằng tài khoản quản trị.</p>
        <Button asChild className="mt-5"><Link href="/login">Đăng nhập</Link></Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-20 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-primary" />
        <h1 className="mt-4 text-2xl font-semibold">Không có quyền truy cập</h1>
        <p className="mt-2 text-sm text-muted-foreground">Dashboard chỉ dành cho quản trị viên.</p>
      </div>
    );
  }

  const metrics = [
    { label: "Chapter chưa có ảnh", value: summary?.chaptersWithoutImages, icon: ImageOff },
    { label: "Ảnh thiếu đường dẫn", value: summary?.imagesWithoutPath, icon: BookImage },
    { label: "Trang bị trùng thứ tự", value: summary?.duplicatePageOrders, icon: Copy },
    { label: "Truyện chưa có bìa", value: summary?.mangaWithoutCover, icon: AlertTriangle },
  ];

  async function repairChapter(chapterId: number, reportId?: number) {
    setRepairing((current) => ({ ...current, [chapterId]: "Đang xếp hàng…" }));
    try {
      const job = await enqueueCrawlRepair(chapterId, reportId);
      setRepairing((current) => ({ ...current, [chapterId]: labelForJob(job.status) }));
      if (job.status === "QUEUED" || job.status === "RUNNING") pollJob(job.id, chapterId, 0);
    } catch {
      setRepairing((current) => ({ ...current, [chapterId]: "Không thể gửi" }));
    }
  }

  function labelForJob(status: string) {
    if (status === "RUNNING") return "Đang crawl…";
    if (status === "SUCCEEDED") return "Hoàn tất";
    if (status === "FAILED") return "Thất bại";
    return "Đã xếp hàng";
  }

  function pollJob(jobId: string, chapterId: number, attempt: number) {
    if (attempt >= 60) {
      setRepairing((current) => ({ ...current, [chapterId]: "Quá thời gian" }));
      clearRepairLabel(chapterId);
      return;
    }
    const timer = setTimeout(async () => {
      pollTimers.current.delete(timer);
      try {
        const job = await getCrawlRepairJob(jobId);
        setRepairing((current) => ({ ...current, [chapterId]: labelForJob(job.status) }));
        if (job.status === "QUEUED" || job.status === "RUNNING") {
          pollJob(jobId, chapterId, attempt + 1);
        } else if (job.status === "SUCCEEDED") {
          await loadHealth();
        } else {
          clearRepairLabel(chapterId);
        }
      } catch {
        pollJob(jobId, chapterId, attempt + 1);
      }
    }, 5000);
    pollTimers.current.add(timer);
  }

  function clearRepairLabel(chapterId: number) {
    const timer = setTimeout(() => setRepairing((current) => {
      const next = { ...current };
      delete next[chapterId];
      return next;
    }), 4000);
    pollTimers.current.add(timer);
  }

  return (
    <main className="container py-6 md:py-10">
      <header className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-primary">Quản trị dữ liệu</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Sức khỏe thư viện</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Báo cáo chỉ đọc, chỉ chạy khi mở trang hoặc bấm kiểm tra lại. Không có tác vụ quét nền.
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadHealth()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Kiểm tra lại
        </Button>
      </header>

      <section className="grid grid-cols-2 gap-3 py-6 lg:grid-cols-4" aria-label="Tổng quan lỗi dữ liệu">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl bg-muted/55 p-4 ring-1 ring-border/70">
            <div className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4" /><span className="text-xs font-medium">{label}</span></div>
            <p className="mt-3 text-2xl font-semibold tabular-nums">{value ?? "—"}</p>
          </div>
        ))}
      </section>

      {error && <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      <section aria-labelledby="missing-images-title">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 id="missing-images-title" className="text-xl font-semibold">Chapter chưa có ảnh</h2>
            <p className="mt-1 text-sm text-muted-foreground">{totalElements} bản ghi cần kiểm tra hoặc crawl lại.</p>
          </div>
          {summary?.checkedAt && <time className="hidden text-xs text-muted-foreground sm:block">Cập nhật {new Date(summary.checkedAt).toLocaleString("vi-VN")}</time>}
        </div>

        <div className="overflow-hidden rounded-xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-muted/70 text-xs text-muted-foreground">
                <tr><th className="px-4 py-3 font-semibold">Truyện</th><th className="px-4 py-3 font-semibold">Chapter</th><th className="px-4 py-3 font-semibold">ID</th><th className="px-4 py-3 text-right font-semibold">Thao tác</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {issues.map((issue) => (
                  <tr key={issue.chapterId} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{issue.mangaTitle}</td>
                    <td className="px-4 py-3 text-muted-foreground">{issue.chapterName || `Chương ${issue.chapterNumber}`}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{issue.chapterId}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild><Link href={`/truyen/${issue.mangaId}/chuong/${issue.chapterId}`}>Mở chapter</Link></Button>
                        <Button size="sm" onClick={() => void repairChapter(issue.chapterId)} disabled={Boolean(repairing[issue.chapterId])}>
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />{repairing[issue.chapterId] || "Crawl lại"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && issues.length === 0 && <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">Không phát hiện chapter thiếu ảnh.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="mr-1 h-4 w-4" /> Trước</Button>
          <span className="px-2 text-xs text-muted-foreground">Trang {totalPages === 0 ? 0 : page + 1}/{totalPages}</span>
          <Button variant="outline" size="sm" disabled={page + 1 >= totalPages || loading} onClick={() => setPage((value) => value + 1)}>Sau <ChevronRight className="ml-1 h-4 w-4" /></Button>
        </div>
      </section>

      <section className="mt-10 border-t border-border pt-7" aria-labelledby="reader-reports-title">
        <h2 id="reader-reports-title" className="text-xl font-semibold">Người đọc báo lỗi</h2>
        <p className="mt-1 text-sm text-muted-foreground">10 báo cáo gần nhất; crawler vẫn xử lý tuần tự qua Kafka.</p>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          {reports.map((report) => (
            <div key={report.id} className="grid gap-2 border-b border-border px-4 py-3 text-sm last:border-0 md:grid-cols-[7rem_8rem_1fr_auto] md:items-center">
              <span className="font-mono text-xs text-muted-foreground">Chapter {report.chapterId}</span>
              <span className="font-medium">{report.reason.replaceAll("_", " ")}</span>
              <span className="truncate text-muted-foreground">{report.details || `Trang ${(report.pageIndex ?? 0) + 1}`} · {new Date(report.createdAt).toLocaleString("vi-VN")}</span>
              <Button size="sm" variant={report.status === "RESOLVED" ? "outline" : "default"} disabled={report.status === "RESOLVED" || Boolean(repairing[report.chapterId])} onClick={() => void repairChapter(report.chapterId, report.id)}>
                {report.status === "RESOLVED" ? "Đã xử lý" : repairing[report.chapterId] || "Crawl lại"}
              </Button>
            </div>
          ))}
          {reports.length === 0 && <p className="px-4 py-10 text-center text-sm text-muted-foreground">Chưa có báo cáo từ người đọc.</p>}
        </div>
      </section>
    </main>
  );
}
