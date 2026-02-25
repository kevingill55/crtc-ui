"use client";

import Link from "next/link";
import { apiFetch } from "@/app/clients/api";
import { useProtectedRoute } from "@/app/hooks/useProtectedRoute";
import { Reservation } from "@/app/types";
import {
  faArrowRight,
  faBookmark,
  faCalendar,
  faCircleExclamation,
  faClock,
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
    month: "long",
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

function QuickActionCard({
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
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center gap-3 hover:border-primary/40 hover:shadow-md transition-all hover:cursor-pointer text-center h-full">
        <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center">
          <FontAwesomeIcon icon={icon} />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
        </div>
      </div>
    </Link>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  iconBg,
  iconColor,
  cardBg,
  border,
}: {
  icon: IconDefinition;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  cardBg: string;
  border: string;
}) {
  return (
    <div className={`${cardBg} ${border} border rounded-xl p-5`}>
      <div
        className={`${iconBg} ${iconColor} rounded-lg w-10 h-10 flex items-center justify-center mb-3`}
      >
        <FontAwesomeIcon icon={icon} />
      </div>
      <h3 className="font-semibold text-sm text-gray-800 mb-1">{title}</h3>
      <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function UpcomingPreview() {
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
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-primary">Upcoming Reservations</h2>
        <Link
          href="/member/reservations"
          className="text-xs text-primary/70 hover:text-primary flex items-center gap-1.5 transition-colors"
        >
          Manage all <FontAwesomeIcon icon={faArrowRight} size="xs" />
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 py-2">Loading...</p>
      ) : upcoming.length === 0 ? (
        <div className="py-8 flex flex-col items-center gap-2">
          <FontAwesomeIcon
            icon={faCircleExclamation}
            className="text-gray-300 text-2xl"
          />
          <p className="text-sm text-gray-500">No upcoming reservations</p>
          <Link
            href="/member/reserve"
            className="text-xs text-primary hover:underline mt-1"
          >
            Reserve a court →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {upcoming.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-blue-50 border-l-4 border-blue-300 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {getDateString(item.date)}
                </p>
              </div>
              <div className="text-right text-xs text-gray-500 shrink-0">
                <p>{getCourtsDisplay(item)}</p>
                <p>{getSlotsDisplay(item)}</p>
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
      <div className="flex flex-col gap-6 w-full pb-12">
        {/* Hero */}
        <div className="relative overflow-hidden w-full bg-gradient-to-br from-primary via-[#253c5b] to-secondary rounded-2xl p-8 text-white min-h-[170px] flex items-center">
          <span className="absolute -right-4 -top-6 text-[130px] opacity-10 select-none rotate-12 pointer-events-none">
            🎾
          </span>
          <span className="absolute right-28 -bottom-10 text-[90px] opacity-10 select-none -rotate-6 pointer-events-none">
            🎾
          </span>
          <div className="relative">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-2">
              Member Portal
            </p>
            <h1 className="text-3xl font-bold">
              {getGreeting()}, {user?.first_name ?? "Member"}!
            </h1>
            <p className="text-white/60 mt-1 text-sm">
              Charles River Tennis Club
            </p>
            <Link href="/member/reserve">
              <button className="mt-6 bg-classic-tennis hover:bg-classic-tennis/80 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:cursor-pointer transition-colors">
                Reserve a court
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          <QuickActionCard
            href="/member/reserve"
            icon={faBookmark}
            label="Reserve"
            sub="Book a court"
          />
          <QuickActionCard
            href="/member/reservations"
            icon={faCalendar}
            label="My Reservations"
            sub="Manage your schedule"
          />
          <QuickActionCard
            href="/member/leagues"
            icon={faTrophy}
            label="Leagues"
            sub="Enroll and view rosters"
          />
          <QuickActionCard
            href="/member/list"
            icon={faPeopleGroup}
            label="Members"
            sub="Club directory"
          />
        </div>

        {/* How It Works */}
        <div>
          <h2 className="text-base font-semibold text-primary mb-3">
            How It Works
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <FeatureCard
              icon={faClock}
              title="Booking Window"
              description="Court reservations open at 10 PM, exactly 7 days before your desired date."
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              cardBg="bg-blue-50"
              border="border-blue-200"
            />
            <FeatureCard
              icon={faUsers}
              title="Playing with Others"
              description="Add fellow members to your reservation so everyone can view and cancel it. Perfect for planning group sessions."
              iconBg="bg-green-100"
              iconColor="text-green-600"
              cardBg="bg-green-50"
              border="border-green-200"
            />
            <FeatureCard
              icon={faTrophy}
              title="League Play"
              description="CRTC offers organized leagues across multiple formats. Visit the Leagues page to see rosters and enroll when registration opens."
              iconBg="bg-amber-100"
              iconColor="text-amber-600"
              cardBg="bg-amber-50"
              border="border-amber-200"
            />
          </div>
        </div>

        {/* Upcoming preview */}
        <UpcomingPreview />
      </div>
    </ProtectedPage>
  );
}
