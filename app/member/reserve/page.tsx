"use client";

import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import ProtectedPage from "@/app/components/ProtectedPage";
import { useProtectedRoute } from "@/app/hooks/useProtectedRoute";
import {
  NotificationStatus,
  useNotificationsContext,
} from "@/app/providers/Notifications";
import { apiFetch } from "@/app/clients/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loading } from "@/app/components/Loading";
import { toEasternISO } from "@/app/utils";
import { PlayersMultiSelect } from "./PlayersMultiSelect";
import { SlotCourtGrid } from "./SlotCourtGrid";
import { GetSlotsApiResponse, League, MemberRole } from "@/app/types";

const courtDropdownOptions: DropdownOption[] = [
  { label: "Court 1 (Lower)", value: 1 },
  { label: "Court 2 (Lower)", value: 2 },
  { label: "Court 3 (Upper)", value: 3 },
  { label: "Court 4 (Upper)", value: 4 },
];

const slotDropdownOptions: DropdownOption[] = [
  { label: "8:30 - 10:00 am", value: 1 },
  { label: "10:00 - 11:30 am", value: 2 },
  { label: "11:30 - 1:00 pm", value: 3 },
  { label: "1:00 - 2:30 pm", value: 4 },
  { label: "2:30 - 4:00 pm", value: 5 },
  { label: "4:00 - 5:30 pm", value: 6 },
  { label: "5:30 - 7:00 pm", value: 7 },
  { label: "7:00 - 8:30 pm", value: 8 },
  { label: "8:30 - 10:00 pm", value: 9 },
];

function ReserveForm() {
  const { addNotification } = useNotificationsContext();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const { user, isAdmin } = useProtectedRoute({ isAdmin: false });
  const isLeagueCoordinator = user?.role === MemberRole.LEAGUE_COORDINATOR;

  // Coordinators and admins choose between their elevated event type or a personal court time.
  const [bookingMode, setBookingMode] = useState<
    "league" | "club" | "personal"
  >("league");

  // Default admins to "club" mode once the role is known.
  useEffect(() => {
    if (isAdmin) setBookingMode("club");
  }, [isAdmin]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);

  // Show the league/club multi-slot form vs the regular single-slot form.
  const showLeagueForm =
    bookingMode !== "personal" && (isAdmin || isLeagueCoordinator);
  // Skip the 7-day booking window when booking as league/admin.
  const skipBookingWindow = showLeagueForm;

  const [date, setDate] = useState(searchParams.get("date") || "");
  const [slot, setSlot] = useState(Number(searchParams.get("slot")) || 0);
  const [court, setCourt] = useState(Number(searchParams.get("court")) || 0);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [players, setPlayers] = useState<string[]>([]);

  // Pre-select the current user when in personal/regular booking mode.
  useEffect(() => {
    if (!showLeagueForm && user?.id && !players.includes(user.id)) {
      setPlayers([user.id]);
    }
  }, [showLeagueForm, user?.id]);
  const [reservationName, setReservationName] = useState("");
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState(4);

  // Booking window: opens at 22:00 ET, 7 days before the target date.
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
    if (date < minDate)
      return { valid: false, message: "Cannot book a date in the past." };
    if (!skipBookingWindow && date > maxDate) {
      const [y, m, d] = date.split("-").map(Number);
      const opensDate = new Date(y, m - 1, d - 7).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return {
        valid: false,
        message: `Booking window not yet open — opens ${opensDate} at 10:00 PM ET.`,
      };
    }
    if (!skipBookingWindow) {
      const [my, mm, md] = maxDate.split("-").map(Number);
      const maxFormatted = new Date(my, mm - 1, md).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" }
      );
      return {
        valid: true,
        message: `Booking window open through ${maxFormatted}.`,
      };
    }
    return { valid: true, message: null };
  }, [date, minDate, maxDate, skipBookingWindow]);

  // Fetch all leagues this coordinator is assigned to.
  const { data: myLeaguesData, isLoading: leaguesLoading } = useQuery<{
    success: boolean;
    data: League[];
  }>({
    queryKey: ["getMyLeagues"],
    queryFn: async () => {
      const res = await apiFetch("/api/leagues/mine", { method: "GET" });
      return res.json();
    },
    enabled: isLeagueCoordinator,
  });
  const myLeagues = myLeaguesData?.data ?? [];

  // Auto-select when there's only one league.
  useEffect(() => {
    if (myLeagues.length === 1 && !selectedLeagueId) {
      setSelectedLeagueId(myLeagues[0].id);
    }
  }, [myLeagues]);

  const selectedLeague =
    myLeagues.find((l) => l.id === selectedLeagueId) ?? null;

  // Pre-fill name whenever the selected league changes.
  useEffect(() => {
    if (selectedLeague) {
      setReservationName(selectedLeague.name);
    }
  }, [selectedLeagueId]);

  // Fetch availability for the selected date.
  const { data: slotsData } = useQuery<GetSlotsApiResponse>({
    queryKey: ["getSlotsByDay", date],
    queryFn: async () => {
      const res = await apiFetch(`/api/reservations?date=${date}`, {
        method: "GET",
      });
      return res.json();
    },
    enabled: !!date && dateStatus?.valid !== false,
  });

  const bookedCells = useMemo<Set<string>>(() => {
    if (!slotsData?.slots) return new Set();
    const cells = new Set<string>();
    for (const slotData of slotsData.slots) {
      for (const courtKey of Object.keys(slotData.reservationsByCourt)) {
        cells.add(`${slotData.slotIndex}-${courtKey}`);
      }
    }
    return cells;
  }, [slotsData]);

  // Available court options for REGULAR (filtered by selected slot).
  const availableCourtOptions = useMemo(() => {
    if (!slot) return courtDropdownOptions;
    return courtDropdownOptions.filter(
      (opt) => !bookedCells.has(`${slot}-${opt.value}`)
    );
  }, [slot, bookedCells]);

  // Reset court if it becomes unavailable.
  useEffect(() => {
    if (court !== 0 && slot !== 0 && bookedCells.has(`${slot}-${court}`)) {
      setCourt(0);
    }
  }, [slot, bookedCells, court]);

  const handleToggleCell = (s: number, c: number) => {
    const key = `${s}-${c}`;
    setSelectedCells((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleOnClear = () => {
    setPlayers([]);
    setDate("");
    setSlot(0);
    setCourt(0);
    setSelectedCells(new Set());
    setReservationName(selectedLeague?.name ?? "");
    setRepeatWeekly(false);
    setRepeatWeeks(4);
  };

  const handleModeSwitch = (mode: "league" | "club" | "personal") => {
    setBookingMode(mode);
    setDate("");
    setSlot(0);
    setCourt(0);
    setSelectedCells(new Set());
    setPlayers(mode === "personal" && user?.id ? [user.id] : []);
    setReservationName(mode === "league" ? selectedLeague?.name ?? "" : "");
  };

  const { mutate: createReservation, isPending } = useMutation({
    onSuccess: (result: unknown) => {
      queryClient.invalidateQueries({ queryKey: ["getSlotsByDay"] });
      handleOnClear();
      const count = (result as { count?: number })?.count;
      addNotification({
        status: NotificationStatus.SUCCESS,
        id: "temp",
        expiresIn: 5000,
        title:
          count !== undefined && count > 1
            ? `${count} reservations created`
            : "Reservation created",
      });
    },
    mutationFn: async () => {
      if (showLeagueForm) {
        const slots_arr = [
          ...new Set([...selectedCells].map((k) => Number(k.split("-")[0]))),
        ];
        const courts_arr = [
          ...new Set([...selectedCells].map((k) => Number(k.split("-")[1]))),
        ];
        const dates: string[] = [];
        if (repeatWeekly) {
          const [y, m, d] = date.split("-").map(Number);
          for (let i = 0; i < repeatWeeks; i++) {
            const dt = new Date(y, m - 1, d + i * 7);
            dates.push(toEasternISO(dt));
          }
        } else {
          dates.push(date);
        }

        const type = isAdmin ? "CLUB" : "LEAGUE";
        let successCount = 0;
        for (const dt of dates) {
          const res = await apiFetch(`/api/reservations`, {
            method: "POST",
            body: JSON.stringify({
              type,
              slots: slots_arr,
              courts: courts_arr,
              players,
              date: dt,
              name: reservationName,
              ...(type === "LEAGUE" && { league_id: selectedLeagueId }),
            }),
          });
          if (res.ok) successCount++;
        }
        return { count: successCount };
      } else {
        const res = await apiFetch(`/api/reservations`, {
          method: "POST",
          body: JSON.stringify({
            type: "REGULAR",
            slot,
            court,
            players,
            date,
          }),
        });
        return res.json();
      }
    },
  });

  const leagueSubmitReady =
    selectedCells.size > 0 &&
    !!reservationName.trim() &&
    (!isLeagueCoordinator || (!leaguesLoading && !!selectedLeagueId));

  const isSubmitDisabled =
    isPending ||
    !dateStatus?.valid ||
    (showLeagueForm ? !leagueSubmitReady : slot === 0 || court === 0);

  return (
    <ProtectedPage title="Reserve">
      <div className="w-full pt-2 flex flex-col h-full gap-6">
        {/* Header */}
        <div>
          <h1 className="text-primary font-bold text-2xl">
            Schedule court time
          </h1>
          <p className="text-sm text-gray-500">
            {showLeagueForm
              ? "Create reservations for league matches and club events."
              : "Create reservations and include all members of your party; you can only reserve court time once per day."}
          </p>

          {/* Mode toggle — admins and coordinators */}
          {(isAdmin || isLeagueCoordinator) && (
            <div className="mt-3 flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
              <button
                onClick={() => handleModeSwitch(isAdmin ? "club" : "league")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors hover:cursor-pointer ${
                  bookingMode !== "personal"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {isAdmin ? "Club event" : "League event"}
              </button>
              <button
                onClick={() => handleModeSwitch("personal")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors hover:cursor-pointer ${
                  bookingMode === "personal"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Play on your own
              </button>
            </div>
          )}

          {/* League identity badge */}
          {isLeagueCoordinator && bookingMode === "league" && (
            <div className="mt-2">
              {leaguesLoading ? (
                <span className="text-xs text-gray-400">
                  Loading leagues...
                </span>
              ) : myLeagues.length === 0 ? (
                <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-1">
                  You are not assigned to any leagues — contact an admin to book
                  league events.
                </div>
              ) : selectedLeague ? (
                <span className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  Booking for: {selectedLeague.name}
                </span>
              ) : null}
            </div>
          )}
        </div>

        <div className="bg-white flex flex-col min-w-160 w-full gap-6 rounded-lg p-8">
          {/* League picker — only shown when coordinator has multiple leagues */}
          {isLeagueCoordinator &&
            bookingMode === "league" &&
            myLeagues.length > 1 && (
              <div className="flex flex-col gap-2">
                <label className="text-gray-600">League</label>
                <Dropdown
                  label={selectedLeague?.name ?? "Select a league"}
                  value={selectedLeagueId ?? ""}
                  onSelect={(v) => setSelectedLeagueId(v as string)}
                  options={myLeagues.map((l) => ({
                    label: l.name,
                    value: l.id,
                  }))}
                />
              </div>
            )}

          {/* Date */}
          <div className="flex flex-col gap-2">
            <label htmlFor="crtc-reservation-date" className="text-gray-600">
              Date
            </label>
            <input
              id="crtc-reservation-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              min={minDate}
              max={skipBookingWindow ? undefined : maxDate}
              className="w-52 px-4 py-2 rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary hover:border-gray-500"
            />
            {dateStatus?.message && (
              <p
                className={`text-xs ${
                  dateStatus.valid ? "text-gray-400" : "text-amber-600"
                }`}
              >
                {dateStatus.message}
              </p>
            )}
          </div>

          {/* Form body */}
          {!showLeagueForm ? (
            /* REGULAR form */
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-4 w-full">
                <div className="w-1/2">
                  <label className="text-gray-600">Court</label>
                  <Dropdown
                    label={
                      court === 0
                        ? "Select court"
                        : courtDropdownOptions.find((o) => o.value === court)
                            ?.label ?? "Select court"
                    }
                    value={court}
                    onSelect={(x) => setCourt(x as number)}
                    options={availableCourtOptions}
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-gray-600">Time</label>
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
                  {slot !== 0 && slotsData && (
                    <p className="text-xs text-gray-500 mt-1">
                      {availableCourtOptions.length} court
                      {availableCourtOptions.length !== 1 ? "s" : ""} available
                      at this time
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* LEAGUE / CLUB form */
            <div className="flex flex-col gap-4">
              <div className="flex flex-col mb-2">
                <label className="text-gray-600">Event name</label>
                <input
                  type="text"
                  placeholder="Club event"
                  value={reservationName}
                  onChange={(e) => setReservationName(e.target.value)}
                  className="w-1/2 mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary hover:border-gray-500"
                />
              </div>
              <div>
                <SlotCourtGrid
                  selectedCells={selectedCells}
                  onToggle={handleToggleCell}
                  bookedCells={bookedCells}
                />
                {selectedCells.size > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    All selected time slots will be booked across all selected
                    courts.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Recurring option — admin club events only */}
          {isAdmin && bookingMode === "club" && (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={repeatWeekly}
                  onChange={(e) => setRepeatWeekly(e.target.checked)}
                  className="accent-primary"
                />
                Repeat weekly
              </label>
              {repeatWeekly && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">for</span>
                  <input
                    type="number"
                    min={1}
                    max={26}
                    value={repeatWeeks}
                    onChange={(e) =>
                      setRepeatWeeks(
                        Math.max(1, Math.min(26, Number(e.target.value)))
                      )
                    }
                    className="w-16 px-2 py-1 rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary text-center"
                  />
                  <span className="text-sm text-gray-600">weeks</span>
                </div>
              )}
            </div>
          )}

          {/* Players */}
          <div className="flex w-1/2">
            <div className="w-full">
              <label className="text-gray-600">Players</label>
              <PlayersMultiSelect
                players={players}
                onSave={(newPlayers) => setPlayers(newPlayers)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex w-full gap-2 items-center justify-end pt-2">
            <button
              onClick={handleOnClear}
              className="hover:cursor-pointer hover:bg-gray-300/80 rounded-lg py-2 px-6 text-sm flex justify-center items-center bg-gray-100 text-primary border-primary border"
            >
              Clear
            </button>
            <button
              onClick={() => createReservation()}
              disabled={isSubmitDisabled}
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
