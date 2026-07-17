import type { Route } from "./+types/itinerary-detail";
import { Link, redirect } from "react-router";
import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Send } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import * as Dialog from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label, FieldRoot, ErrorMessage } from "~/components/ui/label";
import apiClient from "~/lib/api-client";
import { createClientSchema } from "~/schemas/clientSchema";
import { validateWithSchema } from "~/lib/validate";
import { SITE_CONTACT } from "~/lib/constants";
import type { Itinerary } from "~/types";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const res = await apiClient.get(`/content/itineraries/${params.slug}`);
    return { itinerary: res.data as Itinerary };
  } catch {
    throw redirect("/itineraries");
  }
}

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: `${loaderData?.itinerary?.title || "Itinerary"} — Isitoshe Tours` },
    {
      name: "description",
      content: loaderData?.itinerary?.subtitle || "",
    },
  ];
}

export default function ItineraryDetail({
  loaderData,
}: Route.ComponentProps) {
  const { itinerary } = loaderData;
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");

  const handleEnquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setEnquiryError("");
    const form = new FormData(e.currentTarget);
    const clientData = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      phone: form.get("phone") as string,
    };
    const validation = validateWithSchema(createClientSchema, clientData);
    if (!validation.success) {
      const firstError = Object.values(validation.errors)[0];
      setEnquiryError(firstError || "Please fill in all required fields");
      setSubmitting(false);
      return;
    }
    try {
      let clientId: string;
      try {
        const clientRes = await apiClient.post("/clients", clientData);
        clientId = clientRes.data._id;
      } catch (err: unknown) {
        const status = err && typeof err === "object" && "response" in err
          ? (err as { response: { status: number } }).response?.status
          : null;
        if (status === 409) {
          clientId = (err as { response: { data: { clientId: string } } }).response.data.clientId;
        } else {
          throw err;
        }
      }
      await apiClient.post("/bookings", {
        clientId,
        itinerary: itinerary.slug,
        itineraryTitle: itinerary.title,
        travelDate: form.get("travelDate"),
        participants: Number(form.get("participants")),
        totalAmount: itinerary.pricing?.from || 0,
        notes: form.get("notes") || undefined,
      });
      setDialogOpen(false);
      const message = encodeURIComponent(
        `Hi Isitoshe Tours! I submitted an enquiry for ${itinerary.title}.`
      );
      window.open(`https://wa.me/${SITE_CONTACT.phoneDigits}?text=${message}`, "_blank");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { error?: string } } }).response?.data?.error || "Failed to submit enquiry"
          : "Failed to submit enquiry";
      setEnquiryError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{itinerary.difficulty}</Badge>
            {itinerary.destinations?.map((d) => (
              <Link key={d} to={`/destinations/${d}`}>
                <Badge variant="outline" className="hover:bg-primary/10 hover:text-primary transition-colors">
                  {d.replace(/-/g, " ")}
                </Badge>
              </Link>
            ))}
          </div>
          <h1 className="mt-2 font-heading text-3xl font-bold text-foreground">
            {itinerary.title}
          </h1>
          {itinerary.subtitle && (
            <p className="mt-2 text-lg text-muted-foreground">
              {itinerary.subtitle}
            </p>
          )}
          {itinerary.images && itinerary.images.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {itinerary.images.map((url, i) => (
                <div key={i} className="overflow-hidden border border-border bg-muted">
                  <img
                    src={url}
                    alt={`${itinerary.title} ${i + 1}`}
                    loading="lazy"
                    width={640}
                    height={360}
                    className="aspect-video w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          {itinerary.duration && (
            <p className="mt-1 text-sm text-muted-foreground">
              Duration: {itinerary.duration}
            </p>
          )}

          {itinerary.includes && itinerary.includes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold tracking-wider uppercase">
                Includes
              </h3>
              <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                {itinerary.includes.map((item: string) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="size-3.5 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <h2 className="font-heading text-xl font-bold">Itinerary</h2>
            <div className="mt-4 space-y-2">
              {itinerary.days?.map((day: Itinerary["days"][number]) => (
                <div
                  key={day.day}
                  className="border border-border"
                >
                  <button
                    onClick={() =>
                      setExpandedDay(
                        expandedDay === day.day ? null : day.day
                      )
                    }
                    aria-expanded={expandedDay === day.day}
                    className="flex w-full items-center justify-between bg-muted px-4 py-3 text-left"
                  >
                    <span className="text-sm font-semibold">
                      Day {day.day}{day.title ? `: ${day.title}` : ""}
                    </span>
                    {expandedDay === day.day ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </button>
                  {expandedDay === day.day && (
                    <div className="px-4 py-3">
                      {day.description && (
                        <p className="text-sm text-muted-foreground">
                          {day.description}
                        </p>
                      )}
                      {day.meals && day.meals.length > 0 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Meals: {day.meals.join(", ")}
                        </p>
                      )}
                      {day.accommodation && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Accommodation: {day.accommodation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 border border-border bg-card p-6">
            <p className="mb-4 text-sm font-semibold text-primary">
              Enquire for pricing
            </p>

            <ul className="mb-6 space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="size-3.5 text-primary" />
                Expert local guides
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="size-3.5 text-primary" />
                Hand-picked accommodations
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="size-3.5 text-primary" />
                Flexible booking
              </li>
            </ul>

            <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
              <Dialog.Trigger>
                <Button variant="default" size="lg" className="w-full">
                  <Send className="size-4" />
                  Enquire Now
                </Button>
              </Dialog.Trigger>
              <Dialog.Popup>
                <Dialog.Title>Enquire About This Tour</Dialog.Title>
                <Dialog.Description>
                  Fill in your details and we'll get back to you.
                </Dialog.Description>
                <Dialog.Close />
                <form onSubmit={handleEnquiry} className="mt-4 space-y-4">
                  {enquiryError && (
                    <p className="text-sm text-destructive">{enquiryError}</p>
                  )}
                  <FieldRoot>
                    <Label>Name</Label>
                    <Input
                      name="name"
                      required
                      placeholder="Your full name"
                    />
                  </FieldRoot>
                  <FieldRoot>
                    <Label>Email</Label>
                    <Input
                      name="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                    />
                  </FieldRoot>
                  <FieldRoot>
                    <Label>Phone</Label>
                    <Input
                      name="phone"
                      required
                      placeholder={SITE_CONTACT.phone}
                    />
                  </FieldRoot>
                  <FieldRoot>
                    <Label>Travel Date</Label>
                    <Input name="travelDate" type="date" required />
                  </FieldRoot>
                  <FieldRoot>
                    <Label>Participants</Label>
                    <Input
                      name="participants"
                      type="number"
                      min={1}
                      defaultValue={1}
                      required
                    />
                  </FieldRoot>
                  <FieldRoot>
                    <Label>Notes (Optional)</Label>
                    <textarea
                      name="notes"
                      className="w-full border border-input bg-background p-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 resize-none"
                      rows={3}
                      placeholder="Any special requests?"
                    />
                  </FieldRoot>
                  <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    className="w-full"
                    disabled={submitting}
                  >
                    <Send className="size-4" />
                    Submit Enquiry
                  </Button>
                </form>
              </Dialog.Popup>
            </Dialog.Root>
          </div>
        </div>
      </div>
    </div>
  );
}
