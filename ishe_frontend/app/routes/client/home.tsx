import type { Route } from "./+types/home";
import { Link } from "react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Mountain,
  Sun,
  ChevronDown,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { useHomepageContent } from "~/hooks/useHomepageContent";
import { seoMeta } from "~/lib/seo";

export function meta({}: Route.MetaArgs) {
  return seoMeta({
    title: "Isitoshe Tours — Discover Uganda",
    description:
      "Explore Uganda with expertly curated safaris and unforgettable experiences. Disability-inclusive tours, gorilla trekking, and wildlife adventures.",
  });
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "Isitoshe Tours",
  url: "https://isitoshetours.com",
  logo: "https://isitoshetours.com/isitoshetours.png",
  image: "https://isitoshetours.com/isitoshetours.png",
  email: "info@isitoshetours.com",
  telephone: "+256787699744",
  description:
    "Disability-inclusive Ugandan tour operator offering curated safari itineraries, gorilla trekking, and unforgettable wildlife experiences.",
  areaServed: "Uganda",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kyaliwajjala, Kampala",
    addressCountry: "UG",
  },
};

const highlights = [
  {
    icon: Compass,
    title: "Curated Routes",
    description: "Hand-picked itineraries designed to show you the best of Uganda.",
  },
  {
    icon: Mountain,
    title: "Adventure Awaits",
    description: "From Bwindi Impenetrable Forest to Murchison Falls, explore diverse landscapes.",
  },
  {
    icon: Sun,
    title: "Year-Round Tours",
    description:
      "Every season offers a unique Ugandan experience. Find your perfect time to visit.",
  },
];

const faqs = [
  {
    question: "How much deposit is required to book a tour?",
    answer:
      "A minimum deposit of $150 USD per person is required to confirm your booking. The remaining balance is due 60 days before the tour start date. Bookings made within 60 days of departure require full payment upfront.",
  },
  {
    question: "What is the cancellation policy?",
    answer:
      "Cancellation charges depend on when you cancel: 12+ weeks before departure you forfeit the deposit ($150 per person); 11–6 weeks is 25% of the total cost; 6–2 weeks is 50%; and within 2 weeks is 100% of the total tour cost.",
  },
  {
    question: "Do I need travel insurance?",
    answer:
      "Yes, comprehensive travel insurance is mandatory for all travellers. It must cover trip cancellation, medical emergencies, emergency evacuation, and personal liability. Please arrange your insurance before the tour.",
  },
  {
    question: "What health requirements should I be aware of?",
    answer:
      "Travellers must be in good physical and mental health. Some tours involve strenuous activities. Disclose any pre-existing medical conditions when booking so we can ensure the right itinerary for you.",
  },
  {
    question: "What documents do I need for Uganda?",
    answer:
      "You need a valid passport with at least 6 months' validity from your entry date. Visa requirements vary by nationality — we can provide guidance on obtaining the correct visa for your trip.",
  },
  {
    question: "Are tours affected by epidemics or natural disasters?",
    answer:
      "While we monitor all safety situations closely, Isitoshe Tours is not liable for disruptions caused by force majeure events including epidemics, pandemics, natural disasters, or political instability. We will work with you to reschedule where possible.",
  },
  {
    question: "Are airport transfers included?",
    answer:
      "Airport transfers and in-tour transport are provided as specified in each itinerary. Changes to transfer times or pick-up locations requested by the traveller may incur additional charges.",
  },
  {
    question: "What is included and excluded in the tour price?",
    answer:
      "Each itinerary clearly lists what is included and excluded. Typically, accommodation, transport, meals, and activities as listed are included. Personal shopping, optional activities, alcoholic beverages, and gratuities are generally excluded unless stated.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function Home() {
  const { heroSlides, aboutTitle, aboutParagraphs, aboutImages } = useHomepageContent();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, isPaused]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd, faqJsonLd]) }}
      />
      <section
        aria-label="Image carousel"
        aria-live="off"
        className="relative h-[60vh] min-h-[400px] overflow-hidden sm:h-[80vh]"
      >
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            aria-hidden={i !== currentSlide}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === currentSlide ? 1 : 0 }}
          >
            <img
              src={slide.image}
              alt={slide.tagline}
              width={1920}
              height={1080}
              className="size-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="mb-3 text-sm font-semibold tracking-widest uppercase text-white/80 sm:text-base">
              {heroSlides[currentSlide].tagline}
            </p>
            <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Discover the Beauty of Uganda
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Expertly curated safaris through lush forests, vast savannahs, and stunning national
              parks.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link to="/itineraries">
                <Button variant="secondary" size="lg">
                  Explore Tours
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
          aria-label="Next slide"
        >
          <ChevronRight className="size-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`size-2 transition-colors ${i === currentSlide ? "bg-white" : "bg-white/40"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="ml-2 bg-black/40 px-2 py-1 text-xs text-white transition-colors hover:bg-black/60"
            aria-label={isPaused ? "Resume carousel" : "Pause carousel"}
          >
            {isPaused ? "▶" : "❚❚"}
          </button>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground">{aboutTitle}</h2>
              {aboutParagraphs.map((paragraph, i) => (
                <p key={i} className="mt-4 text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
              <div className="mt-6 flex items-center gap-4">
                <Link to="/itineraries">
                  <Button variant="default" size="lg">
                    View Our Tours
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg">
                    Get in Touch
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {aboutImages.map((image, i) => (
                <div
                  key={i}
                  className={`aspect-[4/5] bg-muted overflow-hidden ${i % 2 === 1 ? "mt-8" : ""}`}
                >
                  <img
                    src={image}
                    alt={`${aboutTitle} image ${i + 1}`}
                    loading="lazy"
                    width={600}
                    height={750}
                    className="size-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              Why Travel with Isitoshe Tours?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Disability-inclusive, eco-friendly tours with expert local guides and unforgettable
              memories.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-none border border-border bg-card p-8 text-center transition-shadow hover:shadow-lg"
              >
                <div className="mx-auto flex size-12 items-center justify-center bg-primary text-primary-foreground">
                  <item.icon className="size-6" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-muted-foreground">
              Everything you need to know before booking your safari
            </p>
          </div>
          <div className="mt-12 space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border bg-card">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
                  aria-expanded={openFaq === i}
                >
                  {faq.question}
                  <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/terms" className="text-sm font-semibold text-primary hover:underline">
              Read full Terms &amp; Conditions &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
