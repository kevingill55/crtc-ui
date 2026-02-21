"use client";

import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import ProtectedPage from "@/app/components/ProtectedPage";
import { useProtectedRoute } from "@/app/hooks/useProtectedRoute";
import {
  NotificationStatus,
  useNotificationsContext,
} from "@/app/providers/Notifications";
import { apiFetch } from "@/app/clients/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loading } from "@/app/components/Loading";
import { toEasternISO } from "@/app/utils";
import { PlayersMultiSelect } from "./PlayersMultiSelect";

const courtDropdownOptions: DropdownOption[] = [
  {
    label: "Court 1 (Lower)",
    value: 1,
  },
  {
    label: "Court 2 (Lower)",
    value: 2,
  },
  {
    label: "Court 3 (Upper)",
    value: 3,
  },
  {
    label: "Court 4 (Upper)",
    value: 4,
  },
];

const slotDropdownOptions: DropdownOption[] = [
  {
    label: "8:30 - 10:00 am",
    value: 1,
  },
  {
    label: "10:00 - 11:30 am",
    value: 2,
  },
  {
    label: "11:30 - 1:00 pm",
    value: 3,
  },
  {
    label: "1:00 - 2:30 pm",
    value: 4,
  },
  {
    label: "2:30 - 4:00 pm",
    value: 5,
  },
  {
    label: "4:00 - 5:30 pm",
    value: 6,
  },
  {
    label: "5:30 - 7:00 pm",
    value: 7,
  },
  {
    label: "7:00 - 8:30 pm",
    value: 8,
  },
  {
    label: "8:30 - 10:00 pm",
    value: 9,
  },
];

function ReserveForm() {
  const { addNotification } = useNotificationsContext();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [slot, setSlot] = useState(Number(searchParams.get("slot")) || 0);
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [court, setCourt] = useState(Number(searchParams.get("court")) || 0);
  const [players, setPlayers] = useState<string[]>([]);

  // Booking window: opens at 22:00 ET, 7 days before the target date.
  // If it's past 22:00 ET now, today+7 is bookable; otherwise only through today+6.
  const { minDate, maxDate } = useMemo(() => {
    const now = new Date();
    const etNow = new Date(
      now.toLocaleString("en-US", { timeZone: "America/New_York" })
    );
    const daysAhead = etNow.getHours() >= 22 ? 7 : 6;
    const max = new Date(now);
    max.setDate(now.getDate() + daysAhead);
    return { minDate: toEasternISO(now), maxDate: toEasternISO(max) };
  }, []);

  const dateStatus = useMemo(() => {
    if (!date) return null;
    if (date < minDate) return { valid: false, message: "Cannot book a date in the past." };
    if (date > maxDate) {
      // Compute when the window opens for this date: (date − 7 days) at 22:00 ET
      const [y, m, d] = date.split("-").map(Number);
      const opensDate = new Date(y, m - 1, d - 7).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return { valid: false, message: `Booking window not yet open — opens ${opensDate} at 10:00 PM ET.` };
    }
    const [my, mm, md] = maxDate.split("-").map(Number);
    const maxFormatted = new Date(my, mm - 1, md).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return { valid: true, message: `Booking window open through ${maxFormatted}.` };
  }, [date, minDate, maxDate]);

  const handleOnClear = () => {
    setPlayers([]);
    setDate("");
    setSlot(0);
    setCourt(0);
  };

  const { mutate: createReservation } = useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`getUpcomingReservations`] });
      handleOnClear();
      addNotification({
        status: NotificationStatus.SUCCESS,
        id: "temp",
        expiresIn: 5000,
        title: "Reservation created",
      });
    },
    mutationFn: async () => {
      const createReservationFetch = await apiFetch(`/api/reservations`, {
        method: "POST",
        body: JSON.stringify({
          type: "REGULAR",
          slot,
          court,
          players,
          date,
        }),
      });
      return createReservationFetch.json();
    },
  });

  return (
    <ProtectedPage title="Reserve">
      <div className="w-full pt-2 flex flex-col h-full gap-6">
        <div>
          <h1 className="text-primary font-bold text-2xl">
            Schedule court time
          </h1>
          <p className="text-sm text-gray-500">
            Create reservations and include all members of your party; you can
            only reserve court time once per day.
          </p>
        </div>

        <div className="bg-white flex flex-col min-w-160 w-3/4 gap-6 rounded-lg p-8">
          <div className="flex justify-between gap-4 items-center">
            <div className="flex flex-col w-full gap-2">
              <label htmlFor="crtc-reservation-date" className="text-gray-600">
                Date
              </label>
              <input
                id="crtc-reservation-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type="date"
                min={minDate}
                max={maxDate}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary hover:border-gray-500"
              />
              {dateStatus && (
                <p className={`text-xs ${dateStatus.valid ? "text-gray-400" : "text-amber-600"}`}>
                  {dateStatus.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-4 w-full">
            <div className="w-1/2">
              <label htmlFor="crtc-reservation-name" className="text-gray-600">
                Court
              </label>
              <Dropdown
                label={
                  court === 0
                    ? "Select court"
                    : courtDropdownOptions[court - 1].label
                }
                value={court}
                onSelect={(x) => setCourt(x as number)}
                options={courtDropdownOptions}
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="crtc-reservation-name" className="text-gray-600">
                Time
              </label>
              <Dropdown
                label={
                  slot === 0
                    ? "Select a time"
                    : slotDropdownOptions[slot - 1].label
                }
                value={slot}
                onSelect={(x) => setSlot(x as number)}
                options={slotDropdownOptions}
              />
            </div>
          </div>
          <div className="flex w-full">
            <div className="w-full">
              <label htmlFor="crtc-reservation-name" className="text-gray-600">
                Players
              </label>
              <PlayersMultiSelect
                players={players}
                addPlayer={(val: string) => setPlayers([...players, val])}
                removePlayer={(val: string) =>
                  setPlayers(players.filter((player) => player !== val))
                }
              />
            </div>
          </div>

          <div className="flex w-full gap-2 items-center justify-end pt-2">
            <button
              onClick={handleOnClear}
              className="hover:cursor-pointer hover:bg-gray-300/80 rounded-lg py-2 px-6 text-sm flex justify-center items-center bg-gray-100 text-primary border-primary border"
            >
              Clear
            </button>
            <button
              onClick={() => createReservation()}
              disabled={!dateStatus?.valid}
              className="hover:cursor-pointer hover:bg-primary/80 border border-primary rounded-lg py-2 px-6 text-sm flex justify-center items-center bg-primary text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}

export default function Reserve() {
  return (
    <Suspense fallback={<Loading />}>
      <ReserveForm />
    </Suspense>
  );
}
