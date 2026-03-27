"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ProtectedPage from "@/app/components/ProtectedPage";
import { useProtectedRoute } from "@/app/hooks/useProtectedRoute";
import { apiFetch } from "@/app/clients/api";
import {
  NotificationStatus,
  useNotificationsContext,
} from "@/app/providers/Notifications";
import { useState } from "react";
import { League, LeagueEnrollment, LeagueSeason } from "@/app/types";

type RosterResponse = {
  success: boolean;
  season: LeagueSeason;
  data: LeagueEnrollment[];
};

const SEASON_STATUS: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "Draft", cls: "bg-gray-100 text-gray-500" },
  ENROLLMENT_OPEN: { label: "Enrollment Open", cls: "bg-green-100 text-green-700" },
  ACTIVE: { label: "Enrollment Open", cls: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Completed", cls: "bg-gray-100 text-gray-500" },
};

function Th({ title }: { title: string }) {
  return (
    <th className="p-2 text-sm font-medium text-center text-nowrap">{title}</th>
  );
}

export default function Leagues() {
  const { user } = useProtectedRoute({ isAdmin: false });
  const { addNotification } = useNotificationsContext();
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ── All leagues (includes current_season + my_enrollment) ────────────────
  const { data: leaguesData, isLoading: leaguesLoading } = useQuery<{
    success: boolean;
    data: League[];
  }>({
    queryKey: ["getLeagues"],
    queryFn: async () => {
      const res = await apiFetch("/api/leagues", { method: "GET" });
      return res.json();
    },
  });

  const leagues = leaguesData?.data ?? [];
  const selected = leagues.find((l) => l.id === selectedId) ?? null;

  // ── Enrollments for expanded league ──────────────────────────────────────
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery<RosterResponse>({
    queryKey: ["leagueEnrollments", selectedId],
    queryFn: async () => {
      const res = await apiFetch(`/api/leagues/${selectedId}/enrollments`, { method: "GET" });
      return res.json();
    },
    enabled: !!selectedId,
  });

  const enrollments = enrollmentsData?.data ?? [];
  const detailLoading = enrollmentsLoading;

  // ── Mutations ─────────────────────────────────────────────────────────────
  const invalidate = (leagueId: string) => {
    queryClient.invalidateQueries({ queryKey: ["getLeagues"] });
    queryClient.invalidateQueries({ queryKey: ["leagueEnrollments", leagueId] });
  };

  const { mutate: enroll, isPending: enrollPending } = useMutation({
    mutationFn: async (leagueId: string) => {
      const res = await apiFetch(`/api/leagues/${leagueId}/enroll`, { method: "POST" });
      return res.json();
    },
    onSuccess: (data, leagueId) => {
      if (data.success) {
        invalidate(leagueId);
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "league-enroll",
          expiresIn: 5000,
          title: data.data?.status === "WAITLISTED" ? "Added to waitlist" : "Enrolled successfully",
        });
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "league-enroll",
          expiresIn: 5000,
          title: data.message ?? "Could not enroll",
        });
      }
    },
  });

  const { mutate: withdraw, isPending: withdrawPending } = useMutation({
    mutationFn: async (leagueId: string) => {
      const res = await apiFetch(`/api/leagues/${leagueId}/enroll`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: (data, leagueId) => {
      if (data.success) {
        invalidate(leagueId);
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "league-withdraw",
          expiresIn: 5000,
          title: "Withdrawn from league",
        });
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "league-withdraw",
          expiresIn: 5000,
          title: data.message ?? "Could not withdraw",
        });
      }
    },
  });

  const isMutating = enrollPending || withdrawPending;

  return (
    <ProtectedPage
      title="Leagues"
      subtitle="View rosters and manage your enrollment"
    >
      <div className="w-full pt-2 flex flex-col gap-8 pb-12">
        {leaguesLoading ? (
          <p className="text-sm text-gray-500">Loading leagues...</p>
        ) : leagues.length === 0 ? (
          <p className="text-sm text-gray-500">No leagues available.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {leagues.map((league) => {
              const season = league.current_season;
              const myStatus = league.my_enrollment;
              const canEnroll = !!season && myStatus === null;
              const isSelected = league.id === selectedId;

              return (
                <div
                  key={league.id}
                  className={`bg-white rounded-xl border transition-colors ${
                    isSelected ? "border-primary" : "border-gray-200"
                  }`}
                >
                  {/* Card header */}
                  <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                    {/* Left: league info */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800">{league.name}</p>
                        {season && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              SEASON_STATUS[season.status]?.cls
                            }`}
                          >
                            {SEASON_STATUS[season.status]?.label}
                          </span>
                        )}
                        {myStatus === "ACTIVE" && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                            Enrolled
                          </span>
                        )}
                        {myStatus === "WAITLISTED" && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                            Waitlisted
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {league.coordinator && (
                          <span>
                            League coordinator: {league.coordinator.first_name} {league.coordinator.last_name}
                          </span>
                        )}
                        {season && (
                          <span>{season.enrolled_count ?? 0} enrolled</span>
                        )}
                        {!season && (
                          <span className="italic">No active season</span>
                        )}
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2">
                      {myStatus !== null && (
                        <button
                          onClick={() => withdraw(league.id)}
                          disabled={isMutating}
                          className="text-sm px-4 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                        >
                          {myStatus === "WAITLISTED" ? "Leave waitlist" : "Withdraw"}
                        </button>
                      )}
                      {canEnroll && (
                        <button
                          onClick={() => enroll(league.id)}
                          disabled={isMutating}
                          className="text-sm px-5 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/80 disabled:opacity-40 cursor-pointer"
                        >
                          Enroll
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setSelectedId(isSelected ? null : league.id)
                        }
                        className="text-sm px-4 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer"
                      >
                        {isSelected ? "Hide roster" : "View roster"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded enrollments */}
                  {isSelected && (
                    <div className="border-t border-gray-100 px-5 py-4">
                      {detailLoading ? (
                        <p className="text-sm text-gray-400">Loading...</p>
                      ) : enrollments.length === 0 ? (
                        <p className="text-sm text-gray-400">No one enrolled yet.</p>
                      ) : (
                        <table className="w-full">
                          <thead className="bg-primary text-white">
                            <tr>
                              <Th title="#" />
                              <Th title="Name" />
                              <Th title="Email" />
                              <Th title="Enrolled" />
                            </tr>
                          </thead>
                          <tbody className="border border-gray-200">
                            {enrollments.map((e, i) => (
                              <tr
                                key={e.id}
                                className={`${
                                  e.member_id === user?.id
                                    ? "bg-primary/5"
                                    : i % 2 === 0
                                    ? "bg-white"
                                    : "bg-gray-50"
                                }`}
                              >
                                <td className="text-sm text-center p-3 text-gray-400">
                                  {i + 1}
                                </td>
                                <td className="text-sm text-center p-3 text-nowrap font-medium">
                                  {e.members?.first_name} {e.members?.last_name}
                                  {e.member_id === user?.id && (
                                    <span className="ml-2 text-xs text-primary font-normal">
                                      (you)
                                    </span>
                                  )}
                                </td>
                                <td className="text-sm text-center p-3 text-gray-500">
                                  {e.members?.email}
                                </td>
                                <td className="text-sm text-center p-3 text-gray-400">
                                  {new Date(e.enrolled_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    timeZone: "America/New_York",
                                  })}{" "}
                                  {new Date(e.enrolled_at).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    timeZone: "America/New_York",
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
