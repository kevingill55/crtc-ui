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
import {
  League,
  LeagueEnrollment,
  LeagueSeason,
  Member,
  Reservation,
} from "@/app/types";
import { AssignmentsEditor, AssignmentsView } from "./AssignmentsPanel";
import { getSlotLabel } from "@/app/utils";

type SessionWithCounts = LeagueSeason & {
  enrolled_count: number;
  waitlisted_count: number;
  my_enrollment: "ACTIVE" | "WAITLISTED" | null;
};

type SessionEnrollmentsResponse = {
  success: boolean;
  data: LeagueEnrollment[];
};

// ── Shared sub-components ────────────────────────────────────────────────────

function EnrollmentStatusBadge({
  status,
}: {
  status: "ACTIVE" | "WAITLISTED" | null;
}) {
  if (status === "ACTIVE")
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
        Enrolled
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
      const res = await apiFetch(`/api/sessions/${sessionId}/enrollments`);
      return res.json();
    },
  });

  if (isLoading)
    return <p className="text-sm text-gray-400 mt-3">Loading players...</p>;

  const enrollments = data?.data ?? [];
  const active = enrollments.filter((e) => e.status === "ACTIVE");

  return (
    <div className="mt-4">
      {active.length > 0 ? (
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
                    isMe
                      ? "bg-primary/5"
                      : i % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50"
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
      ) : (
        <p className="text-sm text-gray-400">No one signed up yet.</p>
      )}
    </div>
  );
}

function ClosedSession({
  session,
  currentUserId,
}: {
  session: SessionWithCounts;
  currentUserId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isCancelled = session.status === "CANCELLED";

  return (
    <div
      className={`bg-white rounded-xl border ${
        isCancelled ? "border-gray-100" : "border-gray-200"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50 rounded-xl transition-colors"
      >
        <div className="flex items-center gap-2">
          <p
            className={`font-medium ${
              isCancelled ? "text-gray-400" : "text-gray-700"
            }`}
          >
            {session.name}
          </p>
          {isCancelled ? (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-50 text-red-400">
              Cancelled
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-400">
              Closed
            </span>
          )}
          {session.start_date && (
            <span className="text-xs text-gray-400">
              {new Date(session.start_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-gray-400">
            {session.enrolled_count} players
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

      {expanded && !isCancelled && (
        <div className="border-t border-gray-100 px-5 py-4">
          <PlayerList sessionId={session.id} currentUserId={currentUserId} />
        </div>
      )}
    </div>
  );
}

function EmailModal({
  enrollments,
  onClose,
}: {
  enrollments: LeagueEnrollment[];
  onClose: () => void;
}) {
  const active = enrollments.filter((e) => e.status === "ACTIVE");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(active.map((e) => e.member_id))
  );
  const [copied, setCopied] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedEmails = active
    .filter((e) => selected.has(e.member_id) && e.members?.email)
    .map((e) => e.members!.email);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(selectedEmails.join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="font-semibold text-gray-800">Email players</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-4 max-h-72 overflow-y-auto flex flex-col gap-2">
          {active.map((e) => (
            <label
              key={e.id}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.has(e.member_id)}
                onChange={() => toggle(e.member_id)}
                className="accent-primary w-4 h-4"
              />
              <span className="text-sm text-gray-800 font-medium">
                {e.members?.first_name} {e.members?.last_name}
              </span>
              <span className="text-xs text-gray-400 ml-auto">
                {e.members?.email}
              </span>
            </label>
          ))}
          {active.length === 0 && (
            <p className="text-sm text-gray-400">No enrolled players.</p>
          )}
        </div>
        <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 mr-auto">
            {selected.size} of {active.length} selected
          </span>
          <button
            onClick={() => setSelected(new Set(active.map((e) => e.member_id)))}
            className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            All
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            None
          </button>
          <button
            onClick={handleCopy}
            disabled={selected.size === 0}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
          >
            {copied ? "Copied!" : "Copy emails"}
          </button>
          <button
            onClick={() => {
              window.location.href = `mailto:?bcc=${selectedEmails.join(",")}`;
            }}
            disabled={selected.size === 0}
            className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/80 disabled:opacity-40 cursor-pointer"
          >
            Open in Mail
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function Friday() {
  const { user } = useProtectedRoute({ isAdmin: false });
  const { addNotification } = useNotificationsContext();
  const queryClient = useQueryClient();

  const [view, setView] = useState<"member" | "coordinator">("member");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  // Coordinator player management
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [addPlayerQuery, setAddPlayerQuery] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Coordinator court booking & assignments
  const [showAssignmentsEditor, setShowAssignmentsEditor] = useState(false);

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
      const res = await apiFetch(`/api/leagues/${fntLeague!.id}/sessions`);
      return res.json();
    },
    enabled: !!fntLeague,
  });

  const sessions = sessionsData?.data ?? [];
  const activeSession = sessions.find(
    (s) => s.status === "ACTIVE" || s.status === "ENROLLMENT_OPEN"
  );
  const today = new Date().toISOString().split("T")[0];
  const nonActiveSessions = sessions
    .filter((s) => s.status !== "ACTIVE" && s.status !== "ENROLLMENT_OPEN")
    .sort((a, b) => {
      if (a.start_date && b.start_date)
        return a.start_date.localeCompare(b.start_date);
      return 0;
    });
  const upcomingSessions = nonActiveSessions.filter(
    (s) => !s.start_date || s.start_date >= today
  );
  const pastSessions = nonActiveSessions
    .filter((s) => s.start_date && s.start_date < today)
    .reverse(); // most recent first

  // ── LC check ─────────────────────────────────────────────────────────────
  const isLC = !!fntLeague && fntLeague.coordinator_id === user?.id;

  // ── Coordinator: enrollments with email ───────────────────────────────────
  const { data: coEnrollmentsData } = useQuery<SessionEnrollmentsResponse>({
    queryKey: ["sessionEnrollments", activeSession?.id],
    queryFn: async () => {
      const res = await apiFetch(
        `/api/sessions/${activeSession!.id}/enrollments`
      );
      return res.json();
    },
    enabled: view === "coordinator" && isLC && !!activeSession,
  });
  const coEnrollments = coEnrollmentsData?.data ?? [];

  // ── Coordinator: session reservations ─────────────────────────────────────
  const { data: sessionReservationsData } = useQuery<{
    success: boolean;
    data: Reservation[];
  }>({
    queryKey: ["sessionReservations", activeSession?.id],
    queryFn: async () => {
      const res = await apiFetch(
        `/api/seasons/${activeSession!.id}/reservations`
      );
      return res.json();
    },
    enabled: view === "coordinator" && isLC && !!activeSession,
  });
  const sessionReservations = sessionReservationsData?.data ?? [];
  const sessionCourts = [
    ...new Set(sessionReservations.map((r) => r.court)),
  ].sort() as number[];

  // ── Active members for add-player search ──────────────────────────────────
  const { data: activeMembersData } = useQuery<{
    success: boolean;
    data: Member[];
  }>({
    queryKey: ["activeMembers"],
    queryFn: async () => {
      const res = await apiFetch("/api/members?status=ACTIVE");
      return res.json();
    },
    enabled: showAddPlayer,
    staleTime: 5 * 60 * 1000,
  });

  const enrolledIds = new Set(
    coEnrollments.filter((e) => e.status === "ACTIVE").map((e) => e.member_id)
  );
  const memberSearchResults =
    addPlayerQuery.trim().length > 0
      ? (activeMembersData?.data ?? [])
          .filter((m) => {
            if (enrolledIds.has(m.id) || m.id === user?.id) return false;
            return `${m.first_name} ${m.last_name}`
              .toLowerCase()
              .includes(addPlayerQuery.toLowerCase());
          })
          .slice(0, 6)
      : [];

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

  const { mutate: setStatus, isPending: statusPending } = useMutation({
    mutationFn: async ({
      sessionId,
      status,
    }: {
      sessionId: string;
      status: "ACTIVE" | "INACTIVE";
    }) => {
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
          title:
            variables.status === "ACTIVE"
              ? "Session activated — signups are open"
              : "Session deactivated",
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

  const { mutate: cancelSession, isPending: cancelPending } = useMutation({
    mutationFn: async (seasonId: string) => {
      const res = await apiFetch(`/api/seasons/${seasonId}/cancel`, {
        method: "POST",
      });
      return res.json();
    },
    onSuccess: (data) => {
      setConfirmCancelId(null);
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ["fntSessions", fntLeague?.id],
        });
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "fnt-cancel",
          expiresIn: 5000,
          title: "Session cancelled",
        });
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "fnt-cancel",
          expiresIn: 5000,
          title: data.message ?? "Could not cancel session",
        });
      }
    },
  });

  const { mutate: deleteSession, isPending: deletePending } = useMutation({
    mutationFn: async (seasonId: string) => {
      const res = await apiFetch(`/api/seasons/${seasonId}`, {
        method: "DELETE",
      });
      return res.json();
    },
    onSuccess: (data) => {
      setConfirmDeleteId(null);
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ["fntSessions", fntLeague?.id],
        });
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

  const { mutate: addPlayer, isPending: addPlayerPending } = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await apiFetch(
        `/api/seasons/${activeSession!.id}/enrollments`,
        {
          method: "POST",
          body: JSON.stringify({ member_id: memberId }),
        }
      );
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setAddPlayerQuery("");
        setShowAddPlayer(false);
        queryClient.invalidateQueries({
          queryKey: ["sessionEnrollments", activeSession?.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["fntSessions", fntLeague?.id],
        });
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "fnt-add-player",
          expiresIn: 5000,
          title: data.message ?? "Could not add player",
        });
      }
    },
  });

  const { mutate: removePlayer, isPending: removePlayerPending } = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await apiFetch(
        `/api/seasons/${activeSession!.id}/enrollments/${memberId}`,
        { method: "DELETE" }
      );
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ["sessionEnrollments", activeSession?.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["fntSessions", fntLeague?.id],
        });
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "fnt-remove-player",
          expiresIn: 5000,
          title: data.message ?? "Could not remove player",
        });
      }
    },
  });

  const isMutating =
    enrollPending ||
    withdrawPending ||
    statusPending ||
    cancelPending ||
    deletePending ||
    addPlayerPending ||
    removePlayerPending;
  const isLoading = leaguesLoading || sessionsLoading;
  const myStatus = activeSession?.my_enrollment ?? null;

  const formatDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        })
      : null;

  return (
    <ProtectedPage
      title="Friday Night Tennis"
      subtitle="Weekly social round-robin open to all members"
    >
      {showEmailModal && (
        <EmailModal
          enrollments={coEnrollments}
          onClose={() => setShowEmailModal(false)}
        />
      )}

      <div className="w-full pt-2 flex flex-col gap-6 pb-12">
        {/* Tab toggle (LC only) */}
        {isLC && (
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            {(["member", "coordinator"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 text-sm rounded-md transition-colors cursor-pointer capitalize ${
                  view === v
                    ? "bg-white text-gray-800 font-medium shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !fntLeague ? (
          <p className="text-sm text-gray-500">
            Friday Night Tennis league not found.
          </p>
        ) : view === "coordinator" && isLC ? (
          /* ── Coordinator view ─────────────────────────────────────────── */
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-500">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""}
            </p>

            {/* ── Active session ── */}
            {activeSession && (
              <div className="bg-white rounded-xl border border-primary/30">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-gray-800">
                          {activeSession.name}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      </div>
                      {activeSession.start_date && (
                        <p className="text-xs text-gray-400">
                          {formatDate(activeSession.start_date)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {confirmCancelId === activeSession.id ? (
                        <>
                          <span className="text-xs text-gray-500">
                            Cancel session?
                          </span>
                          <button
                            onClick={() => cancelSession(activeSession.id)}
                            disabled={isMutating}
                            className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 cursor-pointer"
                          >
                            {cancelPending ? "..." : "Yes, cancel"}
                          </button>
                          <button
                            onClick={() => setConfirmCancelId(null)}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              setStatus({
                                sessionId: activeSession.id,
                                status: "INACTIVE",
                              })
                            }
                            disabled={isMutating}
                            className="px-4 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 cursor-pointer font-medium transition-colors"
                          >
                            {statusPending ? "..." : "Deactivate"}
                          </button>
                          <button
                            onClick={() => setConfirmCancelId(activeSession.id)}
                            disabled={isMutating}
                            className="px-4 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 disabled:opacity-40 cursor-pointer transition-colors"
                          >
                            Cancel session
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Courts */}
                {sessionReservations.length > 0 && (
                  <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Courts
                    </p>
                    {(() => {
                      const courts = [...new Set(sessionReservations.map((r) => r.court))].sort();
                      const slots = [...new Set(sessionReservations.map((r) => r.slot))].sort((a, b) => a - b);
                      const firstSlot = slots[0];
                      const lastSlot = slots[slots.length - 1];
                      return (
                        <ul className="list-disc list-inside flex flex-col gap-0.5">
                          {courts.map((court) => {
                            const start = getSlotLabel(firstSlot, court).split(" – ")[0];
                            const end = getSlotLabel(lastSlot, court).split(" – ")[1];
                            return (
                              <li key={court} className="text-sm text-gray-600">
                                Court {court}: {start} – {end}
                              </li>
                            );
                          })}
                        </ul>
                      );
                    })()}
                  </div>
                )}

                {/* Players */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Players (
                    {coEnrollments.filter((e) => e.status === "ACTIVE").length})
                  </p>
                  {coEnrollments.filter((e) => e.status === "ACTIVE").length >
                  0 ? (
                    <div className="flex flex-col gap-1 mb-3">
                      {coEnrollments
                        .filter((e) => e.status === "ACTIVE")
                        .map((e, i) => (
                          <div
                            key={e.id}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                              i % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                          >
                            <span className="text-gray-400 w-5 text-center text-xs">
                              {i + 1}
                            </span>
                            <span className="font-medium text-gray-800">
                              {e.members?.first_name} {e.members?.last_name}
                            </span>
                            <span className="text-gray-400 text-xs ml-auto">
                              {new Date(e.enrolled_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  timeZone: "America/New_York",
                                }
                              )}
                            </span>
                            <button
                              onClick={() => removePlayer(e.member_id)}
                              disabled={isMutating}
                              className="text-gray-300 hover:text-red-400 disabled:opacity-40 cursor-pointer transition-colors text-xs ml-1"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 mb-3">
                      No players yet.
                    </p>
                  )}
                  {showAddPlayer ? (
                    <div className="relative mt-1">
                      <input
                        autoFocus
                        type="text"
                        value={addPlayerQuery}
                        onChange={(e) => setAddPlayerQuery(e.target.value)}
                        placeholder="Search by name..."
                        className="w-full max-w-xs px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-1 focus:outline-primary"
                      />
                      {memberSearchResults.length > 0 && (
                        <div className="absolute top-full mt-1 left-0 w-full max-w-xs bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                          {memberSearchResults.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => addPlayer(m.id)}
                              disabled={addPlayerPending}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              {m.first_name} {m.last_name}
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setShowAddPlayer(false);
                          setAddPlayerQuery("");
                        }}
                        className="ml-2 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddPlayer(true)}
                      className="text-sm text-primary hover:text-primary/70 cursor-pointer font-medium transition-colors"
                    >
                      + Add player
                    </button>
                  )}
                </div>

                {/* Assignments */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Assignments
                    </p>
                    {!showAssignmentsEditor && (
                      <button
                        onClick={() => setShowAssignmentsEditor(true)}
                        className="text-xs text-primary hover:text-primary/70 cursor-pointer font-medium"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {showAssignmentsEditor ? (
                    <AssignmentsEditor
                      sessionId={activeSession.id}
                      enrollments={coEnrollments}
                      sessionCourts={sessionCourts}
                      onClose={() => setShowAssignmentsEditor(false)}
                    />
                  ) : (
                    <AssignmentsView
                      sessionId={activeSession.id}
                      currentUserId={user?.id ?? ""}
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="px-5 py-3 flex items-center gap-2">
                  <button
                    disabled
                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-400 opacity-40 cursor-not-allowed"
                  >
                    Email players
                  </button>
                </div>
              </div>
            )}

            {/* ── Upcoming / Previous sessions ── */}
            {[
              { label: "Upcoming sessions", list: upcomingSessions },
              { label: "Previous sessions", list: pastSessions },
            ].map(({ label, list }) =>
              list.length > 0 ? (
                <div key={label} className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2">
                    {label}
                  </p>
                  {list.map((s) => {
                    const isCancelled = s.status === "CANCELLED";
                    const isConfirmingCancel = confirmCancelId === s.id;
                    const isConfirmingDelete = confirmDeleteId === s.id;
                    return isCancelled ? (
                      <div
                        key={s.id}
                        className="bg-white rounded-xl border border-gray-100 px-5 py-3 flex items-center justify-between opacity-60"
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500">{s.name}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-50 text-red-400">
                            Cancelled
                          </span>
                          {s.start_date && (
                            <span className="text-xs text-gray-400">
                              {new Date(s.start_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  timeZone: "UTC",
                                }
                              )}
                            </span>
                          )}
                        </div>
                        {confirmDeleteId === s.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              Delete?
                            </span>
                            <button
                              onClick={() => deleteSession(s.id)}
                              disabled={isMutating}
                              className="px-3 py-1 text-xs rounded-lg bg-red-600 text-white cursor-pointer"
                            >
                              {deletePending ? "..." : "Yes"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1 text-xs rounded-lg border border-gray-300 text-gray-600 cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(s.id)}
                            className="text-xs text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ) : (
                      <div
                        key={s.id}
                        className="bg-white rounded-xl border border-gray-200 px-5 py-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-700">
                                {s.name}
                              </p>
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
                                Inactive
                              </span>
                            </div>
                            {s.start_date && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {formatDate(s.start_date)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {isConfirmingCancel ? (
                              <>
                                <span className="text-xs text-gray-500">
                                  Cancel?
                                </span>
                                <button
                                  onClick={() => cancelSession(s.id)}
                                  disabled={isMutating}
                                  className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 cursor-pointer"
                                >
                                  {cancelPending ? "..." : "Yes"}
                                </button>
                                <button
                                  onClick={() => setConfirmCancelId(null)}
                                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 cursor-pointer"
                                >
                                  No
                                </button>
                              </>
                            ) : isConfirmingDelete ? (
                              <>
                                <span className="text-xs text-gray-500">
                                  Delete?
                                </span>
                                <button
                                  onClick={() => deleteSession(s.id)}
                                  disabled={isMutating}
                                  className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 cursor-pointer"
                                >
                                  {deletePending ? "..." : "Yes"}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 cursor-pointer"
                                >
                                  No
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    setStatus({
                                      sessionId: s.id,
                                      status: "ACTIVE",
                                    })
                                  }
                                  disabled={isMutating || !!activeSession}
                                  title={
                                    activeSession
                                      ? "Deactivate current session first"
                                      : undefined
                                  }
                                  className="px-4 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/80 disabled:opacity-40 cursor-pointer font-medium transition-colors"
                                >
                                  {statusPending ? "..." : "Activate"}
                                </button>
                                <button
                                  onClick={() => setConfirmCancelId(s.id)}
                                  disabled={isMutating}
                                  className="px-4 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600 disabled:opacity-40 cursor-pointer transition-colors"
                                >
                                  Cancel
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
              ) : null
            )}

            {sessions.length === 0 && (
              <p className="text-sm text-gray-400">No sessions yet.</p>
            )}
          </div>
        ) : (
          /* ── Member view ──────────────────────────────────────────────── */
          <div className="flex flex-col gap-6">
            {activeSession ? (
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
                      {formatDate(activeSession.start_date)}
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

                <div className="px-6 py-5 border-b border-gray-100">
                  <PlayerList
                    sessionId={activeSession.id}
                    currentUserId={user?.id ?? ""}
                  />
                </div>

                <div className="px-6 py-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Assignments
                  </p>
                  <AssignmentsView
                    sessionId={activeSession.id}
                    currentUserId={user?.id ?? ""}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 px-6 py-10 flex flex-col items-center gap-2 text-center">
                <p className="text-gray-500 font-medium">No session open yet</p>
                <p className="text-sm text-gray-400">
                  Check back Monday — signups typically open at the start of the
                  week.
                </p>
              </div>
            )}

            {[
              { label: "Upcoming sessions", list: upcomingSessions },
              { label: "Previous sessions", list: pastSessions },
            ].map(({ label, list }) =>
              list.length > 0 ? (
                <div key={label} className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {label}
                  </p>
                  {list.map((s) => (
                    <ClosedSession
                      key={s.id}
                      session={s}
                      currentUserId={user?.id ?? ""}
                    />
                  ))}
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
