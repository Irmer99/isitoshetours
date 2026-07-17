import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/client-layout.tsx", [
    index("routes/client/home.tsx"),
    route("itineraries", "routes/client/itineraries.tsx"),
    route("itineraries/:slug", "routes/client/itinerary-detail.tsx"),
    route("destinations", "routes/client/destinations.tsx"),
    route("destinations/:slug", "routes/client/destination-detail.tsx"),
    route("blog", "routes/client/blog.tsx"),
    route("blog/:slug", "routes/client/blog-detail.tsx"),
    route("terms", "routes/client/terms.tsx"),
    route("contact", "routes/client/contact.tsx"),
  ]),
  route("admin/login", "routes/admin/login.tsx"),
  route("admin/forgot-password", "routes/admin/forgot-password.tsx"),
  route("admin/reset-password", "routes/admin/reset-password.tsx"),
  route("admin", "routes/admin-layout.tsx", [
    index("routes/admin/dashboard.tsx"),
    route("bookings", "routes/admin/bookings-list.tsx"),
    route("bookings/:id", "routes/admin/booking-detail.tsx"),
    route("clients", "routes/admin/client-tracker.tsx"),
    route("itineraries", "routes/admin/itinerary-manager.tsx"),
    route("destinations", "routes/admin/destination-manager.tsx"),
    route("discounts", "routes/admin/discount-manager.tsx"),
    route("notifications", "routes/admin/notifications.tsx"),
    route("blogs", "routes/admin/blog-manager.tsx"),
    route("settings", "routes/admin/settings-manager.tsx"),
  ]),
] satisfies RouteConfig;
