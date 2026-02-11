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

/**
 * Checks if a coordinator can edit an event based on its status.
 * Logic:
 * - Editable if returned to coordinator.
 * - Editable if pending HOD or resubmitted (within HOD level).
 * - Editable if pending Dean AND it was a direct submission (hod_approval_at is null).
 */
export function canCoordinatorEdit(event: any): boolean {
  if (!event) return false;
  
  const { status, hod_approval_at } = event;
  
  if (status === 'draft') return true;
  if (status === 'returned_to_coordinator') return true;
  if (status === 'pending_hod' || status === 'resubmitted') return true;
  if (status === 'pending_dean' && !hod_approval_at) return true;
  
  return false;
}
