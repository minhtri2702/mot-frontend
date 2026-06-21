import Link from "next/link";
import { BookOpen, Mail, MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-primary mr-2" />
              <span className="font-bold text-xl">Mọt truyện tranh</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Website đọc truyện tranh online, cập nhật nhanh nhất các truyện tranh hot, nhiều thể loại đa dạng.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/truyen-hot" className="text-sm hover:text-primary">
                  Truyện Hot
                </Link>
              </li>
              <li>
                <Link href="/truyen-moi-cap-nhat" className="text-sm hover:text-primary">
                  Truyện mới cập nhật
                </Link>
              </li>
              <li>
                <Link href="/truyen-full" className="text-sm hover:text-primary">
                  Truyện Full
                </Link>
              </li>
              <li>
                <Link href="/bang-xep-hang" className="text-sm hover:text-primary">
                  Bảng xếp hạng
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">Thể loại</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/the-loai/action" className="text-sm hover:text-primary">
                  Action
                </Link>
              </li>
              <li>
                <Link href="/the-loai/comedy" className="text-sm hover:text-primary">
                  Comedy
                </Link>
              </li>
              <li>
                <Link href="/the-loai/romance" className="text-sm hover:text-primary">
                  Romance
                </Link>
              </li>
              <li>
                <Link href="/the-loai/fantasy" className="text-sm hover:text-primary">
                  Fantasy
                </Link>
              </li>
              <li>
                <Link href="/the-loai" className="text-sm hover:text-primary">
                  Xem tất cả
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">Liên hệ</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <a href="mailto:contact@mottruyentranh.com" className="text-sm hover:text-primary">
                  contact@mottruyen.com
                </a>
              </li>
              <li className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                <a href="/lien-he" className="text-sm hover:text-primary">
                  Gửi phản hồi
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Mọt truyện tranh. Tất cả nội dung trên website đều được sưu tầm từ Internet.
            <br />
            Website không lưu trữ bất kỳ tệp tin nào trên máy chủ của mình.
          </p>
        </div>
      </div>
    </footer>
  );
}
