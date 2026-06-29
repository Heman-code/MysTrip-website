import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getSlotsLeft(max: number, booked: number) {
  return Math.max(0, max - booked);
}

export function getDifficultyColor(difficulty: string) {
  const map: Record<string, string> = {
    Easy: "bg-green-100 text-green-800",
    Moderate: "bg-yellow-100 text-yellow-800",
    Hard: "bg-orange-100 text-orange-800",
    Challenging: "bg-red-100 text-red-800",
  };
  return map[difficulty] ?? "bg-gray-100 text-gray-800";
}
