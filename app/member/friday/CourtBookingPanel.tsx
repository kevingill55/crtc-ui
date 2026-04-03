"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/app/clients/api";
import {
  NotificationStatus,
  useNotificationsContext,
} from "@/app/providers/Notifications";
import { getSlotOverviewLabel } from "@/app/utils";
import { LeagueSeason, Reservation } from "@/app/types";

const SLOTS = Array.from({ length: 9 }, (_, i) => i + 1);
const COURTS = [1, 2, 3, 4];
const COURT_LABELS: Record<number, string> = {
  1: "Court 1 (Lower)",
  2: "Court 2 (Lower)",
  3: "Court 3 (Upper)",
  4: "Court 4 (Upper)",
};

// Slots 4 and 5 are watering slots for lower/upper courts respectively
const WATERING_LABEL: Record<number, string> = {
  4: "watering — lower",
  5: "watering — upper",
};

export function CourtBookingPanel({
  session,
  leagueId,
  enrolledPlayerIds,
  currentUserId,
  existingReservations,
  onBooked,
  onClose,
}: {
  session: LeagueSeason;
  leagueId: string;
  enrolledPlayerIds: string[];
  currentUserId: string;
  existingReservations: Reservation[];
  onBooked: () => void;
  onClose: () => void;
}) {
  const { addNotification } = useNotificationsContext();
  const queryClient = useQueryClient();

  const [bookDate, setBookDate] = useState(
    session.start_date ? session.start_date.split("T")[0] : ""
  );
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());
  const [selectedCourts, setSelectedCourts] = useState<Set<number>>(new Set([1, 2]));

  const toggleSlot = (s: number) =>
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });

  const toggleCourt = (c: number) =>
    setSelectedCourts((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c); else next.add(c);
      return next;
    });

  const { mutate: book, isPending } = useMutation({
    mutationFn: async () => {
      const players =
        enrolledPlayerIds.length > 0 ? enrolledPlayerIds : [currentUserId];
      const res = await apiFetch("/api/reservations", {
        method: "POST",
        body: JSON.stringify({
          type: "LEAGUE",
          date: bookDate,
          slots: [...selectedSlots].sort(),
          courts: [...selectedCourts].sort(),
          players,
          name: session.name,
          league_id: leagueId,
          season_id: session.id,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success || data.group_id) {
        queryClient.invalidateQueries({
          queryKey: ["sessionReservations", session.id],
        });
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "fnt-book-courts",
          expiresIn: 4000,
          title: "Courts booked",
        });
        onBooked();
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "fnt-book-courts",
          expiresIn: 5000,
          title: data.message ?? "Could not book courts",
        });
      }
    },
  });

  const canSubmit =
    !!bookDate && selectedSlots.size > 0 && selectedCourts.size > 0;

  // Summarize existing reservations
  const bookedGroups = existingReservations.reduce<
    Record<string, { courts: number[]; slots: number[] }>
  >((acc, r) => {
    const gid = r.group_id ?? r.id;
    if (!acc[gid]) acc[gid] = { courts: [], slots: [] };
    if (!acc[gid].courts.includes(r.court)) acc[gid].courts.push(r.court);
    if (!acc[gid].slots.includes(r.slot)) acc[gid].slots.push(r.slot);
    return acc;
  }, {});
  const bookedSummaries = Object.values(bookedGroups);

  return (
    <div className="border-t border-gray-100 pt-4 mt-2 flex flex-col gap-4">
      {/* Existing reservations */}
      {bookedSummaries.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Already booked
          </p>
          {bookedSummaries.map((g, i) => (
            <p key={i} className="text-sm text-gray-600">
              Courts {g.courts.sort().join(", ")} ·{" "}
              {g.slots
                .sort()
                .map((s) => getSlotOverviewLabel(s))
                .join(", ")}
            </p>
          ))}
        </div>
      )}

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        Book additional courts
      </p>

      {/* Date */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Date</label>
        <input
          type="date"
          value={bookDate}
          onChange={(e) => setBookDate(e.target.value)}
          className="w-44 px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-1 focus:outline-primary"
        />
      </div>

      {/* Courts */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-500">Courts</label>
        <div className="flex flex-wrap gap-2">
          {COURTS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCourt(c)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors cursor-pointer ${
                selectedCourts.has(c)
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
            >
              {COURT_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Slots */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-500">Time slots</label>
        <div className="flex flex-col gap-1">
          {SLOTS.map((s) => {
            const watering = WATERING_LABEL[s];
            return (
              <label
                key={s}
                className={`flex items-center gap-2 cursor-pointer ${watering ? "opacity-50" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={selectedSlots.has(s)}
                  onChange={() => !watering && toggleSlot(s)}
                  disabled={!!watering}
                  className="accent-primary"
                />
                <span className="text-sm text-gray-700">
                  {getSlotOverviewLabel(s)}
                  {watering && (
                    <span className="ml-1 text-xs text-gray-400">({watering})</span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => book()}
          disabled={!canSubmit || isPending}
          className="px-5 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/80 disabled:opacity-40 cursor-pointer transition-colors"
        >
          {isPending ? "Booking..." : "Book courts"}
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
