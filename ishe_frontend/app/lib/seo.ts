import type { MetaDescriptor } from "react-router";

export const SITE_URL = "https://isitoshetours.com";

export const FALLBACK_OG_IMAGE = `${SITE_URL}/isitoshetours.png`;

export function absoluteUrl(path?: string | null): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function truncate(text?: string | null, max = 158): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function ogImage(path?: string | null): string {
  return absoluteUrl(path || "/isitoshetours.png");
}

interface SeoOptions {
  title: string;
  description?: string | null;
  path?: string;
  image?: string | null;
  type?: string;
}

export function seoMeta({
  title,
  description,
  path,
  image,
  type = "website",
}: SeoOptions): MetaDescriptor[] {
  const canonical = absoluteUrl(path);
  const desc = truncate(description);
  const img = ogImage(image);

  return [
    { title },
    ...(desc ? [{ name: "description", content: desc }] : []),
    { tagName: "link", rel: "canonical", href: canonical },
    { property: "og:type", content: type },
    { property: "og:url", content: canonical },
    { property: "og:title", content: title },
    ...(desc ? [{ property: "og:description", content: desc }] : []),
    { property: "og:image", content: img },
    { property: "og:site_name", content: "Isitoshe Tours" },
    { property: "og:locale", content: "en_US" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    ...(desc ? [{ name: "twitter:description", content: desc }] : []),
    { name: "twitter:image", content: img },
  ];
}
