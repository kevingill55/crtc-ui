"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { Session, AuthError } from "@supabase/auth-js";
import { supabase } from "../clients/supabase";
import { Member } from "../types";
import {
  NotificationStatus,
  useNotificationsContext,
} from "../providers/Notifications";

export const getMember = async (memberId: string) => {
  const response = await fetch(`/api/members/${memberId}`, {
    method: "GET",
  });
  return await response.json();
};

export function useProtectedRoute() {
  const router = useRouter();
  const { addNotification } = useNotificationsContext();

  const {
    data: sessionData,
    isError: isSessionError,
    isLoading: isSessionLoading,
  } = useQuery<{ error: AuthError | null; data: { session: Session } }>({
    queryKey: ["getSession"],
    queryFn: () => supabase.auth.getSession(),
  });

  const memberId = sessionData?.data?.session.user.id || "";

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery<{ success: boolean; data: { member: Member } }>({
    queryKey: ["getMember"],
    queryFn: async () => {
      return getMember(memberId);
    },
    enabled: !!sessionData?.data.session,
  });

  useEffect(() => {
    if (userData && !userData.success) {
      addNotification({
        status: NotificationStatus.WARNING,
        title: "Your session has timed out — please log in again to continue",
        id: "temp",
      });
      router.push("/login");
    }
  }, [router, addNotification, userData]);

  return {
    user: userData?.data.member,
    error: isUserError || isSessionError,
    loading: isUserLoading || isSessionLoading,
  };
}
