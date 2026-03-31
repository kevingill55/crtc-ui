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
import { League, LeagueEnrollment, LeagueSeason, MemberRole } from "@/app/types";

type SessionWithCounts = LeagueSeason & {
  enrolled_count: number;
  waitlisted_count: number;
  my_enrollment: "ACTIVE" | "WAITLISTED" | null;
};

type SessionEnrollmentsResponse = {
  success: boolean;
  data: LeagueEnrollment[];
};


function EnrollmentStatusBadge({ status }: { status: "ACTIVE" | "WAITLISTED" | null }) {
  if (status === "ACTIVE")
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
        Enrolled
      </span>
    );
  if (status === "WAITLISTED")
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
        Waitlisted
      </span>
    );
  return null;
}

function PlayerList({
  sessionId,
  currentUserId,
}: {
  sessionId: string;
  currentUserId: string;
}) {
  const { data, isLoading } = useQuery<SessionEnrollmentsResponse>({
    queryKey: ["sessionEnrollments", sessionId],
    queryFn: async () => {
      const res = await apiFetch(`/api/sessions/${sessionId}/enrollments`, {
        method: "GET",
      });
      return res.json();
    },
  });

  if (isLoading)
    return <p className="text-sm text-gray-400 mt-3">Loading players...</p>;

  const enrollments = data?.data ?? [];
  const active = enrollments.filter((e) => e.status === "ACTIVE");
  const waitlisted = enrollments.filter((e) => e.status === "WAITLISTED");

  return (
    <div className="mt-4 flex flex-col gap-4">
      {active.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Players ({active.length})
          </p>
          <div className="flex flex-col gap-1">
            {active.map((e, i) => {
              const isMe = e.member_id === currentUserId;
              return (
                <div
                  key={e.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    isMe ? "bg-primary/5" : i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <span className="text-gray-400 w-5 text-center text-xs">{i + 1}</span>
                  <span className="font-medium text-gray-800">
                    {e.members?.first_name} {e.members?.last_name}
                    {isMe && (
                      <span className="ml-2 text-xs text-primary font-normal">(you)</span>
                    )}
                  </span>
                  <span className="text-gray-400 ml-auto">
                    {new Date(e.enrolled_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      timeZone: "America/New_York",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {waitlisted.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Waitlist ({waitlisted.length})
          </p>
          <div className="flex flex-col gap-1">
            {waitlisted.map((e, i) => {
              const isMe = e.member_id === currentUserId;
              return (
                <div
                  key={e.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    isMe ? "bg-amber-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <span className="text-gray-400 w-5 text-center text-xs">{i + 1}</span>
                  <span className="font-medium text-gray-800">
                    {e.members?.first_name} {e.members?.last_name}
                    {isMe && (
                      <span className="ml-2 text-xs text-amber-600 font-normal">(you)</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {active.length === 0 && waitlisted.length === 0 && (
        <p className="text-sm text-gray-400">No one signed up yet.</p>
      )}
    </div>
  );
}

export default function Friday() {
  const { user } = useProtectedRoute({ isAdmin: false });
  const { addNotification } = useNotificationsContext();
  const queryClient = useQueryClient();

  const [view, setView] = useState<"member" | "coordinator">("member");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Leagues ──────────────────────────────────────────────────────────────
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

  const fntLeague = (leaguesData?.data ?? []).find((l) =>
    l.name.toLowerCase().includes("friday")
  );

  // ── Sessions ─────────────────────────────────────────────────────────────
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery<{
    success: boolean;
    data: SessionWithCounts[];
  }>({
    queryKey: ["fntSessions", fntLeague?.id],
    queryFn: async () => {
      const res = await apiFetch(`/api/leagues/${fntLeague!.id}/sessions`, {
        method: "GET",
      });
      return res.json();
    },
    enabled: !!fntLeague,
  });

  const sessions = sessionsData?.data ?? [];
  const activeSession = sessions.find(
    (s) => s.status === "ACTIVE" || s.status === "ENROLLMENT_OPEN"
  );

  // ── LC check ─────────────────────────────────────────────────────────────
  const isLC =
    !!fntLeague &&
    fntLeague.coordinator_id === user?.id &&
    (user?.role === MemberRole.LEAGUE_COORDINATOR || user?.role === MemberRole.ADMIN);

  // ── Invalidation helper ───────────────────────────────────────────────────
  const invalidate = () => {
    if (!fntLeague) return;
    queryClient.invalidateQueries({ queryKey: ["getLeagues"] });
    queryClient.invalidateQueries({ queryKey: ["fntSessions", fntLeague.id] });
    if (activeSession) {
      queryClient.invalidateQueries({
        queryKey: ["sessionEnrollments", activeSession.id],
      });
    }
  };

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { mutate: enroll, isPending: enrollPending } = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/leagues/${fntLeague!.id}/enroll`, {
        method: "POST",
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        invalidate();
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "fnt-enroll",
          expiresIn: 5000,
          title: "Signed up for Friday night tennis",
        });
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "fnt-enroll",
          expiresIn: 5000,
          title: data.message ?? "Could not sign up",
        });
      }
    },
  });

  const { mutate: withdraw, isPending: withdrawPending } = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/leagues/${fntLeague!.id}/enroll`, {
        method: "DELETE",
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        invalidate();
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "fnt-withdraw",
          expiresIn: 5000,
          title: "Removed from Friday night tennis",
        });
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "fnt-withdraw",
          expiresIn: 5000,
          title: data.message ?? "Could not withdraw",
        });
      }
    },
  });

  const { mutate: createSession, isPending: createPending } = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiFetch(`/api/leagues/${fntLeague!.id}/seasons`, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setShowCreateForm(false);
        setSessionName("");
        invalidate();
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "fnt-create",
          expiresIn: 5000,
          title: "Session created",
        });
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "fnt-create",
          expiresIn: 5000,
          title: data.message ?? "Could not create session",
        });
      }
    },
  });

  const { mutate: setStatus, isPending: statusPending } = useMutation({
    mutationFn: async ({ sessionId, status }: { sessionId: string; status: "ACTIVE" | "INACTIVE" }) => {
      const res = await apiFetch(`/api/seasons/${sessionId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        invalidate();
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "fnt-status",
          expiresIn: 4000,
          title: variables.status === "ACTIVE" ? "Session activated — signups are open" : "Session deactivated",
        });
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "fnt-status",
          expiresIn: 5000,
          title: data.message ?? "Could not update session",
        });
      }
    },
  });

  const { mutate: deleteSession, isPending: deletePending } = useMutation({
    mutationFn: async (seasonId: string) => {
      const res = await apiFetch(`/api/seasons/${seasonId}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: (data) => {
      setConfirmDeleteId(null);
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["fntSessions", fntLeague?.id] });
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "fnt-delete",
          expiresIn: 5000,
          title: "Session deleted",
        });
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "fnt-delete",
          expiresIn: 5000,
          title: data.message ?? "Could not delete session",
        });
      }
    },
  });

  const isMutating = enrollPending || withdrawPending || createPending || statusPending || deletePending;
  const isLoading = leaguesLoading || sessionsLoading;

  const myStatus = activeSession?.my_enrollment ?? null;

  return (
    <ProtectedPage
      title="Friday Night Tennis"
      subtitle="Weekly social round-robin open to all members"
    >
      <div className="w-full pt-2 flex flex-col gap-6 pb-12">
        {/* Tab toggle (LC only) */}
        {isLC && (
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setView("member")}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors cursor-pointer ${
                view === "member"
                  ? "bg-white text-gray-800 font-medium shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Member
            </button>
            <button
              onClick={() => setView("coordinator")}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors cursor-pointer ${
                view === "coordinator"
                  ? "bg-white text-gray-800 font-medium shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Coordinator
            </button>
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !fntLeague ? (
          <p className="text-sm text-gray-500">Friday Night Tennis league not found.</p>
        ) : view === "coordinator" && isLC ? (
          /* ── Coordinator view ─────────────────────────────────────────── */
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {sessions.length} session{sessions.length !== 1 ? "s" : ""}
              </p>
              {!showCreateForm && !activeSession && (
                <button
                  onClick={() => {
                    const friday = new Date();
                    const day = friday.getDay();
                    friday.setDate(friday.getDate() + ((5 - day + 7) % 7 || 7));
                    setSessionName(
                      `Week of ${friday.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        timeZone: "America/New_York",
                      })}`
                    );
                    setShowCreateForm(true);
                  }}
                  className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/80 cursor-pointer"
                >
                  + New session
                </button>
              )}
            </div>

            {showCreateForm && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="font-medium text-gray-800 mb-4">New session</p>
                <div className="flex flex-col gap-3 max-w-sm">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Session name</label>
                    <input
                      autoFocus
                      type="text"
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && sessionName.trim()) {
                          createSession(sessionName.trim());
                        }
                      }}
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-1 focus:outline-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => sessionName.trim() && createSession(sessionName.trim())}
                      disabled={!sessionName.trim() || isMutating}
                      className="px-5 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/80 disabled:opacity-40 cursor-pointer"
                    >
                      {createPending ? "Creating..." : "Create"}
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {sessions.length === 0 ? (
              <p className="text-sm text-gray-400">No sessions yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {sessions.map((s) => {
                  const isActive = s.status === "ACTIVE" || s.status === "ENROLLMENT_OPEN";
                  const isConfirmingDelete = confirmDeleteId === s.id;
                  return (
                    <div
                      key={s.id}
                      className={`bg-white rounded-xl border px-5 py-4 ${
                        isActive ? "border-primary/30" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-800">{s.name}</p>
                            {isActive ? (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                                Active
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
                                Inactive
                              </span>
                            )}
                          </div>
                          {isActive && (
                            <p className="text-xs text-gray-400">
                              {s.enrolled_count} enrolled
                              {s.waitlisted_count > 0 ? ` · ${s.waitlisted_count} waitlisted` : ""}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isConfirmingDelete ? (
                            <>
                              <span className="text-xs text-gray-500">Delete session?</span>
                              <button
                                onClick={() => deleteSession(s.id)}
                                disabled={isMutating}
                                className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 cursor-pointer"
                              >
                                {deletePending ? "Deleting..." : "Yes, delete"}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  setStatus({ sessionId: s.id, status: isActive ? "INACTIVE" : "ACTIVE" })
                                }
                                disabled={isMutating}
                                className={`px-4 py-1.5 text-sm rounded-lg font-medium disabled:opacity-40 cursor-pointer transition-colors ${
                                  isActive
                                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    : "bg-primary text-white hover:bg-primary/80"
                                }`}
                              >
                                {statusPending ? "..." : isActive ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(s.id)}
                                disabled={isMutating}
                                className="px-4 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 disabled:opacity-40 cursor-pointer transition-colors"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ── Member view ──────────────────────────────────────────────── */
          activeSession ? (
            <div className="bg-white rounded-xl border border-primary/30 shadow-sm">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-800 text-lg">
                    {activeSession.name}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                    Signup Open
                  </span>
                  {myStatus && <EnrollmentStatusBadge status={myStatus} />}
                </div>
                {activeSession.start_date && (
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(activeSession.start_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      timeZone: "America/New_York",
                    })}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  {myStatus === null && (
                    <button
                      onClick={() => enroll()}
                      disabled={isMutating}
                      className="px-5 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/80 disabled:opacity-40 cursor-pointer"
                    >
                      Sign Up
                    </button>
                  )}
                  {myStatus !== null && (
                    <button
                      onClick={() => withdraw()}
                      disabled={isMutating}
                      className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>

              <div className="px-6 py-5">
                <PlayerList
                  sessionId={activeSession.id}
                  currentUserId={user?.id ?? ""}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 px-6 py-10 flex flex-col items-center gap-2 text-center">
              <p className="text-gray-500 font-medium">No session open yet</p>
              <p className="text-sm text-gray-400">
                Check back Monday — signups typically open at the start of the week.
              </p>
            </div>
          )
        )}
      </div>
    </ProtectedPage>
  );
}
