import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Safe ID generator that works in older browsers without crypto.randomUUID
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: random string + timestamp to reduce collision risk
  return `id-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}
