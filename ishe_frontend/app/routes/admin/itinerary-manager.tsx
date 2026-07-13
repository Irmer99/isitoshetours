import type { Route } from "./+types/itinerary-manager";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Save, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label, FieldRoot } from "~/components/ui/label";
import { ImageUpload } from "~/components/admin/image-upload";
import apiClient from "~/lib/api-client";
import type { Itinerary, Destination } from "~/types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Itineraries — Ishe Tours Admin" }];
}

export default function ItineraryManager() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    slug: "",
    difficulty: "moderate" as Itinerary["difficulty"],
    duration: "",
    pricingFrom: 0,
    pricingCurrency: "MAD",
    destinations: [] as string[],
    images: [] as string[],
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { data: itineraries, isLoading, isError } = useQuery({
    queryKey: ["itineraries"],
    queryFn: () =>
      apiClient.get<Itinerary[]>("/content/itineraries").then((r) => r.data),
  });

  const { data: destinations } = useQuery({
    queryKey: ["destinations"],
    queryFn: () =>
      apiClient.get<Destination[]>("/content/destinations").then((r) => r.data),
  });

  const [formError, setFormError] = useState("");

  const parseError = (err: unknown) => {
    const res = err && typeof err === "object" && "response" in err
      ? (err as { response: { data: { error?: string; details?: string } } }).response?.data
      : null;
    setFormError(res?.error || "Operation failed");
    setFieldErrors({});
    if (res?.details) {
      try {
        const parsed = JSON.parse(res.details);
        const errs: Record<string, string> = {};
        parsed.forEach((e: { path?: string[]; message: string }) => {
          if (e.path?.[0]) errs[e.path[0]] = e.message;
        });
        setFieldErrors(errs);
      } catch { /* ignore */ }
    }
  };

  const saveMutation = useMutation({
    mutationFn: (data: { slug: string; body: Record<string, unknown> }) =>
      apiClient.patch(`/content/itineraries/${data.slug}`, data.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      setEditingId(null);
      setFormError("");
      setFieldErrors({});
    },
    onError: parseError,
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post("/content/itineraries", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      setCreating(false);
      setFormError("");
      setFieldErrors({});
    },
    onError: parseError,
  });

  const startCreate = () => {
    setForm({
      title: "",
      subtitle: "",
      slug: "",
      difficulty: "moderate",
      duration: "",
      pricingFrom: 0,
      pricingCurrency: "MAD",
      destinations: [],
      images: [],
    });
    setEditingId(null);
    setCreating(true);
    setFieldErrors({});
  };

  const startEdit = (it: Itinerary) => {
    setForm({
      title: it.title,
      subtitle: it.subtitle || "",
      slug: it.slug,
      difficulty: it.difficulty,
      duration: it.duration || "",
      pricingFrom: it.pricing?.from || 0,
      pricingCurrency: it.pricing?.currency || "MAD",
      destinations: it.destinations || [],
      images: it.images || [],
    });
    setEditingId(it._id);
    setCreating(false);
    setFieldErrors({});
  };

  const cancelForm = () => {
    setEditingId(null);
    setCreating(false);
    setFieldErrors({});
  };

  const handleSave = () => {
    if (creating) {
      createMutation.mutate({
        title: form.title,
        slug: form.slug,
        subtitle: form.subtitle || undefined,
        difficulty: form.difficulty,
        duration: form.duration || undefined,
        pricing: {
          from: form.pricingFrom || undefined,
          currency: form.pricingCurrency,
        },
        destinations: form.destinations.length > 0 ? form.destinations : undefined,
        images: form.images.length > 0 ? form.images : undefined,
      });
      return;
    }
    const itinerary = itineraries?.find((i) => i._id === editingId);
    if (!itinerary) return;
    saveMutation.mutate({
      slug: itinerary.slug,
      body: {
        title: form.title,
        subtitle: form.subtitle || undefined,
        difficulty: form.difficulty,
        duration: form.duration || undefined,
        pricing: {
          from: form.pricingFrom || undefined,
          currency: form.pricingCurrency,
        },
        destinations: form.destinations,
        images: form.images,
      },
    });
  };

  const formOpen = creating || editingId !== null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Itinerary Manager
        </h1>
        <p className="text-sm text-muted-foreground">
          Create and edit tour itineraries
        </p>
      </div>

      {formOpen && (
        <div className="mb-6 border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-wider uppercase">
              {creating ? "New Itinerary" : "Edit Itinerary"}
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
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => { setForm({ ...form, title: e.target.value }); setFieldErrors({ ...fieldErrors, title: "" }); }}
                className={fieldErrors.title ? "border-destructive" : ""}
              />
              {fieldErrors.title && <p className="text-xs text-destructive">{fieldErrors.title}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>Slug</Label>
              <Input
                value={form.slug}
                disabled={!creating}
                onChange={(e) => { setForm({ ...form, slug: e.target.value }); setFieldErrors({ ...fieldErrors, slug: "" }); }}
                className={fieldErrors.slug ? "border-destructive" : ""}
              />
              {fieldErrors.slug && <p className="text-xs text-destructive">{fieldErrors.slug}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>Subtitle</Label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </FieldRoot>
            <FieldRoot>
              <Label>Duration</Label>
              <Input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 5 days"
              />
            </FieldRoot>
            <FieldRoot>
              <Label>Difficulty</Label>
              <select
                value={form.difficulty}
                onChange={(e) =>
                  setForm({
                    ...form,
                    difficulty: e.target.value as Itinerary["difficulty"],
                  })
                }
                className="h-10 border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
              </select>
            </FieldRoot>
            <FieldRoot>
              <Label>Price From</Label>
              <Input
                type="number"
                value={form.pricingFrom}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pricingFrom: Number(e.target.value),
                  })
                }
              />
            </FieldRoot>
          </div>
          {destinations && destinations.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold tracking-wider uppercase">Destinations</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {destinations.map((d) => {
                  const checked = form.destinations.includes(d.slug);
                  return (
                    <label
                      key={d._id}
                      className={`flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-colors ${
                        checked
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input bg-background text-muted-foreground hover:border-muted-foreground"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => {
                          const next = checked
                            ? form.destinations.filter((s) => s !== d.slug)
                            : [...form.destinations, d.slug];
                          setForm({ ...form, destinations: next });
                        }}
                      />
                      {d.name}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          <div className="mt-4">
            <p className="text-sm font-semibold tracking-wider uppercase">Images</p>
            <div className="mt-2">
              <ImageUpload
                images={form.images}
                onChange={(images) => setForm({ ...form, images })}
              />
            </div>
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
          Add New Itinerary
        </Button>
      </div>

      <div className="space-y-2">
        {isError ? (
          <p className="text-sm text-destructive">Failed to load itineraries.</p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          itineraries?.map((it) => (
            <div
              key={it._id}
              className="flex items-center justify-between border border-border bg-card px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{it.title}</p>
                <p className="text-xs text-muted-foreground">
                  {it.slug} · {it.difficulty}
{it.pricing?.from != null &&
                      ` · From ${it.pricing.currency} ${it.pricing.from}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => startEdit(it)}
                >
                  <Pencil className="size-3" />
                  Edit
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
