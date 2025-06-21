import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const dev = process.env.NEXT_PUBLIC_DEV_URL || "http://localhost:5001";
const prod = process.env.NEXT_PUBLIC_SERVER_URL;

export const prefix = "NEHES_ISRAEL";
export const BACKEND_URL = process.env.NODE_ENV === 'development' ? dev : prod;
export const PAGE_SIZE = 20;
export const DEFAULT_PAGE = 1;
export const DEBOUND_DELAY = 700;
