import type { Route } from "./+types/home";
import { Link } from "react-router";
import { ArrowRight, Compass, Mountain, Sun } from "lucide-react";

import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ishe Tours — Discover Morocco" },
    {
      name: "description",
      content:
        "Explore Morocco with expertly curated tours and unforgettable experiences.",
    },
  ];
}

const highlights = [
  {
    icon: Compass,
    title: "Curated Routes",
    description:
      "Hand-picked itineraries designed to show you the best of Morocco.",
  },
  {
    icon: Mountain,
    title: "Adventure Awaits",
    description:
      "From the Atlas Mountains to the Sahara desert, explore diverse landscapes.",
  },
  {
    icon: Sun,
    title: "Year-Round Tours",
    description:
      "Every season offers a unique Moroccan experience. Find your perfect time to visit.",
  },
];

export default function Home() {
  return (
    <>
      <section className="relative flex min-h-[80vh] items-center justify-center bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 to-primary/80" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <h1 className="font-heading text-4xl font-bold text-primary-foreground sm:text-5xl lg:text-6xl">
            Discover the Magic of Morocco
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Expertly curated tours through ancient medinas, vast deserts, and the
            stunning Atlas Mountains.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/itineraries">
              <Button variant="secondary" size="lg">
                Explore Tours
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              Why Travel with Ishe Tours?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Authentic experiences, expert guides, and memories that last a lifetime.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-none border border-border bg-card p-8 text-center transition-shadow hover:shadow-lg"
              >
                <div className="mx-auto flex size-12 items-center justify-center bg-primary text-primary-foreground">
                  <item.icon className="size-6" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
