import type { Route } from "./+types/dashboard";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarCheck,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid } from "recharts";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "~/components/ui/chart";
import apiClient from "~/lib/api-client";
import { CURRENCY } from "~/lib/constants";
import type { StatsOverview, ConversionRate } from "~/types";

interface BookingsByRoute {
  itinerary: string;
  count: number;
  revenue: number;
}

interface BookingsOverTime {
  date: string;
  count: number;
  revenue: number;
}

function useOverview() {
  return useQuery({
    queryKey: ["stats", "overview"],
    queryFn: () =>
      apiClient.get<StatsOverview>("/stats/overview").then((r) => r.data),
  });
}

function useConversion() {
  return useQuery({
    queryKey: ["stats", "conversion"],
    queryFn: () =>
      apiClient.get<ConversionRate>("/stats/conversion").then((r) => r.data),
  });
}

function useBookingsByRoute() {
  return useQuery({
    queryKey: ["stats", "bookings-by-route"],
    queryFn: () =>
      apiClient.get<BookingsByRoute[]>("/stats/bookings-by-route").then((r) => r.data),
  });
}

function useBookingsOverTime() {
  return useQuery({
    queryKey: ["stats", "bookings-over-time"],
    queryFn: () =>
      apiClient.get<BookingsOverTime[]>("/stats/bookings-over-time").then((r) => r.data),
  });
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dashboard — Isitoshe Tours Admin" }];
}

export default function Dashboard() {
  const { data: overview, isLoading: ovLoading, isError: ovError } = useOverview();
  const { data: conversion, isLoading: convLoading, isError: convError } = useConversion();
  const { data: byRoute, isLoading: routeLoading, isError: routeError } = useBookingsByRoute();
  const { data: overTime, isLoading: timeLoading, isError: timeError } = useBookingsOverTime();

  const metrics = [
    {
      label: "Total Bookings",
      value: overview?.totalBookings ?? "-",
      icon: CalendarCheck,
      color: "text-primary",
    },
    {
      label: "This Month",
      value: overview?.bookingsThisMonth ?? "-",
      icon: TrendingUp,
      color: "text-success",
    },
    {
      label: "Top Routes",
      value: overview?.topItineraries?.length ?? "-",
      icon: Users,
      color: "text-secondary",
    },
    {
      label: "Revenue (MTD)",
      value: overview?.totalRevenue
        ? `${CURRENCY} ${overview.totalRevenue.toLocaleString()}`
        : "-",
      icon: DollarSign,
      color: "text-primary",
    },
  ];

  const routeChartData = byRoute?.map((r) => ({
    name: r.itinerary.length > 20 ? r.itinerary.slice(0, 20) + "..." : r.itinerary,
    bookings: r.count,
    revenue: r.revenue,
  })) ?? [];

  const timeChartData = overTime?.map((t) => ({
    date: t.date,
    bookings: t.count,
    revenue: t.revenue,
  })) ?? [];

  const routeChartConfig = {
    bookings: { label: "Bookings", color: "var(--color-primary)" },
  } satisfies ChartConfig;

  const timeChartConfig = {
    bookings: { label: "Bookings", color: "var(--color-primary)" },
  } satisfies ChartConfig;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of your booking metrics
        </p>
      </div>

      {ovError && (
        <p className="mb-4 text-sm text-destructive">
          Failed to load dashboard data. Check your connection and try again.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                {m.label}
              </p>
              <m.icon className={`size-5 ${m.color}`} />
            </div>
            <p className="mt-2 font-heading text-2xl font-bold">
              {ovLoading ? "..." : m.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="border border-border bg-card p-6">
          <h2 className="text-sm font-semibold tracking-wider uppercase">
            Conversion Rate
          </h2>
          {convError ? (
            <p className="mt-2 text-sm text-destructive">
              Failed to load conversion data.
            </p>
          ) : convLoading ? (
            <p className="mt-2 text-muted-foreground">Loading...</p>
          ) : (
            <div className="mt-4 flex items-end gap-4">
              <p className="font-heading text-3xl font-bold text-primary">
                {conversion?.rate
                  ? `${(conversion.rate * 100).toFixed(1)}%`
                  : "0%"}
              </p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>
                  Enquiries: {conversion?.enquiries ?? 0}
                </span>
                <span>
                  Confirmed: {conversion?.confirmed ?? 0}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="border border-border bg-card p-6">
          <h2 className="text-sm font-semibold tracking-wider uppercase">
            Top Itineraries
          </h2>
          {ovError ? (
            <p className="mt-2 text-sm text-destructive">
              Failed to load top itineraries.
            </p>
          ) : ovLoading ? (
            <p className="mt-2 text-muted-foreground">Loading...</p>
          ) : (
            <div className="mt-4 space-y-3">
              {overview?.topItineraries?.length ? (
                overview.topItineraries.map((item) => (
                  <div
                    key={item.itinerary}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{item.itinerary}</span>
                    <Badge variant="secondary">{item.count} bookings</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No data yet
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Route</CardTitle>
          </CardHeader>
          <CardContent>
            {routeError ? (
              <p className="text-sm text-destructive">Failed to load data.</p>
            ) : routeLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : routeChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ChartContainer config={routeChartConfig} className="h-[250px] w-full">
                <BarChart data={routeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="bookings" fill="var(--color-primary)" radius={0} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {timeError ? (
              <p className="text-sm text-destructive">Failed to load data.</p>
            ) : timeLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : timeChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ChartContainer config={timeChartConfig} className="h-[250px] w-full">
                <LineChart data={timeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
