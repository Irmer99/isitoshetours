import type { Route } from "./+types/login";
import { Form, useActionData, useNavigate, redirect } from "react-router";
import { useEffect, useState } from "react";
import { LogIn, Eye, EyeOff } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label, FieldRoot, ErrorMessage } from "~/components/ui/label";
import apiClient from "~/lib/api-client";
import type { Admin, LoginResponse } from "~/types";

export async function clientLoader() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (token) {
    throw redirect("/admin");
  }
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  try {
    const res = await apiClient.post<LoginResponse>("/auth/login", {
      email: formData.get("email"),
      password: formData.get("password"),
    });
    return { token: res.data.token, admin: res.data.admin };
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "response" in err
        ? (err as { response: { data: { message?: string } } }).response?.data
            ?.message || "Invalid credentials"
        : "Invalid credentials";
    return { error: message };
  }
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Admin Login — Ishe Tours" }];
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const actionData = useActionData<{
    token?: string;
    admin?: Admin;
    error?: string;
  }>();

  useEffect(() => {
    if (actionData?.token && actionData?.admin) {
      localStorage.setItem("token", actionData.token);
      localStorage.setItem("admin", JSON.stringify(actionData.admin));
      navigate("/admin", { replace: true });
    }
  }, [actionData, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm border border-border bg-card p-8">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Ishe Tours
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Admin Login</p>
        </div>
        <Form method="post" className="mt-6 space-y-4">
          <FieldRoot>
            <Label>Email</Label>
            <Input
              name="email"
              type="email"
              required
              placeholder="admin@ishetours.com"
            />
          </FieldRoot>
          <FieldRoot>
            <Label>Password</Label>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </FieldRoot>
          {actionData?.error && (
            <p className="text-sm text-destructive">{actionData.error}</p>
          )}
          <Button type="submit" variant="default" size="lg" className="w-full">
            <LogIn className="size-4" />
            Sign In
          </Button>
        </Form>
      </div>
    </div>
  );
}
