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
  ENROLLMENT_OPEN: {
    label: "Enrollment Open",
    cls: "bg-green-100 text-green-700",
  },
  ACTIVE: { label: "In Progress", cls: "bg-blue-100 text-blue-700" },
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

  // ── All leagues ──────────────────────────────────────────────────────────
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
  const selected = leagues.find((l) => l.id === selectedId);

  // ── Roster + waitlist for selected league ─────────────────────────────────
  const { data: rosterData, isLoading: rosterLoading } =
    useQuery<RosterResponse>({
      queryKey: ["leagueRoster", selectedId],
      queryFn: async () => {
        const res = await apiFetch(`/api/leagues/${selectedId}/roster`, {
          method: "GET",
        });
        return res.json();
      },
      enabled: !!selectedId,
    });

  const { data: waitlistData, isLoading: waitlistLoading } =
    useQuery<RosterResponse>({
      queryKey: ["leagueWaitlist", selectedId],
      queryFn: async () => {
        const res = await apiFetch(`/api/leagues/${selectedId}/waitlist`, {
          method: "GET",
        });
        return res.json();
      },
      enabled: !!selectedId,
    });

  const roster = rosterData?.data ?? [];
  const waitlist = waitlistData?.data ?? [];
  const season = rosterData?.season ?? waitlistData?.season ?? null;
  const detailLoading = rosterLoading || waitlistLoading;

  // ── Current member's enrollment status ───────────────────────────────────
  const myRosterEntry = roster.find((e) => e.member_id === user?.id);
  const myWaitlistIndex = waitlist.findIndex((e) => e.member_id === user?.id);
  const myStatus = myRosterEntry
    ? "ACTIVE"
    : myWaitlistIndex !== -1
    ? "WAITLISTED"
    : null;

  // ── Mutations ─────────────────────────────────────────────────────────────
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["leagueRoster", selectedId] });
    queryClient.invalidateQueries({
      queryKey: ["leagueWaitlist", selectedId],
    });
  };

  const { mutate: enroll, isPending: enrollPending } = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/leagues/${selectedId}/enroll`, {
        method: "POST",
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        invalidate();
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "temp",
          expiresIn: 5000,
          title: data.message ?? "Enrolled",
        });
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "temp",
          expiresIn: 5000,
          title: data.message ?? "Could not enroll",
        });
      }
    },
  });

  const { mutate: withdraw, isPending: withdrawPending } = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/leagues/${selectedId}/enroll`, {
        method: "DELETE",
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        invalidate();
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "temp",
          expiresIn: 5000,
          title: "Withdrawn from league",
        });
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "temp",
          expiresIn: 5000,
          title: data.message ?? "Could not withdraw",
        });
      }
    },
  });

  const isMutating = enrollPending || withdrawPending;
  const isFull =
    season?.max_players != null && roster.length >= season.max_players;

  return (
    <ProtectedPage
      title="Leagues"
      subtitle="CRTC leagues; view rosters and manage your enrollment"
    >
      <div className="w-full pt-2 flex flex-col gap-6 pb-10">
        {/* League selector cards */}
        {leaguesLoading ? (
          <p className="text-sm text-gray-500">Loading leagues...</p>
        ) : (
          <div className="flex gap-3 flex-wrap">
            {leagues.map((league) => {
              const isSelected = league.id === selectedId;
              return (
                <button
                  key={league.id}
                  onClick={() => setSelectedId(isSelected ? null : league.id)}
                  className={`text-left rounded-xl border px-5 py-4 min-w-[155px] transition-colors hover:cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-gray-200 bg-white hover:border-gray-400"
                  }`}
                >
                  <p
                    className={`font-semibold text-sm ${
                      isSelected ? "text-white" : "text-primary"
                    }`}
                  >
                    {league.name}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isSelected ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {league.coordinator
                      ? `${league.coordinator.first_name} ${league.coordinator.last_name}`
                      : "No coordinator"}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Detail panel */}
        {selectedId && (
          <div className="flex flex-col gap-5">
            {/* Season header card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {detailLoading ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : !season ? (
                <p className="text-sm text-gray-500">
                  No current season for{" "}
                  <span className="font-medium">{selected?.name}</span>.
                </p>
              ) : (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {/* Season info */}
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-primary">{season.name}</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          SEASON_STATUS[season.status]?.cls
                        }`}
                      >
                        {SEASON_STATUS[season.status]?.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {roster.length}
                        {season.max_players != null
                          ? `/${season.max_players}`
                          : ""}{" "}
                        players enrolled
                        {waitlist.length > 0 &&
                          ` · ${waitlist.length} on waitlist`}
                      </span>
                    </div>
                  </div>

                  {/* Enrollment action */}
                  <div className="flex items-center gap-3">
                    {myStatus === "ACTIVE" && (
                      <>
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                          Enrolled
                        </span>
                        <button
                          onClick={() => withdraw()}
                          disabled={isMutating}
                          className="text-sm px-4 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 hover:cursor-pointer"
                        >
                          Withdraw
                        </button>
                      </>
                    )}
                    {myStatus === "WAITLISTED" && (
                      <>
                        <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                          Waitlisted #{myWaitlistIndex + 1}
                        </span>
                        <button
                          onClick={() => withdraw()}
                          disabled={isMutating}
                          className="text-sm px-4 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 hover:cursor-pointer"
                        >
                          Leave waitlist
                        </button>
                      </>
                    )}
                    {myStatus === null &&
                      season.status === "ENROLLMENT_OPEN" && (
                        <button
                          onClick={() => enroll()}
                          disabled={isMutating}
                          className="text-sm px-5 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/80 disabled:opacity-40 hover:cursor-pointer"
                        >
                          {isMutating
                            ? "..."
                            : isFull
                            ? "Join waitlist"
                            : "Enroll"}
                        </button>
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* Roster */}
            {!detailLoading && roster.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Roster
                </p>
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
                    {roster.map((e, i) => (
                      <tr
                        key={e.id}
                        className={`${
                          i % 2 === 0 ? "bg-white" : "bg-blue-50"
                        } hover:bg-gray-200`}
                      >
                        <td className="text-sm text-center p-3 text-gray-400">
                          {i + 1}
                        </td>
                        <td className="text-sm text-center p-3 text-nowrap">
                          {e.members?.first_name} {e.members?.last_name}
                        </td>
                        <td className="text-sm text-center p-3">
                          {e.members?.email}
                        </td>
                        <td className="text-sm text-center p-3 text-gray-500">
                          {new Date(e.enrolled_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Waitlist */}
            {!detailLoading && waitlist.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Waitlist
                </p>
                <table className="w-full mb-4">
                  <thead className="bg-primary text-white">
                    <tr>
                      <Th title="Position" />
                      <Th title="Name" />
                      <Th title="Joined" />
                    </tr>
                  </thead>
                  <tbody className="border border-gray-200">
                    {waitlist.map((e, i) => (
                      <tr
                        key={e.id}
                        className={`${
                          i % 2 === 0 ? "bg-white" : "bg-blue-50"
                        } hover:bg-gray-200`}
                      >
                        <td className="text-sm text-center p-3 text-gray-400">
                          {i + 1}
                        </td>
                        <td className="text-sm text-center p-3 text-nowrap">
                          {e.members?.first_name} {e.members?.last_name}
                        </td>
                        <td className="text-sm text-center p-3 text-gray-500">
                          {new Date(e.enrolled_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
