import type { Route } from "./+types/sitemap.xml";
import apiClient from "~/lib/api-client";
import { SITE_URL } from "~/lib/seo";
import type { Blog, Destination, Itinerary } from "~/types";

const staticPages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/itineraries", changefreq: "weekly", priority: "0.9" },
  { path: "/destinations", changefreq: "weekly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
  { path: "/disability", changefreq: "monthly", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isoDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function imageEntries(images?: string[]): string {
  if (!images || images.length === 0) return "";
  return images
    .map(
      (image) =>
        `    <image:image>\n      <image:loc>${escapeXml(`${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`)}</image:loc>\n    </image:image>\n`
    )
    .join("");
}

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string, images?: string[]): string {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${imageEntries(images)}  </url>`;
}

export async function loader({}: Route.LoaderArgs) {
  let itineraries: Itinerary[] = [];
  let destinations: Destination[] = [];
  let blogs: Blog[] = [];

  try {
    const [itRes, destRes, blogRes] = await Promise.all([
      apiClient.get<Itinerary[]>("/content/itineraries"),
      apiClient.get<Destination[]>("/content/destinations"),
      apiClient.get<Blog[]>("/content/blogs"),
    ]);
    itineraries = itRes.data;
    destinations = destRes.data;
    blogs = blogRes.data;
  } catch {
    // Serve the static pages even if the content API is unavailable.
  }

  const today = new Date().toISOString().slice(0, 10);

  const staticUrls = staticPages
    .map((page) => urlEntry(`${SITE_URL}${page.path === "/" ? "/" : page.path}`, today, page.changefreq, page.priority))
    .join("\n");

  const itineraryUrls = itineraries
    .map((it) =>
      urlEntry(
        `${SITE_URL}/itineraries/${it.slug}`,
        isoDate(it.updatedAt),
        "weekly",
        "0.8",
        it.images
      )
    )
    .join("\n");

  const destinationUrls = destinations
    .map((dest) =>
      urlEntry(
        `${SITE_URL}/destinations/${dest.slug}`,
        isoDate(dest.updatedAt),
        "weekly",
        "0.7",
        dest.images
      )
    )
    .join("\n");

  const blogUrls = blogs
    .map((post) =>
      urlEntry(
        `${SITE_URL}/blog/${post.slug}`,
        isoDate(post.updatedAt),
        "weekly",
        "0.6",
        post.coverImage ? [post.coverImage] : post.images
      )
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[staticUrls, itineraryUrls, destinationUrls, blogUrls].filter(Boolean).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
