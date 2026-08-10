import type { Route } from "./+types/destination-detail";
import { Link, redirect } from "react-router";
import { MapPin, Check, ArrowRight } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import apiClient from "~/lib/api-client";
import type { Destination, Itinerary } from "~/types";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const res = await apiClient.get<Destination>(`/content/destinations/${params.slug}`);
    const itinerariesResult = await Promise.allSettled([
      apiClient.get<Itinerary[]>(`/content/destinations/${params.slug}/itineraries`),
    ]);
    const itineraries =
      itinerariesResult[0].status === "fulfilled" ? itinerariesResult[0].value.data : [];
    return { destination: res.data, itineraries };
  } catch {
    throw redirect("/destinations");
  }
}

export function meta({ loaderData }: Route.MetaArgs) {
  const name = loaderData?.destination?.name;
  return [
    { title: name ? `${name} — Isitoshe Tours` : "Destination — Isitoshe Tours" },
    {
      name: "description",
      content:
        loaderData?.destination?.description ||
        `Explore ${name} on a guided Isitoshe Tours safari.`,
    },
  ];
}

export default function DestinationDetail({ loaderData }: Route.ComponentProps) {
  const { destination, itineraries } = loaderData;

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/destinations"
          className="mb-6 inline-block text-sm font-semibold tracking-wider uppercase text-muted-foreground transition-colors hover:text-primary"
        >
          &larr; All Destinations
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="font-heading text-3xl font-bold text-foreground">{destination.name}</h1>

            {destination.description && (
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {destination.description}
              </p>
            )}

            {destination.highlights && destination.highlights.length > 0 && (
              <div className="mt-8">
                <h2 className="font-heading text-xl font-semibold text-foreground">Highlights</h2>
                <ul className="mt-4 space-y-2">
                  {destination.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {destination.images && destination.images.length > 0 && (
              <div className="mt-8">
                <h2 className="font-heading text-xl font-semibold text-foreground">Gallery</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {destination.images.map((url, i) => (
                    <div key={i} className="overflow-hidden border border-border bg-muted">
                      <img
                        src={url}
                        alt={`${destination.name} ${i + 1}`}
                        loading="lazy"
                        width={640}
                        height={360}
                        className="aspect-video w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-border bg-card p-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                <span className="text-sm font-semibold tracking-wider uppercase">
                  {destination.name}
                </span>
              </div>

              {itineraries.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
                    Tours visiting this destination
                  </h3>
                  <div className="mt-3 space-y-3">
                    {itineraries.map((it) => (
                      <Link
                        key={it.id}
                        to={`/itineraries/${it.slug}`}
                        className="group block border border-border p-3 transition-colors hover:border-primary"
                      >
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">
                          {it.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          {it.duration && <span>{it.duration}</span>}
                          <ArrowRight className="ml-auto size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-6 text-sm text-muted-foreground">
                  No tours currently visit this destination.
                </p>
              )}

              <Link
                to="/contact"
                className="mt-6 block w-full bg-primary px-4 py-2.5 text-center text-sm font-semibold tracking-wider uppercase text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Enquire Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
