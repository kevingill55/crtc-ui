"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { Session, AuthError } from "@supabase/auth-js";
import { supabase } from "../clients/supabase";
import { Member, MemberRole, MemberStatus } from "../types";
import { getMember } from "../utils";
import {
  NotificationStatus,
  useNotificationsContext,
} from "../providers/Notifications";

export function useProtectedRoute({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const { addNotification } = useNotificationsContext();

  const {
    data: sessionData,
    isError: isSessionError,
    isLoading: isSessionLoading,
  } = useQuery<{ error: AuthError | null; data: { session: Session } }>({
    queryKey: ["getSession"],
    staleTime: 5 * 60 * 1000, // Don't refetch session constantly
    queryFn: () => supabase.auth.getSession(),
  });

  const memberId = sessionData?.data?.session.user.id || "";

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery<{ success: boolean; data: { member: Member } }>({
    queryKey: ["getMember", memberId],
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

    if (isAdmin) {
      if (userData && userData.data.member.role !== MemberRole.ADMIN) {
        router.back();
      }
    }
  }, [router, addNotification, isAdmin, userData]);

  return {
    user: userData?.data.member,
    isActive: userData?.data.member.status === MemberStatus.ACTIVE || false,
    isAdmin: userData?.data.member.role === MemberRole.ADMIN || false,
    error: isUserError || isSessionError,
    loading: isUserLoading || isSessionLoading,
  };
}
