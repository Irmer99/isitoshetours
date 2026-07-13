import type { Route } from "./+types/contact";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useFetcher } from "react-router";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label, FieldRoot } from "~/components/ui/label";
import apiClient from "~/lib/api-client";
import { createClientSchema } from "~/schemas/clientSchema";
import { validateWithSchema } from "~/lib/validate";
import { SITE_CONTACT } from "~/lib/constants";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Contact Us — Isitoshe Tours" },
    {
      name: "description",
      content: "Get in touch with Isitoshe Tours.",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
  };
  const validation = validateWithSchema(createClientSchema, data);
  if (!validation.success) {
    return { fieldErrors: validation.errors };
  }
  try {
    await apiClient.post("/clients", validation.data);
    return { success: true };
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "response" in err
        ? (err as { response: { data: { error?: string } } }).response?.data?.error || "Failed to send message"
        : "Failed to send message";
    return { error: message };
  }
}

const contactInfo = [
  {
    icon: MapPin,
    label: "Address",
    value: SITE_CONTACT.address,
  },
  {
    icon: Phone,
    label: "Phone",
    value: SITE_CONTACT.phone,
  },
  {
    icon: Mail,
    label: "Email",
    value: SITE_CONTACT.email,
  },
];

export default function Contact() {
  const fetcher = useFetcher();
  const fieldErrors = (fetcher.data as { fieldErrors?: Record<string, string> })?.fieldErrors ?? {};
  const formKey = fetcher.data?.success ? Date.now() : "form";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Contact Us
        </h1>
        <p className="mt-2 text-muted-foreground">
          Get in touch and let's plan your Ugandan adventure
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
          <fetcher.Form key={formKey} method="post" className="mt-4 space-y-4">
            <FieldRoot>
              <Label>Name</Label>
              <Input name="name" required placeholder="Your full name" className={fieldErrors.name ? "border-destructive" : ""} />
              {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                className={fieldErrors.email ? "border-destructive" : ""}
              />
              {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>Phone</Label>
              <Input name="phone" required placeholder={SITE_CONTACT.phone} className={fieldErrors.phone ? "border-destructive" : ""} />
              {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
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
            {fetcher.data?.success && (
              <p className="text-center text-sm text-success">
                Message sent! We'll be in touch shortly.
              </p>
            )}
            {fetcher.data?.error && (
              <p className="text-center text-sm text-destructive">
                {fetcher.data.error}
              </p>
            )}
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}
