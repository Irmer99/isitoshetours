import type { Route } from "./+types/settings-manager";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Lock, Eye, EyeOff, Plus, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label, FieldRoot } from "~/components/ui/label";
import { ImageUpload } from "~/components/admin/image-upload";
import apiClient from "~/lib/api-client";
import type { SiteSettings, HomepageSettings, HeroSlide } from "~/types";
import { HOMEPAGE_DEFAULTS, firstNonEmpty } from "~/hooks/useHomepageContent";

const HOMEPAGE_KEYS = ["heroSlides", "aboutTitle", "aboutParagraphs", "aboutImages"];
const textareaClass =
  "flex w-full border bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 min-h-[80px]";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Settings — Isitoshe Tours Admin" }];
}

export default function SettingsManager() {
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => apiClient.get<SiteSettings>("/content/site-settings").then((r) => r.data),
  });

  const [form, setForm] = useState<Record<string, string>>({});
  const [homepage, setHomepage] = useState<HomepageSettings>({
    heroSlides: HOMEPAGE_DEFAULTS.heroSlides,
    aboutTitle: HOMEPAGE_DEFAULTS.aboutTitle,
    aboutParagraphs: HOMEPAGE_DEFAULTS.aboutParagraphs,
    aboutImages: HOMEPAGE_DEFAULTS.aboutImages,
  });

  useEffect(() => {
    if (settings?.data) {
      const initial: Record<string, string> = {};
      for (const [key, value] of Object.entries(settings.data)) {
        if (HOMEPAGE_KEYS.includes(key)) continue;
        initial[key] = String(value ?? "");
      }
      setForm(initial);
      setHomepage({
        heroSlides: firstNonEmpty<HeroSlide[]>(
          settings.data.heroSlides,
          HOMEPAGE_DEFAULTS.heroSlides
        ),
        aboutTitle: (settings.data.aboutTitle as string) || HOMEPAGE_DEFAULTS.aboutTitle,
        aboutParagraphs: firstNonEmpty<string[]>(
          settings.data.aboutParagraphs,
          HOMEPAGE_DEFAULTS.aboutParagraphs
        ),
        aboutImages: firstNonEmpty<string[]>(
          settings.data.aboutImages,
          HOMEPAGE_DEFAULTS.aboutImages
        ),
      });
    }
  }, [settings]);

  const [saveError, setSaveError] = useState("");

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const pwMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiClient.patch("/auth/password", data),
    onSuccess: () => {
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwError("");
      setPwSuccess("Password changed successfully");
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { error?: string } } }).response?.data?.error ||
            "Failed to change password"
          : "Failed to change password";
      setPwError(msg);
      setPwSuccess("");
    },
  });

  const handlePasswordChange = () => {
    setPwError("");
    setPwSuccess("");
    const pw = pwForm.newPassword;
    if (pw.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(pw)) {
      setPwError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[a-z]/.test(pw)) {
      setPwError("Password must contain at least one lowercase letter");
      return;
    }
    if (!/[0-9]/.test(pw)) {
      setPwError("Password must contain at least one number");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(pw)) {
      setPwError("Password must contain at least one special character");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New passwords do not match");
      return;
    }
    pwMutation.mutate({
      currentPassword: pwForm.currentPassword,
      newPassword: pwForm.newPassword,
    });
  };

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.patch("/content/site-settings", { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      setSaveError("");
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { error?: string } } }).response?.data?.error ||
            "Failed to save settings"
          : "Failed to save settings";
      setSaveError(msg);
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      ...form,
      heroSlides: homepage.heroSlides,
      aboutTitle: homepage.aboutTitle,
      aboutParagraphs: homepage.aboutParagraphs,
      aboutImages: homepage.aboutImages,
    });
  };

  const updateSlide = (index: number, patch: Partial<HeroSlide>) => {
    setHomepage((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)),
    }));
  };

  const removeSlide = (index: number) => {
    setHomepage((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((_, i) => i !== index),
    }));
  };

  const addSlide = () => {
    setHomepage((prev) => ({
      ...prev,
      heroSlides: [...prev.heroSlides, { image: "", tagline: "" }].slice(0, 15),
    }));
  };

  const updateParagraph = (index: number, value: string) => {
    setHomepage((prev) => ({
      ...prev,
      aboutParagraphs: prev.aboutParagraphs.map((p, i) => (i === index ? value : p)),
    }));
  };

  const removeParagraph = (index: number) => {
    setHomepage((prev) => ({
      ...prev,
      aboutParagraphs: prev.aboutParagraphs.filter((_, i) => i !== index),
    }));
  };

  const addParagraph = () => {
    setHomepage((prev) => ({
      ...prev,
      aboutParagraphs: [...prev.aboutParagraphs, ""],
    }));
  };

  if (isError) return <p className="text-destructive">Failed to load settings.</p>;
  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Site Settings</h1>
        <p className="text-sm text-muted-foreground">Configure global site settings</p>
      </div>

      <div className="border border-border bg-card p-6">
        <div className="mb-4">
          <h2 className="font-heading text-lg font-bold text-foreground">Homepage</h2>
          <p className="text-sm text-muted-foreground">
            Manage the hero carousel and about section shown on the homepage
          </p>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FieldRoot>
                <Label>Hero Slides</Label>
              </FieldRoot>
              <Button
                variant="outline"
                size="xs"
                onClick={addSlide}
                disabled={homepage.heroSlides.length >= 15}
              >
                <Plus />
                Add Slide
              </Button>
            </div>
            {homepage.heroSlides.map((slide, i) => (
              <div key={i} className="space-y-3 border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <FieldRoot>
                    <Label>Slide {i + 1}</Label>
                  </FieldRoot>
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => removeSlide(i)}
                    aria-label={`Remove slide ${i + 1}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <FieldRoot>
                  <Label>Image</Label>
                  <ImageUpload
                    images={slide.image ? [slide.image] : []}
                    onChange={(imgs) => updateSlide(i, { image: imgs[0] || "" })}
                    maxDimensions={{ width: 1920, height: 1080 }}
                    context="hero"
                  />
                </FieldRoot>
                <FieldRoot>
                  <Label>Tagline</Label>
                  <Input
                    value={slide.tagline}
                    onChange={(e) => updateSlide(i, { tagline: e.target.value })}
                    placeholder="Slide tagline"
                  />
                </FieldRoot>
              </div>
            ))}
          </div>

          <FieldRoot>
            <Label>About Title</Label>
            <Input
              value={homepage.aboutTitle}
              onChange={(e) => setHomepage({ ...homepage, aboutTitle: e.target.value })}
              placeholder="About section heading"
            />
          </FieldRoot>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FieldRoot>
                <Label>About Paragraphs</Label>
              </FieldRoot>
              <Button variant="outline" size="xs" onClick={addParagraph}>
                <Plus />
                Add Paragraph
              </Button>
            </div>
            {homepage.aboutParagraphs.map((paragraph, i) => (
              <div key={i} className="flex items-start gap-2">
                <textarea
                  className={textareaClass}
                  value={paragraph}
                  onChange={(e) => updateParagraph(i, e.target.value)}
                  placeholder="Paragraph text"
                />
                <Button
                  variant="destructive"
                  size="icon-sm"
                  onClick={() => removeParagraph(i)}
                  aria-label={`Remove paragraph ${i + 1}`}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FieldRoot>
                <Label>About Images</Label>
              </FieldRoot>
              <span className="text-xs text-muted-foreground">Paste URLs or upload images</span>
            </div>
            <ImageUpload
              images={homepage.aboutImages}
              onChange={(imgs) => setHomepage({ ...homepage, aboutImages: imgs })}
              maxDimensions={{ width: 1200, height: 1500 }}
              context="about"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 border border-border bg-card p-6">
        {saveError && <p className="mb-4 text-sm text-destructive">{saveError}</p>}
        <div className="space-y-4">
          {Object.entries(form)
            .filter(([key]) => !HOMEPAGE_KEYS.includes(key))
            .map(([key, value]) => (
              <FieldRoot key={key}>
                <Label>
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                </Label>
                <Input
                  value={value}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </FieldRoot>
            ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="default" onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="size-4" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="mt-8 border border-border bg-card p-6">
        <div className="mb-4">
          <h2 className="font-heading text-lg font-bold text-foreground">Change Password</h2>
          <p className="text-sm text-muted-foreground">Update your admin account password</p>
        </div>
        <div className="space-y-4 max-w-sm">
          <FieldRoot>
            <Label>Current Password</Label>
            <div className="relative">
              <Input
                type={showCurrentPw ? "text" : "password"}
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showCurrentPw ? "Hide current password" : "Show current password"}
              >
                {showCurrentPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </FieldRoot>
          <FieldRoot>
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={showNewPw ? "text" : "password"}
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                placeholder="8+ chars, upper, lower, number, special"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showNewPw ? "Hide new password" : "Show new password"}
              >
                {showNewPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </FieldRoot>
          <FieldRoot>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              placeholder="Re-enter new password"
            />
          </FieldRoot>
          {pwError && <p className="text-sm text-destructive">{pwError}</p>}
          {pwSuccess && <p className="text-sm text-green-600">{pwSuccess}</p>}
          <Button variant="default" onClick={handlePasswordChange} disabled={pwMutation.isPending}>
            <Lock className="size-4" />
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
}
