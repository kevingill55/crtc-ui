export const normalizeString = (str: string) => {
  const trimmedString = str.trim().toLowerCase();
  return trimmedString.charAt(0).toUpperCase() + trimmedString.slice(1);
};

export const getMember = async (memberId: string) => {
  const response = await fetch(`/api/members/${memberId}`, {
    method: "GET",
  });
  return await response.json();
};
