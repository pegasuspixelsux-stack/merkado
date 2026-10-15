import { Minus, Plus } from "lucide-react";
import type { PastaItem } from "@/types/pasta";
import { formatPrice } from "@/lib/format";
import FillText from "./FillText";
import PastaImage from "./PastaImage";

export const MAX_QUANTITY = 99;

const stepBtn =
  "grid h-8 w-8 shrink-0 place-items-center rounded-full text-walnut transition-all hover:bg-walnut/5 active:scale-[0.92] disabled:pointer-events-none disabled:text-zinc-300 sm:h-9 sm:w-9 dark:text-white dark:hover:bg-white/10 dark:disabled:text-zinc-700";

// Two columns at every width. The image is a flush 1:1 square on the left and sets the card's
// height. The text column is sized to fit inside that square, so the description is clamped to
// fewer lines on small screens instead of making the card taller.
export default function PastaCard({
  item,
  quantity,
  onQuantityChange,
}: {
  item: PastaItem;
  quantity: number;
  onQuantityChange: (next: number) => void;
}) {
  const soldOut = !item.available;

  return (
    <li className="group grid grid-cols-[5fr_6fr] overflow-hidden rounded-[14px] border border-walnut/15 bg-cream/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-walnut/30 sm:grid-cols-[2fr_3fr] dark:border-white/10 dark:bg-zinc-900/50 dark:hover:border-white/25">
      {/* Left: image, no padding, always square */}
      <div className="relative aspect-square w-full">
        <PastaImage
          key={item.imageUrl}
          url={item.imageUrl}
          alt={item.title}
          className={`absolute inset-0 h-full w-full ${soldOut ? "opacity-50 grayscale" : ""}`}
        />
        {soldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-chestnut px-2.5 py-1 text-xs font-medium text-white sm:left-3 sm:top-3 dark:bg-white dark:text-black">
            Agotado
          </span>
        )}
      </div>

      {/* Right: title, description, then quantity stepper and price on one row.
          Absolutely filled so the square image alone decides the card height. */}
      <div className="relative min-w-0">
        <div className="absolute inset-0 flex flex-col overflow-hidden p-3.5 sm:p-6 md:p-8">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-walnut max-[360px]:line-clamp-1 sm:text-lg md:text-xl dark:text-white">
            {item.title}
          </h3>
          <div className="flex min-h-0 flex-1 flex-col max-[360px]:hidden">
            <FillText
              text={item.description}
              className="text-sm leading-relaxed text-muted md:text-base md:leading-relaxed dark:text-zinc-400"
            />
          </div>

          <div className="mt-auto flex items-end justify-between gap-2 sm:gap-3">
            <div>
              <p id={`qty-${item.id}`} className="mb-1 hidden text-xs text-muted sm:block dark:text-zinc-400">
                Cantidad
              </p>
              <div
                role="group"
                aria-label={`Cantidad de ${item.title}`}
                className="inline-flex items-center rounded-full border border-walnut/15 p-0.5 dark:border-white/10"
              >
                <button
                  type="button"
                  onClick={() => onQuantityChange(quantity - 1)}
                  disabled={soldOut || quantity <= 0}
                  aria-label={`Quitar una unidad de ${item.title}`}
                  className={stepBtn}
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <output
                  aria-live="polite"
                  className="w-6 text-center text-sm font-semibold tabular-nums text-walnut sm:w-7 dark:text-white"
                >
                  {quantity}
                </output>
                <button
                  type="button"
                  onClick={() => onQuantityChange(quantity + 1)}
                  disabled={soldOut || quantity >= MAX_QUANTITY}
                  aria-label={`Agregar una unidad de ${item.title}`}
                  className={stepBtn}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="min-w-0 text-right">
              <p className="mb-1 hidden text-xs text-muted sm:block dark:text-zinc-400">Precio</p>
              <p className="text-base font-semibold leading-tight tracking-tight text-walnut sm:text-lg dark:text-white">
                {formatPrice(item.price)}
              </p>
              <p className="truncate text-xs leading-tight text-muted dark:text-zinc-400">/ {item.unit}</p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
