"use client";

import { useState } from "react";
import type { NewPastaItem, PastaItem } from "@/types/pasta";
import { useCategories } from "@/hooks/useCategories";
import Switch from "./Switch";

const input =
  "w-full rounded-xl border border-walnut/15 bg-cream px-3.5 py-2.5 text-sm text-walnut placeholder:text-zinc-500 focus:border-walnut/30 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:focus:border-white/30";
const label = "mb-1.5 block text-sm font-medium text-walnut dark:text-zinc-200";
const errorText = "mt-1.5 text-xs text-red-700 dark:text-red-400";

type Errors = Partial<Record<"title" | "price" | "unit" | "imageUrl", string>>;

function isHttpUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Mounted fresh (via key) each time the dialog opens, so state starts from `item`.
export default function ItemForm({
  item,
  onSave,
  onCancel,
}: {
  item: PastaItem | null; // null means "new item"
  onSave: (data: NewPastaItem) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(item?.title ?? "");
  const { categories } = useCategories();
  // A product whose category was deleted starts as Uncategorized; a new product starts in the first category.
  const [category, setCategory] = useState<string>(() =>
    item ? (categories.some((c) => c.id === item.category) ? item.category : "") : (categories[0]?.id ?? ""),
  );
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [unit, setUnit] = useState(item?.unit ?? "500g");
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? "");
  const [available, setAvailable] = useState(item?.available ?? true);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    const priceNum = Number(price);
    if (!title.trim()) next.title = "Enter a name for this item.";
    if (price === "" || !Number.isFinite(priceNum) || priceNum <= 0) next.price = "Enter a price above 0.";
    if (!unit.trim()) next.unit = "Enter a unit, such as 500g or kg.";
    if (imageUrl.trim() && !isHttpUrl(imageUrl.trim())) next.imageUrl = "Use a full link starting with https://";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    await onSave({
      title: title.trim(),
      category,
      description: description.trim(),
      price: priceNum,
      unit: unit.trim(),
      imageUrl: imageUrl.trim(),
      available,
    });
  }

  return (
    <form onSubmit={submit} noValidate className="p-6 sm:p-8">
      <h2 id="item-dialog-title" className="text-xl font-semibold tracking-tight">
        {item ? "Edit item" : "Add item"}
      </h2>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="f-title" className={label}>Title</label>
          <input
            id="f-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "f-title-err" : undefined}
            className={input}
            placeholder="Sorrentinos de Jamón y Queso"
            autoFocus
          />
          {errors.title && <p id="f-title-err" className={errorText}>{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="f-category" className={label}>Category</label>
          <select
            id="f-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={input}
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="f-description" className={label}>Description</label>
          <textarea
            id="f-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${input} resize-y`}
            placeholder="Ingredients and a short note"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="f-price" className={label}>Price (ARS)</label>
            <input
              id="f-price"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              aria-invalid={!!errors.price}
              aria-describedby={errors.price ? "f-price-err" : undefined}
              className={input}
              placeholder="850"
            />
            {errors.price && <p id="f-price-err" className={errorText}>{errors.price}</p>}
          </div>
          <div>
            <label htmlFor="f-unit" className={label}>Unit</label>
            <input
              id="f-unit"
              list="unit-options"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              aria-invalid={!!errors.unit}
              aria-describedby={errors.unit ? "f-unit-err" : undefined}
              className={input}
              placeholder="500g"
            />
            <datalist id="unit-options">
              <option value="500g" />
              <option value="kg" />
              <option value="unit" />
              <option value="12 unidades" />
            </datalist>
            {errors.unit && <p id="f-unit-err" className={errorText}>{errors.unit}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="f-image" className={label}>Image URL</label>
          <input
            id="f-image"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            aria-invalid={!!errors.imageUrl}
            aria-describedby={errors.imageUrl ? "f-image-err" : "f-image-help"}
            className={input}
            placeholder="https://"
          />
          {errors.imageUrl ? (
            <p id="f-image-err" className={errorText}>{errors.imageUrl}</p>
          ) : (
            <p id="f-image-help" className="mt-1.5 text-xs text-muted dark:text-zinc-400">
              Optional. Leave empty to show a placeholder.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-walnut/15 px-4 py-3 dark:border-white/10">
          <div>
            <p className="text-sm font-medium text-walnut dark:text-zinc-200">
              {available ? "In stock" : "Sold out"}
            </p>
            <p className="text-xs text-muted dark:text-zinc-400">
              Sold out items stay visible but cannot be ordered.
            </p>
          </div>
          <Switch checked={available} onChange={setAvailable} label="Available to order" />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-walnut/15 px-5 py-2.5 text-sm font-medium text-walnut transition-colors hover:border-walnut/30 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/25"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-chestnut px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-chestnut-hover active:scale-[0.97] disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {item ? "Save changes" : "Add item"}
        </button>
      </div>
    </form>
  );
}
