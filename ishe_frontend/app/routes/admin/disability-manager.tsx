import type { Route } from "./+types/disability-manager";
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Save } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label, FieldRoot } from "~/components/ui/label";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Undo,
  Redo,
} from "lucide-react";
import apiClient from "~/lib/api-client";
import { parseApiError } from "~/lib/api-errors";

const DEFAULT_TITLE = "Disability-Inclusive Travel";
const DEFAULT_CONTENT = `<p>Uganda's wild beauty belongs to everyone. Isitoshe Tours is a disability-inclusive tour operator, and we design every safari so that travellers with disabilities can experience it comfortably, safely, and with dignity.</p>
<p>From the moment you enquire, our team works with you to understand your needs and adapt your itinerary around them. We are committed to removing barriers — physical, sensory, or otherwise — so the only thing you carry is the excitement of the journey.</p>
<h2>How We Support Your Journey</h2>
<ul>
<li><strong>Accessible vehicles</strong> — vans and vehicles with ramps or lift access, extra space, and flexible seating.</li>
<li><strong>Wheelchair-friendly lodges</strong> — we select accommodation with step-free access, accessible bathrooms, and ground-floor rooms wherever possible.</li>
<li><strong>Adaptive activities</strong> — game drives and viewing decks designed so everyone can see, with guides who can adapt pacing to mobility levels.</li>
<li><strong>Sensory support</strong> — quiet pacing, reduced-stimulation options, and guides experienced in supporting travellers with visual, hearing, or cognitive disabilities.</li>
</ul>
<h2>Honest, Practical Planning</h2>
<p>Accessibility looks different for everyone, so we never guess. Before we finalise an itinerary, we'll discuss:</p>
<ul>
<li>The nature of your disability and your preferred mobility aids</li>
<li>Your comfort with long drives, uneven terrain, and high altitude</li>
<li>Any medication, equipment, or dietary requirements</li>
<li>Whether you'll travel with a companion or carer</li>
</ul>
<p>We rate every itinerary's physical difficulty honestly, and we will tell you straight if a particular park or activity won't suit your needs — then we'll offer a workable alternative.</p>
<h2>Travelling With a Companion or Carer</h2>
<p>Companions and carers are welcome. Let us know when booking and we'll arrange adjacent rooms, shared transport, and a single point of contact for your whole group.</p>
<h2>Let's Plan Together</h2>
<p>The best itineraries for disability-inclusive travel are built through conversation. Reach out to us and tell us what you need — we'll take it from there.</p>`;

function TipTapToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  const btn = (active: boolean) =>
    `border border-input bg-background p-1.5 text-muted-foreground transition-colors hover:text-foreground ${active ? "text-primary" : ""}`;
  return (
    <div className="flex flex-wrap items-center gap-1 border border-input border-b-0 bg-muted/50 px-2 py-1.5">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} aria-label="Bold">
        <Bold className="size-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} aria-label="Italic">
        <Italic className="size-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))} aria-label="Heading 2">
        <Heading2 className="size-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} aria-label="Bullet list">
        <List className="size-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))} aria-label="Ordered list">
        <ListOrdered className="size-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))} aria-label="Blockquote">
        <Quote className="size-4" />
      </button>
      <div className="mx-1 h-4 w-px bg-border" />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={btn(false)} aria-label="Undo">
        <Undo className="size-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={btn(false)} aria-label="Redo">
        <Redo className="size-4" />
      </button>
    </div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Disability Page — Isitoshe Tours Admin" }];
}

export default function DisabilityManager() {
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () =>
      apiClient.get<{ id: string; key: string; data: Record<string, unknown> }>("/content/site-settings").then((r) => r.data),
  });

  const page =
    (settings?.data?.disabilityPage as { title?: string; content?: string } | undefined) || {};

  const [title, setTitle] = useState(page.title || DEFAULT_TITLE);
  const [content, setContent] = useState(page.content || DEFAULT_CONTENT);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (settings?.data) {
      setTitle((page.title as string) || DEFAULT_TITLE);
      setContent((page.content as string) || DEFAULT_CONTENT);
    }
  }, [settings?.data]);

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor: e }) => {
      setContent(e.getHTML());
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const resetToDefault = useCallback(() => {
    setTitle(DEFAULT_TITLE);
    setContent(DEFAULT_CONTENT);
    if (editor) editor.commands.setContent(DEFAULT_CONTENT);
  }, [editor]);

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.patch("/content/site-settings", { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      setSaveError("");
    },
    onError: (err: unknown) => {
      const msg = parseApiError(err)?.error || "Failed to save disability page";
      setSaveError(msg);
    },
  });

  const handleSave = () => {
    const existingData = (settings?.data || {}) as Record<string, unknown>;
    saveMutation.mutate({
      ...existingData,
      disabilityPage: { title, content },
    });
  };

  if (isError) return <p className="text-destructive">Failed to load settings.</p>;
  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Disability Page
        </h1>
        <p className="text-sm text-muted-foreground">
          Edit the content shown on the public disability-inclusive travel page
        </p>
      </div>

      <div className="border border-border bg-card p-6">
        {saveError && <p className="mb-4 text-sm text-destructive">{saveError}</p>}
        <div className="space-y-4">
          <FieldRoot>
            <Label>Page Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Page heading"
            />
          </FieldRoot>
          <FieldRoot>
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
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={resetToDefault}>
            Reset to Default
          </Button>
          <Button variant="default" onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="size-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
