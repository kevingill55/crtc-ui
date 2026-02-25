"use client";

import { apiFetch } from "@/app/clients/api";
import { Reservation } from "@/app/types";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import ProtectedPage from "../../components/ProtectedPage";
import { Modal } from "../../components/Modal";
import { Dropdown, DropdownOption } from "../../components/Dropdown";
import { PlayersMultiSelect } from "../reserve/PlayersMultiSelect";
import {
  NotificationStatus,
  useNotificationsContext,
} from "@/app/providers/Notifications";

const courtDropdownOptions: DropdownOption[] = [
  { label: "Court 1 (Lower)", value: 1 },
  { label: "Court 2 (Lower)", value: 2 },
  { label: "Court 3 (Upper)", value: 3 },
  { label: "Court 4 (Upper)", value: 4 },
];

const slotDropdownOptions: DropdownOption[] = [
  { label: "8:30 - 10:00 am", value: 1 },
  { label: "10:00 - 11:30 am", value: 2 },
  { label: "11:30 - 1:00 pm", value: 3 },
  { label: "1:00 - 2:30 pm", value: 4 },
  { label: "2:30 - 4:00 pm", value: 5 },
  { label: "4:00 - 5:30 pm", value: 6 },
  { label: "5:30 - 7:00 pm", value: 7 },
  { label: "7:00 - 8:30 pm", value: 8 },
  { label: "8:30 - 10:00 pm", value: 9 },
];

const getDateString = (str: string) =>
  new Date(str + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });

const TIME_SLOTS = [
  "",
  "8:30 – 10:00 am",
  "10:00 – 11:30 am",
  "11:30 – 1:00 pm",
  "1:00 – 2:30 pm",
  "2:30 – 4:00 pm",
  "4:00 – 5:30 pm",
  "5:30 – 7:00 pm",
  "7:00 – 8:30 pm",
  "8:30 – 10:00 pm",
];

const getSlotsDisplay = (item: Reservation) => {
  const slots = item.slots?.length ? item.slots : [item.slot];
  if (slots.length === 1) return TIME_SLOTS[slots[0]];
  const start = TIME_SLOTS[Math.min(...slots)].split(" – ")[0];
  const end = TIME_SLOTS[Math.max(...slots)].split(" – ")[1];
  return `${start} – ${end}`;
};

const getCourtsDisplay = (item: Reservation) => {
  const courts = item.courts?.length ? item.courts : [item.court];
  return courts.length === 1
    ? `Court ${courts[0]}`
    : `Courts ${courts.join(", ")}`;
};

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  REGULAR: { label: "Play on your own", cls: "bg-blue-100 text-blue-700" },
  LEAGUE: { label: "League", cls: "bg-green-100 text-green-700" },
  CLUB: { label: "Club", cls: "bg-purple-100 text-purple-700" },
};

export default function MyReservations() {
  const { addNotification } = useNotificationsContext();
  const queryClient = useQueryClient();

  const [confirmCancel, setConfirmCancel] = useState<Reservation | null>(null);
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editSlot, setEditSlot] = useState(0);
  const [editCourt, setEditCourt] = useState(0);
  const [editPlayers, setEditPlayers] = useState<string[]>([]);

  const { data, isLoading } = useQuery<{ data: Reservation[] }>({
    queryKey: ["getUpcomingReservations"],
    queryFn: async () => {
      const res = await apiFetch("/api/reservations/upcoming", {
        method: "GET",
      });
      return res.json();
    },
  });

  const { mutate: cancelReservation, isPending: cancelling } = useMutation({
    mutationFn: async (reservationId: string) => {
      const res = await apiFetch(`/api/reservations/${reservationId}`, {
        method: "DELETE",
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ["getUpcomingReservations"],
        });
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "cancel-res",
          expiresIn: 4000,
          title: "Reservation cancelled",
        });
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "cancel-res",
          expiresIn: 4000,
          title: data.message ?? "Could not cancel reservation",
        });
      }
    },
  });

  const { mutate: updateReservation, isPending: updating } = useMutation({
    mutationFn: async ({
      id,
      date,
      slot,
      court,
      players,
    }: {
      id: string;
      date: string;
      slot: number;
      court: number;
      players: string[];
    }) => {
      const res = await apiFetch(`/api/reservations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ date, slot, court, players }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["getUpcomingReservations"] });
        setEditingReservation(null);
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "update-res",
          expiresIn: 4000,
          title: "Reservation updated",
        });
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "update-res",
          expiresIn: 4000,
          title: data.message ?? "Could not update reservation",
        });
      }
    },
  });

  const handleEditOpen = (item: Reservation) => {
    setEditingReservation(item);
    setEditDate(item.date);
    setEditSlot(item.slot);
    setEditCourt(item.court);
    setEditPlayers(item.player_ids ?? []);
  };

  const today = new Date().toISOString().split("T")[0];

  // Group reservations by date
  const byDate: { date: string; items: Reservation[] }[] = [];
  const seen = new Set<string>();
  for (const r of data?.data ?? []) {
    if (!seen.has(r.date)) {
      seen.add(r.date);
      byDate.push({ date: r.date, items: [] });
    }
    byDate[byDate.length - 1].items.push(r);
  }

  return (
    <ProtectedPage
      title="My Reservations"
      subtitle="Upcoming court time you own or are listed on"
    >
      {confirmCancel && (
        <Modal
          id="confirm-cancel"
          title="Cancel reservation?"
          subtitle={`"${confirmCancel.name}" on ${getDateString(confirmCancel.date)}`}
          content={
            <p className="text-sm text-gray-500 py-2">
              This cannot be undone.
            </p>
          }
          doneLabel="Confirm"
          onDone={() => {
            cancelReservation(confirmCancel.id);
            setConfirmCancel(null);
          }}
          onClose={() => setConfirmCancel(null)}
        />
      )}

      {editingReservation && (
        <Modal
          id="edit-reservation"
          title="Edit reservation"
          subtitle={editingReservation.name}
          content={
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Date</label>
                <input
                  type="date"
                  min={today}
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-48 px-4 py-2 rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary hover:border-gray-500"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-sm text-gray-600">Court</label>
                  <Dropdown
                    label={
                      courtDropdownOptions.find((o) => o.value === editCourt)
                        ?.label ?? "Select court"
                    }
                    value={editCourt}
                    onSelect={(v) => setEditCourt(v as number)}
                    options={courtDropdownOptions}
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-sm text-gray-600">Time</label>
                  <Dropdown
                    label={
                      editSlot
                        ? slotDropdownOptions[editSlot - 1].label
                        : "Select a time"
                    }
                    value={editSlot}
                    onSelect={(v) => setEditSlot(v as number)}
                    options={slotDropdownOptions}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Players</label>
                <PlayersMultiSelect
                  players={editPlayers}
                  onSave={(newPlayers) => setEditPlayers(newPlayers)}
                />
              </div>
            </div>
          }
          doneLabel="Save"
          onDone={() => {
            if (!editingReservation) return;
            updateReservation({
              id: editingReservation.id,
              date: editDate,
              slot: editSlot,
              court: editCourt,
              players: editPlayers,
            });
          }}
          onClose={() => setEditingReservation(null)}
        />
      )}

      <div className="w-full pb-12">
        {isLoading ? (
          <div className="flex items-center gap-3 py-10 text-gray-500 text-sm">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Loading reservations...
          </div>
        ) : byDate.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FontAwesomeIcon
              icon={faCircleExclamation}
              className="text-gray-300 text-4xl"
            />
            <p className="text-gray-500">No upcoming reservations</p>
            <Link
              href="/member/reserve"
              className="mt-1 text-sm bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/80 transition-colors"
            >
              Reserve a court
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {byDate.map(({ date, items }) => (
              <div key={date}>
                <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  {getDateString(date)}
                </p>
                <div className="flex flex-col gap-2">
                  {items.map((item) => {
                    const badge = TYPE_BADGE[item.type ?? "REGULAR"];
                    const canEdit =
                      item.can_manage && item.type === "REGULAR";
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between gap-4"
                      >
                        {/* Left: name + type badge */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="shrink-0 w-1 h-10 bg-blue-300 rounded-full" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-gray-800 truncate">
                                {item.name}
                              </p>
                              {badge && (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}
                                >
                                  {badge.label}
                                </span>
                              )}
                            </div>
                            {item.players && item.players.length > 0 && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {item.players.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: court + time + actions */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right text-sm text-gray-500 leading-5">
                            <p className="font-medium text-gray-700">
                              {getCourtsDisplay(item)}
                            </p>
                            <p>{getSlotsDisplay(item)}</p>
                          </div>
                          {canEdit && (
                            <button
                              onClick={() => handleEditOpen(item)}
                              className="text-xs text-primary border border-gray-300 hover:border-primary rounded-lg px-3 py-1.5 transition-colors hover:cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                          {item.can_manage ? (
                            <button
                              onClick={() => setConfirmCancel(item)}
                              disabled={cancelling || updating}
                              className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 rounded-lg px-3 py-1.5 transition-colors hover:cursor-pointer disabled:opacity-40"
                            >
                              Cancel
                            </button>
                          ) : (
                            <div className="w-[60px]" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
