import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu, Search, User, ChevronDown, BookOpen, Clock, Heart, BarChart } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>

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
        <div className="flex items-center space-x-2">
          <div className="relative w-full max-w-[200px] md:max-w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm truyện..."
              className="w-full pl-8 md:w-[300px] rounded-full bg-muted"
            />
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" title="Lịch sử đọc truyện">
              <Clock className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" title="Truyện yêu thích">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" title="Bảng xếp hạng">
              <BarChart className="h-5 w-5" />
            </Button>
            <a href="/login" >
            <Button variant="ghost"   size="icon" title="Tài khoản">
              <User className="h-5 w-5" />
            </Button>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
