import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { QueryProvider } from "@/lib/query-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AIChatbot from "@/components/ai-chatbot";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Góc Truyện Tranh Vui - Manga Reader",
  description: "Đọc truyện tranh, manga, webtoon miễn phí - Góc Truyện Tranh Vui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="http://100.94.58.103:9000" />
        <link rel="dns-prefetch" href="http://100.94.58.103:9000" />
      </head>
      <body className={`${jakarta.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </AuthProvider>
          </QueryProvider>
          <Toaster />
          <AIChatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}
