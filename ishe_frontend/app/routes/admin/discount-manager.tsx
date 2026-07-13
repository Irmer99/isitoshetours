import type { Route } from "./+types/discount-manager";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label, FieldRoot } from "~/components/ui/label";
import apiClient from "~/lib/api-client";
import type { Discount } from "~/types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Discounts — Ishe Tours Admin" }];
}

type DiscountForm = {
  code: string;
  type: Discount["type"];
  value: number;
  appliesTo: string;
  startDate: string;
  endDate: string;
  usageLimit: number;
};

const emptyForm: DiscountForm = {
  code: "",
  type: "percent",
  value: 0,
  appliesTo: "",
  startDate: "",
  endDate: "",
  usageLimit: 0,
};

export default function DiscountManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DiscountForm>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { data: discounts, isLoading, isError } = useQuery({
    queryKey: ["discounts"],
    queryFn: () =>
      apiClient.get<Discount[]>("/discounts").then((r) => r.data),
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

  const createMutation = useMutation({
    mutationFn: (data: DiscountForm) =>
      apiClient.post("/discounts", {
        ...data,
        usageLimit: data.usageLimit ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      setShowForm(false);
      setForm(emptyForm);
      setFormError("");
      setFieldErrors({});
    },
    onError: parseError,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; body: Partial<DiscountForm> }) =>
      apiClient.patch(`/discounts/${data.id}`, {
        ...data.body,
        usageLimit: data.body.usageLimit ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      setEditingId(null);
      setForm(emptyForm);
      setFormError("");
      setFieldErrors({});
    },
    onError: parseError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/discounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { error?: string } } }).response?.data
              ?.error || "Failed to delete discount"
          : "Failed to delete discount";
      setFormError(msg);
    },
  });

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setFieldErrors({});
    setShowForm(true);
  };

  const startEdit = (d: Discount) => {
    setShowForm(false);
    setEditingId(d._id);
    setForm({
      code: d.code,
      type: d.type,
      value: d.value,
      appliesTo: d.appliesTo,
      startDate: d.startDate.split("T")[0],
      endDate: d.endDate.split("T")[0],
      usageLimit: d.usageLimit ?? 0,
    });
    setFormError("");
    setFieldErrors({});
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setFieldErrors({});
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, body: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleStartChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      startDate: val,
      endDate: prev.endDate && prev.endDate < val ? "" : prev.endDate,
    }));
    setFieldErrors((prev) => ({ ...prev, startDate: "", endDate: "" }));
  };

  const formOpen = showForm || editingId !== null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Discounts
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage promo codes and discounts
          </p>
        </div>
        <Button variant="default" size="sm" onClick={startCreate}>
          <Plus className="size-4" />
          New Discount
        </Button>
      </div>

      {formOpen && (
        <div className="mb-6 border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-wider uppercase">
              {editingId ? "Edit Discount" : "Create Discount"}
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
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => { setForm({ ...form, code: e.target.value }); setFieldErrors({ ...fieldErrors, code: "" }); }}
                placeholder="SUMMER20"
                className={fieldErrors.code ? "border-destructive" : ""}
              />
              {fieldErrors.code && <p className="text-xs text-destructive">{fieldErrors.code}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>Type</Label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as Discount["type"] })}
                className="h-10 border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                <option value="percent">Percent</option>
                <option value="flat">Flat</option>
              </select>
            </FieldRoot>
            <FieldRoot>
              <Label>Value</Label>
              <Input
                type="number"
                value={form.value}
                onChange={(e) => { setForm({ ...form, value: Number(e.target.value) }); setFieldErrors({ ...fieldErrors, value: "" }); }}
                className={fieldErrors.value ? "border-destructive" : ""}
              />
              {fieldErrors.value && <p className="text-xs text-destructive">{fieldErrors.value}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>Applies To</Label>
              <Input
                value={form.appliesTo}
                onChange={(e) => { setForm({ ...form, appliesTo: e.target.value }); setFieldErrors({ ...fieldErrors, appliesTo: "" }); }}
                placeholder="Itinerary slug or '*' for all"
                className={fieldErrors.appliesTo ? "border-destructive" : ""}
              />
              {fieldErrors.appliesTo && <p className="text-xs text-destructive">{fieldErrors.appliesTo}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => handleStartChange(e.target.value)}
                className={fieldErrors.startDate ? "border-destructive" : ""}
              />
              {fieldErrors.startDate && <p className="text-xs text-destructive">{fieldErrors.startDate}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>End Date</Label>
              <Input
                type="date"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(e) => { setForm({ ...form, endDate: e.target.value }); setFieldErrors({ ...fieldErrors, endDate: "" }); }}
                className={fieldErrors.endDate ? "border-destructive" : ""}
              />
              {fieldErrors.endDate && <p className="text-xs text-destructive">{fieldErrors.endDate}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>Usage Limit</Label>
              <Input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
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
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Save className="size-4" />
              {editingId ? "Save Changes" : "Create"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {isError ? (
          <p className="text-sm text-destructive">Failed to load discounts.</p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : discounts?.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No discounts created yet.
          </p>
        ) : (
          discounts?.map((d) => (
            <div
              key={d._id}
              className="flex items-center justify-between border border-border bg-card px-4 py-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{d.code}</p>
                  <Badge variant={d.active ? "success" : "destructive"}>
                    {d.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {d.type === "percent"
                    ? `${d.value}% off`
                    : `MAD ${d.value} off`}{" "}
                  · {d.appliesTo} · Used {d.usedCount}
                  {d.usageLimit ? `/${d.usageLimit}` : ""}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => startEdit(d)}
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => deleteMutation.mutate(d._id)}
                  disabled={deleteMutation.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
