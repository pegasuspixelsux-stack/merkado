"use client";

import { useState } from "react";
import type { Category, CategoryDetails } from "@/types/category";
import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH, slugify } from "@/lib/categories/rules";

const input =
  "w-full rounded-xl border border-walnut/15 bg-cream px-3.5 py-2.5 text-sm text-walnut placeholder:text-zinc-500 focus:border-walnut/30 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:focus:border-white/30";
const label = "mb-1.5 block text-sm font-medium text-walnut dark:text-zinc-200";

// Mounted fresh (via key) each time the dialog opens, so it always starts from `category`.
export default function CategoryForm({
  category,
  onSave,
  onCancel,
}: {
  category: Category | null; // null means "new category"
  onSave: (name: string, details: CategoryDetails) => Promise<void>; // rejects with a readable message
  onCancel: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave(name, { description, icon });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar. Probá de nuevo.");
      setSaving(false);
    }
  }

  const slug = slugify(name);

  return (
    <form onSubmit={submit} noValidate className="p-6 sm:p-8">
      <h2 id="category-dialog-title" className="text-xl font-semibold tracking-tight">
        {category ? "Editar categoría" : "Agregar categoría nueva"}
      </h2>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="c-name" className={label}>Nombre</label>
          <input
            id="c-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            aria-invalid={!!error}
            aria-describedby="c-slug"
            className={input}
            placeholder="Vinos"
            autoFocus
          />
          <p id="c-slug" className="mt-1.5 text-xs text-muted dark:text-zinc-400">
            Slug: <span className="font-medium tabular-nums">{slug || "se genera a partir del nombre"}</span>
          </p>
        </div>

        <div>
          <label htmlFor="c-description" className={label}>
            Descripción <span className="font-normal text-muted dark:text-zinc-500">(opcional)</span>
          </label>
          <textarea
            id="c-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={MAX_DESCRIPTION_LENGTH}
            rows={2}
            className={`${input} resize-y`}
            placeholder="Vinos para acompañar nuestras pastas"
          />
        </div>

        <div>
          <label htmlFor="c-icon" className={label}>
            Ícono o enlace de imagen <span className="font-normal text-muted dark:text-zinc-500">(opcional)</span>
          </label>
          <input
            id="c-icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            inputMode="url"
            className={input}
            placeholder="https://"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-5 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-walnut/15 px-5 py-2.5 text-sm font-medium text-walnut transition-colors hover:border-walnut/30 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/25"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-chestnut px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-chestnut-hover active:scale-[0.97] disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {category ? "Guardar cambios" : "Agregar categoría"}
        </button>
      </div>
    </form>
  );
}
