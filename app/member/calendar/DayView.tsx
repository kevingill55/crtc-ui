"use client";

import { useRouter } from "next/navigation";
import { Slot } from "@/app/types";

const COURTS = [1, 2, 3, 4];

const formatTime = (timeStr: string): string => {
  const [h, m] = timeStr.split(":");
  const hours = parseInt(h);
  const period = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${m} ${period}`;
};

export default function DayView({ slots, date }: { slots: Slot[]; date: string }) {
  const router = useRouter();
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="bg-primary text-white text-sm font-medium p-3 w-24 text-center">
              Time
            </th>
            {COURTS.map((c) => (
              <th
                key={c}
                className="bg-primary text-white text-sm font-medium p-3 text-center"
              >
                Court {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.slotIndex} className="border-t border-gray-100">
              <td className="text-right pr-3 text-sm text-gray-500 w-24 py-3 pl-2">
                {formatTime(slot.startTime)}
              </td>
              {COURTS.map((court) => {
                const reservation = slot.reservationsByCourt[court];
                return (
                  <td key={court} className="p-2">
                    {reservation ? (
                      <div className="bg-amber-50 border-l-4 border-amber-400 rounded p-2">
                        <p className="font-medium text-sm text-gray-800">
                          {reservation.name}
                        </p>
                        <div className="mt-1">
                          {Array.from(
                            {
                              length: Math.ceil(reservation.players.length / 2),
                            },
                            (_, i) =>
                              reservation.players.slice(i * 2, i * 2 + 2)
                          ).map((pair, i) => (
                            <p key={i} className="text-xs text-gray-600">
                              {pair.join(", ")}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="bg-blue-50 rounded p-2 cursor-pointer hover:bg-blue-100"
                        onClick={() =>
                          router.push(
                            `/member/reserve?date=${date}&slot=${slot.slotIndex}&court=${court}`
                          )
                        }
                      >
                        <p className="text-sm text-gray-400">Available</p>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
