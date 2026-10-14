"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import type { NewPastaItem, PastaItem } from "@/types/pasta";
import { formatPrice } from "@/lib/format";
import { signOut, useSession } from "@/lib/auth";
import { useCategories } from "@/hooks/useCategories";
import { usePastaInventory } from "@/hooks/usePastaInventory";
import PastaImage from "@/components/catalog/PastaImage";
import ThemeToggle from "@/components/ThemeToggle";
import CategoryManager from "./CategoryManager";
import HeroSettings from "./HeroSettings";
import ItemForm from "./ItemForm";
import Modal from "./Modal";
import Switch from "./Switch";

// "new" opens the add form, an item opens the edit form, null keeps the dialog closed.
type Editing = PastaItem | "new" | null;
type Tab = "inventory" | "categories" | "hero";
const TABS: { id: Tab; label: string }[] = [
  { id: "inventory", label: "Inventory" },
  { id: "categories", label: "Categories" },
  { id: "hero", label: "Hero" },
];

const ghostBtn =
  "inline-flex items-center gap-1.5 rounded-full border border-walnut/15 px-4 py-2 text-sm font-medium text-walnut transition-colors hover:border-walnut/30 hover:text-walnut dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/25 dark:hover:text-white";
const iconBtn =
  "grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-walnut/5 hover:text-walnut dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white";

export default function Dashboard() {
  const router = useRouter();
  const session = useSession();
  const { items, hydrated, create, update, remove } = usePastaInventory();
  const { nameOf } = useCategories();
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<PastaItem | null>(null);
  const [tab, setTab] = useState<Tab>("inventory");

  useEffect(() => {
    if (session.status === "signed-out") router.replace("/admin/login");
  }, [session.status, router]);

  if (session.status !== "signed-in" || !hydrated) {
    return (
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-16" aria-busy="true">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-cream/50 dark:bg-zinc-900" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-cream/50 dark:bg-zinc-900" />
          ))}
        </div>
      </div>
    );
  }

  async function save(data: NewPastaItem) {
    if (editing && editing !== "new") await update(editing.id, data);
    else await create(data);
    setEditing(null);
  }

  async function confirmDelete() {
    if (deleting) await remove(deleting.id);
    setDeleting(null);
  }

  async function logout() {
    await signOut();
    router.replace("/admin/login");
  }

  const soldOut = items.filter((i) => !i.available).length;

  return (
    <>
      <header className="glass sticky top-0 z-40 border-b border-walnut/15 bg-background/70 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-6">
          <p className="text-lg font-bold tracking-tight text-walnut dark:text-white">
            Merkado <span className="font-normal text-muted dark:text-zinc-500">Admin</span>
          </p>
          <div className="flex items-center gap-1">
            <Link href="/" className={`${iconBtn} w-auto gap-1.5 px-3 text-sm`}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">View catalog</span>
              <span className="sr-only sm:hidden">View catalog</span>
            </Link>
            <button type="button" onClick={logout} className={`${iconBtn} w-auto gap-1.5 px-3 text-sm`}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
              <span className="sr-only sm:hidden">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div
          role="tablist"
          aria-label="Dashboard sections"
          className="mb-8 inline-flex rounded-full border border-walnut/15 bg-walnut/[0.05] p-0.5 dark:border-white/10 dark:bg-white/5"
        >
          {TABS.map(({ id: t, label }) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={`tab-${t}`}
              aria-selected={tab === t}
              aria-controls="dashboard-panel"
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-cream text-walnut shadow-sm dark:bg-white/10 dark:text-white dark:shadow-none"
                  : "text-muted hover:text-walnut dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div id="dashboard-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "hero" ? (
          <HeroSettings />
        ) : tab === "categories" ? (
          <CategoryManager />
        ) : (
        <>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-walnut dark:text-white">
              Inventory
            </h1>
            <p className="mt-2 text-sm text-muted dark:text-zinc-400">
              {items.length} {items.length === 1 ? "item" : "items"}, {soldOut} sold out
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1.5 rounded-full bg-chestnut px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-chestnut-hover active:scale-[0.97] dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-walnut/15 px-6 py-20 text-center dark:border-white/15">
            <h2 className="text-lg font-semibold text-walnut dark:text-white">No items yet</h2>
            <p className="mt-2 text-sm text-muted dark:text-zinc-400">
              Add your first item and it appears in the catalog right away.
            </p>
            <button type="button" onClick={() => setEditing("new")} className={`${ghostBtn} mt-6`}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add item
            </button>
          </div>
        ) : (
          <ul className="mt-8 divide-y divide-walnut/15 overflow-hidden rounded-3xl border border-walnut/15 dark:divide-white/10 dark:border-white/10">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 bg-cream/70 p-4 dark:bg-zinc-900/50"
              >
                <PastaImage
                  key={item.imageUrl}
                  url={item.imageUrl}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-xl"
                />
                <div className="min-w-0 flex-1 basis-48">
                  <p className="truncate font-medium text-walnut dark:text-white">{item.title}</p>
                  <p className="mt-0.5 text-sm text-muted dark:text-zinc-400">
                    {nameOf(item.category)} · {formatPrice(item.price)} / {item.unit}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`w-16 text-right text-xs font-medium ${
                      item.available ? "text-muted dark:text-zinc-400" : "text-walnut dark:text-white"
                    }`}
                  >
                    {item.available ? "In stock" : "Sold out"}
                  </span>
                  <Switch
                    checked={item.available}
                    onChange={(next) => update(item.id, { available: next })}
                    label={`${item.title} available to order`}
                  />
                </div>

                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    className={iconBtn}
                    aria-label={`Edit ${item.title}`}
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(item)}
                    className={iconBtn}
                    aria-label={`Delete ${item.title}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        </>
        )}
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8">
        <p className="text-xs text-muted dark:text-zinc-500">
          Saved in this browser. Connect Firebase to share it across devices.
        </p>
        <ThemeToggle />
      </footer>

      <Modal open={editing !== null} onClose={() => setEditing(null)} labelledBy="item-dialog-title">
        <ItemForm
          key={editing === "new" ? "new" : (editing?.id ?? "closed")}
          item={editing === "new" ? null : editing}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} labelledBy="delete-dialog-title">
        <div className="p-6 sm:p-8">
          <h2 id="delete-dialog-title" className="text-xl font-semibold tracking-tight">
            Delete {deleting?.title}?
          </h2>
          <p className="mt-2 text-sm text-muted dark:text-zinc-400">
            It disappears from the catalog right away. This cannot be undone.
          </p>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={() => setDeleting(null)} className={ghostBtn}>
              Keep item
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700 active:scale-[0.97]"
            >
              Delete item
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
