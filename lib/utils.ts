import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in Kenyan Shillings
export function formatKSh(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace('KES', 'KSh');
}

// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-KE').format(num);
}

