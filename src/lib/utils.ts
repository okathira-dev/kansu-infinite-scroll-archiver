import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// テスト用の簡単な関数
export function add(a: number, b: number): number {
  return a + b;
}
