import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Upload, X, Link as LinkIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import apiClient from "~/lib/api-client";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxDimensions?: { width: number; height: number };
  context?: string;
}

function checkImageDimensions(
  file: File,
  maxDimensions: { width: number; height: number } | undefined
): Promise<string | null> {
  if (!maxDimensions) return Promise.resolve(null);
  if (file.type === "image/svg+xml" || /\.svg$/i.test(file.name)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (
        img.naturalWidth > maxDimensions.width ||
        img.naturalHeight > maxDimensions.height
      ) {
        resolve(
          `Image is ${img.naturalWidth}×${img.naturalHeight}px. Maximum is ${maxDimensions.width}×${maxDimensions.height}px.`
        );
      } else {
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("Could not read image dimensions. Try a different file.");
    };
    img.src = url;
  });
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

function placeholderInfo(
  maxDimensions: { width: number; height: number } | undefined
): { label: string; note: string; aspect: string } {
  if (!maxDimensions) {
    return { label: "Upload images", note: "max 500KB", aspect: "aspect-video" };
  }
  const { width, height } = maxDimensions;
  const isPortrait = Math.abs(width / height - 0.8) < 0.01;
  const ratio = isPortrait ? "4:5" : "16:9";
  return {
    label: `${width}×${height}px`,
    note: `${ratio} · max 500KB`,
    aspect: isPortrait ? "aspect-[4/5]" : "aspect-video",
  };
}

export function ImageUpload({
  images,
  onChange,
  maxDimensions,
  context,
}: ImageUploadProps) {
  const [urlInput, setUrlInput] = useState("");
  const [uploadError, setUploadError] = useState("");
  const placeholder = placeholderInfo(maxDimensions);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      if (context) {
        formData.append("context", context);
      }
      return apiClient.post<{ url: string }>("/content/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (res) => {
      onChange([...images, res.data.url]);
      setUploadError("");
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        setUploadError("File must be under 500KB");
        e.target.value = "";
        return;
      }
      const dimensionError = await checkImageDimensions(file, maxDimensions);
      if (dimensionError) {
        setUploadError(dimensionError);
        e.target.value = "";
        return;
      }
      setUploadError("");
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
                aria-label={`Remove image ${i + 1}`}
                className="absolute top-1 right-1 bg-background/80 p-0.5 text-destructive opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
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

      {images.length === 0 && (
        <div
          className={`flex items-center justify-center border border-dashed border-muted-foreground/40 bg-muted/50 ${placeholder.aspect} w-full`}
        >
          <div className="flex flex-col items-center py-6 text-center">
            <Upload className="mb-2 size-5 text-muted-foreground" />
            <p className="font-medium text-sm">{placeholder.label}</p>
            <p className="text-xs text-muted-foreground">{placeholder.note}</p>
          </div>
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
            className="sr-only"
            onChange={handleFileChange}
            disabled={uploadMutation.isPending}
          />
        </label>
      </div>
      {uploadMutation.isPending && (
        <p className="text-xs text-muted-foreground">Uploading...</p>
      )}
      {(uploadMutation.isError || uploadError) && (
        <p className="text-xs text-destructive">
          {uploadError ||
            (uploadMutation.error &&
              "response" in uploadMutation.error &&
              (uploadMutation.error as { response?: { data?: { message?: string } } })
                .response?.data?.message) ||
            "Upload failed. Try a different file."}
        </p>
      )}
    </div>
  );
}
