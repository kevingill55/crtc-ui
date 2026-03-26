"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { apiFetch } from "@/app/clients/api";
import { isWateringSlot, toEasternISO } from "@/app/utils";
import { GetSlotsApiResponse } from "@/app/types";

const COURTS = [1, 2, 3, 4];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TOTAL_BOOKABLE = 32; // 36 court-slots minus 4 watering slots

function getAvailable(slots: GetSlotsApiResponse["slots"]): number {
  let booked = 0;
  for (const slot of slots) {
    for (const court of COURTS) {
      if (!isWateringSlot(slot.slotIndex, court) && slot.reservationsByCourt[court]) {
        booked++;
      }
    }
  }
  return TOTAL_BOOKABLE - booked;
}

export default function WeekView({
  currentDate,
  onSelectDate,
}: {
  currentDate: Date;
  onSelectDate: (d: Date) => void;
}) {
  const weekDates = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - ((currentDate.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const weekDateIsos = useMemo(() => weekDates.map(toEasternISO), [weekDates]);
  const today = toEasternISO(new Date());

  const results = useQueries({
    queries: weekDateIsos.map((iso) => ({
      queryKey: ["getSlotsByDay", iso],
      queryFn: async (): Promise<GetSlotsApiResponse> => {
        const res = await apiFetch(`/api/reservations?date=${iso}`, { method: "GET" });
        return res.json();
      },
    })),
  });

  return (
    <div className="grid grid-cols-7 gap-3">
      {weekDates.map((d, i) => {
        const iso = weekDateIsos[i];
        const isToday = iso === today;
        const isPast = iso < today;
        const result = results[i];
        const slots = result.data?.slots;
        const available = slots ? getAvailable(slots) : null;
        const fillPct =
          available !== null
            ? ((TOTAL_BOOKABLE - available) / TOTAL_BOOKABLE) * 100
            : 0;

        return (
          <div
            key={iso}
            onClick={() => onSelectDate(d)}
            className={`bg-white rounded-xl border cursor-pointer hover:shadow-md transition-shadow p-4 flex flex-col gap-3 ${
              isToday
                ? "border-primary ring-2 ring-primary/20"
                : "border-gray-200 hover:border-gray-300"
            } ${isPast ? "opacity-50" : ""}`}
          >
            {/* Day header */}
            <div className="text-center">
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  isToday ? "text-primary" : "text-gray-400"
                }`}
              >
                {DAY_NAMES[i]}
              </p>
              <p
                className={`text-2xl font-bold leading-tight ${
                  isToday ? "text-primary" : "text-gray-800"
                }`}
              >
                {d.getDate()}
              </p>
            </div>

            {/* Availability count */}
            <div className="text-center min-h-[2rem] flex items-center justify-center">
              {result.isLoading ? (
                <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
              ) : available === null ? null : available === 0 ? (
                <p className="text-sm font-semibold text-red-400">Full</p>
              ) : (
                <p className="leading-none">
                  <span
                    className={`text-xl font-bold ${
                      available <= 8 ? "text-amber-500" : "text-primary"
                    }`}
                  >
                    {available}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">open</span>
                </p>
              )}
            </div>

            {/* Fill bar */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              {!result.isLoading && available !== null && (
                <div
                  className={`h-full rounded-full transition-all ${
                    available === 0
                      ? "bg-red-400"
                      : available <= 8
                      ? "bg-amber-400"
                      : "bg-primary/50"
                  }`}
                  style={{ width: `${fillPct}%` }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
