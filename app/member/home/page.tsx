"use client";

import Link from "next/link";
import { apiFetch } from "@/app/clients/api";
import { useProtectedRoute } from "@/app/hooks/useProtectedRoute";
import { Reservation } from "@/app/types";
import {
  faArrowRight,
  faBookmark,
  faCalendar,
  faClock,
  faMoon,
  faPeopleGroup,
  faTrophy,
  faUsers,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import ProtectedPage from "../../components/ProtectedPage";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getDateString = (str: string) =>
  new Date(str + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });

const TIME_SLOTS = [
  "",
  "8:30 – 10:00 am",
  "10:00 – 11:30 am",
  "11:30 – 1:00 pm",
  "1:00 – 2:30 pm",
  "2:30 – 4:00 pm",
  "4:00 – 5:30 pm",
  "5:30 – 7:00 pm",
  "7:00 – 8:30 pm",
  "8:30 – 10:00 pm",
];

const getSlotsDisplay = (item: Reservation) => {
  const slots = item.slots?.length ? item.slots : [item.slot];
  if (slots.length === 1) return TIME_SLOTS[slots[0]];
  const start = TIME_SLOTS[Math.min(...slots)].split(" – ")[0];
  const end = TIME_SLOTS[Math.max(...slots)].split(" – ")[1];
  return `${start} – ${end}`;
};

const getCourtsDisplay = (item: Reservation) => {
  const courts = item.courts?.length ? item.courts : [item.court];
  return courts.length === 1
    ? `Court ${courts[0]}`
    : `Courts ${courts.join(", ")}`;
};

function NavCard({
  href,
  icon,
  label,
  sub,
}: {
  href: string;
  icon: IconDefinition;
  label: string;
  sub: string;
}) {
  return (
    <Link href={href}>
      <div className="group bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer">
        <div className="bg-primary/8 text-primary rounded-xl w-11 h-11 flex items-center justify-center shrink-0">
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">{label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        </div>
        <FontAwesomeIcon
          icon={faArrowRight}
          className="text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 text-xs"
        />
      </div>
    </Link>
  );
}

function InfoTile({
  icon,
  title,
  body,
  num,
}: {
  icon: IconDefinition;
  title: string;
  body: string;
  num: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="bg-gray-50 text-gray-400 rounded-xl w-10 h-10 flex items-center justify-center">
          <FontAwesomeIcon icon={icon} size="sm" />
        </div>
        <span className="text-3xl font-bold text-gray-100 leading-none select-none">
          {num}
        </span>
      </div>
      <div>
        <p className="font-semibold text-gray-800 text-sm">{title}</p>
        <p className="text-xs text-gray-500 leading-relaxed mt-1">{body}</p>
      </div>
    </div>
  );
}

function UpcomingReservations() {
  const { data, isLoading } = useQuery<{ data: Reservation[] }>({
    queryKey: ["getUpcomingReservations"],
    queryFn: async () => {
      const res = await apiFetch("/api/reservations/upcoming", {
        method: "GET",
      });
      return res.json();
    },
  });

  const upcoming = (data?.data ?? []).slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-semibold text-gray-800">Upcoming Reservations</h2>
        <Link
          href="/member/reservations"
          className="group text-xs font-medium text-gray-400 hover:text-primary flex items-center gap-1.5 transition-colors"
        >
          Manage all
          <FontAwesomeIcon
            icon={faArrowRight}
            size="xs"
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <div className="py-10 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
            <FontAwesomeIcon icon={faCalendar} className="text-gray-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              No upcoming reservations
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Book a court to get started
            </p>
          </div>
          <Link
            href="/member/reserve"
            className="mt-1 text-xs font-semibold text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors px-4 py-1.5 rounded-lg"
          >
            Reserve a court
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {upcoming.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-tennis shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {getDateString(item.date)}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-gray-500 shrink-0">
                <p className="font-medium">{getCourtsDisplay(item)}</p>
                <p className="text-gray-400">{getSlotsDisplay(item)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { user } = useProtectedRoute({ isAdmin: false });

  return (
    <ProtectedPage>
      <div className="flex flex-col gap-5 w-full pb-12">
        {/* Hero */}
        <div className="relative overflow-hidden w-full bg-linear-to-br from-primary via-[#253c5b] to-secondary rounded-3xl p-10 text-white">
          {/* Glow orbs */}
          <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-tennis/10 blur-3xl pointer-events-none" />
          <div className="absolute right-40 -bottom-16 w-48 h-48 rounded-full bg-secondary/40 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <p className="text-amber-300 text-xs uppercase tracking-widest font-semibold mb-3">
              Charles River Tennis Club
            </p>
            <h1 className="text-4xl font-bold leading-tight">
              {getGreeting()}
              {", "}
              {user?.first_name ?? "Member"}
            </h1>
            <p className="text-white/70 text-sm mt-2 max-w-md">
              Welcome to your member portal. Book courts, track leagues, and
              connect with fellow members.
            </p>
            <div className="flex gap-3 mt-6">
              <Link href="/member/reserve">
                <button className="bg-amber-300 text-primary font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-amber-300/80 transition-colors cursor-pointer">
                  Reserve a court
                </button>
              </Link>
              <Link href="/member/calendar">
                <button className="border border-white/20 text-white text-sm px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                  View calendar
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-3 gap-5">
          {/* Left col: Nav cards + info tiles */}
          <div className="col-span-2 flex flex-col gap-5">
            {/* Navigation cards */}
            <div className="grid grid-cols-2 gap-3">
              <NavCard
                href="/member/reserve"
                icon={faBookmark}
                label="Reserve"
                sub="Book a court up to 7 days out"
              />
              <NavCard
                href="/member/reservations"
                icon={faCalendar}
                label="My Schedule"
                sub="View and manage your bookings"
              />
              <NavCard
                href="/member/leagues"
                icon={faTrophy}
                label="Leagues"
                sub="Rosters, enrollment, standings"
              />
              <NavCard
                href="/member/friday"
                icon={faMoon}
                label="Friday Night Tennis"
                sub="Organized play and social tennis"
              />
              <NavCard
                href="/member/list"
                icon={faPeopleGroup}
                label="Members"
                sub="Browse the club directory"
              />
            </div>

            {/* Info tiles */}
            <div className="grid grid-cols-3 gap-3">
              <InfoTile
                num={1}
                icon={faClock}
                title="Booking Window"
                body="Reservations open at 10 PM, exactly 7 days before your desired date."
              />
              <InfoTile
                num={2}
                icon={faUsers}
                title="Group Play"
                body="Add fellow members to your reservation so everyone can view and manage it."
              />
              <InfoTile
                num={3}
                icon={faTrophy}
                title="Leagues"
                body="Singles and doubles leagues run June–August with playoffs in the fall."
              />
            </div>
          </div>

          {/* Right col: Upcoming */}
          <div className="col-span-1">
            <UpcomingReservations />
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
