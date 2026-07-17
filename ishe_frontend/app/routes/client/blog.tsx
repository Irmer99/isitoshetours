import { Link } from "react-router";
import type { Route } from "./+types/blog";

import apiClient from "~/lib/api-client";
import type { Blog } from "~/types";

export async function loader() {
  const res = await apiClient.get<Blog[]>("/content/blogs");
  return { blogs: res.data };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Blog — Isitoshe Tours" },
    { name: "description", content: "Stories, tips, and updates from Isitoshe Tours." },
  ];
}

export default function BlogList({ loaderData }: Route.ComponentProps) {
  const { blogs } = loaderData;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground">Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Stories, tips, and updates from Isitoshe Tours
        </p>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">
            No blog posts yet.
          </p>
        )}
        {blogs.map((post) => (
          <Link
            key={post._id}
            to={`/blog/${post.slug}`}
            className="group border border-border bg-card transition-shadow hover:shadow-lg"
          >
            <div className="aspect-[16/9] bg-muted flex items-center justify-center text-muted-foreground">
              {post.coverImage ? (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  loading="lazy"
                  width={640}
                  height={360}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-xs">No image</span>
              )}
            </div>
            <div className="p-4">
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
              <h3 className="mt-3 font-heading text-lg font-semibold group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {post.excerpt}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
