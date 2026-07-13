import type { Booking } from "~/types";

export const statusColors: Record<Booking["status"], "warning" | "success" | "secondary" | "destructive"> = {
  enquiry: "warning",
  confirmed: "success",
  completed: "secondary",
  cancelled: "destructive",
};

export const CURRENCY = "UGX";

export const SITE_CONTACT = {
  phone: "+256 787 699744",
  phoneDigits: "+256787699744",
  email: "info@isitoshetours.com",
  address: "Kyaliwajjala, Kampala, Uganda",
} as const;
