import type { Route } from "./+types/destination-manager";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Save, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label, FieldRoot } from "~/components/ui/label";
import { ImageUpload } from "~/components/admin/image-upload";
import apiClient from "~/lib/api-client";
import { parseApiError, parseFieldErrors } from "~/lib/api-errors";
import type { Destination } from "~/types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Destinations — Isitoshe Tours Admin" }];
}

export default function DestinationManager() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    slug: "",
    name: "",
    description: "",
    highlights: "",
    images: [] as string[],
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { data: destinations, isLoading, isError } = useQuery({
    queryKey: ["destinations"],
    queryFn: () =>
      apiClient.get<Destination[]>("/content/destinations").then((r) => r.data),
  });

  const [formError, setFormError] = useState("");

  const saveMutation = useMutation({
    mutationFn: (data: { slug: string; body: Record<string, unknown> }) =>
      apiClient.patch(`/content/destinations/${data.slug}`, data.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      setEditingId(null);
      setFormError("");
      setFieldErrors({});
    },
    onError: (err: unknown) => {
      const res = parseApiError(err);
      setFormError(res?.error || "Failed to save destination");
      setFieldErrors({});
      if (res?.details) {
        setFieldErrors(parseFieldErrors(res.details));
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post("/content/destinations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      setCreating(false);
      setFormError("");
      setFieldErrors({});
    },
    onError: (err: unknown) => {
      const res = parseApiError(err);
      setFormError(res?.error || "Failed to create destination");
      setFieldErrors({});
      if (res?.details) {
        setFieldErrors(parseFieldErrors(res.details));
      }
    },
  });

  const startCreate = () => {
    setForm({ slug: "", name: "", description: "", highlights: "", images: [] });
    setEditingId(null);
    setCreating(true);
    setFieldErrors({});
  };

  const startEdit = (d: Destination) => {
    setForm({
      slug: d.slug,
      name: d.name,
      description: d.description || "",
      highlights: d.highlights?.join("\n") || "",
      images: d.images || [],
    });
    setEditingId(d._id);
    setCreating(false);
    setFieldErrors({});
  };

  const cancelForm = () => {
    setEditingId(null);
    setCreating(false);
    setFieldErrors({});
  };

  const handleSave = () => {
    const body: Record<string, unknown> = {
      name: form.name,
      description: form.description || undefined,
      highlights: form.highlights ? form.highlights.split("\n").filter(Boolean) : undefined,
      images: form.images.length > 0 ? form.images : undefined,
    };
    if (creating) {
      (body as Record<string, unknown>).slug = form.slug;
      createMutation.mutate(body);
    } else if (editingId) {
      const dest = destinations?.find((d) => d._id === editingId);
      if (dest) {
        saveMutation.mutate({ slug: dest.slug, body });
      }
    }
  };

  const formOpen = creating || editingId !== null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Destinations
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage tour destinations
        </p>
      </div>

      {formOpen && (
        <div className="mb-6 border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-wider uppercase">
              {creating ? "New Destination" : "Edit Destination"}
            </h2>
            <button
              onClick={cancelForm}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          {formError && (
            <p className="mb-4 text-sm text-destructive">{formError}</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldRoot>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); setFieldErrors({ ...fieldErrors, name: "" }); }}
                placeholder="e.g. Bwindi Impenetrable Forest"
                className={fieldErrors.name ? "border-destructive" : ""}
              />
              {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>Slug</Label>
              <Input
                value={form.slug}
                disabled={!creating}
                onChange={(e) => { setForm({ ...form, slug: e.target.value }); setFieldErrors({ ...fieldErrors, slug: "" }); }}
                placeholder="e.g. bwindi-impenetrable-forest"
                className={fieldErrors.slug ? "border-destructive" : ""}
              />
              {fieldErrors.slug && <p className="text-xs text-destructive">{fieldErrors.slug}</p>}
            </FieldRoot>
            <FieldRoot className="sm:col-span-2">
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-input bg-background p-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 resize-none"
                rows={3}
                placeholder="Brief description of the destination"
              />
            </FieldRoot>
            <FieldRoot className="sm:col-span-2">
              <Label>Highlights (one per line)</Label>
              <textarea
                value={form.highlights}
                onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                className="w-full border border-input bg-background p-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 resize-none"
                rows={4}
                placeholder="Mountain gorilla trekking&#10;Ancient rainforest&#10;Bird watching paradise"
              />
            </FieldRoot>
            <FieldRoot className="sm:col-span-2">
              <Label>Images</Label>
              <ImageUpload
                images={form.images}
                onChange={(images) => setForm({ ...form, images })}
              />
            </FieldRoot>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={cancelForm}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
              disabled={saveMutation.isPending || createMutation.isPending}
            >
              <Save className="size-4" />
              {creating ? "Create" : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <Button variant="default" onClick={startCreate}>
          <Plus className="size-4" />
          Add Destination
        </Button>
      </div>

      <div className="space-y-2">
        {isError ? (
          <p className="text-sm text-destructive">Failed to load destinations.</p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : destinations?.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No destinations yet.
          </p>
        ) : (
          destinations?.map((d) => (
            <div
              key={d._id}
              className="flex items-center justify-between border border-border bg-card px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground">
                  {d.slug}
                  {d.highlights?.length ? ` · ${d.highlights.length} highlights` : ""}
                  {d.images?.length ? ` · ${d.images.length} images` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => startEdit(d)}
              >
                <Pencil className="size-3" />
                Edit
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
