import type { Route } from "./+types/client-tracker";
import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, ChevronDown, ChevronUp, Plus, Pencil, Save, X } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label, FieldRoot } from "~/components/ui/label";
import * as Dialog from "~/components/ui/dialog";
import apiClient from "~/lib/api-client";
import { createClientSchema } from "~/schemas/clientSchema";
import { validateWithSchema } from "~/lib/validate";
import { parseApiError, parseFieldErrors } from "~/lib/api-errors";
import type { Client, Booking, PaginatedResponse } from "~/types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Clients — Isitoshe Tours Admin" }];
}

export default function ClientTracker() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { data: clients, isLoading, isError } = useQuery({
    queryKey: ["clients", debouncedSearch],
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<Client>>(`/clients${debouncedSearch ? `?search=${debouncedSearch}` : ""}`)
        .then((r) => r.data.data),
  });

  const { data: clientBookings, isError: bookingsError } = useQuery({
    queryKey: ["client-bookings", expandedId],
    queryFn: () =>
      apiClient
        .get<Booking[]>(`/clients/${expandedId}/bookings`)
        .then((r) => r.data),
    enabled: !!expandedId,
  });

  const [formError, setFormError] = useState("");

  const parseError = (err: unknown) => {
    const res = parseApiError(err);
    setFormError(res?.error || "Operation failed");
    setFieldErrors({});
    if (res?.details) {
      setFieldErrors(parseFieldErrors(res.details));
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: typeof form) =>
      apiClient.post("/clients", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        notes: data.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setDialogOpen(false);
      setForm({ name: "", email: "", phone: "", notes: "" });
      setFormError("");
      setFieldErrors({});
    },
    onError: parseError,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; body: typeof form }) =>
      apiClient.patch(`/clients/${data.id}`, {
        name: data.body.name,
        email: data.body.email,
        phone: data.body.phone,
        notes: data.body.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setDialogOpen(false);
      setEditingClient(null);
      setForm({ name: "", email: "", phone: "", notes: "" });
      setFormError("");
      setFieldErrors({});
    },
    onError: parseError,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateWithSchema(createClientSchema, form);
    if (!validation.success) {
      setFieldErrors(validation.errors);
      setFormError("Please fix the errors below");
      return;
    }
    setFieldErrors({});
    setFormError("");
    if (editingClient) {
      updateMutation.mutate({ id: editingClient._id, body: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const openCreate = () => {
    setEditingClient(null);
    setForm({ name: "", email: "", phone: "", notes: "" });
    setFormError("");
    setFieldErrors({});
    setDialogOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      notes: client.notes || "",
    });
    setFormError("");
    setFieldErrors({});
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Clients
          </h1>
          <p className="text-sm text-muted-foreground">
            Search and view client profiles
          </p>
        </div>
        <Button variant="default" size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          Add Client
        </Button>
      </div>

      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Popup>
          <Dialog.Title>{editingClient ? "Edit Client" : "Add Client"}</Dialog.Title>
          <Dialog.Description>
            {editingClient ? "Update client details." : "Create a new client profile."}
          </Dialog.Description>
          <Dialog.Close />
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
            <FieldRoot>
              <Label>Name</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); setFieldErrors({ ...fieldErrors, name: "" }); }}
                placeholder="Client name"
                className={fieldErrors.name ? "border-destructive" : ""}
              />
              {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setFieldErrors({ ...fieldErrors, email: "" }); }}
                placeholder="client@example.com"
                className={fieldErrors.email ? "border-destructive" : ""}
              />
              {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>Phone</Label>
              <Input
                required
                value={form.phone}
                onChange={(e) => { setForm({ ...form, phone: e.target.value }); setFieldErrors({ ...fieldErrors, phone: "" }); }}
                placeholder="+256 787 699744"
                className={fieldErrors.phone ? "border-destructive" : ""}
              />
              {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>Notes</Label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-input bg-background p-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 resize-none"
                rows={3}
                placeholder="Any notes about the client"
              />
            </FieldRoot>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="size-4" />
                {editingClient ? "Save Changes" : "Save Client"}
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Root>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          aria-label="Search clients"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => setDebouncedSearch(e.target.value), 300);
          }}
          className="w-full border border-input bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="space-y-2">
        {isError ? (
          <p className="text-sm text-destructive">Failed to load clients.</p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : clients?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No clients found.</p>
        ) : (
          clients?.map((client) => (
            <div key={client._id} className="border border-border bg-card">
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === client._id ? null : client._id
                  )
                }
                aria-expanded={expandedId === client._id}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-medium">{client.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {client.email} · {client.phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(client);
                    }}
                    className="p-1 text-muted-foreground hover:text-foreground"
                    aria-label="Edit client"
                  >
                    <Pencil className="size-3" />
                  </button>
                  {expandedId === client._id ? (
                    <ChevronUp className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  )}
                </div>
              </button>
              {expandedId === client._id && (
                <div className="border-t border-border px-4 py-3">
                  {bookingsError ? (
                    <p className="text-sm text-destructive">Failed to load bookings.</p>
                  ) : clientBookings?.length ? (
                    <div className="space-y-2">
                      {clientBookings.map((b) => (
                        <div
                          key={b._id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>
                            {b.itineraryTitle || b.itinerary}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{b.status}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(b.travelDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No booking history.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
