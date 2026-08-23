"use client";

import Link from "next/link";
import { Bell, BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { formatRelativeTime, getNotifications, getUnreadNotificationCount, markAllNotificationsRead, type UserNotificationDTO } from "@/lib/api";

export default function NotificationMenu() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<UserNotificationDTO[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const refresh = async () => {
      try {
        const unread = await getUnreadNotificationCount();
        setCount(unread);
        if (unread > 0 && Notification.permission === "granted") {
          const result = await getNotifications(1);
          const newest = result.content[0];
          if (newest && localStorage.getItem("mot:last-browser-notification") !== String(newest.id)) {
            const registration = await navigator.serviceWorker?.ready;
            await registration?.showNotification("Mọt Truyện có chương mới", {
              body: newest.title, icon: "/pwa-icon.svg",
              data: { url: `/truyen/${newest.mangaId}/chuong/${newest.chapterId}` },
            });
            localStorage.setItem("mot:last-browser-notification", String(newest.id));
          }
        }
      } catch {}
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [isAuthenticated]);

  async function handleOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen || !isAuthenticated) return;
    try {
      const result = await getNotifications();
      setItems(result.content);
      const newestUnread = result.content.find((item) => !item.read);
      if (newestUnread && Notification.permission === "granted" && localStorage.getItem("mot:last-browser-notification") !== String(newestUnread.id)) {
        const registration = await navigator.serviceWorker?.ready;
        await registration?.showNotification("Mọt Truyện có chương mới", {
          body: newestUnread.title,
          icon: "/pwa-icon.svg",
          data: { url: `/truyen/${newestUnread.mangaId}/chuong/${newestUnread.chapterId}` },
        });
        localStorage.setItem("mot:last-browser-notification", String(newestUnread.id));
      }
      if (count > 0) {
        await markAllNotificationsRead();
        setCount(0);
      }
    } catch {}
  }

  async function enableBrowserNotifications() {
    if (!("Notification" in window)) return;
    await Notification.requestPermission();
  }

  if (!isAuthenticated) return null;
  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Thông báo${count ? `, ${count} chưa đọc` : ""}`}>
          {count ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          {count > 0 && <span className="absolute right-1 top-1 min-w-4 rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">{Math.min(count, 99)}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(24rem,calc(100vw-1rem))] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-semibold">Chương mới</p>
          {typeof Notification !== "undefined" && Notification.permission === "default" && (
            <button onClick={enableBrowserNotifications} className="text-xs font-medium text-primary hover:underline">Bật thông báo máy</button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.map((item) => (
            <Link key={item.id} href={`/truyen/${item.mangaId}/chuong/${item.chapterId}`} className="block border-b px-4 py-3 transition-colors hover:bg-muted">
              <p className="text-sm font-medium leading-snug">{item.title}</p>
              <time className="mt-1 block text-xs text-muted-foreground">{formatRelativeTime(item.createdAt)}</time>
            </Link>
          ))}
          {items.length === 0 && <p className="px-4 py-10 text-center text-sm text-muted-foreground">Chưa có thông báo mới.</p>}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
