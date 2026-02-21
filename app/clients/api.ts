import { supabase } from "./supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const authHeaders = await getAuthHeaders();
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers as Record<string, string>),
    },
  });
}
