import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Archive, Save, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label, FieldRoot } from "~/components/ui/label";
import apiClient from "~/lib/api-client";
import { statusColors, CURRENCY } from "~/lib/constants";
import { parseApiError, parseFieldErrors, getErrorMessage } from "~/lib/api-errors";
import type { Booking } from "~/types";

const nextStatuses: Record<Booking["status"], Booking["status"][]> = {
  enquiry: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ["booking", id],
    queryFn: () =>
      apiClient.get<Booking>(`/bookings/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const { data: history, isError: historyError } = useQuery({
    queryKey: ["booking-history", id],
    queryFn: () =>
      apiClient.get(`/bookings/${id}/history`).then((r) => r.data),
    enabled: !!id,
  });

  const [editForm, setEditForm] = useState({
    itinerary: "",
    itineraryTitle: "",
    travelDate: "",
    participants: 1,
    totalAmount: 0,
    notes: "",
  });

  const [updateError, setUpdateError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const parseError = (err: unknown) => {
    const res = parseApiError(err);
    setUpdateError(res?.error || "Operation failed");
    setFieldErrors({});
    if (res?.details) {
      setFieldErrors(parseFieldErrors(res.details));
    }
  };

  const updateMutation = useMutation({
    mutationFn: (status: Booking["status"]) =>
      apiClient.patch(`/bookings/${id}`, { status, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["booking-history", id] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setComment("");
      setUpdateError("");
    },
    onError: parseError,
  });

  const editMutation = useMutation({
    mutationFn: (data: typeof editForm) =>
      apiClient.patch(`/bookings/${id}/edit`, {
        itinerary: data.itinerary,
        itineraryTitle: data.itineraryTitle || undefined,
        travelDate: data.travelDate,
        participants: data.participants,
        totalAmount: data.totalAmount,
        notes: data.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setEditing(false);
      setUpdateError("");
      setFieldErrors({});
    },
    onError: parseError,
  });

  const archiveMutation = useMutation({
    mutationFn: () => apiClient.patch(`/bookings/${id}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      navigate("/admin/bookings");
    },
    onError: (err: unknown) => {
      setUpdateError(getErrorMessage(err, "Failed to archive booking"));
      setArchiving(false);
    },
  });

  const startEdit = () => {
    if (!booking) return;
    setEditForm({
      itinerary: booking.itinerary,
      itineraryTitle: booking.itineraryTitle || "",
      travelDate: new Date(booking.travelDate).toISOString().split("T")[0],
      participants: booking.participants,
      totalAmount: booking.totalAmount,
      notes: booking.notes || "",
    });
    setEditing(true);
    setFieldErrors({});
  };

  if (isError) return <p className="text-destructive">Failed to load booking.</p>;
  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!booking) return <p className="text-destructive">Booking not found.</p>;

  const client =
    typeof booking.clientId === "object" ? booking.clientId : null;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Booking #{booking.id.slice(-6)}
          </h1>
          <p className="text-sm text-muted-foreground">
            Created {new Date(booking.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          {!editing && (
            <Button variant="outline" size="sm" onClick={startEdit}>
              <Pencil className="size-4" />
              Edit
            </Button>
          )}
          {!archiving ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setArchiving(true)}
              className="text-destructive hover:text-destructive"
            >
              <Archive className="size-4" />
              Archive
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => archiveMutation.mutate()}
                disabled={archiveMutation.isPending}
              >
                Confirm Archive
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setArchiving(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {updateError && (
        <p className="mb-4 text-sm text-destructive">{updateError}</p>
      )}

      {editing ? (
        <div className="mb-6 border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-wider uppercase">
              Edit Booking
            </h2>
            <button
              onClick={() => setEditing(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close form"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldRoot>
              <Label>Itinerary</Label>
              <Input
                value={editForm.itinerary}
                onChange={(e) => { setEditForm({ ...editForm, itinerary: e.target.value }); setFieldErrors({ ...fieldErrors, itinerary: "" }); }}
                className={fieldErrors.itinerary ? "border-destructive" : ""}
              />
              {fieldErrors.itinerary && <p className="text-xs text-destructive">{fieldErrors.itinerary}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>Itinerary Title</Label>
              <Input
                value={editForm.itineraryTitle}
                onChange={(e) => setEditForm({ ...editForm, itineraryTitle: e.target.value })}
              />
            </FieldRoot>
            <FieldRoot>
              <Label>Travel Date</Label>
              <Input
                type="date"
                value={editForm.travelDate}
                onChange={(e) => { setEditForm({ ...editForm, travelDate: e.target.value }); setFieldErrors({ ...fieldErrors, travelDate: "" }); }}
                className={fieldErrors.travelDate ? "border-destructive" : ""}
              />
              {fieldErrors.travelDate && <p className="text-xs text-destructive">{fieldErrors.travelDate}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>Participants</Label>
              <Input
                type="number"
                min={1}
                value={editForm.participants}
                onChange={(e) => { setEditForm({ ...editForm, participants: Number(e.target.value) }); setFieldErrors({ ...fieldErrors, participants: "" }); }}
                className={fieldErrors.participants ? "border-destructive" : ""}
              />
              {fieldErrors.participants && <p className="text-xs text-destructive">{fieldErrors.participants}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>Total Amount ({CURRENCY})</Label>
              <Input
                type="number"
                min={0}
                value={editForm.totalAmount}
                onChange={(e) => { setEditForm({ ...editForm, totalAmount: Number(e.target.value) }); setFieldErrors({ ...fieldErrors, totalAmount: "" }); }}
                className={fieldErrors.totalAmount ? "border-destructive" : ""}
              />
              {fieldErrors.totalAmount && <p className="text-xs text-destructive">{fieldErrors.totalAmount}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>Notes</Label>
              <Input
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </FieldRoot>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => editMutation.mutate(editForm)}
              disabled={editMutation.isPending}
            >
              <Save className="size-4" />
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border border-border bg-card p-6">
            <h2 className="text-sm font-semibold tracking-wider uppercase">
              Client Details
            </h2>
            {client ? (
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  {client.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  {client.email}
                </p>
                <p>
                  <span className="text-muted-foreground">Phone:</span>{" "}
                  {client.phone}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Client ID: {booking.clientId as string}
              </p>
            )}
          </div>

          <div className="border border-border bg-card p-6">
            <h2 className="text-sm font-semibold tracking-wider uppercase">
              Booking Info
            </h2>
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Itinerary:</span>{" "}
                {booking.itineraryTitle || booking.itinerary}
              </p>
              <p>
                <span className="text-muted-foreground">Travel Date:</span>{" "}
                {new Date(booking.travelDate).toLocaleDateString()}
              </p>
              <p>
                <span className="text-muted-foreground">Participants:</span>{" "}
                {booking.participants}
              </p>
              <p>
                <span className="text-muted-foreground">Total Amount:</span> {CURRENCY}{" "}
                {booking.totalAmount.toLocaleString()}
              </p>
              <p>
                <span className="text-muted-foreground">Status:</span>{" "}
                <Badge variant={statusColors[booking.status]}>
                  {booking.status}
                </Badge>
              </p>
              {booking.notes && (
                <p>
                  <span className="text-muted-foreground">Notes:</span>{" "}
                  {booking.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!editing && nextStatuses[booking.status].length > 0 && (
        <div className="mt-6 border border-border bg-card p-6">
          <h2 className="text-sm font-semibold tracking-wider uppercase">
            Update Status
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {nextStatuses[booking.status].map((status) => (
              <Button
                key={status}
                variant="outline"
                size="sm"
                onClick={() => updateMutation.mutate(status)}
                disabled={updateMutation.isPending}
              >
                Mark as {status}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 border border-border bg-card p-6">
        <h2 className="text-sm font-semibold tracking-wider uppercase">
          Status History
        </h2>
        {historyError ? (
          <p className="mt-2 text-sm text-destructive">Failed to load history.</p>
        ) : history?.length ? (
          <div className="mt-4 space-y-2">
            {(history as { from: string; to: string; changedAt: string }[]).map(
              (entry, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">{entry.from}</Badge>
                  <span className="text-muted-foreground">&rarr;</span>
                  <Badge variant="secondary">{entry.to}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.changedAt).toLocaleString()}
                  </span>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No history yet.
          </p>
        )}
      </div>
    </div>
  );
}
