import { Form, useActionData, redirect } from "react-router";
import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
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
  try {
    await apiClient.post("/auth/forgot-password", {
      email: formData.get("email"),
    });
    return { sent: true };
  } catch {
    return { sent: true };
  }
}

export function meta() {
  return [{ title: "Forgot Password — Isitoshe Tours" }];
}

export default function ForgotPassword() {
  const actionData = useActionData<{ sent?: boolean }>();
  const [submitted, setSubmitted] = useState(false);

  if (actionData?.sent || submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm border border-border bg-card p-8 text-center">
          <Mail className="mx-auto size-10 text-primary" />
          <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists with that email, we&apos;ve sent a password reset link.
            The link expires in 15 minutes.
          </p>
          <Link
            to="/admin/login"
            className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to login
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
            Forgot Password
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>
        <Form
          method="post"
          className="mt-6 space-y-4"
          onSubmit={() => setSubmitted(true)}
        >
          <FieldRoot>
            <Label>Email</Label>
            <Input
              name="email"
              type="email"
              required
              placeholder="admin@isitoshetours.com"
            />
          </FieldRoot>
          <Button type="submit" variant="default" size="lg" className="w-full">
            <Mail className="size-4" />
            Send Reset Link
          </Button>
        </Form>
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
