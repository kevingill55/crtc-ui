"use client";

import { useMemo } from "react";
import { toEasternISO } from "@/app/utils";
import { DayAvailability } from "@/app/types";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getAvailabilityColor(bookedSlots: number): string {
  if (bookedSlots <= 9) return "bg-green-400";
  if (bookedSlots <= 18) return "bg-yellow-400";
  if (bookedSlots <= 27) return "bg-orange-400";
  return "bg-red-500";
}

export default function MonthView({
  currentDate,
  availability,
  onSelectDate,
}: {
  currentDate: Date;
  availability: DayAvailability[];
  onSelectDate: (d: Date) => void;
}) {
  const today = toEasternISO(new Date());

  const availabilityMap = useMemo(() => {
    const map: Record<string, DayAvailability> = {};
    availability.forEach((a) => (map[a.date] = a));
    return map;
  }, [availability]);

  const weeks = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    // Grid starts on Monday on or before the first of the month
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(
      firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7)
    );

    // Grid ends on Sunday on or after the last of the month
    const gridEnd = new Date(lastOfMonth);
    const daysToAdd = (7 - lastOfMonth.getDay()) % 7;
    gridEnd.setDate(lastOfMonth.getDate() + daysToAdd);

    const cells: Date[] = [];
    const cursor = new Date(gridStart);
    while (cursor <= gridEnd) {
      cells.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    const result: Date[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      result.push(cells.slice(i, i + 7));
    }
    return result;
  }, [currentDate]);

  const currentMonth = currentDate.getMonth();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="bg-primary text-white text-sm font-medium p-2 text-center"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((week, wi) => (
        <div
          key={wi}
          className="grid grid-cols-7 border-b border-gray-100 last:border-b-0"
        >
          {week.map((day) => {
            const iso = toEasternISO(day);
            const isToday = iso === today;
            const isCurrentMonth = day.getMonth() === currentMonth;
            const avail = availabilityMap[iso];

            return (
              <div
                key={iso}
                className={`p-2 min-h-[80px] cursor-pointer hover:bg-gray-50 border-r border-gray-100 last:border-r-0 ${
                  isToday ? "ring-2 ring-primary ring-inset" : ""
                }`}
                onClick={() => onSelectDate(day)}
              >
                <div
                  className={`text-sm font-medium ${
                    isCurrentMonth ? "text-gray-800" : "text-gray-300"
                  }`}
                >
                  {day.getDate()}
                </div>
                {avail && avail.bookedSlots > 0 ? (
                  <div
                    className={`h-1.5 rounded-full mt-1 ${getAvailabilityColor(
                      avail.bookedSlots
                    )}`}
                  />
                ) : (
                  <div className="h-1.5 rounded-full mt-1 bg-gray-100" />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
