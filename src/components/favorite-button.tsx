"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { addFavorite, removeFavorite, checkFavorite } from "@/lib/api";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  mangaId: string;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function FavoriteButton({ mangaId, size = "default", className = "" }: FavoriteButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Check initial favorite status
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setInitialLoading(false);
      return;
    }
    checkFavorite(user.id, mangaId)
      .then(setIsFav)
      .catch(() => {})
      .finally(() => setInitialLoading(false));
  }, [isAuthenticated, user, mangaId]);

  const toggleFavorite = useCallback(async () => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      if (isFav) {
        await removeFavorite(user.id, mangaId);
        setIsFav(false);
      } else {
        await addFavorite(user.id, mangaId);
        setIsFav(true);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, mangaId, isFav, router]);

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        size={size}
        className={className}
        onClick={() => router.push("/login")}
        title="Đăng nhập để thêm vào yêu thích"
      >
        <Heart className="h-4 w-4 mr-2" />
        Yêu thích
      </Button>
    );
  }

  return (
    <Button
      variant={isFav ? "default" : "outline"}
      size={size}
      className={className}
      onClick={toggleFavorite}
      disabled={loading || initialLoading}
      title={isFav ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
    >
      <Heart
        className={`h-4 w-4 mr-2 ${isFav ? "fill-current" : ""}`}
      />
      {isFav ? "Đã yêu thích" : "Yêu thích"}
    </Button>
  );
}
