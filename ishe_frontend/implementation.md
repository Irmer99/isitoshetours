# Ishe Tours Frontend — Implementation Blueprint

## Project Overview

React + Vite + TypeScript SPA. Tailwind v4 with Shadcn/Radix UI primitives. Two route branches:

- **Client-facing discovery** — home, itineraries, itinerary detail, contact
- **Admin dashboard** — login, bookings, clients, itineraries, discounts, settings

---

## Directory Structure

```
ishe_frontend/
├── public/
├── src/
│   ├── assets/               # Brand imagery, logos, global static assets
│   ├── components/
│   │   ├── ui/               # Raw Shadcn primitives (button, dialog, input, etc.)
│   │   ├── client/           # Client layout components (Navbar, Footer, SearchHero)
│   │   ├── admin/            # Custom Admin layout blocks (Sidebar, MetricCard, DataChart)
│   │   └── shared/           # Cross-cutting (FormGroup, DynamicTable, StatusBadge)
│   ├── hooks/
│   │   ├── useAuth.ts        # Auth state wrapper
│   │   └── useApi.ts         # react-query wrapper for CRUD operations
│   ├── layouts/
│   │   ├── ClientLayout.tsx  # Public header, nav, footer
│   │   └── AdminLayout.tsx   # Protected layout with sidebar
│   ├── lib/
│   │   ├── api-client.ts     # Axios instance with JWT interceptors
│   │   └── utils.ts          # Tailwind merge utility (`cn`)
│   ├── pages/
│   │   ├── client/
│   │   │   ├── Home.tsx
│   │   │   ├── Itineraries.tsx
│   │   │   ├── ItineraryDetail.tsx
│   │   │   └── Contact.tsx
│   │   └── admin/
│   │       ├── Dashboard.tsx
│   │       ├── BookingsList.tsx
│   │       ├── BookingDetail.tsx
│   │       ├── ClientTracker.tsx
│   │       ├── ItineraryManager.tsx
│   │       ├── DiscountManager.tsx
│   │       └── SettingsManager.tsx
│   ├── schemas/              # Zod schemas matching backend validation
│   │   ├── clientSchema.ts
│   │   └── itinerarySchema.ts
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces matching backend models
│   ├── App.tsx               # Route declarations + context providers
│   ├── index.css             # Tailwind directives + custom variables
│   └── main.tsx              # Mount point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Route Architecture

### Client Views (Public)

| Route | Component | Description | Actions |
|-------|-----------|-------------|---------|
| `/` | Home | Hero, curated routes, testimonials, overview | Quick-filter search |
| `/itineraries` | Itineraries | Package grid with sidebar filters | Search text, filtering |
| `/itineraries/:slug` | ItineraryDetail | Day-by-day stepper timeline, sticky summary, enquiry modal | Submit enquiry |
| `/contact` | Contact | Company info, address, phone | Contact form |

### Admin Panel Views (Protected)

| Route | Component | Description | Actions |
|-------|-----------|-------------|---------|
| `/admin/login` | AdminLogin | JWT auth gateway | Login |
| `/admin/dashboard` | Dashboard | Metrics, volume, conversion rates | Range filters |
| `/admin/bookings` | BookingsList | Pipeline data table | Status filter, CSV export |
| `/admin/bookings/:id` | BookingDetail | History, customer info, status updates | Pipeline progression |
| `/admin/clients` | ClientTracker | Contact index with booking history | Search, profile view |
| `/admin/itineraries` | ItineraryManager | Multi-step package editor | Create/edit itineraries |
| `/admin/discounts` | DiscountManager | Promo code CRUD | Create/edit/delete |
| `/admin/settings` | SettingsManager | Global site config | Update meta, landing |

---

## Key Implementation Details

### 1. Call-To-Book Funnel (Client Side)

No payment processing. Flow:

1. Sticky summary box on itinerary detail page
2. "Enquire Now" triggers Shadcn Dialog form
3. On submit:
   - `POST /api/clients` → create/match client
   - `POST /api/bookings` → create booking (status: `enquiry`)
4. On 201 response → WhatsApp redirect:
   ```
   https://wa.me/{phone}?text=Hi+Ishe+Tours!+I+submitted+an+enquiry+for+{TourTitle}+on+{Date}.+Ref:+{BookingID}
   ```

### 2. Multi-Step Itinerary Creator (Admin)

react-hook-form + useFieldArray for dynamic day rows:

- **Step 1:** Identity (title, slug, difficulty, pricing)
- **Step 2:** Timeline (dynamic day array — day number, title, description, accommodation, meals)
- **Step 3:** Media (drag-and-drop image uploads)

### 3. JWT Auth Flow

- Login → receive token
- Store in localStorage
- Axios interceptor reads token, attaches `Authorization: Bearer <token>`
- 401 response → redirect to `/admin/login`

---

## Backend API Contract

Base URL: `http://localhost:3000/api`

### Auth
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/auth/login` | `{ email, password }` | `{ token, admin }` |
| POST | `/auth/refresh` | `{ token }` | `{ token, admin }` |
| POST | `/auth/seed` | — | `{ message }` |

### Bookings
| Method | Path | Auth | Body/Query |
|--------|------|------|------------|
| POST | `/bookings` | No | `{ clientId, itinerary, travelDate, participants, totalAmount }` |
| GET | `/bookings` | No | `?status=&itinerary=&from=&to=` |
| GET | `/bookings/:id` | No | — |
| PATCH | `/bookings/:id` | Yes | `{ status }` |
| DELETE | `/bookings/:id` | Yes | — |
| GET | `/bookings/:id/history` | No | — |

### Clients
| Method | Path | Auth | Body/Query |
|--------|------|------|------------|
| POST | `/clients` | No | `{ name, email, phone }` |
| GET | `/clients` | Yes | `?search=` |
| GET | `/clients/:id` | Yes | — |
| PATCH | `/clients/:id` | Yes | `{ name?, email?, phone? }` |
| GET | `/clients/:id/bookings` | Yes | — |

### Discounts
| Method | Path | Auth | Body/Query |
|--------|------|------|------------|
| GET | `/discounts` | Yes | — |
| POST | `/discounts` | Yes | `{ code, type, value, appliesTo, startDate, endDate }` |
| PATCH | `/discounts/:id` | Yes | partial fields |
| DELETE | `/discounts/:id` | Yes | — |
| POST | `/discounts/validate` | No | `{ code, itineraryId }` |

### Stats (all admin)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/stats/overview` | Bookings this month, totals, top itineraries |
| GET | `/stats/bookings-by-route` | Per-itinerary group |
| GET | `/stats/bookings-over-time` | `?range=30` (days) |
| GET | `/stats/conversion` | Enquiry vs confirmed rate |

### Content
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/content/itineraries` | No | List all |
| GET | `/content/itineraries/:slug` | No | Detail |
| PATCH | `/content/itineraries/:slug` | Yes | Update |
| GET | `/content/destinations` | No | List |
| PATCH | `/content/destinations/:id` | Yes | Update |
| GET | `/content/testimonials` | No | List active |
| PATCH | `/content/testimonials/:id` | Yes | Update |
| GET | `/content/team` | No | List active |
| PATCH | `/content/team/:id` | Yes | Update |
| GET | `/content/site-settings` | No | Get settings |
| PATCH | `/content/site-settings` | Yes | Update |

---

## TypeScript Schema Sync

### Booking Form Zod Schema (`schemas/bookingSchema.ts`)
```typescript
import { z } from "zod";

export const clientBookingSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(9, "Valid phone required"),
  travelDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid date required",
  }),
  participants: z.number().int().min(1, "At least 1 required"),
  itinerary: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid itinerary ID"),
  discountCode: z.string().optional(),
  notes: z.string().optional(),
});
```

### TypeScript Types (`types/index.ts`)
```typescript
export interface ItineraryDay {
  dayNumber: number;
  title: string;
  description: string;
  accommodation?: string;
  mealsIncluded: ("B" | "L" | "D")[];
}

export interface Itinerary {
  _id: string;
  slug: string;
  title: string;
  days: ItineraryDay[];
  difficulty: "Easy" | "Moderate" | "Challenging" | "Extreme";
  pricing: { basePrice: number; currency: string; perPerson: boolean };
}

export interface Booking {
  _id: string;
  clientId: { _id: string; name: string; email: string; phone: string };
  itinerary: string | Itinerary;
  status: "enquiry" | "confirmed" | "completed" | "cancelled";
  travelDate: string;
  participants: number;
  totalAmount: number;
  discount?: string;
  statusHistory: {
    status: string;
    updatedAt: string;
    updatedBy?: string;
    comment?: string;
  }[];
  createdAt: string;
}
```

---

## Implementation Order

### Phase 1: Scaffold
1. `npm create vite@latest . -- --template react-ts`
2. `npx tailwindcss init -p`
3. `npx shadcn@latest init`
4. Install: `react-router-dom`, `@tanstack/react-query`, `axios`, `zod`, `react-hook-form`, `@hookform/resolvers`

### Phase 2: Foundation
1. `lib/utils.ts` — `cn` utility
2. `lib/api-client.ts` — Axios instance with base URL + JWT interceptor
3. `types/index.ts` — all interfaces
4. `schemas/` — Zod schemas matching backend validators

### Phase 3: Client Routes
1. `layouts/ClientLayout.tsx` — navbar, footer, outlet
2. `pages/client/Home.tsx`
3. `pages/client/Itineraries.tsx`
4. `pages/client/ItineraryDetail.tsx` — includes enquiry modal + WhatsApp redirect
5. `pages/client/Contact.tsx`

### Phase 4: Admin Routes
1. `hooks/useAuth.ts` — login, logout, token management
2. `layouts/AdminLayout.tsx` — sidebar, header, protected route wrapper
3. `pages/admin/Dashboard.tsx` — stats from `/api/stats/*`
4. `pages/admin/BookingsList.tsx` — data table with filters
5. `pages/admin/BookingDetail.tsx` — status history + updates
6. `pages/admin/ClientTracker.tsx` — search + client bookings
7. `pages/admin/ItineraryManager.tsx` — multi-step creator
8. `pages/admin/DiscountManager.tsx` — promo CRUD
9. `pages/admin/SettingsManager.tsx` — site config editor

---

## API Client Configuration

```typescript
// lib/api-client.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  }
);

export default apiClient;
```

---

## Color Palette (Tailwind Theme)

| Token | Usage | Hex |
|-------|-------|-----|
| `primary` | Headers, CTAs, active states | Deep Forest Green `#1B4332` |
| `primary-foreground` | Text on primary | White `#FFFFFF` |
| `secondary` | Accents, badges, highlights | Ochre/Amber `#D4A373` |
| `background` | Page backgrounds | Warm Sand `#FAF3E0` |
| `muted` | Subtle backgrounds, cards | `#F5F0E8` |
| `card` | Card surfaces | White `#FFFFFF` |
| `destructive` | Cancelled/delete states | `#DC2626` |
| `success` | Confirmed/completed | `#16A34A` |
