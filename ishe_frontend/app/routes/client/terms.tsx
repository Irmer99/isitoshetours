import { Link } from "react-router";
import type { Route } from "./+types/terms";
import { seoMeta } from "~/lib/seo";

export function meta({}: Route.MetaArgs) {
  return seoMeta({
    title: "Terms & Conditions — Isitoshe Tours",
    path: "/terms",
    description: "Isitoshe Tours terms and conditions for safari bookings.",
  });
}

export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-foreground">
        Terms &amp; Conditions
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: January 2025
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
            1. Booking &amp; Deposits
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              A minimum deposit of <strong className="text-foreground">$150 USD</strong> per
              person is required to confirm a booking.
            </li>
            <li>
              The remaining balance is due <strong className="text-foreground">60 days</strong>{" "}
              before the tour start date.
            </li>
            <li>
              Bookings made within 60 days of the tour start date require full payment at the
              time of booking.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
            2. Cancellation Policy
          </h2>
          <p className="mb-2">
            Cancellation charges apply based on the number of days before the tour start date:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">12+ weeks before:</strong> USD 150 per person
              (deposit forfeited)
            </li>
            <li>
              <strong className="text-foreground">11–6 weeks before:</strong> 25% of total tour
              cost
            </li>
            <li>
              <strong className="text-foreground">6–2 weeks before:</strong> 50% of total tour
              cost
            </li>
            <li>
              <strong className="text-foreground">Within 2 weeks:</strong> 100% of total tour
              cost
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
            3. Travel Insurance
          </h2>
          <p>
            Comprehensive travel insurance is <strong className="text-foreground">mandatory</strong>{" "}
            for all travellers. It must cover trip cancellation, medical emergencies, emergency
            evacuation, and personal liability. Isitoshe Tours is not responsible for any costs
            arising from inadequate insurance coverage.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
            4. Health Requirements
          </h2>
          <p>
            Travellers must be in good physical and mental health for the activities included in
            their chosen itinerary. It is the traveller&apos;s responsibility to disclose any
            pre-existing medical conditions at the time of booking. Some tours involve strenuous
            activities and may not be suitable for individuals with certain health conditions.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
            5. Passport &amp; Visa Requirements
          </h2>
          <p>
            All travellers must hold a valid passport with at least 6 months&apos; validity from the
            date of entry into Uganda. Visa requirements vary by nationality. It is the
            traveller&apos;s responsibility to obtain the necessary travel documents before departure.
            Isitoshe Tours can provide guidance but cannot be held responsible for denied entry
            due to incomplete documentation.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
            6. Liability
          </h2>
          <p>
            Isitoshe Tours acts as an agent for independent suppliers (accommodation, transport,
            activity operators). We are not liable for any loss, injury, damage, delay, or
            irregularity caused by these suppliers or by circumstances beyond our control. Our
            total liability shall not exceed the amount paid for the tour.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
            7. Delays &amp; Itinerary Changes
          </h2>
          <p>
            Isitoshe Tours reserves the right to modify itineraries, accommodation, or
            transport arrangements due to weather, road conditions, safety concerns, or other
            unforeseen circumstances. Every effort will be made to provide equivalent alternatives.
            Additional costs resulting from such changes will be borne by the traveller.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
            8. Unforeseeable Events
          </h2>
          <p>
            Isitoshe Tours shall not be held liable for failure to perform obligations due to
            force majeure events including, but not limited to: natural disasters, epidemics or
            pandemics, political instability, civil unrest, government actions, terrorism, or
            other events beyond our reasonable control.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
            9. Surcharges
          </h2>
          <p>
            Isitoshe Tours reserves the right to impose surcharges due to currency fluctuations,
            fuel price increases, government levies, park fee changes, or tax increases. Any
            surcharges will be communicated to the traveller before the final payment is due.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
            10. Transfers
          </h2>
          <p>
            Airport transfers and in-tour transport are provided as specified in each itinerary.
            Changes to transfer times or pick-up locations requested by the traveller may incur
            additional charges.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
            11. Tour Inclusions &amp; Exclusions
          </h2>
          <p>
            Each itinerary clearly lists what is included and excluded. Items not explicitly
            listed as included are the traveller&apos;s responsibility and expense (e.g. personal
            shopping, optional activities, alcoholic beverages, gratuities unless stated).
          </p>
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
