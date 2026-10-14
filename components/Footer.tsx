import Link from "next/link";
import { Check, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { siFacebook, siInstagram, siWhatsapp } from "simple-icons";
import { addressLine, storeInfo } from "@/config/storeInfo";
import { whatsappLink } from "@/lib/format";
import OpenAboutLink from "@/components/OpenAboutLink";
import ThemeToggle from "@/components/ThemeToggle";

// Brand marks come from the simple-icons package, drawn in the current text colour.
function Brand({ icon, label, href }: { icon: { path: string }; label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-walnut/15 text-muted transition-colors hover:border-walnut/30 hover:text-walnut dark:border-white/10 dark:text-zinc-400 dark:hover:border-white/25 dark:hover:text-white"
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden="true">
        <path d={icon.path} />
      </svg>
    </a>
  );
}

const heading = "text-sm font-semibold text-walnut dark:text-white";
const linkCls =
  "text-sm text-muted transition-colors hover:text-walnut dark:text-zinc-400 dark:hover:text-white";
const row = "flex items-start gap-3 text-sm text-muted dark:text-zinc-400";

export default function Footer() {
  const { name, summary, hours, pickup, delivery, phone, email, social } = storeInfo;

  return (
    <footer className="mt-10 border-t border-walnut/15 bg-walnut/[0.04] dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* 1. Brand and overview */}
          <div>
            <p className="text-xl font-bold tracking-tight text-walnut dark:text-white">{name}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted dark:text-zinc-400">{summary}</p>
            <div className="mt-5 flex items-center gap-2">
              <Brand icon={siInstagram} label={`${name} on Instagram`} href={social.instagram} />
              <Brand icon={siFacebook} label={`${name} on Facebook`} href={social.facebook} />
              <Brand icon={siWhatsapp} label={`Order from ${name} on WhatsApp`} href={whatsappLink("Hola!")} />
            </div>
          </div>

          {/* 2. Business hours */}
          <div id="hours">
            <h2 className={heading}>Business hours</h2>
            <ul className="mt-4 space-y-3">
              {hours.map((h) => (
                <li key={h.days} className={row}>
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="block font-medium text-walnut dark:text-zinc-200">{h.days}</span>
                    {h.times}
                  </span>
                </li>
              ))}
            </ul>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Ways to get your order">
              {[
                { label: "Pickup", on: pickup },
                { label: "Delivery", on: delivery },
              ].map((s) => (
                <li
                  key={s.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-walnut/15 px-3 py-1 text-xs font-medium text-walnut dark:border-white/10 dark:text-zinc-200"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  {s.label}
                  <span className="sr-only">{s.on ? " available" : " not available"}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Contact and location */}
          <div>
            <h2 className={heading}>Contact and location</h2>
            <ul className="mt-4 space-y-3">
              <li className={row}>
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <address className="not-italic">{addressLine()}</address>
              </li>
              <li className={row}>
                <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <a href={`tel:${phone.tel}`} className={linkCls}>{phone.display}</a>
              </li>
              <li className={row}>
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <a href={whatsappLink("Hola! Quiero hacer un pedido.")} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  Order on WhatsApp
                </a>
              </li>
              <li className={row}>
                <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <a href={`mailto:${email}`} className={linkCls}>{email}</a>
              </li>
            </ul>
          </div>

          {/* 4. Quick links and admin */}
          <nav aria-label="Footer">
            <h2 className={heading}>Quick links</h2>
            <ul className="mt-4 space-y-3">
              <li><Link href="/#catalog" className={linkCls}>Menu and catalog</Link></li>
              <li><OpenAboutLink className={linkCls}>About us</OpenAboutLink></li>
              <li><Link href="/#hours" className={linkCls}>Delivery info</Link></li>
              <li>
                <Link href="/admin/login" className="text-xs text-muted/80 transition-colors hover:text-walnut dark:text-zinc-500 dark:hover:text-white">
                  Admin login
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Sub-footer */}
        <hr className="mt-12 border-walnut/15 dark:border-white/10" />
        <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-xs text-muted dark:text-zinc-500">
            &copy; {storeInfo.copyrightYear} {name}. All rights reserved.
          </p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
