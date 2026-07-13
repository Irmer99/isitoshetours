import { useState, useCallback, useEffect } from "react";
import apiClient from "~/lib/api-client";
import type { Admin, LoginResponse } from "~/types";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const a = localStorage.getItem("admin");
    setToken(t);
    setAdmin(a ? (JSON.parse(a) as Admin) : null);
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
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setToken(null);
    setAdmin(null);
    window.location.href = "/admin/login";
  }, []);

  return {
    token,
    admin,
    ready,
    isAuthenticated: !!token,
    login,
    logout,
  };
}
