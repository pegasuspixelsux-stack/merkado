import type { HeroConfig } from "@/types/hero";

// Most slides allowed in each of the desktop and mobile sets.
export const MAX_SLIDES = 3;
export const INTERVAL_OPTIONS_MS = [3000, 5000, 7000, 10000] as const;

// The default hero uses the banner artwork in public/hero_images: the landscape file on screens
// 768px wide and up, the square file on phones. The artwork already carries its own text, so the
// heading and supporting text overlay starts switched off (the heading below still serves as the
// page's hidden h1). Turn the overlay on, or swap the images, from the admin Hero tab.
const ALT =
  "Pastas artesanales: raviolones de jamón y queso, sorrentinos de ricota y queso, y canelones";

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  showTextOverlay: false,
  heading: "Fresh Pasta Today",
  subtext: "Rolled and filled by hand each morning. Pick what you need below and order on WhatsApp.",
  desktopSlides: [
    { id: "hero-landscape", imageUrl: "/hero_images/pasta_landscape.jpg", altText: ALT },
  ],
  mobileSlides: [
    { id: "hero-square", imageUrl: "/hero_images/pasta_square.jpg", altText: ALT },
  ],
  autoplayIntervalMs: 5000,
  enableAutoplay: true,
};
