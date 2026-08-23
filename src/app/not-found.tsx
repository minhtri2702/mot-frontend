import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container grid min-h-[70vh] place-items-center py-16 text-center">
      <div className="max-w-md">
        <BookOpen className="mx-auto h-12 w-12 text-primary" />
        <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-primary">404</p>
        <h1 className="mt-2 text-3xl font-bold">Trang này không còn ở đây</h1>
        <p className="mt-3 text-muted-foreground">Truyện có thể đã đổi địa chỉ. Hãy tìm lại theo tên hoặc quay về trang chủ.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild><Link href="/">Về trang chủ</Link></Button>
          <Button variant="outline" asChild><Link href="/tim-kiem"><Search className="mr-2 h-4 w-4" />Tìm truyện</Link></Button>
        </div>
      </div>
    </div>
  );
}
