import type { CategoryBackend } from "./backend";
import { localCategoryBackend } from "./local";

// The one line to change when Firestore replaces localStorage.
export const categoryBackend: CategoryBackend = localCategoryBackend;
