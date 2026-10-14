import type { PastaBackend } from "./backend";
import { localBackend } from "./local";

// The one line to change when Firestore replaces localStorage.
export const pastaBackend: PastaBackend = localBackend;
