import { useQuery } from "@tanstack/react-query";
import apiClient from "~/lib/api-client";
import type { SiteSettings, HeroSlide, HomepageSettings } from "~/types";

export const HOMEPAGE_DEFAULTS: HomepageSettings = {
  heroSlides: [
    {
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=80",
      tagline: "Uganda's Premier Tour Operator",
    },
    {
      image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&q=80",
      tagline: "Gorilla Trekking Adventures",
    },
    {
      image: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=1920&q=80",
      tagline: "Safari Across the Savannah",
    },
    {
      image: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1920&q=80",
      tagline: "Discover Murchison Falls",
    },
    {
      image: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=1920&q=80",
      tagline: "Unforgettable Wildlife Encounters",
    },
  ] satisfies HeroSlide[],
  aboutTitle: "About Isitoshe Tours",
  aboutParagraphs: [
    "Isitoshe Tours is a disability-inclusive tour operator based in Kyaliwajjala, Kampala, Uganda. We specialise in curating unforgettable safari experiences that showcase the best of Uganda's wildlife, landscapes, and culture.",
    "Our team of expert local guides is passionate about responsible tourism and creating meaningful connections between travellers and the communities they visit. Every tour is designed with care, ensuring accessibility, sustainability, and genuine cultural exchange.",
  ],
  aboutImages: [
    "https://images.unsplash.com/photo-1521651201144-634f700b36ef?w=600&q=80",
    "https://images.unsplash.com/photo-1504173010664-32509aeebb62?w=600&q=80",
  ],
};

export function firstNonEmpty<T>(value: unknown, fallback: T): T {
  return Array.isArray(value) && value.length > 0 ? (value as T) : fallback;
}

export function useHomepageContent() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () =>
      apiClient.get<SiteSettings>("/content/site-settings").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const data = settings?.data ?? {};

  return {
    heroSlides: firstNonEmpty<HeroSlide[]>(data.heroSlides, HOMEPAGE_DEFAULTS.heroSlides),
    aboutTitle: (data.aboutTitle as string) || HOMEPAGE_DEFAULTS.aboutTitle,
    aboutParagraphs: firstNonEmpty<string[]>(data.aboutParagraphs, HOMEPAGE_DEFAULTS.aboutParagraphs),
    aboutImages: firstNonEmpty<string[]>(data.aboutImages, HOMEPAGE_DEFAULTS.aboutImages),
  };
}
