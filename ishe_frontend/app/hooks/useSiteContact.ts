import { useQuery } from "@tanstack/react-query";
import apiClient from "~/lib/api-client";
import { SITE_CONTACT } from "~/lib/constants";
import type { SiteSettings } from "~/types";

interface SiteContact {
  phone: string;
  phoneDigits: string;
  email: string;
  address: string;
}

export function useSiteContact(): SiteContact {
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () =>
      apiClient.get<SiteSettings>("/content/site-settings").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const data = settings?.data ?? {};

  return {
    phone: (data.phone as string) || SITE_CONTACT.phone,
    phoneDigits: (data.phoneDigits as string) || SITE_CONTACT.phoneDigits,
    email: (data.email as string) || SITE_CONTACT.email,
    address: (data.address as string) || SITE_CONTACT.address,
  };
}
