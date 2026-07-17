import { useMemo } from "react";
import type { Route } from "./+types/itineraries";
import { Link, useSearchParams } from "react-router";
import { Search } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import apiClient from "~/lib/api-client";
import type { Itinerary } from "~/types";

export async function loader() {
  const res = await apiClient.get(`/content/itineraries`);
  return { itineraries: res.data as Itinerary[] };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Itineraries — Isitoshe Tours" },
    { name: "description", content: "Browse our curated tour itineraries." },
  ];
}

const difficulties = ["easy", "moderate", "hard"] as const;

export default function Itineraries({ loaderData }: Route.ComponentProps) {
  const { itineraries } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const difficulty = searchParams.get("difficulty") || "";

  const filtered = useMemo(() => {
    return itineraries.filter((it) => {
      if (difficulty && it.difficulty !== difficulty) return false;
      if (search && !it.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [itineraries, search, difficulty]);

  const updateParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Our Itineraries
        </h1>
        <p className="mt-2 text-muted-foreground">
          Find your perfect Ugandan adventure
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="search"
            type="text"
            placeholder="Search itineraries..."
            aria-label="Search itineraries"
            value={search}
            onChange={(e) => updateParam("search", e.target.value)}
            className="w-full border border-input bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex gap-2">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => {
                updateParam("difficulty", d === difficulty ? "" : d);
              }}
              aria-pressed={difficulty === d}
              className={`rounded-none border px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
                difficulty === d
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background text-muted-foreground hover:border-muted-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">
            No itineraries found.
          </p>
        )}
        {filtered.map((it: Itinerary) => (
          <Link
            key={it._id}
            to={`/itineraries/${it.slug}`}
            className="group border border-border bg-card transition-shadow hover:shadow-lg"
          >
            <div className="aspect-[16/9] bg-muted flex items-center justify-center text-muted-foreground">
              {it.images?.[0] ? (
                <img
                  src={it.images[0]}
                  alt={it.title}
                  loading="lazy"
                  width={640}
                  height={360}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-xs">Image placeholder</span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{it.difficulty}</Badge>
              </div>
              <h3 className="mt-3 font-heading text-lg font-semibold group-hover:text-primary transition-colors">
                {it.title}
              </h3>
              {it.subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {it.subtitle}
                </p>
              )}
              {it.duration && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {it.duration}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
