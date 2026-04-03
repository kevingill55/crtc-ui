"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/app/clients/api";
import {
  NotificationStatus,
  useNotificationsContext,
} from "@/app/providers/Notifications";
import { FntRoundAssignment, LeagueEnrollment } from "@/app/types";

type AssignmentsDraft = Record<string, string[]>; // key: "round-court"

// ── Shared helper ────────────────────────────────────────────────────────────

function buildNameMap(enrollments: LeagueEnrollment[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const e of enrollments) {
    if (e.members) {
      map[e.member_id] = `${e.members.first_name} ${e.members.last_name}`;
    }
  }
  return map;
}

// ── Cell player picker ───────────────────────────────────────────────────────

function CellPicker({
  label,
  playerIds,
  enrollments,
  nameMap,
  onChange,
}: {
  label: string;
  playerIds: string[];
  enrollments: LeagueEnrollment[];
  nameMap: Record<string, string>;
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const filterRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      filterRef.current?.focus();
    } else {
      document.body.style.overflow = "";
      setFilter("");
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const toggle = (id: string) => {
    onChange(
      playerIds.includes(id)
        ? playerIds.filter((x) => x !== id)
        : [...playerIds, id]
    );
  };

  const activePlayers = enrollments.filter((e) => e.status === "ACTIVE");
  const filtered = filter
    ? activePlayers.filter((e) =>
        `${e.members?.first_name} ${e.members?.last_name}`
          .toLowerCase()
          .includes(filter.toLowerCase())
      )
    : activePlayers;

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="min-h-8 flex flex-wrap gap-1 p-1 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 bg-white"
      >
        {playerIds.length === 0 ? (
          <span className="text-xs text-gray-300 px-1 leading-6">—</span>
        ) : (
          playerIds.map((id) => (
            <span
              key={id}
              className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded font-medium"
            >
              {nameMap[id] ?? "?"}
            </span>
          ))
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col h-[60vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-medium text-gray-800">{label}</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg leading-none">✕</button>
            </div>

            <div className="px-4 py-3 border-b border-gray-100">
              <input
                ref={filterRef}
                type="text"
                placeholder="Search players"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary text-sm"
              />
            </div>

            <div className="overflow-y-auto flex-1 py-1">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 px-4 py-3">No players found</p>
              ) : (
                filtered.map((e) => {
                  const isSelected = playerIds.includes(e.member_id);
                  return (
                    <div
                      key={e.id}
                      onClick={() => toggle(e.member_id)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className={`w-4 h-4 rounded border shrink-0 ${isSelected ? "bg-primary border-primary" : "border-gray-300"}`} />
                      <span className="text-sm text-gray-800">
                        {e.members?.first_name} {e.members?.last_name}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-200">
              <button
                onClick={() => setOpen(false)}
                className="w-full py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/80 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Coordinator editor ───────────────────────────────────────────────────────

export function AssignmentsEditor({
  sessionId,
  enrollments,
  sessionCourts,
  onClose,
}: {
  sessionId: string;
  enrollments: LeagueEnrollment[];
  sessionCourts: number[];
  onClose: () => void;
}) {
  const { addNotification } = useNotificationsContext();
  const queryClient = useQueryClient();
  const courts = sessionCourts.length > 0 ? sessionCourts : [1, 2];

  const { data: assignmentsData } = useQuery<{
    success: boolean;
    data: FntRoundAssignment[];
  }>({
    queryKey: ["seasonAssignments", sessionId],
    queryFn: async () => {
      const res = await apiFetch(`/api/seasons/${sessionId}/assignments`);
      return res.json();
    },
  });

  const [draft, setDraft] = useState<AssignmentsDraft>({});
  const [numRounds, setNumRounds] = useState(3);

  useEffect(() => {
    const assignments = assignmentsData?.data ?? [];
    if (assignments.length === 0) return;
    const initial: AssignmentsDraft = {};
    for (const a of assignments) {
      initial[`${a.round_number}-${a.court}`] = a.player_ids;
    }
    setDraft(initial);
    setNumRounds(Math.max(3, ...assignments.map((a) => a.round_number)));
  }, [assignmentsData]);

  const setCellPlayers = (cellKey: string, ids: string[]) => {
    setDraft((prev) => ({ ...prev, [cellKey]: ids }));
  };

  const nameMap = buildNameMap(enrollments);

  const { mutate: save, isPending } = useMutation({
    mutationFn: async () => {
      const rows = [];
      for (let r = 1; r <= numRounds; r++) {
        for (const court of courts) {
          rows.push({
            round_number: r,
            court,
            player_ids: draft[`${r}-${court}`] ?? [],
          });
        }
      }
      const res = await apiFetch(`/api/seasons/${sessionId}/assignments`, {
        method: "PUT",
        body: JSON.stringify(rows),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["seasonAssignments", sessionId] });
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "fnt-assignments",
          expiresIn: 4000,
          title: "Assignments saved",
        });
        onClose();
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "fnt-assignments",
          expiresIn: 5000,
          title: data.message ?? "Could not save assignments",
        });
      }
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="text-left pr-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide w-20" />
              {courts.map((c) => (
                <th
                  key={c}
                  className="px-2 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left"
                                  >
                  Court {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numRounds }, (_, i) => i + 1).map((round) => (
              <tr key={round}>
                <td className="pr-4 py-1.5 text-sm font-medium text-gray-600 whitespace-nowrap">
                  Round {round}
                </td>
                {courts.map((court) => {
                  const key = `${round}-${court}`;
                  return (
                    <td key={court} className="px-2 py-1.5">
                      <CellPicker
                        label={`Round ${round} · Court ${court}`}
                        playerIds={draft[key] ?? []}
                        enrollments={enrollments}
                        nameMap={nameMap}
                        onChange={(ids) => setCellPlayers(key, ids)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => save()}
          disabled={isPending}
          className="px-5 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/80 disabled:opacity-40 cursor-pointer transition-colors"
        >
          {isPending ? "Saving..." : "Save assignments"}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Read-only view (member + coordinator) ────────────────────────────────────

export function AssignmentsView({
  sessionId,
  currentUserId,
}: {
  sessionId: string;
  currentUserId: string;
}) {
  const { data: assignmentsData } = useQuery<{
    success: boolean;
    data: FntRoundAssignment[];
  }>({
    queryKey: ["seasonAssignments", sessionId],
    queryFn: async () => {
      const res = await apiFetch(`/api/seasons/${sessionId}/assignments`);
      return res.json();
    },
  });

  const { data: enrollmentsData } = useQuery<{
    success: boolean;
    data: LeagueEnrollment[];
  }>({
    queryKey: ["sessionEnrollments", sessionId],
    queryFn: async () => {
      const res = await apiFetch(`/api/sessions/${sessionId}/enrollments`);
      return res.json();
    },
  });

  const assignments = assignmentsData?.data ?? [];
  if (assignments.length === 0) return null;

  const nameMap = buildNameMap(enrollmentsData?.data ?? []);
  const courts = [...new Set(assignments.map((a) => a.court))].sort();
  const rounds = [...new Set(assignments.map((a) => a.round_number))].sort((a, b) => a - b);

  const myRounds = assignments
    .filter((a) => a.player_ids.includes(currentUserId))
    .sort((a, b) => a.round_number - b.round_number);

  return (
    <div className="flex flex-col gap-4">
      {myRounds.length > 0 && (
        <div className="bg-primary/5 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
            Your assignments
          </p>
          <p className="text-sm text-gray-700">
            {myRounds
              .map((a) => `Round ${a.round_number} · Court ${a.court}`)
              .join("  ·  ")}
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="text-left pr-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide w-20" />
              {courts.map((c) => (
                <th
                  key={c}
                  className="px-3 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left"
                                  >
                  Court {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rounds.map((round) => (
              <tr key={round} className="border-t border-gray-50">
                <td className="pr-4 py-2 text-sm font-medium text-gray-500 whitespace-nowrap">
                  Round {round}
                </td>
                {courts.map((court) => {
                  const cell = assignments.find(
                    (a) => a.round_number === round && a.court === court
                  );
                  const playerIds = cell?.player_ids ?? [];
                  return (
                    <td key={court} className="px-3 py-2 align-top">
                      <div className="flex flex-wrap gap-1">
                        {playerIds.length === 0 ? (
                          <span className="text-xs text-gray-300">—</span>
                        ) : (
                          playerIds.map((id) => {
                            const isMe = id === currentUserId;
                            return (
                              <span
                                key={id}
                                className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                  isMe
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {nameMap[id] ?? "?"}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
