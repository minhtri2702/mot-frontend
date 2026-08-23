"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// ============================================
// Types
// ============================================

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  roles: string[];
}

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
}

// ============================================
// Auth API URL
// ============================================

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:9090/api/auth";

// ============================================
// Auth Context
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isJwtExpired(token: string): boolean {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return true;
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(base64 + padding)) as { exp?: number };
    return typeof payload.exp !== "number" || payload.exp <= Date.now() / 1000 + 30;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");

      if (storedToken && storedUser && !isJwtExpired(storedToken)) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else if (storedToken || storedUser) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    } catch (e) {
      // Clear invalid data
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleRejectedAuth = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener("mot:auth-rejected", handleRejectedAuth);
    return () => window.removeEventListener("mot:auth-rejected", handleRejectedAuth);
  }, []);

  const login = (newToken: string, newUser: UserInfo) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// ============================================
// Google Login API
// ============================================

export async function loginWithGoogle(idToken: string): Promise<{ token: string; user: UserInfo }> {
  const response = await fetch(`${AUTH_API_URL}/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error(`Google login failed: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();
  const data = raw?.success === true ? raw.data : raw;

  return {
    token: data.token,
    user: {
      id: data.id,
      username: data.username,
      email: data.email,
      avatarUrl: null, // Will be fetched from profile later
      roles: data.roles || [],
    },
  };
}

// ============================================
// Regular Login API
// ============================================

export async function loginWithEmail(username: string, password: string): Promise<{ token: string; user: UserInfo }> {
  const response = await fetch(`${AUTH_API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();
  const data = raw?.success === true ? raw.data : raw;

  return {
    token: data.token,
    user: {
      id: data.id,
      username: data.username,
      email: data.email,
      avatarUrl: null,
      roles: data.roles || [],
    },
  };
}
