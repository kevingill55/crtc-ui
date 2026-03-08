import { ReservationType } from "./types";

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

export function getReservationColors(type?: ReservationType | string): ReservationColors {
  switch (type) {
    case ReservationType.LEAGUE:
      return {
        badge: { label: "League", cls: "bg-green-100 text-green-700" },
        cell: { bg: "bg-green-50", border: "border-green-400", hover: "hover:bg-green-100" },
        dot: "bg-green-400",
        accent: "bg-green-300",
      };
    case ReservationType.CLUB:
      return {
        badge: { label: "Club", cls: "bg-stone-100 text-stone-500" },
        cell: { bg: "bg-stone-50", border: "border-stone-400", hover: "hover:bg-stone-100" },
        dot: "bg-stone-400",
        accent: "bg-stone-400",
      };
    default: // REGULAR
      return {
        badge: { label: "Play on your own", cls: "bg-blue-100 text-blue-700" },
        cell: { bg: "bg-blue-50", border: "border-blue-400", hover: "hover:bg-blue-100" },
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
  return first.includes(q) || last.includes(q) || `${first} ${last}`.includes(q);
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
