// The site's main links, used by both the top nav and the footer's "Enlaces rápidos" so the two
// always match. Change a label or add a link here and both update.
export interface NavLink {
  label: string;
  href: string;
  opensAbout?: boolean; // also opens the collapsed About band when followed
}

export const navLinks: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Menú", href: "/#catalog" },
  { label: "Sobre nosotros", href: "/#about", opensAbout: true },
  { label: "Contacto", href: "/#contact" }, // the footer's Contact column
];
