import type { Route } from "./+types/notifications";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import { Bell, CheckCheck, Mail, MailOpen } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import apiClient from "~/lib/api-client";
import type { Notification, PaginatedResponse } from "~/types";

function useNotifications(unreadOnly: boolean, page: number) {
  return useQuery({
    queryKey: ["notifications", unreadOnly, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (unreadOnly) params.set("unread", "true");
      return apiClient
        .get<PaginatedResponse<Notification>>(`/notifications?${params}`)
        .then((r) => r.data);
    },
  });
}

function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () =>
      apiClient.get<{ count: number }>("/notifications/unread-count").then((r) => r.data.count),
    refetchInterval: 30000,
  });
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Notifications — Isitoshe Tours Admin" }];
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Notifications() {
  const queryClient = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useNotifications(unreadOnly, page);
  const notifications = data?.data ?? [];
  const totalPages = data?.pages ?? 1;

  const markRead = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => apiClient.patch("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) markRead.mutate(n.id);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            Enquiry submissions and updates
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending}
        >
          <CheckCheck className="size-4" />
          Mark all as read
        </Button>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => { setUnreadOnly(false); setPage(1); }}
          aria-pressed={!unreadOnly}
          className={`rounded-none border px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
            !unreadOnly
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-background text-muted-foreground hover:border-muted-foreground"
          }`}
        >
          All
        </button>
        <button
          onClick={() => { setUnreadOnly(true); setPage(1); }}
          aria-pressed={unreadOnly}
          className={`rounded-none border px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
            unreadOnly
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-background text-muted-foreground hover:border-muted-foreground"
          }`}
        >
          Unread
        </button>
      </div>

      <div className="border border-border">
        {isLoading ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-muted-foreground">
            <Bell className="size-8" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50">
                <div className="mt-0.5">
                  {n.read ? (
                    <MailOpen className="size-4 text-muted-foreground" />
                  ) : (
                    <Mail className="size-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    {!n.read && (
                      <span className="size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">{timeAgo(n.createdAt)}</p>
                </div>
                {n.link && (
                  <Link
                    to={n.link}
                    onClick={() => handleNotificationClick(n)}
                    className="shrink-0 text-xs font-semibold text-primary hover:underline"
                  >
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export { useUnreadCount };
