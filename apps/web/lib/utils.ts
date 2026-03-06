import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function timeAgo(timestamp: number): string {
    if (!timestamp) return "";
    // Finnhub returns unix timestamp in seconds, date-fns expects milliseconds
    return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
}

export function truncate(str: string, length: number): string {
    if (!str) return "";
    if (str.length <= length) return str;
    return str.slice(0, length) + "...";
}
