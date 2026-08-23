"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AIChatbot from "@/components/ai-chatbot";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isReader = /^\/truyen\/[^/]+\/chuong\/[^/]+/.test(pathname);

  if (isReader) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <AIChatbot />
    </>
  );
}
