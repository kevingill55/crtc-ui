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
