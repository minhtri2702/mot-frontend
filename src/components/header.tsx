"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Search, User, ChevronDown, BookOpen, Clock, Heart, BarChart, Sun, Moon, LogOut, Settings, ShieldCheck } from "lucide-react";
import SearchDialog from "@/components/search-dialog";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}

function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" title="Tài khoản">
        <User className="h-5 w-5" />
      </Button>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Link href="/login">
        <Button variant="ghost" size="icon" title="Đăng nhập">
          <User className="h-5 w-5" />
        </Button>
      </Link>
    );
  }

  const initials = (user.username || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" title={user.username}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium truncate max-w-[150px]">{user.username}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</span>
          </div>
        </div>
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="h-4 w-4 mr-2" />
            Trang cá nhân
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile#account">
            <Settings className="h-4 w-4 mr-2" />
            Thông tin tài khoản
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/truyen-yeu-thich">
            <Heart className="h-4 w-4 mr-2" />
            Truyện yêu thích
          </Link>
        </DropdownMenuItem>
        {user.roles.includes("ROLE_ADMIN") && (
          <DropdownMenuItem asChild>
            <Link href="/admin/data-health">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Kiểm tra dữ liệu
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/loi-ngo">
            <BookOpen className="h-4 w-4 mr-2" />
            Lời ngỏ
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px]">
        <SheetHeader className="border-b pb-4 mb-4">
          <SheetTitle className="flex items-center">
            <BookOpen className="h-5 w-5 text-primary mr-2" />
            <span>Mọt Truyện</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-1">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
          >
            <BookOpen className="h-4 w-4" />
            Trang chủ
          </Link>
          <Link
            href="/truyen-moi-cap-nhat"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
          >
            <Clock className="h-4 w-4" />
            Mới cập nhật
          </Link>
          <Link
            href="/truyen-hot"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
          >
            <BarChart className="h-4 w-4" />
            Truyện Hot
          </Link>
          <Link
            href="/truyen-full"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
          >
            <BookOpen className="h-4 w-4" />
            Hoàn thành
          </Link>

          <div className="border-t my-2 pt-2">
            <p className="text-xs text-muted-foreground px-3 pb-2 font-medium">THỂ LOẠI</p>
            {["Action", "Comedy", "Romance", "Fantasy"].map((genre) => (
              <Link
                key={genre}
                href={`/the-loai/${genre.toLowerCase()}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                {genre}
              </Link>
            ))}
            <Link
              href="/the-loai"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-primary"
            >
              Xem tất cả
            </Link>
          </div>

        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default function Header() {
  const pathname = usePathname();
  const navClass = (href: string) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      pathname === href
        ? "bg-accent text-accent-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full glass-header">
      <div className="container flex h-[68px] items-center justify-between gap-3">
        {/* Mobile Menu Button */}
        <MobileNav />

        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="mr-5 flex items-center gap-2.5" aria-label="Mọt Truyện, trang chủ">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[inset_0_-2px_0_hsl(var(--foreground)/0.12)]">
              <BookOpen className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="hidden font-[family-name:var(--font-space-grotesk)] text-xl font-semibold tracking-tight sm:inline-block">
              Mọt<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Điều hướng chính">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 rounded-lg px-3 font-semibold text-muted-foreground hover:text-foreground">
                  Thể loại <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href="/the-loai/action">Action</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/the-loai/comedy">Comedy</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/the-loai/romance">Romance</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/the-loai/fantasy">Fantasy</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/the-loai">Xem tất cả</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/truyen-moi-cap-nhat" className={navClass("/truyen-moi-cap-nhat")}>
              Mới cập nhật
            </Link>
            <Link href="/truyen-hot" className={navClass("/truyen-hot")}>
              Truyện Hot
            </Link>
            <Link href="/truyen-full" className={navClass("/truyen-full")}>
              Hoàn thành
            </Link>
          </nav>
        </div>

        {/* Search and User */}
        <div className="flex items-center space-x-1">
          {/* Desktop Search */}
          <div className="relative hidden w-[220px] md:block lg:w-[320px]">
            <button
              onClick={() => {
                // Trigger search dialog via keyboard event simulation
                const event = new KeyboardEvent("keydown", {
                  metaKey: true,
                  ctrlKey: true,
                  key: "k",
                });
                window.dispatchEvent(event);
              }}
              className="flex h-10 w-full items-center rounded-xl border border-border bg-muted/70 px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Search className="h-4 w-4 mr-2 shrink-0" />
              <span className="flex-1 text-left">Tìm truyện, tác giả…</span>
              <kbd className="hidden items-center gap-1 rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline-flex">
                <span className="text-[10px]">⌘</span>K
              </kbd>
            </button>
          </div>

          <div className="flex items-center">
            {/* Mobile Search Button */}
            <SearchDialog />

            <ThemeToggle />
            <Link href="/truyen-yeu-thich">
              <Button variant="ghost" size="icon" title="Truyện yêu thích" className="hidden sm:inline-flex">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
