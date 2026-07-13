import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Upload, X, Link as LinkIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import apiClient from "~/lib/api-client";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

function convertGoogleDriveUrl(url: string): string {
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch) {
    return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
  }
  const openIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openIdMatch) {
    return `https://drive.google.com/uc?export=view&id=${openIdMatch[1]}`;
  }
  return url;
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [urlInput, setUrlInput] = useState("");

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiClient.post<{ url: string }>("/content/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (res) => {
      onChange([...images, res.data.url]);
    },
  });

  const addUrl = () => {
    const trimmed = convertGoogleDriveUrl(urlInput.trim());
    if (trimmed && !images.includes(trimmed)) {
      onChange([...images, trimmed]);
      setUrlInput("");
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((url, i) => (
            <div key={i} className="group relative border border-border bg-muted">
              <img
                src={url}
                alt={`Image ${i + 1}`}
                className="aspect-video w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-background/80 p-0.5 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
              <p className="truncate px-1 py-0.5 text-[10px] text-muted-foreground">
                {url}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 border border-input bg-background px-2">
          <LinkIcon className="size-3 text-muted-foreground shrink-0" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
            placeholder="Paste image URL"
            className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={addUrl}
            disabled={!urlInput.trim()}
          >
            Add
          </Button>
        </div>
        <label className="flex cursor-pointer items-center gap-1.5 border border-input bg-background px-3 text-xs font-medium text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors">
          <Upload className="size-3" />
          Upload
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/tiff,image/tif"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploadMutation.isPending}
          />
        </label>
      </div>
      {uploadMutation.isPending && (
        <p className="text-xs text-muted-foreground">Uploading...</p>
      )}
      {uploadMutation.isError && (
        <p className="text-xs text-destructive">Upload failed. Try a different file.</p>
      )}
    </div>
  );
}
