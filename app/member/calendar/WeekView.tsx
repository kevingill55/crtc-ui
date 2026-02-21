"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { apiFetch } from "@/app/clients/api";
import { toEasternISO } from "@/app/utils";
import { GetSlotsApiResponse } from "@/app/types";

const COURTS = [1, 2, 3, 4];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Slot start times matching constants.py
const SLOT_LABELS = [
  "8:30 AM",
  "10:00 AM",
  "11:30 AM",
  "1:00 PM",
  "2:30 PM",
  "4:00 PM",
  "5:30 PM",
  "7:00 PM",
  "8:30 PM",
];

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

  const weekDateIsos = useMemo(
    () => weekDates.map(toEasternISO),
    [weekDates]
  );

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

  const slotsByDate: Record<string, GetSlotsApiResponse["slots"]> = {};
  weekDateIsos.forEach((iso, i) => {
    slotsByDate[iso] = results[i].data?.slots || [];
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="bg-primary text-white text-sm font-medium p-3 w-24 text-left">
              Time
            </th>
            {weekDates.map((d, i) => {
              const iso = weekDateIsos[i];
              const isToday = iso === today;
              return (
                <th
                  key={iso}
                  className="bg-primary text-white text-sm font-medium p-2 text-center"
                >
                  <div className={isToday ? "font-bold underline" : ""}>
                    {DAY_NAMES[i]}
                  </div>
                  <div className="text-xs opacity-80">{d.getDate()}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {SLOT_LABELS.map((label, slotIdx) => (
            <tr key={slotIdx} className="border-t border-gray-100">
              <td className="text-right pr-3 text-sm text-gray-500 w-24 py-3 pl-2">
                {label}
              </td>
              {weekDates.map((d, dayIdx) => {
                const iso = weekDateIsos[dayIdx];
                const slots = slotsByDate[iso];
                const slot = slots[slotIdx];
                const isToday = iso === today;

                return (
                  <td
                    key={iso}
                    className={`p-2 text-center cursor-pointer hover:bg-gray-50 ${
                      isToday ? "bg-blue-50" : ""
                    }`}
                    onClick={() => onSelectDate(d)}
                  >
                    <div className="grid grid-cols-2 gap-1 w-fit mx-auto">
                      {COURTS.map((court) => {
                        const booked = slot
                          ? court in slot.reservationsByCourt
                          : false;
                        return (
                          <div
                            key={court}
                            className={`w-2.5 h-2.5 rounded-full ${
                              booked ? "bg-amber-400" : "bg-gray-200"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
