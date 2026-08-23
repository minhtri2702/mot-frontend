"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, loginWithGoogle, loginWithEmail } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Initialize Google Sign-In
  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
    if (!googleClientId) {
      setGoogleError("Đăng nhập Google chưa được cấu hình. Vui lòng dùng email hoặc liên hệ quản trị viên.");
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleLogin,
        });
        const buttonContainer = document.getElementById("google-signin-button");
        if (buttonContainer) {
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: "outline",
            size: "large",
            width: 320,
            text: "signin_with",
            shape: "rectangular",
          });
        }
      }
    };
    script.onerror = () => {
      setGoogleError("Không thể tải dịch vụ đăng nhập Google. Vui lòng thử lại sau.");
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleLogin = async (response: { credential: string }) => {
    try {
      setIsLoading(true);
      const result = await loginWithGoogle(response.credential);
      login(result.token, result.user);
      toast.success("Đăng nhập thành công!");
      // Force full page reload to ensure auth state is picked up
      window.location.href = "/";
    } catch (error) {
      toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setIsLoading(true);
      const result = await loginWithEmail(loginForm.username, loginForm.password);
      login(result.token, result.user);
      toast.success("Đăng nhập thành công!");
      window.location.href = "/";
    } catch (error) {
      toast.error("Sai tên đăng nhập hoặc mật khẩu");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>Đăng nhập để theo dõi và lưu lại tiến độ đọc truyện</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="google">Google</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="google" className="flex flex-col items-center gap-4">
              <div id="google-signin-button" className="min-h-[40px]"></div>
              {googleError && (
                <p role="alert" className="text-center text-sm text-destructive">
                  {googleError}
                </p>
              )}
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </div>
              )}
            </TabsContent>

            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên đăng nhập</label>
                  <Input
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mật khẩu</label>
                  <Input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <a href="#" className="underline hover:text-primary">
              Điều khoản sử dụng
            </a>{" "}
            và{" "}
            <a href="#" className="underline hover:text-primary">
              Chính sách bảo mật
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
