"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { apiFetch } from "@/app/clients/api";
import {
  isWateringSlot,
  toEasternISO,
  getSlotOverviewLabel,
} from "@/app/utils";
import { GetSlotsApiResponse, Slot } from "@/app/types";

const COURTS = [1, 2, 3, 4];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOT_INDICES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function slotStartTime(slotIndex: number): string {
  return getSlotOverviewLabel(slotIndex).split(" – ")[0];
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
        const res = await apiFetch(`/api/reservations?date=${iso}`, {
          method: "GET",
        });
        return res.json();
      },
    })),
  });

  const slotMaps = results.map((result) => {
    const map: Record<number, Slot> = {};
    if (result.data?.slots) {
      for (const slot of result.data.slots) map[slot.slotIndex] = slot;
    }
    return map;
  });

  const colTemplate = "4rem repeat(7, 1fr)";

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Day headers */}
      <div
        className="grid border-b border-gray-200 shrink-0"
        style={{ gridTemplateColumns: colTemplate }}
      >
        <div className="bg-primary" />
        {weekDates.map((d, i) => {
          const iso = weekDateIsos[i];
          const isToday = iso === today;
          return (
            <div
              key={iso}
              onClick={() => onSelectDate(d)}
              className={`text-center py-3 px-2 border-l border-white/20 cursor-pointer transition-colors ${
                isToday ? "bg-primary/80" : "bg-primary hover:bg-primary/90"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                {DAY_NAMES[i]}
              </p>
              <p
                className={`text-xl font-bold text-white ${
                  isToday ? "underline underline-offset-2" : ""
                }`}
              >
                {d.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Slot rows */}
      <div className="flex-1 flex flex-col min-h-0">
        {SLOT_INDICES.map((slotIdx) => (
          <div
            key={slotIdx}
            className="flex-1 grid border-b border-gray-100 last:border-b-0 min-h-0"
            style={{ gridTemplateColumns: colTemplate }}
          >
            {/* Time label */}
            <div className="flex items-center justify-end pr-3 text-xs text-gray-400 bg-gray-50 border-r border-gray-200 shrink-0">
              {slotStartTime(slotIdx)}
            </div>

            {/* Day cells */}
            {weekDates.map((d, i) => {
              const iso = weekDateIsos[i];
              const isPast = iso < today;
              const isToday = iso === today;
              const result = results[i];
              const slot = slotMaps[i][slotIdx];

              return (
                <div
                  key={iso}
                  onClick={() => onSelectDate(d)}
                  className={`border-l border-gray-100 flex items-center justify-center cursor-pointer transition-colors hover:bg-gray-50 ${
                    isToday ? "bg-primary/5" : ""
                  } ${isPast ? "opacity-40" : ""}`}
                >
                  <div className="flex gap-1">
                    {COURTS.map((court) => {
                      const isWatering = isWateringSlot(slotIdx, court);
                      const isBooked = slot
                        ? !!slot.reservationsByCourt[court]
                        : false;
                      return (
                        <span
                          key={court}
                          className={`w-3 h-3 rounded-full ${
                            result.isLoading
                              ? "bg-gray-100 animate-pulse"
                              : isWatering
                              ? "bg-sky-200"
                              : isBooked
                              ? "bg-gray-300"
                              : "bg-amber-200"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
