import type { Route } from "./+types/settings-manager";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Lock, Eye, EyeOff } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label, FieldRoot } from "~/components/ui/label";
import apiClient from "~/lib/api-client";
import type { SiteSettings } from "~/types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Settings — Isitoshe Tours Admin" }];
}

export default function SettingsManager() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () =>
      apiClient.get<SiteSettings>("/content/site-settings").then((r) => r.data),
  });

  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings?.data) {
      const initial: Record<string, string> = {};
      for (const [key, value] of Object.entries(settings.data)) {
        initial[key] = String(value ?? "");
      }
      setForm(initial);
    }
  }, [settings]);

  const [saveError, setSaveError] = useState("");

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const pwMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiClient.patch("/auth/password", data),
    onSuccess: () => {
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwError("");
      setPwSuccess("Password changed successfully");
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { error?: string } } }).response?.data
              ?.error || "Failed to change password"
          : "Failed to change password";
      setPwError(msg);
      setPwSuccess("");
    },
  });

  const handlePasswordChange = () => {
    setPwError("");
    setPwSuccess("");
    if (pwForm.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New passwords do not match");
      return;
    }
    pwMutation.mutate({
      currentPassword: pwForm.currentPassword,
      newPassword: pwForm.newPassword,
    });
  };

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.patch("/content/site-settings", { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      setSaveError("");
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { error?: string } } }).response?.data
              ?.error || "Failed to save settings"
          : "Failed to save settings";
      setSaveError(msg);
    },
  });

  const handleSave = () => {
    saveMutation.mutate(form);
  };

  if (isError) return <p className="text-destructive">Failed to load settings.</p>;
  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Site Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure global site settings
        </p>
      </div>

      <div className="border border-border bg-card p-6">
        {saveError && (
          <p className="mb-4 text-sm text-destructive">{saveError}</p>
        )}
        <div className="space-y-4">
          {Object.entries(form).map(([key, value]) => (
            <FieldRoot key={key}>
              <Label>
                {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
              </Label>
              <Input
                value={value}
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.value })
                }
              />
            </FieldRoot>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            variant="default"
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            <Save className="size-4" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="mt-8 border border-border bg-card p-6">
        <div className="mb-4">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Change Password
          </h2>
          <p className="text-sm text-muted-foreground">
            Update your admin account password
          </p>
        </div>
        <div className="space-y-4 max-w-sm">
          <FieldRoot>
            <Label>Current Password</Label>
            <div className="relative">
              <Input
                type={showCurrentPw ? "text" : "password"}
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showCurrentPw ? "Hide current password" : "Show current password"}
              >
                {showCurrentPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </FieldRoot>
          <FieldRoot>
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={showNewPw ? "text" : "password"}
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                placeholder="At least 6 characters"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showNewPw ? "Hide new password" : "Show new password"}
              >
                {showNewPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </FieldRoot>
          <FieldRoot>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              placeholder="Re-enter new password"
            />
          </FieldRoot>
          {pwError && <p className="text-sm text-destructive">{pwError}</p>}
          {pwSuccess && <p className="text-sm text-green-600">{pwSuccess}</p>}
          <Button
            variant="default"
            onClick={handlePasswordChange}
            disabled={pwMutation.isPending}
          >
            <Lock className="size-4" />
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
}
