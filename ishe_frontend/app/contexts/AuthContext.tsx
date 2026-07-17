import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import apiClient from "~/lib/api-client";
import { logger } from "~/lib/logger";
import type { Admin, LoginResponse } from "~/types";

interface AuthState {
  token: string | null;
  admin: Admin | null;
  ready: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  setAuth: (token: string, admin: Admin) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem("token");
      const a = localStorage.getItem("admin");
      setToken(t);
      setAdmin(a ? (JSON.parse(a) as Admin) : null);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
    }
    setReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("admin", JSON.stringify(res.data.admin));
    setToken(res.data.token);
    setAdmin(res.data.admin);
    logger.info("Login successful", { component: "AuthContext", action: "login" });
    return res.data;
  }, []);

  const setAuth = useCallback((newToken: string, newAdmin: Admin) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("admin", JSON.stringify(newAdmin));
    setToken(newToken);
    setAdmin(newAdmin);
  }, []);

  const logout = useCallback(() => {
    logger.info("Logout", { component: "AuthContext", action: "logout" });
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setToken(null);
    setAdmin(null);
    window.location.href = "/admin/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        admin,
        ready,
        isAuthenticated: !!token,
        login,
        logout,
        setAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
