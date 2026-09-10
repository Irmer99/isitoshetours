import { Link } from "react-router";
import type { Route } from "./+types/disability";
import { seoMeta } from "~/lib/seo";
import apiClient from "~/lib/api-client";

export function meta({}: Route.MetaArgs) {
  return seoMeta({
    title: "Disability-Inclusive Travel — Isitoshe Tours",
    path: "/disability",
    description:
      "Accessible, disability-inclusive safaris in Uganda. Wheelchair-friendly itineraries, adaptive vehicles, and experienced support for travellers with disabilities.",
  });
}

export async function loader() {
  try {
    const res = await apiClient.get("/content/site-settings");
    return res.data;
  } catch {
    return null;
  }
}

function FallbackContent() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-foreground">
        Disability-Inclusive Travel
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Uganda&apos;s wild beauty belongs to everyone. Isitoshe Tours is a
        disability-inclusive tour operator, and we design every safari so that
        travellers with disabilities can experience it comfortably, safely, and
        with dignity.
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
            How We Support Your Journey
          </h2>
          <p>
            From the moment you enquire, our team works with you to understand your
            needs and adapt your itinerary around them. We are committed to removing
            barriers — physical, sensory, or otherwise — so the only thing you carry
            is the excitement of the journey.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Accessible vehicles</strong> — vans and
              vehicles with ramps or lift access, extra space, and flexible seating.
            </li>
            <li>
              <strong className="text-foreground">Wheelchair-friendly lodges</strong> — we
              select accommodation with step-free access, accessible bathrooms, and
              ground-floor rooms wherever possible.
            </li>
            <li>
              <strong className="text-foreground">Adaptive activities</strong> — game drives
              and viewing decks designed so everyone can see, with guides who can adapt
              pacing to mobility levels.
            </li>
            <li>
              <strong className="text-foreground">Sensory support</strong> — quiet pacing,
              reduced-stimulation options, and guides experienced in supporting travellers
              with visual, hearing, or cognitive disabilities.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
            Honest, Practical Planning
          </h2>
          <p>
            Accessibility looks different for everyone, so we never guess. Before we
            finalise an itinerary, we&apos;ll discuss:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>The nature of your disability and your preferred mobility aids</li>
            <li>Your comfort with long drives, uneven terrain, and high altitude</li>
            <li>Any medication, equipment, or dietary requirements</li>
            <li>Whether you&apos;ll travel with a companion or carer</li>
          </ul>
          <p className="mt-3">
            We rate every itinerary&apos;s physical difficulty honestly, and we will tell
            you straight if a particular park or activity won&apos;t suit your needs —
            then we&apos;ll offer a workable alternative.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
            Travelling With a Companion or Carer
          </h2>
          <p>
            Companions and carers are welcome. Let us know when booking and we&apos;ll
            arrange adjacent rooms, shared transport, and a single point of contact
            for your whole group.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
            Let&apos;s Plan Together
          </h2>
          <p>
            The best itineraries for disability-inclusive travel are built through
            conversation. Reach out to us and tell us what you need — we&apos;ll take it
            from there.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link to="/contact">
              <span className="inline-block bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                Contact Us
              </span>
            </Link>
            <Link to="/itineraries">
              <span className="inline-block border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50">
                Browse Itineraries
              </span>
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-12 text-center">
        <Link to="/" className="text-sm font-semibold text-primary hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function Disability({ loaderData }: Route.ComponentProps) {
  const page = loaderData?.data?.disabilityPage as { title?: string; content?: string } | undefined;

  if (!page?.content) {
    return <FallbackContent />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-foreground">
        {page.title || "Disability-Inclusive Travel"}
      </h1>
      <div
        className="mt-4 text-sm leading-relaxed text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
      <div className="mt-12 text-center">
        <Link to="/" className="text-sm font-semibold text-primary hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
