export interface ItineraryDay {
  day: number;
  title?: string;
  description?: string;
  meals?: string[];
  accommodation?: string;
}

export interface Itinerary {
  _id: string;
  slug: string;
  title: string;
  subtitle?: string;
  difficulty: "easy" | "moderate" | "hard";
  duration?: string;
  pricing: {
    from?: number;
    currency: string;
  };
  days: ItineraryDay[];
  includes?: string[];
  excludes?: string[];
  images?: string[];
  destinations?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  clientId: string | Client;
  itinerary: string;
  itineraryTitle?: string;
  status: "enquiry" | "confirmed" | "completed" | "cancelled";
  travelDate: string;
  participants: number;
  totalAmount: number;
  discountCode?: string;
  discountApplied?: number;
  notes?: string;
  archived?: boolean;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryEntry {
  from: Booking["status"];
  to: Booking["status"];
  changedBy?: string;
  changedAt: string;
}

export interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  _id: string;
  email: string;
  role: "admin" | "superadmin";
}

export interface Discount {
  _id: string;
  code: string;
  type: "percent" | "flat";
  value: number;
  appliesTo: string;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  _id: string;
  name: string;
  text: string;
  rating?: number;
  avatar?: string;
  active: boolean;
  order: number;
}

export interface Destination {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  images?: string[];
  highlights?: string[];
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  bio?: string;
  photo?: string;
  order: number;
  active: boolean;
}

export interface SiteSettings {
  _id: string;
  key: string;
  data: Record<string, unknown>;
}

export interface StatsOverview {
  totalBookings: number;
  bookingsThisMonth: number;
  confirmedThisMonth: number;
  enquiriesThisMonth: number;
  totalRevenue: number;
  topItineraries: { itinerary: string; count: number; revenue: number }[];
}

export interface ConversionRate {
  rate: number;
  enquiries: number;
  confirmed: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Blog {
  _id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  images?: string[];
  tags?: string[];
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}
