import { ReservationType } from "./types";

// Courts 1–2 are lower courts (clay watering at slot 4), courts 3–4 are upper (watering at slot 5).
// After the 60-min watering slot, all subsequent slots shift 30 min earlier.
const LOWER_SLOT_LABELS = [
  "8:30 – 10:00 am",
  "10:00 – 11:30 am",
  "11:30 – 1:00 pm",
  "1:00 – 2:00 pm", // 60 min (watering)
  "2:00 – 3:30 pm",
  "3:30 – 5:00 pm",
  "5:00 – 6:30 pm",
  "6:30 – 8:00 pm",
  "8:00 – 9:30 pm",
];

const UPPER_SLOT_LABELS = [
  "8:30 – 10:00 am",
  "10:00 – 11:30 am",
  "11:30 – 1:00 pm",
  "1:00 – 2:30 pm",
  "2:30 – 3:30 pm", // 60 min (watering)
  "3:30 – 5:00 pm",
  "5:00 – 6:30 pm",
  "6:30 – 8:00 pm",
  "8:00 – 9:30 pm",
];

/** Returns the full "start – end" label for a given slot on a given court. */
export function getSlotLabel(slot: number, court: number): string {
  const labels = court <= 2 ? LOWER_SLOT_LABELS : UPPER_SLOT_LABELS;
  return labels[slot - 1] ?? "";
}

/**
 * Returns a representative "start – end" label for a slot suitable for overview
 * displays (e.g. WeekView) where no specific court is known.
 * For watering slots, shows the bookable court group's time instead.
 */
export function getSlotOverviewLabel(slot: number): string {
  if (slot === 4) return getSlotLabel(4, 3); // slot 4 lower = watering; show upper bookable time
  if (slot === 5) return getSlotLabel(5, 1); // slot 5 upper = watering; show lower bookable time
  return getSlotLabel(slot, 1); // same for both groups
}

/**
 * Returns true if the slot is reserved for court watering on the given court group.
 * Lower courts (1–2): slot 4 is watering. Upper courts (3–4): slot 5 is watering.
 * Watering slots are not bookable.
 */
export function isWateringSlot(slot: number, court: number): boolean {
  return (court <= 2 && slot === 4) || (court >= 3 && slot === 5);
}

export type ReservationColors = {
  // Pill badge in reservation list
  badge: { label: string; cls: string };
  // Card/cell background, left-border, hover (DayView)
  cell: { bg: string; border: string; hover: string };
  // Small dot in WeekView
  dot: string;
  // Vertical accent bar in reservation list
  accent: string;
};

export function getReservationColors(
  type?: ReservationType | string
): ReservationColors {
  switch (type) {
    case ReservationType.LEAGUE:
      return {
        badge: { label: "League", cls: "bg-green-100 text-green-700" },
        cell: {
          bg: "bg-green-50",
          border: "border-green-400",
          hover: "hover:bg-green-100",
        },
        dot: "bg-green-400",
        accent: "bg-green-300",
      };
    case ReservationType.CLUB:
      return {
        badge: { label: "Club", cls: "bg-stone-100 text-stone-500" },
        cell: {
          bg: "bg-stone-50",
          border: "border-stone-400",
          hover: "hover:bg-stone-100",
        },
        dot: "bg-stone-400",
        accent: "bg-stone-400",
      };
    default: // REGULAR
      return {
        badge: { label: "Play on your own", cls: "bg-blue-100 text-blue-700" },
        cell: {
          bg: "bg-blue-100",
          border: "border-blue-400",
          hover: "hover:bg-blue-200",
        },
        dot: "bg-blue-400",
        accent: "bg-blue-300",
      };
  }
}

// Returns YYYY-MM-DD for a Date in Eastern Time.
// Use this everywhere a date string is needed for API calls or display.
export const toEasternISO = (date: Date = new Date()): string =>
  date.toLocaleDateString("en-CA", { timeZone: "America/New_York" });

export const memberMatchesFilter = (
  member: { first_name: string; last_name: string },
  filter: string
): boolean => {
  const q = filter.trim().toLowerCase();
  if (!q) return true;
  const first = member.first_name.toLowerCase();
  const last = member.last_name.toLowerCase();
  return (
    first.includes(q) || last.includes(q) || `${first} ${last}`.includes(q)
  );
};

export const normalizeString = (str: string) => {
  const trimmedString = str.trim().toLowerCase();
  return trimmedString.charAt(0).toUpperCase() + trimmedString.slice(1);
};

export const getMember = async (memberId: string) => {
  const { apiFetch } = await import("./clients/api");
  const response = await apiFetch(`/api/members/${memberId}`, {
    method: "GET",
  });
  return await response.json();
};
