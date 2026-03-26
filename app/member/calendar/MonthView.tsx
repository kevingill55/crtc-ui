"use client";

import { useMemo } from "react";
import { toEasternISO } from "@/app/utils";
import { DayAvailability } from "@/app/types";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TOTAL_BOOKABLE = 32; // 36 court-slots minus 4 watering slots

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

    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(
      firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7)
    );
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
            const isPast = iso < today;
            const isCurrentMonth = day.getMonth() === currentMonth;
            const avail = availabilityMap[iso];
            const open =
              avail !== undefined ? TOTAL_BOOKABLE - avail.bookedSlots : null;

            // Determine cell style based on availability
            let cellBg = "";
            let labelText = "";
            let labelCls = "";

            if (isCurrentMonth && !isPast && open !== null) {
              if (open === 0) {
                cellBg = "bg-red-50";
                labelText = "Full";
                labelCls = "text-red-400 font-medium";
              } else if (open <= 8) {
                cellBg = "bg-amber-50";
                labelText = `${open} open`;
                labelCls = "text-amber-600";
              } else {
                cellBg = "bg-green-50";
                labelText = `${open} open`;
                labelCls = "text-green-600";
              }
            }

            return (
              <div
                key={iso}
                className={`p-2 min-h-[80px] cursor-pointer border-r border-gray-100 last:border-r-0 transition-colors
                  ${cellBg}
                  ${isToday ? "ring-2 ring-primary ring-inset" : ""}
                  ${isCurrentMonth && !isPast ? "hover:brightness-95" : "hover:bg-gray-50"}
                  ${!isCurrentMonth ? "opacity-40" : ""}
                `}
                onClick={() => onSelectDate(day)}
              >
                <p
                  className={`text-sm font-semibold ${
                    isToday
                      ? "text-primary"
                      : isPast || !isCurrentMonth
                      ? "text-gray-400"
                      : "text-gray-800"
                  }`}
                >
                  {day.getDate()}
                </p>
                {labelText && (
                  <p className={`text-xs mt-1 ${labelCls}`}>{labelText}</p>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
