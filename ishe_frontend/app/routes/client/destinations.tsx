import type { Route } from "./+types/destinations";
import { Link } from "react-router";
import { MapPin } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import apiClient from "~/lib/api-client";
import { seoMeta } from "~/lib/seo";
import type { Destination } from "~/types";

export async function loader() {
  const res = await apiClient.get<Destination[]>("/content/destinations");
  return { destinations: res.data };
}

export function meta({}: Route.MetaArgs) {
  return seoMeta({
    title: "Uganda Destinations — Isitoshe Tours",
    path: "/destinations",
    description:
      "Explore the destinations our Uganda tours visit — Bwindi Impenetrable Forest, Murchison Falls, Queen Elizabeth National Park, and more.",
  });
}

export default function Destinations({ loaderData }: Route.ComponentProps) {
  const { destinations } = loaderData;

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground">Destinations</h1>
          <p className="mt-2 text-muted-foreground">
            Explore the stunning locations our tours visit across Uganda.
          </p>
        </div>

        {destinations.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            No destinations yet. Check back soon.
          </p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((dest) => (
              <Link
                key={dest.id}
                to={`/destinations/${dest.slug}`}
                className="group block border border-border bg-card transition-shadow hover:shadow-lg"
              >
                {dest.images?.[0] ? (
                  <div className="aspect-[16/9] overflow-hidden bg-muted">
                    <img
                      src={dest.images[0]}
                      alt={dest.name}
                      loading="lazy"
                      width={640}
                      height={360}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center bg-muted">
                    <MapPin className="size-10 text-muted-foreground/40" />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-heading text-lg font-semibold group-hover:text-primary transition-colors">
                    {dest.name}
                  </h2>
                  {dest.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {dest.description}
                    </p>
                  )}
                  {dest.highlights && dest.highlights.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {dest.highlights.slice(0, 3).map((h) => (
                        <Badge key={h} variant="secondary" className="text-xs">
                          {h}
                        </Badge>
                      ))}
                      {dest.highlights.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{dest.highlights.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
