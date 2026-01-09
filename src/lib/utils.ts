import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Checks if an event is completed based on the current date.
 * Logic: current date > event end date (or start date if no end date).
 */
export function isEventFinished(event: any): boolean {
  if (!event || !event.event_date) return false;

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Zero out time for date comparison

  const eventDate = new Date(event.end_date || event.event_date);
  eventDate.setHours(0, 0, 0, 0);

  return now > eventDate;
}
