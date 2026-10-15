"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "@/lib/auth";

const input =
  "w-full rounded-xl border border-walnut/15 bg-cream px-3.5 py-2.5 text-sm text-walnut placeholder:text-zinc-500 focus:border-walnut/30 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:focus:border-white/30";

export default function LoginForm() {
  const router = useRouter();
  const session = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Already signed in: skip the form.
  useEffect(() => {
    if (session.status === "signed-in") router.replace("/admin/dashboard");
  }, [session.status, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo ingresar. Probá de nuevo.");
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-3xl font-semibold tracking-tight text-walnut dark:text-white">
        Admin
      </h1>
      <p className="mt-2 text-sm text-muted dark:text-zinc-400">
        Administrá el catálogo: agregá productos, cambiá precios y marcá lo que se agotó.
      </p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-walnut dark:text-zinc-200">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
            placeholder="vos@ejemplo.com"
            aria-invalid={!!error}
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-walnut dark:text-zinc-200">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={input}
            aria-invalid={!!error}
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>

        {error && (
          <p id="login-error" role="alert" className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-chestnut px-5 py-3 text-sm font-medium text-white transition-all hover:bg-chestnut-hover active:scale-[0.98] disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {busy ? "Ingresando" : "Ingresar"}
        </button>
      </form>

      <p className="mt-6 rounded-xl border border-walnut/15 px-4 py-3 text-xs leading-relaxed text-muted dark:border-white/10 dark:text-zinc-400">
        Ingreso de prueba para desarrollo local: sirve cualquier correo y una contraseña de 6 o más caracteres. Firebase Auth lo va a reemplazar y, hasta entonces, no es seguro.
      </p>

      <Link
        href="/"
        className="mt-6 inline-block text-sm text-muted transition-colors hover:text-walnut dark:text-zinc-400 dark:hover:text-white"
      >
        Volver al catálogo
      </Link>
    </div>
  );
}
