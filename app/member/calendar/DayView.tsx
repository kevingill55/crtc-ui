"use client";

import { useRouter } from "next/navigation";
import { Slot } from "@/app/types";
import { useProtectedRoute } from "@/app/hooks/useProtectedRoute";
import {
  getReservationColors,
  getSlotLabel,
  isWateringSlot,
} from "@/app/utils";

const LOWER_COURTS = [1, 2];
const UPPER_COURTS = [3, 4];

export default function DayView({
  slots,
  date,
}: {
  slots: Slot[];
  date: string;
}) {
  const router = useRouter();
  const { user } = useProtectedRoute({ isAdmin: false });

  const renderSection = (courts: number[], label: string) => (
    <div className="flex-1 min-w-0">
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr>
            <th className="bg-primary text-white text-xs font-medium p-3 w-28 text-center">
              {label}
            </th>
            {courts.map((c) => (
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
          {slots.map((slot) => {
            const timeLabel = getSlotLabel(slot.slotIndex, courts[0]);
            return (
              <tr key={slot.slotIndex} className="border-t border-gray-100">
                <td className="text-right pr-3 text-xs text-gray-500 w-28 py-3 pl-2 whitespace-nowrap">
                  {timeLabel}
                </td>
                {courts.map((court) => {
                  const reservation = slot.reservationsByCourt[court];
                  const { cell } = getReservationColors(reservation?.type);
                  const watering = isWateringSlot(slot.slotIndex, court);
                  return (
                    <td key={court} className="p-2">
                      {watering ? (
                        <div className="bg-blue-50 rounded p-2">
                          <p className="text-sm text-gray-600">💧 Watering</p>
                        </div>
                      ) : reservation ? (
                        <div
                          className={`${cell.bg} border-l-4 ${
                            cell.border
                          } rounded p-2 ${
                            reservation.member_id === user?.id
                              ? `cursor-pointer ${cell.hover}`
                              : ""
                          }`}
                          onClick={
                            reservation.member_id === user?.id
                              ? () => router.push("/member/reservations")
                              : undefined
                          }
                        >
                          <p className="font-medium text-sm text-gray-800">
                            {reservation.name}
                          </p>
                          <div className="mt-1">
                            {reservation.players.length > 5 ? (
                              <p className="text-xs text-gray-600">
                                {reservation.players.length} players
                              </p>
                            ) : (
                              Array.from(
                                { length: Math.ceil(reservation.players.length / 2) },
                                (_, i) => reservation.players.slice(i * 2, i * 2 + 2)
                              ).map((pair, i) => (
                                <p key={i} className="text-xs text-gray-600">
                                  {pair.join(", ")}
                                </p>
                              ))
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="bg-primary/5 border border-primary/20 rounded p-2 cursor-pointer hover:bg-primary/10 hover:border-primary/40"
                          onClick={() =>
                            router.push(
                              `/member/reserve?date=${date}&slot=${slot.slotIndex}&court=${court}`
                            )
                          }
                        >
                          <p className="text-sm text-primary/60">Available</p>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex">
      {renderSection(LOWER_COURTS, "Lower Courts")}
      <div className="w-px bg-gray-200" />
      {renderSection(UPPER_COURTS, "Upper Courts")}
    </div>
  );
}
