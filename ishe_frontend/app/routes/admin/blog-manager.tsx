import type { Route } from "./+types/blog-manager";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Plus,
  Pencil,
  Save,
  X,
  Trash2,
  Archive,
  ArchiveRestore,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Undo,
  Redo,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label, FieldRoot } from "~/components/ui/label";
import { ImageUpload } from "~/components/admin/image-upload";
import apiClient from "~/lib/api-client";
import { parseApiError, parseFieldErrors } from "~/lib/api-errors";
import type { Blog } from "~/types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Blog Manager — Isitoshe Tours Admin" }];
}

function TipTapToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  const btn = (active: boolean) =>
    `border border-input bg-background p-1.5 text-muted-foreground transition-colors hover:text-foreground ${active ? "text-primary" : ""}`;
  return (
    <div className="flex flex-wrap items-center gap-1 border border-input border-b-0 bg-muted/50 px-2 py-1.5">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}>
        <Bold className="size-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}>
        <Italic className="size-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>
        <Heading2 className="size-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>
        <List className="size-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>
        <ListOrdered className="size-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))}>
        <Quote className="size-4" />
      </button>
      <div className="mx-1 h-4 w-px bg-border" />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={btn(false)}>
        <Undo className="size-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={btn(false)}>
        <Redo className="size-4" />
      </button>
    </div>
  );
}

export default function BlogManager() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    images: [] as string[],
    tags: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const editor = useEditor({
    extensions: [StarterKit],
    content: form.content,
    onUpdate: ({ editor: e }) => {
      setForm((prev) => ({ ...prev, content: e.getHTML() }));
    },
  });

  const { data: blogs, isLoading, isError } = useQuery({
    queryKey: ["blogs"],
    queryFn: () =>
      apiClient.get<Blog[]>("/content/blogs").then((r) => r.data),
  });

  const [formError, setFormError] = useState("");

  const parseError = (err: unknown) => {
    const res = parseApiError(err);
    setFormError(res?.error || "Operation failed");
    setFieldErrors({});
    if (res?.details) {
      setFieldErrors(parseFieldErrors(res.details));
    }
  };

  const saveMutation = useMutation({
    mutationFn: (data: { slug: string; body: Record<string, unknown> }) =>
      apiClient.patch(`/content/blogs/${data.slug}`, data.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setEditingId(null);
      setFormError("");
      setFieldErrors({});
    },
    onError: parseError,
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post("/content/blogs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setCreating(false);
      setFormError("");
      setFieldErrors({});
    },
    onError: parseError,
  });

  const archiveMutation = useMutation({
    mutationFn: (data: { slug: string; archived: boolean }) =>
      apiClient.patch(`/content/blogs/${data.slug}`, { archived: data.archived }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) =>
      apiClient.delete(`/content/blogs/${slug}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });

  const resetForm = useCallback(() => {
    setForm({ title: "", slug: "", excerpt: "", content: "", coverImage: "", images: [], tags: "" });
    setFieldErrors({});
    setFormError("");
    if (editor) editor.commands.setContent("");
  }, [editor]);

  const startCreate = () => {
    resetForm();
    setEditingId(null);
    setCreating(true);
  };

  const startEdit = (b: Blog) => {
    setForm({
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt || "",
      content: b.content || "",
      coverImage: b.coverImage || "",
      images: b.images || [],
      tags: b.tags?.join(", ") || "",
    });
    if (editor) editor.commands.setContent(b.content || "");
    setEditingId(b._id);
    setCreating(false);
    setFieldErrors({});
  };

  const cancelForm = () => {
    setEditingId(null);
    setCreating(false);
    resetForm();
  };

  const handleSave = () => {
    const body: Record<string, unknown> = {
      title: form.title,
      excerpt: form.excerpt || undefined,
      content: form.content || undefined,
      coverImage: form.coverImage || undefined,
      images: form.images.length > 0 ? form.images : undefined,
      tags: form.tags
        ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
    };
    if (creating) {
      (body as Record<string, unknown>).slug = form.slug;
      createMutation.mutate(body);
    } else if (editingId) {
      const blog = blogs?.find((b) => b._id === editingId);
      if (blog) {
        saveMutation.mutate({ slug: blog.slug, body });
      }
    }
  };

  const formOpen = creating || editingId !== null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Blog Manager</h1>
        <p className="text-sm text-muted-foreground">Create and edit blog posts</p>
      </div>

      {formOpen && (
        <div className="mb-6 border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-wider uppercase">
              {creating ? "New Blog Post" : "Edit Blog Post"}
            </h2>
            <button onClick={cancelForm} className="text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
          {formError && <p className="mb-4 text-sm text-destructive">{formError}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldRoot>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value });
                  setFieldErrors({ ...fieldErrors, title: "" });
                }}
                className={fieldErrors.title ? "border-destructive" : ""}
              />
              {fieldErrors.title && <p className="text-xs text-destructive">{fieldErrors.title}</p>}
            </FieldRoot>
            <FieldRoot>
              <Label>Slug</Label>
              <Input
                value={form.slug}
                disabled={!creating}
                onChange={(e) => {
                  setForm({ ...form, slug: e.target.value });
                  setFieldErrors({ ...fieldErrors, slug: "" });
                }}
                className={fieldErrors.slug ? "border-destructive" : ""}
              />
              {fieldErrors.slug && <p className="text-xs text-destructive">{fieldErrors.slug}</p>}
            </FieldRoot>
            <FieldRoot className="sm:col-span-2">
              <Label>Excerpt</Label>
              <Input
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Brief summary of the post"
              />
            </FieldRoot>
            <FieldRoot>
              <Label>Cover Image</Label>
              <ImageUpload
                images={form.coverImage ? [form.coverImage] : []}
                onChange={(imgs) => setForm({ ...form, coverImage: imgs[0] || "" })}
              />
            </FieldRoot>
            <FieldRoot>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="safari, wildlife, tips"
              />
            </FieldRoot>
            <FieldRoot className="sm:col-span-2">
              <Label>Content</Label>
              <div className="border border-input">
                <TipTapToolbar editor={editor} />
                <EditorContent
                  editor={editor}
                  className="min-h-[300px] bg-background p-3 text-sm outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_h2]:font-heading [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-border [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-muted-foreground"
                />
              </div>
            </FieldRoot>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={cancelForm}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
              disabled={saveMutation.isPending || createMutation.isPending}
            >
              <Save className="size-4" />
              {creating ? "Create" : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <Button variant="default" onClick={startCreate}>
          <Plus className="size-4" />
          New Blog Post
        </Button>
      </div>

      <div className="space-y-2">
        {isError ? (
          <p className="text-sm text-destructive">Failed to load blog posts.</p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : blogs?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No blog posts yet.</p>
        ) : (
          blogs?.map((b) => (
            <div
              key={b._id}
              className="flex items-center justify-between border border-border bg-card px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{b.title}</p>
                  {b.archived && (
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground border border-border px-1.5 py-0.5">
                      Archived
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  /blog/{b.slug}
                  {b.tags?.length ? ` · ${b.tags.join(", ")}` : ""}
                </p>
              </div>
              <div className="flex gap-1 ml-4 shrink-0">
                <Button variant="ghost" size="xs" onClick={() => startEdit(b)}>
                  <Pencil className="size-3" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() =>
                    archiveMutation.mutate({ slug: b.slug, archived: !b.archived })
                  }
                  disabled={archiveMutation.isPending}
                >
                  {b.archived ? <ArchiveRestore className="size-3" /> : <Archive className="size-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    if (window.confirm(`Delete "${b.title}"? This cannot be undone.`)) {
                      deleteMutation.mutate(b.slug);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
