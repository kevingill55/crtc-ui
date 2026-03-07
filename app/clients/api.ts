import { supabase } from "./supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function buildHeaders(
  token: string | null,
  extra?: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return { ...headers, ...extra };
}

function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: buildHeaders(token, options.headers as Record<string, string>),
  });

  if (res.status === 401) {
    const { data: refreshData, error: refreshError } =
      await supabase.auth.refreshSession();

    if (refreshError || !refreshData.session) {
      redirectToLogin();
      return res;
    }

    // Retry once with the refreshed token
    return fetch(`${API_URL}${path}`, {
      ...options,
      headers: buildHeaders(
        refreshData.session.access_token,
        options.headers as Record<string, string>
      ),
    });
  }

  return res;
}
