import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number, currencySymbol: string = "$"): string {
  return `${currencySymbol}${amount.toFixed(2)}`;
}

export function triggerHaptic(duration: number = 12): void {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Haptics not supported or permitted
    }
  }
}
