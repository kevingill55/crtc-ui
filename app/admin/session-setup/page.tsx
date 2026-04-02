"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import ProtectedPage from "@/app/components/ProtectedPage";
import { useProtectedRoute } from "@/app/hooks/useProtectedRoute";
import { apiFetch } from "@/app/clients/api";
import {
  NotificationStatus,
  useNotificationsContext,
} from "@/app/providers/Notifications";
import { League } from "@/app/types";

function nextFridays(startStr: string, endStr: string): Date[] {
  if (!startStr || !endStr) return [];
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");
  if (end < start) return [];

  const daysToFriday = (5 - start.getDay() + 7) % 7;
  const first = new Date(start);
  first.setDate(first.getDate() + daysToFriday);

  const dates: Date[] = [];
  const cur = new Date(first);
  while (cur <= end) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 7);
  }
  return dates;
}

export default function SessionSetup() {
  useProtectedRoute({ isAdmin: true });
  const { addNotification } = useNotificationsContext();

  const [leagueId, setLeagueId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeCourt2, setIncludeCourt2] = useState(false);

  const { data: leaguesData } = useQuery<{ success: boolean; data: League[] }>({
    queryKey: ["getLeagues"],
    queryFn: async () => {
      const res = await apiFetch("/api/leagues", { method: "GET" });
      return res.json();
    },
  });
  const leagues = leaguesData?.data ?? [];

  const preview = useMemo(() => nextFridays(startDate, endDate), [startDate, endDate]);

  const { mutate: bulkCreate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/leagues/${leagueId}/sessions/bulk`, {
        method: "POST",
        body: JSON.stringify({ start_date: startDate, end_date: endDate, include_court_2: includeCourt2 }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        addNotification({
          status: NotificationStatus.SUCCESS,
          id: "bulk-create",
          expiresIn: 5000,
          title: `${data.count} sessions created`,
        });
        setStartDate("");
        setEndDate("");
      } else {
        addNotification({
          status: NotificationStatus.ERROR,
          id: "bulk-create",
          expiresIn: 5000,
          title: data.message ?? "Failed to create sessions",
        });
      }
    },
  });

  const canSubmit = !!leagueId && !!startDate && !!endDate && preview.length > 0;

  return (
    <ProtectedPage
      title="Session setup"
      subtitle="Bulk-create sessions for a league"
    >
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-lg flex flex-col gap-6">
        {/* League */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">League</label>
          <select
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-1 focus:outline-primary"
          >
            <option value="">Select a league</option>
            {leagues.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-1 focus:outline-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-1 focus:outline-primary"
            />
          </div>
        </div>

        {/* Courts */}
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-600">Courts</p>
          <p className="text-xs text-gray-400">Slots 8 & 9 will be booked for each session.</p>
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 cursor-not-allowed opacity-50">
              <input type="checkbox" checked disabled className="accent-primary" />
              <span className="text-sm text-gray-700">Courts 3 & 4 (Upper) — always included</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCourt2}
                onChange={(e) => setIncludeCourt2(e.target.checked)}
                className="accent-primary"
              />
              <span className="text-sm text-gray-700">Court 2 (Lower) — extended daylight</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-600 font-medium">
              {preview.length} session{preview.length !== 1 ? "s" : ""} will be created:
            </p>
            <div className="max-h-52 overflow-y-auto flex flex-col gap-1 border border-gray-100 rounded-lg p-3 bg-gray-50">
              {preview.map((d, i) => (
                <p key={i} className="text-sm text-gray-700">
                  {d.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </p>
              ))}
            </div>
          </div>
        )}

        {startDate && endDate && preview.length === 0 && (
          <p className="text-sm text-amber-600">No Fridays found in that range.</p>
        )}

        <button
          onClick={() => bulkCreate()}
          disabled={!canSubmit || isPending}
          className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Creating..." : `Create ${preview.length > 0 ? preview.length + " " : ""}sessions`}
        </button>
      </div>
    </ProtectedPage>
  );
}
