"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { AuthChangeEvent } from "@supabase/auth-js";
import { supabase } from "../clients/supabase";

/**
 * Listens for unexpected Supabase auth state changes (e.g. refresh token
 * expiry, sign-out from another tab) and redirects to /login.
 *
 * Intentional logouts via /logout are excluded — that page handles its own
 * redirect so we don't double-fire.
 */
export function AuthListener() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "SIGNED_OUT") {
        const pathname =
          typeof window !== "undefined" ? window.location.pathname : "";
        // Let the /logout page handle its own redirect
        if (pathname.startsWith("/logout") || pathname.startsWith("/login")) {
          return;
        }
        queryClient.clear();
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, queryClient]);

  return null;
}
