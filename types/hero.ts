export interface Slide {
  id: string;
  imageUrl: string;
  altText?: string;
}

export interface HeroConfig {
  showTextOverlay: boolean; // Switch: heading and supporting text on or off
  heading: string;
  subtext: string;
  desktopSlides: Slide[]; // screens 768px wide and up
  mobileSlides: Slide[]; // phones; when empty the desktop slides are used
  autoplayIntervalMs: number; // e.g. 5000
  enableAutoplay: boolean;
}
