"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../clients/supabase";
import { AuthSession, Profile } from "../types";

export function useProtectedRoute() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<null | Profile>(null);
  const router = useRouter();
  useEffect(() => {
    (async () => {
      try {
        const { data }: { data: { session: AuthSession } } =
          await supabase.auth.getSession();
        if (!data.session) {
          router.push("/login");
        } else {
          setLoading(true);

          const getUserFetch = await fetch("/api/user", {
            method: "POST",
            body: JSON.stringify({
              userId: data.session.user.id,
            }),
          });

          const {
            data: { user },
          } = await getUserFetch.json();

          setLoading(false);
          setUser(user);
        }
      } catch (error) {
        console.error("Problem with protected route", error);
      }
    })();
  }, [router]);

  return { user, loading };
}
