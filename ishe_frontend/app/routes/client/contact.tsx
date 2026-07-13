import type { Route } from "./+types/contact";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useFetcher } from "react-router";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label, FieldRoot } from "~/components/ui/label";
import apiClient from "~/lib/api-client";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Contact Us — Ishe Tours" },
    {
      name: "description",
      content: "Get in touch with Ishe Tours.",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  await apiClient.post("/clients", {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  return { success: true };
}

const contactInfo = [
  {
    icon: MapPin,
    label: "Address",
    value: "Marrakech, Morocco",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+212 600-000000",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@ishetours.com",
  },
];

export default function Contact() {
  const fetcher = useFetcher();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Contact Us
        </h1>
        <p className="mt-2 text-muted-foreground">
          Get in touch and let's plan your Moroccan adventure
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="space-y-6">
            {contactInfo.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="flex size-10 items-center justify-center bg-primary/10">
                  <item.icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold">
            Send us a Message
          </h2>
          <fetcher.Form method="post" className="mt-4 space-y-4">
            <FieldRoot>
              <Label>Name</Label>
              <Input name="name" required placeholder="Your full name" />
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
              <Input name="phone" required placeholder="+212 600-000000" />
            </FieldRoot>
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full"
              disabled={fetcher.state !== "idle"}
            >
              <Send className="size-4" />
              {fetcher.state !== "idle" ? "Sending..." : "Send Message"}
            </Button>
            {fetcher.data && (
              <p className="text-center text-sm text-success">
                Message sent! We'll be in touch shortly.
              </p>
            )}
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}
