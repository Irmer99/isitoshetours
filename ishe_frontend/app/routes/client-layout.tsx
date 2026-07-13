import { Link, Outlet } from "react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/itineraries", label: "Itineraries" },
  { to: "/destinations", label: "Destinations" },
  { to: "/contact", label: "Contact" },
];

export default function ClientLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="font-heading text-xl font-bold text-primary">
            Isitoshe Tours
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-semibold tracking-wider uppercase text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/contact">
              <Button variant="default" size="sm">
                Enquire Now
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </nav>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 md:hidden",
            mobileOpen ? "max-h-64" : "max-h-0"
          )}
        >
          <div className="flex flex-col gap-2 px-4 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="py-2 text-sm font-semibold tracking-wider uppercase text-muted-foreground transition-colors hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/contact" onClick={() => setMobileOpen(false)}>
              <Button variant="default" size="sm" className="w-full">
                Enquire Now
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/50 bg-muted">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="font-heading text-lg font-bold text-primary">
                Isitoshe Tours
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Discover Uganda with expertly curated safaris and unforgettable experiences.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold tracking-widest uppercase text-foreground">
                Quick Links
              </h4>
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold tracking-widest uppercase text-foreground">
                Contact
              </h4>
              <p className="text-sm text-muted-foreground">
                Email: info@isitoshetours.com
              </p>
              <p className="text-sm text-muted-foreground">
                Phone: +256 787 699744
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Isitoshe Tours. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
