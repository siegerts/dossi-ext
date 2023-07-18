import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function limitReached(counts: any, limits: any, key: string) {
  return counts?.[key] && limits?.[key] && counts?.[key] >= limits?.[key]
}
