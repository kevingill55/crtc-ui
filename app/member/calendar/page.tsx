"use client";
import ProtectedPage from "@/app/components/ProtectedPage";
import { GetSlotsApiResponse, Slot } from "@/app/types";
import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

const formatTimeString = (timeStr: string) => {
  const [h, m] = timeStr.split(":");
  const hours = parseInt(h);
  const period = hours >= 12 ? "PM" : "AM";

  return `${hours % 12 || 12}:${m} ${period}`;
};

const CalendarCourtCard = ({
  courtNum,
  slots,
}: {
  courtNum: number;
  slots: Slot[];
}) => {
  return (
    <div className=" bg-white pb-4 px-2 w-full flex flex-col justify-between">
      <p className="text-center font-bold py-2 border-b border-gray-200">
        {`Court ${courtNum}`}
      </p>
      {slots.map((slot, i) => (
        <div key={`${slot}-${i}`}>
          <p className="text-sm text-gray-600 mb-1">{`${formatTimeString(
            slot.startTime
          )} - ${formatTimeString(slot.endTime)}`}</p>
          {courtNum in slot.reservationsByCourt ? (
            <div className="hover:cursor-pointer hover:bg-amber-100 p-2 bg-amber-50 rounded-lg flex">
              <p className="text-sm">
                {slot.reservationsByCourt[courtNum].name}
              </p>
            </div>
          ) : (
            <div className="hover:cursor-pointer hover:bg-blue-100 p-2 bg-blue-50 rounded-lg flex">
              <p className="text-sm text-gray-600">Available</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const dateOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "EST",
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { dateIso, dateString } = useMemo(() => {
    return {
      // @ts-expect-error For no apparent reason
      dateString: currentDate.toLocaleDateString("en-US", dateOptions),
      dateIso: currentDate.toISOString().split(":")[0],
    };
  }, [currentDate]);

  const { data: reservations } = useQuery<GetSlotsApiResponse>({
    queryKey: ["getSlotsByDay", dateIso],
    queryFn: async () => {
      const listReservationsFetch = await fetch(
        `/api/reservations?date=${dateIso}`,
        { method: "GET" }
      );
      return listReservationsFetch.json();
    },
  });

  return (
    <ProtectedPage title="Calendar">
      <div className="h-full w-full">
        <div>
          <div className="flex gap-6 items-center">
            <div className="flex rounded-lg gap-1 border text-gray-600 p-1 border-gray-200 items-center bg-white">
              <button
                onClick={() => {
                  const prevDay = new Date();
                  prevDay.setDate(currentDate.getDate() - 1);
                  setCurrentDate(prevDay);
                }}
                className="hover:cursor-pointer rounded-lg hover:bg-gray-100 px-1.5 py-1"
              >
                <FontAwesomeIcon size="sm" icon={faCaretLeft} />
              </button>
              <div className="text-gray-300">|</div>
              <button
                onClick={() => {
                  setCurrentDate(new Date());
                }}
                className="hover:cursor-pointer rounded-lg hover:bg-gray-100 px-4 py-1"
              >
                Today
              </button>
              <div className="text-gray-300">|</div>
              <button
                onClick={() => {
                  const nextDay = new Date();
                  nextDay.setDate(currentDate.getDate() + 1);
                  setCurrentDate(nextDay);
                }}
                className="hover:cursor-pointer rounded-lg hover:bg-gray-100 px-1.5 py-1"
              >
                <FontAwesomeIcon size="sm" icon={faCaretRight} />
              </button>
            </div>
            <h2 className="text-primary font-bold text-lg">{dateString}</h2>
          </div>
        </div>
        <div className="w-full pb-12 flex h-full mt-4 text-primary">
          <div className="flex gap-4 justify-between w-full">
            <CalendarCourtCard slots={reservations?.slots || []} courtNum={1} />
            <CalendarCourtCard slots={reservations?.slots || []} courtNum={2} />
            <CalendarCourtCard slots={reservations?.slots || []} courtNum={3} />
            <CalendarCourtCard slots={reservations?.slots || []} courtNum={4} />
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
