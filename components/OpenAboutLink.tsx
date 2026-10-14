"use client";

export const OPEN_ABOUT_EVENT = "merkado:open-about";

// A link to the About section that also opens it. Next's <Link> changes the hash with pushState,
// which never fires `hashchange`, so the section is told directly instead. The plain #about href
// still scrolls there, and works without JavaScript.
export default function OpenAboutLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href="#about"
      onClick={() => window.dispatchEvent(new Event(OPEN_ABOUT_EVENT))}
      className={className}
    >
      {children}
    </a>
  );
}
