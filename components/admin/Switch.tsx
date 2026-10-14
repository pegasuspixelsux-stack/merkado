"use client";

export default function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
        checked ? "bg-chestnut dark:bg-white" : "bg-walnut/20 dark:bg-zinc-700"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-4 bg-cream dark:bg-zinc-950" : "bg-cream dark:bg-zinc-300"
        }`}
      />
    </button>
  );
}
