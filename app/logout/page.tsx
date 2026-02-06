"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../clients/supabase";

export default function Logout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("CRTC logout error", error);
        alert("There was a problem logging you out");
      } else {
        queryClient.clear();
        console.log("CRTC user signed out successfully");
        router.push("/");
      }
    })();
  }, [router, queryClient]);
  return <div></div>;
}
