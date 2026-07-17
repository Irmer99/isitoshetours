import type { Route } from "./+types/bookings-list";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Plus, Save, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label, FieldRoot } from "~/components/ui/label";
import * as Dialog from "~/components/ui/dialog";
import apiClient from "~/lib/api-client";
import { statusColors, CURRENCY } from "~/lib/constants";
import { parseApiError, parseFieldErrors } from "~/lib/api-errors";
import type { Booking, Client, Itinerary, PaginatedResponse } from "~/types";

function useBookings(status: string, archived: boolean) {
  return useQuery({
    queryKey: ["bookings", status, archived],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (archived) params.set("archived", "true");
      const qs = params.toString();
      return apiClient
        .get<PaginatedResponse<Booking>>(`/bookings${qs ? `?${qs}` : ""}`)
        .then((r) => r.data.data);
    },
  });
}

function useClients() {
  return useQuery({
    queryKey: ["clients-list"],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Client>>("/clients").then((r) => r.data.data),
  });
}

function useItineraries() {
  return useQuery({
    queryKey: ["itineraries-list"],
    queryFn: () =>
      apiClient.get<Itinerary[]>("/content/itineraries").then((r) => r.data),
  });
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Bookings — Isitoshe Tours Admin" }];
}

export default function BookingsList() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    clientId: "",
    itinerary: "",
    itineraryTitle: "",
    travelDate: "",
    participants: 1,
    totalAmount: 0,
    notes: "",
  });

  const { data: bookings, isLoading, isError } = useBookings(statusFilter, showArchived);
  const { data: clients } = useClients();
  const { data: itineraries } = useItineraries();

  const statuses = ["", "enquiry", "confirmed", "completed", "cancelled"];

  const [formError, setFormError] = useState("");

  const createMutation = useMutation({
    mutationFn: (data: typeof form) =>
      apiClient.post("/bookings", {
        clientId: data.clientId,
        itinerary: data.itinerary,
        itineraryTitle: data.itineraryTitle || undefined,
        travelDate: data.travelDate,
        participants: data.participants,
        totalAmount: data.totalAmount,
        notes: data.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setDialogOpen(false);
      setForm({
        clientId: "",
        itinerary: "",
        itineraryTitle: "",
        travelDate: "",
        participants: 1,
        totalAmount: 0,
        notes: "",
      });
      setFormError("");
      setFieldErrors({});
    },
    onError: (err: unknown) => {
      const res = parseApiError(err);
      setFormError(res?.error || "Failed to create booking");
      setFieldErrors({});
      if (res?.details) {
        setFieldErrors(parseFieldErrors(res.details));
      }
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    createMutation.mutate(form);
  };

  const handleItinerarySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value;
    const selected = itineraries?.find((i) => i.slug === slug);
    setForm({
      ...form,
      itinerary: slug,
      itineraryTitle: selected?.title || "",
    });
  };

  const exportCSV = () => {
    if (!bookings?.length) return;
    const headers = [
      "ID", "Client Name", "Email", "Phone", "Itinerary",
      "Status", "Travel Date", "Participants", "Total",
    ];
    const rows = bookings.map((b) => [
      b._id,
      typeof b.clientId === "object" ? b.clientId.name : b.clientId,
      typeof b.clientId === "object" ? b.clientId.email : "",
      typeof b.clientId === "object" ? b.clientId.phone : "",
      b.itineraryTitle || b.itinerary,
      b.status,
      new Date(b.travelDate).toLocaleDateString(),
      b.participants,
      b.totalAmount,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookings.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Bookings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage booking pipeline
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
            <Dialog.Trigger>
              <Button variant="default" size="sm">
                <Plus className="size-4" />
                New Booking
              </Button>
            </Dialog.Trigger>
            <Dialog.Popup>
              <Dialog.Title>New Booking</Dialog.Title>
              <Dialog.Description>
                Create a new booking for a client.
              </Dialog.Description>
              <Dialog.Close />
              <form onSubmit={handleCreate} className="mt-4 space-y-4">
                {formError && (
                  <p className="text-sm text-destructive">{formError}</p>
                )}
                <FieldRoot>
                  <Label>Client</Label>
                  <select
                    required
                    value={form.clientId}
                    onChange={(e) => { setForm({ ...form, clientId: e.target.value }); setFieldErrors({ ...fieldErrors, clientId: "" }); }}
                    className={`h-10 border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 ${fieldErrors.clientId ? "border-destructive" : "border-input"}`}
                  >
                    <option value="">Select a client</option>
                    {clients?.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                  {fieldErrors.clientId && <p className="text-xs text-destructive">{fieldErrors.clientId}</p>}
                </FieldRoot>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldRoot>
                    <Label>Itinerary</Label>
                    <select
                      required
                      value={form.itinerary}
                      onChange={handleItinerarySelect}
                      className={`h-10 border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 ${fieldErrors.itinerary ? "border-destructive" : "border-input"}`}
                    >
                      <option value="">Select an itinerary</option>
                      {itineraries?.map((i) => (
                        <option key={i.slug} value={i.slug}>
                          {i.title}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.itinerary && <p className="text-xs text-destructive">{fieldErrors.itinerary}</p>}
                  </FieldRoot>
                  <FieldRoot>
                    <Label>Itinerary Title</Label>
                    <Input
                      value={form.itineraryTitle}
                      onChange={(e) => setForm({ ...form, itineraryTitle: e.target.value })}
                      placeholder="Auto-filled from selection"
                      disabled
                    />
                  </FieldRoot>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <FieldRoot>
                    <Label>Travel Date</Label>
                    <Input
                      type="date"
                      required
                      value={form.travelDate}
                      onChange={(e) => { setForm({ ...form, travelDate: e.target.value }); setFieldErrors({ ...fieldErrors, travelDate: "" }); }}
                      className={fieldErrors.travelDate ? "border-destructive" : ""}
                    />
                    {fieldErrors.travelDate && <p className="text-xs text-destructive">{fieldErrors.travelDate}</p>}
                  </FieldRoot>
                  <FieldRoot>
                    <Label>Participants</Label>
                    <Input
                      type="number"
                      min={1}
                      required
                      value={form.participants}
                      onChange={(e) => { setForm({ ...form, participants: Number(e.target.value) }); setFieldErrors({ ...fieldErrors, participants: "" }); }}
                      className={fieldErrors.participants ? "border-destructive" : ""}
                    />
                    {fieldErrors.participants && <p className="text-xs text-destructive">{fieldErrors.participants}</p>}
                  </FieldRoot>
                  <FieldRoot>
                    <Label>Total Amount ({CURRENCY})</Label>
                    <Input
                      type="number"
                      min={0}
                      required
                      value={form.totalAmount}
                      onChange={(e) => { setForm({ ...form, totalAmount: Number(e.target.value) }); setFieldErrors({ ...fieldErrors, totalAmount: "" }); }}
                      className={fieldErrors.totalAmount ? "border-destructive" : ""}
                    />
                    {fieldErrors.totalAmount && <p className="text-xs text-destructive">{fieldErrors.totalAmount}</p>}
                  </FieldRoot>
                </div>
                <FieldRoot>
                  <Label>Notes</Label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full border border-input bg-background p-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 resize-none"
                    rows={3}
                    placeholder="Optional notes"
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
                    disabled={createMutation.isPending}
                  >
                    <Save className="size-4" />
                    Create Booking
                  </Button>
                </div>
              </form>
            </Dialog.Popup>
          </Dialog.Root>

          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setShowArchived(false); }}
              aria-pressed={statusFilter === s && !showArchived}
              className={`rounded-none border px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                statusFilter === s && !showArchived
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background text-muted-foreground hover:border-muted-foreground"
              }`}
            >
              {s || "All"}
            </button>
          ))}
          <button
            onClick={() => { setShowArchived(true); setStatusFilter(""); }}
            aria-pressed={showArchived}
            className={`rounded-none border px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
              showArchived
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-muted-foreground hover:border-muted-foreground"
            }`}
          >
            Archived
          </button>
          <Button
            variant="outline"
            size="xs"
            onClick={exportCSV}
            disabled={!bookings?.length}
          >
            <Download className="size-3" />
            CSV
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">Client</th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">Itinerary</th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">Date</th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">Total</th>
            </tr>
          </thead>
          <tbody>
            {isError ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-destructive">
                  Failed to load bookings.
                </td>
              </tr>
            ) : isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : bookings?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {showArchived ? "No archived bookings." : "No bookings found."}
                </td>
              </tr>
            ) : (
              bookings?.map((b) => (
                <tr key={b._id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/bookings/${b._id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {typeof b.clientId === "object"
                        ? b.clientId.name
                        : "View"}
                    </Link>
                    {typeof b.clientId === "object" && (
                      <p className="text-xs text-muted-foreground">
                        {b.clientId.email}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {b.itineraryTitle || b.itinerary}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusColors[b.status]}>{b.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(b.travelDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {CURRENCY} {b.totalAmount.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
