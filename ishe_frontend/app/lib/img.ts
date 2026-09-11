const UNSPLASH_HOST = "images.unsplash.com";

export function isUnsplashUrl(src: string): boolean {
  return src.includes(UNSPLASH_HOST);
}

export function unsplashSrc(src: string, width: number, quality = 80): string {
  if (!isUnsplashUrl(src)) return src;
  const [base, query] = src.split("?");
  const params = new URLSearchParams(query || "");
  params.set("w", String(width));
  params.set("q", String(quality));
  return `${base}?${params.toString()}`;
}

export function responsiveSrcset(src: string, widths: number[]): string | undefined {
  if (!isUnsplashUrl(src)) return undefined;
  return widths.map((w) => `${unsplashSrc(src, w)} ${w}w`).join(", ");
}

export const HERO_WIDTHS = [480, 768, 1024, 1440, 1920];
export const CARD_WIDTHS = [320, 480, 640, 960, 1280];

export interface ImgProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  decoding?: "async" | "sync" | "auto";
  fetchPriority?: "high" | "low" | "auto";
}