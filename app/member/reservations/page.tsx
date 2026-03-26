"use client";

import { apiFetch } from "@/app/clients/api";
import { Reservation } from "@/app/types";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import Link from "next/link";
import { getReservationColors, getSlotLabel, isWateringSlot } from "@/app/utils";
import ProtectedPage from "../../components/ProtectedPage";
import { useProtectedRoute } from "../../hooks/useProtectedRoute";
import { Modal } from "../../components/Modal";
import { Dropdown, DropdownOption } from "../../components/Dropdown";
import { PlayersMultiSelectModal } from "../reserve/PlayersMultiSelectModal";
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


const getDateString = (str: string) =>
  new Date(str + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });

const getSlotsDisplay = (item: Reservation) => {
  const slots = item.slots?.length ? item.slots : [item.slot];
  const courts = item.courts?.length ? item.courts : [item.court];
  // Use lower court labels if any court is lower (1–2), otherwise upper
  const refCourt = courts.some((c) => c <= 2) ? 1 : 3;
  if (slots.length === 1) return getSlotLabel(slots[0], refCourt);
  const start = getSlotLabel(Math.min(...slots), refCourt).split(" – ")[0];
  const end = getSlotLabel(Math.max(...slots), refCourt).split(" – ")[1];
  return `${start} – ${end}`;
};

const getCourtsDisplay = (item: Reservation) => {
  const courts = item.courts?.length ? item.courts : [item.court];
  return courts.length === 1
    ? `Court ${courts[0]}`
    : `Courts ${courts.join(", ")}`;
};


export default function MyReservations() {
  const { addNotification } = useNotificationsContext();
  const queryClient = useQueryClient();
  const { user } = useProtectedRoute();

  const [confirmDelete, setConfirmDelete] = useState<Reservation | null>(null);
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editSlot, setEditSlot] = useState(0);
  const [editCourt, setEditCourt] = useState(0);
  const [editPlayers, setEditPlayers] = useState<string[]>([]);

  const slotDropdownOptions = useMemo<DropdownOption[]>(() => {
    const refCourt = editCourt > 0 ? editCourt : 4;
    return Array.from({ length: 9 }, (_, i) => i + 1)
      .filter((s) => editCourt === 0 || !isWateringSlot(s, editCourt))
      .map((s) => ({ label: getSlotLabel(s, refCourt), value: s }));
  }, [editCourt]);

  const { data, isLoading } = useQuery<{ data: Reservation[] }>({
    queryKey: ["getUpcomingReservations"],
    queryFn: async () => {
      const res = await apiFetch("/api/reservations/upcoming", {
        method: "GET",
      });
      return res.json();
    },
  });

  const { mutate: deleteReservation, isPending: deleting } = useMutation({
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
        queryClient.invalidateQueries({ queryKey: ["getSlotsByDay"] });
        queryClient.invalidateQueries({ queryKey: ["availability"] });
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "delete-res",
          expiresIn: 4000,
          title: "Reservation deleted",
        });
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "delete-res",
          expiresIn: 4000,
          title: data.message ?? "Could not delete reservation",
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
      slot?: number;
      court?: number;
      players: string[];
    }) => {
      const body: Record<string, unknown> = { date, players };
      if (slot !== undefined) body.slot = slot;
      if (court !== undefined) body.court = court;
      const res = await apiFetch(`/api/reservations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ["getUpcomingReservations"],
        });
        queryClient.invalidateQueries({ queryKey: ["getSlotsByDay"] });
        queryClient.invalidateQueries({ queryKey: ["availability"] });
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

  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const today = new Date().toISOString().split("T")[0];

  const groupByDate = (reservations: Reservation[]) => {
    const groups: { date: string; items: Reservation[] }[] = [];
    const seen = new Set<string>();
    for (const r of reservations) {
      if (!seen.has(r.date)) {
        seen.add(r.date);
        groups.push({ date: r.date, items: [] });
      }
      groups[groups.length - 1].items.push(r);
    }
    return groups;
  };

  const allReservations = data?.data ?? [];

  const renderCard = (item: Reservation) => {
    const { accent } = getReservationColors(item.type);
    const canEdit =
      item.can_manage && (item.type === "REGULAR" || item.type === "CLUB");
    const isOwner = item.can_manage;
    const isPlaying = !item.can_manage || (item.player_ids ?? []).includes(user?.id ?? "");
    return (
      <div
        key={item.id}
        className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between gap-4"
      >
        {/* Left: name + badges */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`shrink-0 w-1 h-10 ${accent} rounded-full`} />
          <div className="min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <p className="font-medium text-gray-800 truncate">{item.name}</p>
              {isOwner && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary">
                  Owner
                </span>
              )}
              {isPlaying && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                  Playing
                </span>
              )}
            </div>
            {item.players && item.players.length > 0 && (
              <p className="text-sm text-gray-500 mt-0.5 truncate">
                {item.players.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Right: actions + court/time */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => handleEditOpen(item)}
                className="text-xs text-primary border border-gray-300 hover:border-primary rounded-lg px-3 py-1.5 transition-colors hover:cursor-pointer"
              >
                Edit
              </button>
            )}
            {item.can_manage && (
              <button
                onClick={() => setConfirmDelete(item)}
                disabled={deleting || updating}
                className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 rounded-lg px-3 py-1.5 transition-colors hover:cursor-pointer disabled:opacity-40"
              >
                Delete
              </button>
            )}
          </div>
          <div className="text-right text-sm text-gray-500 leading-5 w-36">
            <p className="font-medium text-gray-700">{getCourtsDisplay(item)}</p>
            <p>{getSlotsDisplay(item)}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedPage
      title="My Reservations"
    >
      {confirmDelete && (
        <Modal
          id="confirm-delete"
          title="Delete reservation?"
          subtitle={`"${confirmDelete.name}" on ${getDateString(
            confirmDelete.date
          )}`}
          content={
            <p className="text-sm text-gray-500 py-2">This cannot be undone.</p>
          }
          doneLabel="Delete"
          onDone={() => {
            deleteReservation(confirmDelete.id);
            setConfirmDelete(null);
          }}
          onClose={() => setConfirmDelete(null)}
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
              {editingReservation.type === "REGULAR" && (
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
              )}
              {editingReservation.type === "CLUB" && (
                <div className="flex gap-4 text-sm text-gray-500">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-600">Courts</span>
                    <span>{getCourtsDisplay(editingReservation)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-600">Time</span>
                    <span>{getSlotsDisplay(editingReservation)}</span>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Players</label>
                <PlayersMultiSelectModal
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
              slot: editingReservation.type === "REGULAR" ? editSlot : undefined,
              court:
                editingReservation.type === "REGULAR" ? editCourt : undefined,
              players: editPlayers,
            });
          }}
          onClose={() => setEditingReservation(null)}
        />
      )}

      {/* Upcoming / Past toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
        <button
          onClick={() => setTab("upcoming")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            tab === "upcoming"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setTab("past")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            tab === "past"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Past
        </button>
      </div>

      <div className="w-full pb-12">
        {tab === "past" ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FontAwesomeIcon
              icon={faCircleExclamation}
              className="text-gray-300 text-4xl"
            />
            <p className="text-gray-500">Past reservations coming soon</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center gap-3 py-10 text-gray-500 text-sm">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Loading reservations...
          </div>
        ) : allReservations.length === 0 ? (
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
            {groupByDate(allReservations).map(({ date, items }) => (
              <div key={date}>
                <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  {getDateString(date)}
                </p>
                <div className="flex flex-col gap-2">
                  {items.map((item) => renderCard(item))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
