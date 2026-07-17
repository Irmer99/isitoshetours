import { Outlet, Link, redirect } from "react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Route,
  MapPin,
  Percent,
  Settings,
  LogOut,
  Menu,
  X,
  BookOpen,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

import { Button } from "~/components/ui/button";
import { SessionToast } from "~/components/ui/toast";
import { cn } from "~/lib/utils";
import { useAuth } from "~/contexts/AuthContext";
import { useInactivityLogout } from "~/hooks/useInactivityLogout";

export async function clientLoader() {
  if (typeof window === "undefined") {
    throw redirect("/admin/login");
  }
  const token = localStorage.getItem("token");
  if (!token) {
    throw redirect("/admin/login");
  }
  return null;
}

const sidebarLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/itineraries", label: "Itineraries", icon: Route },
  { to: "/admin/destinations", label: "Destinations", icon: MapPin },
  { to: "/admin/discounts", label: "Discounts", icon: Percent },
  { to: "/admin/blogs", label: "Blogs", icon: BookOpen },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { admin, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSidebar();
        toggleButtonRef.current?.focus();
      }
    };
    const handleFocusTrap = (e: FocusEvent) => {
      if (!sidebarRef.current || sidebarRef.current.contains(e.target as Node)) return;
      sidebarRef.current.querySelector<HTMLElement>("a, button")?.focus();
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("focusin", handleFocusTrap);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("focusin", handleFocusTrap);
    };
  }, [sidebarOpen, closeSidebar]);

  const { showWarning, extendSession } = useInactivityLogout({
    timeout: 30 * 60 * 1000,
    warningBefore: 60 * 1000,
    onLogout: logout,
  });

  return (
    <div className="flex min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <aside
        id="admin-sidebar"
        ref={sidebarRef}
        aria-label="Admin sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link
            to="/admin"
            className="font-heading text-lg font-bold text-primary"
          >
            Isitoshe Tours
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-4" aria-label="Admin navigation">
          {sidebarLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 rounded-none px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <div className="mb-2 px-3 text-xs text-sidebar-foreground/60">
            {admin?.email}
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-6">
          <button
            ref={toggleButtonRef}
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            aria-expanded={sidebarOpen}
            aria-controls="admin-sidebar"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex-1" />
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary">
            View Site
          </Link>
        </header>
        <main id="main-content" className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {isAuthenticated && showWarning && (
        <SessionToast
          message="Your session will expire in 60 seconds."
          onAction={extendSession}
          actionLabel="Stay logged in"
        />
      )}
    </div>
  );
}
