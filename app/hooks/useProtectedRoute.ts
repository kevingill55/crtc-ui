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

export function useProtectedRoute({ isAdmin = false }: { isAdmin?: boolean } = {}) {
  const router = useRouter();
  const { addNotification } = useNotificationsContext();

  const {
    data: sessionData,
    isError: isSessionError,
    isLoading: isSessionLoading,
  } = useQuery<{ error: AuthError | null; data: { session: Session | null } }>({
    queryKey: ["getSession"],
    queryFn: () => supabase.auth.getSession(),
    staleTime: 5 * 60 * 1000,
  });

  const session = sessionData?.data?.session ?? null;
  const memberId = session?.user.id ?? "";

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery<{ success: boolean; data: { member: Member } }>({
    queryKey: ["getMember", memberId],
    queryFn: async () => {
      return getMember(memberId);
    },
    enabled: !!session,
    retry: false,
  });

  useEffect(() => {
    // Session loaded but no active session — send to login
    if (!isSessionLoading && sessionData && !session) {
      router.push("/login");
      return;
    }

    if (isSessionError) {
      router.push("/login");
      return;
    }

    // getMember returned failure (e.g. token rejected by the backend)
    if (userData && !userData.success) {
      addNotification({
        status: NotificationStatus.WARNING,
        title: "Your session has timed out — please log in again to continue",
        id: "session-timeout",
        expiresIn: 6000,
      });
      router.push("/login");
      return;
    }

    // Role guard for admin-only pages
    if (isAdmin && userData?.success) {
      if (userData.data.member.role !== MemberRole.ADMIN) {
        router.back();
      }
    }
  }, [
    router,
    addNotification,
    isAdmin,
    userData,
    session,
    isSessionLoading,
    sessionData,
    isSessionError,
  ]);

  return {
    user: userData?.data?.member,
    isActive: userData?.data?.member?.status === MemberStatus.ACTIVE || false,
    isAdmin: userData?.data?.member?.role === MemberRole.ADMIN || false,
    error: isUserError || isSessionError,
    loading: isUserLoading || isSessionLoading,
  };
}
