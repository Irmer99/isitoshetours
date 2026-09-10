import { Link, data } from "react-router";
import type { Route } from "./+types/blog-detail";
import DOMPurify from "dompurify";

import apiClient from "~/lib/api-client";
import { absoluteUrl, seoMeta } from "~/lib/seo";
import type { Blog } from "~/types";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const res = await apiClient.get<Blog>(`/content/blogs/${params.slug}`);
    return { post: res.data };
  } catch (err: unknown) {
    const status =
      err && typeof err === "object" && "response" in err
        ? (err as { response: { status: number } }).response?.status
        : null;
    if (status === 404) throw data(null, { status: 404 });
    throw err;
  }
}

export function meta({ loaderData }: Route.MetaArgs) {
  const post = loaderData?.post;
  return seoMeta({
    title: post ? `${post.title} — Isitoshe Tours` : "Blog — Isitoshe Tours",
    path: post?.slug ? `/blog/${post.slug}` : "/blog",
    description: post?.excerpt || "Blog post from Isitoshe Tours.",
    image: post?.coverImage,
    type: "article",
  });
}

const articleJsonLd = (post: Blog) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  description: post.excerpt || undefined,
  image: post.coverImage ? absoluteUrl(post.coverImage) : undefined,
  datePublished: post.createdAt,
  dateModified: post.updatedAt,
  author: {
    "@type": "Organization",
    name: "Isitoshe Tours",
    url: "https://isitoshetours.com",
  },
  publisher: {
    "@type": "Organization",
    name: "Isitoshe Tours",
    logo: {
      "@type": "ImageObject",
      url: "https://isitoshetours.com/isitoshetours.png",
    },
  },
  mainEntityOfPage: post.slug ? `https://isitoshetours.com/blog/${post.slug}` : undefined,
});

const breadcrumbJsonLd = (post: Blog) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://isitoshetours.com/" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://isitoshetours.com/blog" },
    {
      "@type": "ListItem",
      position: 3,
      name: post.title,
      item: `https://isitoshetours.com/blog/${post.slug}`,
    },
  ],
});

export default function BlogDetail({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleJsonLd(post), breadcrumbJsonLd(post)]),
        }}
      />
      <Link
        to="/blog"
        className="text-sm font-semibold text-primary hover:underline"
      >
        &larr; Back to Blog
      </Link>

      {post.coverImage && (
        <div className="mt-6 aspect-[16/9] bg-muted flex items-center justify-center overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            loading="lazy"
            width={1200}
            height={675}
            className="size-full object-cover"
          />
        </div>
      )}

      <div className="mt-6">
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
          {post.title}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {post.excerpt && (
          <p className="mt-4 text-lg text-muted-foreground italic">
            {post.excerpt}
          </p>
        )}
      </div>

      {post.content && (
        <div
          className="prose prose-neutral dark:prose-invert mt-8 max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />
      )}
    </article>
  );
}
