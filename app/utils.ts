export const normalizeString = (str: string) => {
  const trimmedString = str.trim().toLowerCase();
  return trimmedString.charAt(0).toUpperCase() + trimmedString.slice(1);
};
