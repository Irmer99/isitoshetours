import { Form, useActionData, useSearchParams, redirect } from "react-router";
import { useState } from "react";
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label, FieldRoot } from "~/components/ui/label";
import apiClient from "~/lib/api-client";

export async function clientLoader() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (token) {
    throw redirect("/admin");
  }
  return null;
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;

  try {
    await apiClient.post("/auth/reset-password", { token, password });
    return { success: true };
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "response" in err
        ? (err as { response: { data: { error?: string } } }).response?.data
            ?.error || "Reset failed"
        : "Reset failed";
    return { error: message };
  }
}

export function meta() {
  return [{ title: "Reset Password — Isitoshe Tours" }];
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const actionData = useActionData<{ success?: boolean; error?: string }>();
  const [showPassword, setShowPassword] = useState(false);

  if (actionData?.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm border border-border bg-card p-8 text-center">
          <Lock className="mx-auto size-10 text-primary" />
          <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
            Password Reset
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your password has been reset successfully.
          </p>
          <Link
            to="/admin/login"
            className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="size-4" />
            Sign in with new password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm border border-border bg-card p-8">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Reset Password
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your new password below
          </p>
        </div>
        {!token ? (
          <div className="mt-6 text-center">
            <p className="text-sm text-destructive">
              No reset token found. Please use the link from your email.
            </p>
            <Link
              to="/admin/forgot-password"
              className="mt-4 inline-block text-sm text-primary hover:underline"
            >
              Request a new reset link
            </Link>
          </div>
        ) : (
          <Form method="post" className="mt-6 space-y-4">
            <input type="hidden" name="token" value={token} />
            <FieldRoot>
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="8+ chars, upper, lower, number, special"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </FieldRoot>
            {actionData?.error && (
              <p className="text-sm text-destructive">{actionData.error}</p>
            )}
            <Button type="submit" variant="default" size="lg" className="w-full">
              <Lock className="size-4" />
              Reset Password
            </Button>
          </Form>
        )}
        <div className="mt-4 text-center">
          <Link
            to="/admin/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
