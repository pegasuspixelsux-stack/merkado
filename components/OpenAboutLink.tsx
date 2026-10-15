"use client";

export const OPEN_ABOUT_EVENT = "merkado:open-about";

// A link to the About section that also opens it. Next's <Link> changes the hash with pushState,
// which never fires `hashchange`, so the section is told directly instead. The plain #about href
// still scrolls there, and works without JavaScript.
export default function OpenAboutLink({
  className,
  children,
  onClick,
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void; // e.g. close a menu this link sits in
}) {
  return (
    <a
      href="#about"
      onClick={() => {
        window.dispatchEvent(new Event(OPEN_ABOUT_EVENT));
        onClick?.();
      }}
      className={className}
    >
      {children}
    </a>
  );
}
