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

const MAX_PLAYERS = 20;

function StatusBadge({ status }: { status: "ACTIVE" | "WAITLISTED" | null }) {
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
                  <span className="text-gray-400 w-5 text-center text-xs">
                    {i + 1}
                  </span>
                  <span className="font-medium text-gray-800">
                    {e.members?.first_name} {e.members?.last_name}
                    {isMe && (
                      <span className="ml-2 text-xs text-primary font-normal">
                        (you)
                      </span>
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
                  <span className="text-gray-400 w-5 text-center text-xs">
                    {i + 1}
                  </span>
                  <span className="font-medium text-gray-800">
                    {e.members?.first_name} {e.members?.last_name}
                    {isMe && (
                      <span className="ml-2 text-xs text-amber-600 font-normal">
                        (you)
                      </span>
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

function PastSession({
  session,
  currentUserId,
}: {
  session: SessionWithCounts;
  currentUserId: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const startDate = session.start_date
    ? new Date(session.start_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "America/New_York",
      })
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50 rounded-xl transition-colors"
      >
        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-gray-800">{session.name}</p>
          {startDate && <p className="text-xs text-gray-400">{startDate}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-gray-500">
            {session.enrolled_count} players
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500`}
          >
            Completed
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <PlayerList sessionId={session.id} currentUserId={currentUserId} />
        </div>
      )}
    </div>
  );
}

export default function Friday() {
  const { user } = useProtectedRoute({ isAdmin: false });
  const { addNotification } = useNotificationsContext();
  const queryClient = useQueryClient();

  // ── Find the FNT league ──────────────────────────────────────────────────
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

  // ── All sessions for FNT league ─────────────────────────────────────────
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
  const openSession = sessions.find(
    (s) => s.status === "ENROLLMENT_OPEN" || s.status === "ACTIVE"
  );
  const pastSessions = sessions
    .filter((s) => s.status === "COMPLETED")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  // ── Mutations ─────────────────────────────────────────────────────────────
  const invalidate = () => {
    if (!fntLeague) return;
    queryClient.invalidateQueries({ queryKey: ["getLeagues"] });
    queryClient.invalidateQueries({ queryKey: ["fntSessions", fntLeague.id] });
    if (openSession) {
      queryClient.invalidateQueries({
        queryKey: ["sessionEnrollments", openSession.id],
      });
    }
  };

  const { mutate: enroll, isPending: enrollPending } = useMutation({
    mutationFn: async (leagueId: string) => {
      const res = await apiFetch(`/api/leagues/${leagueId}/enroll`, {
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
    mutationFn: async (leagueId: string) => {
      const res = await apiFetch(`/api/leagues/${leagueId}/enroll`, {
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

  // ── LC management ────────────────────────────────────────────────────────
  const isLC =
    user?.role === MemberRole.LEAGUE_COORDINATOR &&
    !!fntLeague &&
    fntLeague.coordinator_id === user?.id;

  const [showOpenModal, setShowOpenModal] = useState(false);
  const [sessionName, setSessionName] = useState("");

  const { mutate: openNewSession, isPending: openPending } = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiFetch(`/api/leagues/${fntLeague!.id}/seasons`, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setShowOpenModal(false);
        setSessionName("");
        invalidate();
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "fnt-open",
          expiresIn: 5000,
          title: "Session opened — signups are live",
        });
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "fnt-open",
          expiresIn: 5000,
          title: data.message ?? "Could not open session",
        });
      }
    },
  });

  const { mutate: closeSession, isPending: closePending } = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiFetch(`/api/seasons/${sessionId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        invalidate();
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "fnt-close",
          expiresIn: 5000,
          title: "Session closed",
        });
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "fnt-close",
          expiresIn: 5000,
          title: data.message ?? "Could not close session",
        });
      }
    },
  });

  const isMutating = enrollPending || withdrawPending || openPending || closePending;
  const isLoading = leaguesLoading || sessionsLoading;

  // ── Derived state ────────────────────────────────────────────────────────
  const myStatus = openSession?.my_enrollment ?? null;
  const spotsLeft = openSession
    ? Math.max(0, MAX_PLAYERS - (openSession.enrolled_count ?? 0))
    : 0;
  const waitlistPos = openSession?.waitlisted_count ?? 0;

  const sessionDate = openSession?.start_date
    ? new Date(openSession.start_date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: "America/New_York",
      })
    : null;

  return (
    <ProtectedPage
      title="Friday Night Tennis"
      subtitle="Weekly social round-robin open to all members"
    >
      <div className="w-full pt-2 flex flex-col gap-8 pb-12">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !fntLeague ? (
          <p className="text-sm text-gray-500">
            Friday Night Tennis league not found.
          </p>
        ) : (
          <>
            {/* ── Current open session ─────────────────────────────────── */}
            {openSession ? (
              <div className="bg-white rounded-xl border border-primary/30 shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800 text-lg">
                          {openSession.name}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                          Signup Open
                        </span>
                        {myStatus && <StatusBadge status={myStatus} />}
                      </div>
                      {sessionDate && (
                        <p className="text-sm text-gray-500">{sessionDate}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <p className="text-sm font-medium text-gray-700">
                        {openSession.enrolled_count ?? 0} / {MAX_PLAYERS}{" "}
                        <span className="text-gray-400 font-normal">spots filled</span>
                      </p>
                      {spotsLeft > 0 ? (
                        <p className="text-xs text-green-600">
                          {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} remaining
                        </p>
                      ) : (
                        <p className="text-xs text-amber-600">
                          Full — {waitlistPos} on waitlist
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Spots bar */}
                  <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          ((openSession.enrolled_count ?? 0) / MAX_PLAYERS) * 100
                        )}%`,
                      }}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex gap-2">
                      {myStatus === null && (
                        <button
                          onClick={() => enroll(fntLeague.id)}
                          disabled={isMutating}
                          className="px-5 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/80 disabled:opacity-40 cursor-pointer"
                        >
                          {spotsLeft === 0 ? "Join Waitlist" : "Sign Up"}
                        </button>
                      )}
                      {myStatus !== null && (
                        <button
                          onClick={() => withdraw(fntLeague.id)}
                          disabled={isMutating}
                          className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                        >
                          {myStatus === "WAITLISTED" ? "Leave Waitlist" : "Withdraw"}
                        </button>
                      )}
                    </div>
                    {isLC && (
                      <button
                        onClick={() => closeSession(openSession.id)}
                        disabled={isMutating}
                        className="px-4 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 cursor-pointer"
                      >
                        {closePending ? "Closing..." : "Close session"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Player list */}
                <div className="px-6 py-5">
                  <PlayerList
                    sessionId={openSession.id}
                    currentUserId={user?.id ?? ""}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 px-6 py-10 flex flex-col items-center gap-4 text-center">
                <div>
                  <p className="text-gray-500 font-medium">No session open yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Check back Monday — signups typically open at the start of the week.
                  </p>
                </div>
                {isLC && !showOpenModal && (
                  <button
                    onClick={() => {
                      const friday = new Date();
                      const day = friday.getDay();
                      friday.setDate(friday.getDate() + ((5 - day + 7) % 7 || 7));
                      const label = friday.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        timeZone: "America/New_York",
                      });
                      setSessionName(`Week of ${label}`);
                      setShowOpenModal(true);
                    }}
                    className="px-5 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/80 cursor-pointer"
                  >
                    Open new session
                  </button>
                )}
                {isLC && showOpenModal && (
                  <div className="w-full max-w-sm flex flex-col gap-3 text-left">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-600">Session name</label>
                      <input
                        autoFocus
                        type="text"
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-1 focus:outline-primary"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => sessionName.trim() && openNewSession(sessionName.trim())}
                        disabled={!sessionName.trim() || isMutating}
                        className="px-5 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/80 disabled:opacity-40 cursor-pointer"
                      >
                        {openPending ? "Opening..." : "Open session"}
                      </button>
                      <button
                        onClick={() => setShowOpenModal(false)}
                        className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Past sessions ─────────────────────────────────────────── */}
            {pastSessions.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Past sessions
                </p>
                {pastSessions.map((s) => (
                  <PastSession
                    key={s.id}
                    session={s}
                    currentUserId={user?.id ?? ""}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedPage>
  );
}
