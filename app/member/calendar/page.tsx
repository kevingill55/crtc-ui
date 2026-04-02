"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { apiFetch } from "@/app/clients/api";
import ProtectedPage from "@/app/components/ProtectedPage";
import { toEasternISO } from "@/app/utils";
import { GetSlotsApiResponse } from "@/app/types";
import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DayView from "./DayView";
import WeekView from "./WeekView";

type CalendarView = "day" | "week";

export default function Calendar() {
  const [view, setView] = useState<CalendarView>("day");
  const [currentDate, setCurrentDate] = useState(new Date());

  const goPrev = () => {
    const d = new Date(currentDate);
    if (view === "day") d.setDate(d.getDate() - 1);
    if (view === "week") d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const goNext = () => {
    const d = new Date(currentDate);
    if (view === "day") d.setDate(d.getDate() + 1);
    if (view === "week") d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const label = useMemo(() => {
    if (view === "day") {
      return currentDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "America/New_York",
      });
    }
    const weekStart = new Date(currentDate);
    weekStart.setDate(
      currentDate.getDate() - ((currentDate.getDay() + 6) % 7)
    );
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const startLabel = weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "America/New_York",
    });
    const endLabel = weekEnd.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "America/New_York",
    });
    return `${startLabel} – ${endLabel}`;
  }, [view, currentDate]);

  const weekday =
    view === "day"
      ? currentDate.toLocaleDateString("en-US", {
          weekday: "long",
          timeZone: "America/New_York",
        })
      : null;

  const dateIso = toEasternISO(currentDate);
  const { data: dayData } = useQuery<GetSlotsApiResponse>({
    queryKey: ["getSlotsByDay", dateIso],
    queryFn: async () => {
      const res = await apiFetch(`/api/reservations?date=${dateIso}`, {
        method: "GET",
      });
      return res.json();
    },
    enabled: view === "day",
  });

  return (
    <ProtectedPage title="Calendar">
      <div className="h-full w-full">
        {/* Navigation bar */}
        <div className="flex items-center justify-between mb-4">
          {/* Left: prev / Today / next */}
          <div className="flex rounded-lg gap-1 border text-gray-600 p-1 border-gray-200 items-center bg-white">
            <button
              onClick={goPrev}
              className="hover:cursor-pointer rounded-lg hover:bg-gray-100 px-1.5 py-1"
            >
              <FontAwesomeIcon size="sm" icon={faCaretLeft} />
            </button>
            <div className="text-gray-300">|</div>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="hover:cursor-pointer rounded-lg hover:bg-gray-100 px-4 py-1"
            >
              Today
            </button>
            <div className="text-gray-300">|</div>
            <button
              onClick={goNext}
              className="hover:cursor-pointer rounded-lg hover:bg-gray-100 px-1.5 py-1"
            >
              <FontAwesomeIcon size="sm" icon={faCaretRight} />
            </button>
          </div>

          {/* Center: date label */}
          <div className="flex flex-col items-center">
            <h2 className="text-primary font-bold text-lg">{label}</h2>
            {weekday && (
              <p className="text-gray-600 leading-3 text-sm">{weekday}</p>
            )}
          </div>

          {/* Right: view toggle */}
          <div className="flex rounded-lg border border-gray-200 bg-white p-1 gap-1">
            {(["day", "week"] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded-md text-sm capitalize ${
                  view === v
                    ? "bg-primary text-white"
                    : "text-primary hover:bg-gray-100"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* View content */}
        {view === "day" && (
          <DayView slots={dayData?.slots || []} date={dateIso} />
        )}
        {view === "week" && (
          <WeekView
            currentDate={currentDate}
            onSelectDate={(d) => {
              setCurrentDate(d);
              setView("day");
            }}
          />
        )}
      </div>
    </ProtectedPage>
  );
}
