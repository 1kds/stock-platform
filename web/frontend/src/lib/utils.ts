import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 부호를 붙인 퍼센트 표기. 양수에만 "+"를 붙인다. 예: 1.2 → "+1.2%". */
export function signedPercent(n: number): string {
  return `${n > 0 ? "+" : ""}${n}%`
}
