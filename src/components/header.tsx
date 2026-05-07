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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Search, User, ChevronDown, BookOpen, Clock, Heart, BarChart, Sun, Moon, X } from "lucide-react";
import SearchDialog from "@/components/search-dialog";

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

          <div className="border-t my-2 pt-2">
            <p className="text-xs text-muted-foreground px-3 pb-2 font-medium">QUỐC GIA</p>
            {["Nhật Bản", "Hàn Quốc", "Trung Quốc", "Việt Nam"].map((country) => (
              <Link
                key={country}
                href={`/quoc-gia/${country.toLowerCase()}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                {country}
              </Link>
            ))}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center">
                  Quốc gia <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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
          <div className="hidden md:block relative w-full max-w-[200px] lg:max-w-[300px]">
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
            <Button variant="ghost" size="icon" title="Truyện yêu thích" className="hidden sm:inline-flex">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" title="Bảng xếp hạng" className="hidden sm:inline-flex">
              <BarChart className="h-5 w-5" />
            </Button>
            <a href="/login">
              <Button variant="ghost" size="icon" title="Tài khoản">
                <User className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
