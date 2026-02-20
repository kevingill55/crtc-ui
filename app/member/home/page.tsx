"use client";
import { useProtectedRoute } from "@/app/hooks/useProtectedRoute";
import { Reservation } from "@/app/types";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import ProtectedPage from "../../components/ProtectedPage";

const getDateString = (str: string) => {
  const date = new Date(str + "T00:00:00");
  const options = { year: "numeric", month: "long", day: "numeric" };
  // @ts-expect-error For absolutely no reason.
  return date.toLocaleDateString("en-US", options);
};

const TIME_SLOTS = [
  "",
  "8:30 - 10:00 am",
  "10:00 - 11:30 am",
  "11:30 - 1:00 pm",
  "1:00 - 2:30pm",
  "2:30 - 4:00 pm",
  "4:00 - 5:30 pm",
  "5:30 - 7:00 pm",
  "7:00 - 8:30 pm",
  "8:30 - 10:00 pm",
];

export const ReservationsCard = () => {
  const { user } = useProtectedRoute({ isAdmin: false });

  const { data: reservationsData, isLoading: loadingReservations } = useQuery<{
    data: Reservation[];
  }>({
    queryKey: ["getUpcomingReservations"],
    queryFn: async () => {
      const getUpcomingReservations = await fetch(
        `/api/reservations/${user?.id}`,
        { method: "GET" }
      );

      return getUpcomingReservations.json();
    },
  });

  if (loadingReservations) {
    return (
      <div className="w-full rounded-xl p-8 min-w-100 max-w-150 bg-white shadow-lg flex flex-col gap-6">
        <div className="flex gap-4 items-center">
          <div className="text-sm text-gray-600">Loading reservations</div>
          <div className="w-10 h-10 border-4 border-blue-500 animate-spin border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!reservationsData || reservationsData.data.length === 0) {
    return (
      <div className="w-full rounded-xl p-4 min-w-100 max-w-150 bg-white shadow-lg flex flex-col gap-6">
        <div className="border-b border-gray-200 pb-1 mb-2">
          <h2 className="text-xl font-bold">Schedule</h2>
        </div>
        <div className="flex flex-col justify-center items-center py-8">
          <div className="text-lg text-classic-tennis">
            <FontAwesomeIcon icon={faCircleExclamation} />
          </div>
          <div className="">No events</div>
          <div className="text-sm text-zinc-600">Reserve some court time!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl p-4 min-w-100 max-w-150 bg-white shadow-lg flex flex-col gap-2">
      <div className="border-b border-gray-200 pb-1 mb-2">
        <h2 className="text-xl font-bold">Schedule</h2>
      </div>
      <div>
        <div className="flex flex-col gap-3">
          {reservationsData.data.map((item) => (
            <div key={item.id}>
              <p className="text-sm text-gray-600">
                {getDateString(item.date)}
              </p>
              <div className="p-2 mt-1 bg-blue-50 flex border-l-4 hover:cursor-pointer hover:bg-blue-100 border-blue-300 rounded-lg w-full justify-between items-center">
                <p className="">{item.name}</p>
                <div className="px-2 flex justify-end items-center gap-6">
                  <div className="text-gray-600 leading-4 text-end text-sm">
                    <p className="">{`Court ${item.court}`}</p>
                    <p className="">{TIME_SLOTS[item.slot]}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <ProtectedPage title="Home">
      <div className="flex w-full gap-4 justify-between">
        <div className="w-full rounded-xl min-w-100 max-w-150 p-4 bg-white shadow-lg flex flex-col gap-6">
          <div className="border-b border-gray-200 pb-1 mb-2">
            <h2 className="text-xl font-bold">Announcements</h2>
          </div>
          <div className="flex flex-col justify-center items-center py-8">
            <div className="text-lg text-classic-tennis">
              <FontAwesomeIcon icon={faCircleExclamation} />
            </div>
            <div className="">No announcements</div>
            <div className="text-sm text-zinc-600">Check back soon</div>
          </div>
        </div>
        <ReservationsCard />
      </div>
    </ProtectedPage>
  );
}
