import type { Route } from "./+types/settings-manager";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";

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
    </div>
  );
}
