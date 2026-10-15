"use client";

import { useSyncExternalStore } from "react";

/**
 * PLACEHOLDER AUTH. This only remembers an email in localStorage so the dashboard can be
 * built and clicked through. It is NOT security: anyone can set the key by hand.
 * Replace signIn / signOut / useSession with Firebase Auth (signInWithEmailAndPassword,
 * signOut, onAuthStateChanged) and enforce access with Firestore security rules.
 */
const KEY = "merkado:admin-session:v1";
const listeners = new Set<() => void>();

const read = () => {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

const emit = () => listeners.forEach((l) => l());

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export async function signIn(email: string, password: string): Promise<void> {
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Ingresá un correo electrónico válido.");
  if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.");
  try {
    window.localStorage.setItem(KEY, email);
  } catch {
    throw new Error("Este navegador está bloqueando el almacenamiento, así que no se puede guardar el ingreso.");
  }
  emit();
}

export async function signOut(): Promise<void> {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
  emit();
}

export type Session =
  | { status: "loading"; email: null }
  | { status: "signed-out"; email: null }
  | { status: "signed-in"; email: string };

// Server snapshot is undefined, which maps to "loading" until the client reads storage.
export function useSession(): Session {
  const email = useSyncExternalStore<string | null | undefined>(subscribe, read, () => undefined);
  if (email === undefined) return { status: "loading", email: null };
  if (email === null) return { status: "signed-out", email: null };
  return { status: "signed-in", email };
}
