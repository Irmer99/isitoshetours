import { Link } from "react-router";
import type { Route } from "./+types/blog-detail";
import DOMPurify from "dompurify";

import apiClient from "~/lib/api-client";
import type { Blog } from "~/types";

export async function loader({ params }: Route.LoaderArgs) {
  const res = await apiClient.get<Blog>(`/content/blogs/${params.slug}`);
  return { post: res.data };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const post = loaderData?.post;
  return [
    { title: post ? `${post.title} — Isitoshe Tours` : "Blog — Isitoshe Tours" },
    { name: "description", content: post?.excerpt || "Blog post from Isitoshe Tours." },
  ];
}

export default function BlogDetail({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
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
