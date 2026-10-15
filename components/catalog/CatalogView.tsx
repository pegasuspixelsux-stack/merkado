"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageCircle, SearchX, X } from "lucide-react";
import CategoryIcon from "@/components/CategoryIcon";
import { useCategories } from "@/hooks/useCategories";
import { formatPrice, normalize, whatsappLink } from "@/lib/format";
import { usePastaInventory } from "@/hooks/usePastaInventory";
import HeroSlideshow from "@/components/HeroSlideshow";
import { useHeroConfig } from "@/hooks/useHeroConfig";
import PastaCard, { MAX_QUANTITY } from "./PastaCard";

type Filter = string; // a category id, or "all"

const pill =
  "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors";
const pillOff =
  "border-walnut/15 text-muted hover:border-walnut/30 hover:text-walnut dark:border-white/10 dark:text-zinc-400 dark:hover:border-white/25 dark:hover:text-white";
const pillOn =
  "border-chestnut bg-chestnut text-white dark:border-white dark:bg-white dark:text-black";

// The search text lives in the URL (?q=), written by the top nav search. This view only reads it.
export default function CatalogView() {
  const { items, hydrated } = usePastaInventory();
  const { config: heroConfig } = useHeroConfig();
  const query = useSearchParams().get("q") ?? "";
  const { categories } = useCategories();
  const [chosen, setCategory] = useState<Filter>("all");
  // If the chosen category was deleted in the meantime, fall back to All instead of an empty grid.
  const category = chosen === "all" || categories.some((c) => c.id === chosen) ? chosen : "all";
  // How many of each item the visitor wants, by item id. Kept in memory only.
  const [order, setOrder] = useState<Record<string, number>>({});

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return items.filter((i) => {
      if (category !== "all" && i.category !== category) return false;
      if (!q) return true;
      return normalize(i.title).includes(q) || normalize(i.description).includes(q);
    });
  }, [items, query, category]);

  const filtering = query.trim() !== "" || category !== "all";

  function setQuantity(id: string, next: number) {
    const n = Math.max(0, Math.min(MAX_QUANTITY, next));
    setOrder((o) => ({ ...o, [id]: n }));
  }

  // Only items that still exist and are in stock can be ordered.
  const orderLines = items.filter((i) => i.available && (order[i.id] ?? 0) > 0);
  const orderCount = orderLines.reduce((sum, i) => sum + (order[i.id] ?? 0), 0);
  const orderTotal = orderLines.reduce((sum, i) => sum + i.price * (order[i.id] ?? 0), 0);
  const orderMessage = [
    "Hola! Quiero pedir:",
    ...orderLines.map(
      (i) => `- ${order[i.id]} x ${i.title} (${i.unit}) ${formatPrice(i.price * (order[i.id] ?? 0))}`,
    ),
    `Total: ${formatPrice(orderTotal)}`,
  ].join("\n");

  function clearFilters() {
    setCategory("all");
    // The nav search follows the URL, so clearing ?q= clears it too.
    window.history.replaceState(null, "", window.location.pathname);
  }

  return (
    <>
      {/* Full-bleed: sits outside the narrow content column, flush under the nav. */}
      <HeroSlideshow config={heroConfig} />

      <main id="catalog" className="mx-auto w-full max-w-4xl flex-1 px-6 pb-10 pt-8">
        {/* Visually hidden: announces result counts to screen readers. */}
        <p aria-live="polite" className="sr-only">
          {hydrated
            ? `${visible.length} ${visible.length === 1 ? "producto" : "productos"}${
                query.trim() ? ` para "${query.trim()}"` : ""
              }`
            : "Cargando el catálogo"}
        </p>

        {/* Category filters, above the grid. */}
        <div role="group" aria-label="Filtrar por categoría" className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={category === "all"}
            onClick={() => setCategory("all")}
            className={`${pill} ${category === "all" ? pillOn : pillOff}`}
          >
            Todos
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
              className={`${pill} inline-flex items-center gap-1.5 ${category === c.id ? pillOn : pillOff}`}
            >
              <CategoryIcon key={c.icon} icon={c.icon} className="h-4 w-4 rounded-full" />
              {c.name}
            </button>
          ))}
        </div>

        {!hydrated ? (
          // Skeleton shaped like the final grid, shown until the saved inventory is read.
          <ul className="grid grid-cols-1 gap-5" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="h-48 animate-pulse rounded-[14px] border border-walnut/15 bg-cream/70 dark:border-white/10 dark:bg-zinc-900/50"
              />
            ))}
          </ul>
        ) : visible.length === 0 ? (
          <div className="mx-auto flex max-w-sm flex-col items-center py-24 text-center">
            <SearchX className="h-8 w-8 text-zinc-400" strokeWidth={1.5} aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold text-walnut dark:text-white">
              {filtering ? "No hay resultados para esa búsqueda" : "El catálogo está vacío"}
            </h2>
            <p className="mt-2 text-sm text-muted dark:text-zinc-400">
              {filtering
                ? "Probá con otra palabra o quitá los filtros."
                : "Los productos que agregues en el panel van a aparecer acá."}
            </p>
            {filtering && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-full bg-chestnut px-5 py-2 text-sm font-medium text-white hover:bg-chestnut-hover dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Quitar filtros
              </button>
            )}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5">
            {visible.map((item) => (
              <PastaCard
                key={item.id}
                item={item}
                quantity={order[item.id] ?? 0}
                onQuantityChange={(n) => setQuantity(item.id, n)}
              />
            ))}
          </ul>
        )}
      </main>

      {/* Order bar: appears once anything has a quantity and sends the whole order in one message. */}
      {orderCount > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="glass pointer-events-auto flex items-center gap-1 rounded-full border border-walnut/15 bg-background/80 p-1.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80">
            <a
              href={whatsappLink(orderMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-chestnut px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-chestnut-hover active:scale-[0.97] dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Pedir por WhatsApp
              <span className="tabular-nums opacity-70">
                {orderCount} {orderCount === 1 ? "producto" : "productos"}, {formatPrice(orderTotal)}
              </span>
            </a>
            <button
              type="button"
              onClick={() => setOrder({})}
              aria-label="Vaciar el pedido"
              className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-walnut/5 hover:text-walnut dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

    </>
  );
}
