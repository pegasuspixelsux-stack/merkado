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
  showNavTitle: boolean; // site name in the top nav, on or off
  overlayDarkness: number; // 0 to 90, percent of black over the slides
  overlayColor: string; // hex like #6b3e22
  overlayColorOpacity: number; // 0 to 80, how strongly the colour covers the slides
}
