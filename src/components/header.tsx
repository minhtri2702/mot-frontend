"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
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
import { Menu, Search, User, ChevronDown, BookOpen, Clock, Heart, BarChart, Sun, Moon, LogOut, Settings } from "lucide-react";
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
      <DropdownMenuContent align="end" className="w-56 bg-[#18181B]/95 backdrop-blur-xl border border-white/[0.08]">
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
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Settings className="h-4 w-4 mr-2" />
          Cài đặt tài khoản
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/truyen-yeu-thich">
            <Heart className="h-4 w-4 mr-2" />
            Truyện yêu thích
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Clock className="h-4 w-4 mr-2" />
          Lịch sử đọc
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
      <SheetContent side="left" className="w-[280px] sm:w-[320px] bg-[#18181B]/95 backdrop-blur-xl border-r border-white/[0.08]">
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
  return (
    <header className="sticky top-0 z-50 w-full glass-header">
      <div className="container flex h-16 items-center justify-between">
        {/* Mobile Menu Button */}
        <MobileNav />

        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center mr-6">
            <BookOpen className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-xl hidden sm:inline-block">Mọt Truyện</span>
            <span className="font-bold text-xl sm:hidden">GTT</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center">
                  Thể loại <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#18181B]/95 backdrop-blur-xl border border-white/[0.08]">
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

            <DropdownMenu>
              <DropdownMenuContent className="bg-[#18181B]/95 backdrop-blur-xl border border-white/[0.08]">
                <DropdownMenuItem>
                  <Link href="/quoc-gia/nhat-ban">Nhật Bản</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/quoc-gia/han-quoc">Hàn Quốc</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/quoc-gia/trung-quoc">Trung Quốc</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/quoc-gia/viet-nam">Việt Nam</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/truyen-moi-cap-nhat" className="text-sm font-medium hover:text-primary">
              Mới cập nhật
            </Link>
            <Link href="/truyen-hot" className="text-sm font-medium hover:text-primary">
              Truyện Hot
            </Link>
            <Link href="/truyen-full" className="text-sm font-medium hover:text-primary">
              Hoàn thành
            </Link>
          </nav>
        </div>

        {/* Search and User */}
        <div className="flex items-center space-x-1">
          {/* Desktop Search */}
          <div className="hidden md:block relative w-full max-w-[280px] lg:max-w-[400px]">
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
              className="flex items-center w-full px-3 py-1.5 rounded-full bg-muted text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <Search className="h-4 w-4 mr-2 shrink-0" />
              <span className="flex-1 text-left">Tìm truyện...</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                <span className="text-[10px]">⌘</span>K
              </kbd>
            </button>
          </div>

          <div className="flex items-center">
            {/* Mobile Search Button */}
            <SearchDialog />

            <ThemeToggle />
            <Button variant="ghost" size="icon" title="Lịch sử đọc truyện">
              <Clock className="h-5 w-5" />
            </Button>
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
