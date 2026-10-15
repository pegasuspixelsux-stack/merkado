"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Category, CategoryDetails } from "@/types/category";
import { addCategory, deleteCategory, updateCategory } from "@/lib/categories/api";
import { useCategories } from "@/hooks/useCategories";
import { usePastaInventory } from "@/hooks/usePastaInventory";
import CategoryIcon from "@/components/CategoryIcon";
import CategoryForm from "./CategoryForm";
import Modal from "./Modal";

// "new" opens the add form, a category opens the edit form, null keeps the dialog closed.
type Editing = Category | "new" | null;

const ghostBtn =
  "inline-flex items-center gap-1.5 rounded-full border border-walnut/15 px-4 py-2 text-sm font-medium text-walnut transition-colors hover:border-walnut/30 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/25 dark:hover:text-white";
const iconBtn =
  "grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-walnut/5 hover:text-walnut dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white";
const primaryBtn =
  "inline-flex items-center gap-1.5 rounded-full bg-chestnut px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-chestnut-hover active:scale-[0.97] dark:bg-white dark:text-black dark:hover:bg-zinc-200";

export default function CategoryManager() {
  const { categories } = useCategories();
  const { items } = usePastaInventory();
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [error, setError] = useState("");

  const countIn = (id: string) => items.filter((i) => i.category === id).length;

  // Rejects with a readable message, which the form shows under its fields.
  async function save(name: string, details: CategoryDetails) {
    if (editing && editing !== "new") await updateCategory(editing.id, { name, ...details });
    else await addCategory(name, details);
    setEditing(null);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setError("");
    try {
      await deleteCategory(deleting.id);
    } catch {
      setError("No se pudo eliminar la categoría. Puede que el almacenamiento del navegador esté bloqueado. Probá de nuevo.");
    }
    setDeleting(null);
  }

  const deletingCount = deleting ? countIn(deleting.id) : 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-walnut dark:text-white">Categorías</h1>
          <p className="mt-2 text-sm text-muted dark:text-zinc-400">
            {categories.length} {categories.length === 1 ? "categoría" : "categorías"}. Son los filtros del catálogo y, si
            renombrás una, se actualiza en todos lados.
          </p>
        </div>
        <button type="button" onClick={() => setEditing("new")} className={primaryBtn}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Agregar categoría nueva
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-xl border border-red-700/30 bg-red-700/5 px-4 py-3 text-sm text-red-700 dark:border-red-400/30 dark:text-red-400">
          {error}
        </p>
      )}

      {categories.length === 0 ? (
        <div className="mt-10 rounded-[14px] border border-dashed border-walnut/15 px-6 py-20 text-center dark:border-white/15">
          <h2 className="text-lg font-semibold text-walnut dark:text-white">Todavía no hay categorías</h2>
          <p className="mt-2 text-sm text-muted dark:text-zinc-400">
            Agregá una y aparece como filtro en el catálogo. Los productos sin categoría se ven en Todos.
          </p>
          <button type="button" onClick={() => setEditing("new")} className={`${ghostBtn} mt-6`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Agregar categoría nueva
          </button>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-walnut/15 overflow-hidden rounded-[14px] border border-walnut/15 dark:divide-white/10 dark:border-white/10">
          {categories.map((c) => {
            const n = countIn(c.id);
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 bg-cream/70 p-4 dark:bg-zinc-900/50">
                {/* The initial sits underneath, so a missing or broken icon still shows something. */}
                <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-chestnut/10 text-base font-semibold text-chestnut dark:bg-white/10 dark:text-white">
                  <span aria-hidden="true">{c.name.charAt(0).toUpperCase()}</span>
                  <CategoryIcon key={c.icon} icon={c.icon} className="absolute inset-0 h-full w-full" />
                </span>

                <div className="min-w-0 flex-1 basis-48">
                  <p className="truncate font-medium text-walnut dark:text-white">{c.name}</p>
                  <p className="mt-0.5 truncate text-sm text-muted dark:text-zinc-400">
                    {c.description ? `${c.description} · ` : ""}
                    {n} {n === 1 ? "producto" : "productos"}
                    <span className="text-muted/70 dark:text-zinc-500"> · /{c.slug}</span>
                  </p>
                </div>

                <div className="flex items-center">
                  <button type="button" onClick={() => setEditing(c)} className={iconBtn} aria-label={`Editar ${c.name}`}>
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setDeleting(c)} className={iconBtn} aria-label={`Eliminar ${c.name}`}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} labelledBy="category-dialog-title">
        <CategoryForm
          key={editing === "new" ? "new" : (editing?.id ?? "closed")}
          category={editing === "new" ? null : editing}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} labelledBy="category-delete-title">
        <div className="p-6 sm:p-8">
          <h2 id="category-delete-title" className="text-xl font-semibold tracking-tight">
            ¿Eliminar {deleting?.name}?
          </h2>
          <p className="mt-2 text-sm text-muted dark:text-zinc-400">
            {deletingCount > 0
              ? `${deletingCount} ${deletingCount === 1 ? "producto está" : "productos están"} en esta categoría. ${
                  deletingCount === 1 ? "Sigue" : "Siguen"
                } en el catálogo y ${deletingCount === 1 ? "queda" : "quedan"} sin categoría.`
              : "Ningún producto usa esta categoría."}{" "}
            La categoría en sí no se puede recuperar.
          </p>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={() => setDeleting(null)} className={ghostBtn}>Conservar categoría</button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700 active:scale-[0.97]"
            >
              Eliminar categoría
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
