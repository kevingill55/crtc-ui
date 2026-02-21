"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { apiFetch } from "@/app/clients/api";
import ProtectedPage from "@/app/components/ProtectedPage";
import { toEasternISO } from "@/app/utils";
import { DayAvailability, GetSlotsApiResponse } from "@/app/types";
import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DayView from "./DayView";
import WeekView from "./WeekView";
import MonthView from "./MonthView";

type CalendarView = "day" | "week" | "month";

export default function Calendar() {
  const [view, setView] = useState<CalendarView>("day");
  const [currentDate, setCurrentDate] = useState(new Date());

  const goPrev = () => {
    const d = new Date(currentDate);
    if (view === "day") d.setDate(d.getDate() - 1);
    if (view === "week") d.setDate(d.getDate() - 7);
    if (view === "month") d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const goNext = () => {
    const d = new Date(currentDate);
    if (view === "day") d.setDate(d.getDate() + 1);
    if (view === "week") d.setDate(d.getDate() + 7);
    if (view === "month") d.setMonth(d.getMonth() + 1);
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
    if (view === "week") {
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
    }
    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "America/New_York",
    });
  }, [view, currentDate]);

  // Day view data
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

  // Month view: compute full visible grid range
  const { monthStart, monthEnd } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(
      firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7)
    );
    const gridEnd = new Date(lastOfMonth);
    gridEnd.setDate(
      lastOfMonth.getDate() + ((7 - lastOfMonth.getDay()) % 7)
    );

    return {
      monthStart: toEasternISO(gridStart),
      monthEnd: toEasternISO(gridEnd),
    };
  }, [currentDate]);

  const { data: availabilityData } = useQuery<{
    success: boolean;
    data: DayAvailability[];
  }>({
    queryKey: ["availability", monthStart, monthEnd],
    queryFn: async () => {
      const res = await apiFetch(
        `/api/reservations/availability?start=${monthStart}&end=${monthEnd}`,
        { method: "GET" }
      );
      return res.json();
    },
    enabled: view === "month",
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
          <h2 className="text-primary font-bold text-lg">{label}</h2>

          {/* Right: view toggle */}
          <div className="flex rounded-lg border border-gray-200 bg-white p-1 gap-1">
            {(["day", "week", "month"] as CalendarView[]).map((v) => (
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
        {view === "day" && <DayView slots={dayData?.slots || []} date={dateIso} />}
        {view === "week" && (
          <WeekView
            currentDate={currentDate}
            onSelectDate={(d) => {
              setCurrentDate(d);
              setView("day");
            }}
          />
        )}
        {view === "month" && (
          <MonthView
            currentDate={currentDate}
            availability={availabilityData?.data || []}
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
