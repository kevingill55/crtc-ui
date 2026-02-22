"use client";

const SLOT_LABELS = [
  "8:30 - 10:00 am",
  "10:00 - 11:30 am",
  "11:30 - 1:00 pm",
  "1:00 - 2:30 pm",
  "2:30 - 4:00 pm",
  "4:00 - 5:30 pm",
  "5:30 - 7:00 pm",
  "7:00 - 8:30 pm",
  "8:30 - 10:00 pm",
];

const COURTS = [1, 2, 3, 4];

export function SlotCourtGrid({
  selectedCells,
  onToggle,
  bookedCells,
}: {
  selectedCells: Set<string>;
  onToggle: (slot: number, court: number) => void;
  bookedCells: Set<string>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-left pr-4 pb-2 text-gray-500 font-medium w-36"></th>
            {COURTS.map((court) => (
              <th
                key={court}
                className="px-2 pb-2 text-gray-500 font-medium text-center w-16"
              >
                Court {court}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SLOT_LABELS.map((label, slotIdx) => {
            const slot = slotIdx + 1;
            return (
              <tr key={slot}>
                <td className="pr-4 py-1 text-gray-600 text-xs whitespace-nowrap">
                  {label}
                </td>
                {COURTS.map((court) => {
                  const key = `${slot}-${court}`;
                  const isBooked = bookedCells.has(key);
                  const isSelected = selectedCells.has(key);
                  return (
                    <td key={court} className="px-2 py-1 text-center">
                      <button
                        type="button"
                        disabled={isBooked}
                        onClick={() => onToggle(slot, court)}
                        className={`w-14 h-9 rounded text-xs font-medium transition-colors ${
                          isBooked
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed line-through border border-gray-200"
                            : isSelected
                            ? "bg-primary text-white border border-primary"
                            : "bg-white hover:bg-gray-100 border border-gray-300"
                        }`}
                      >
                        {isBooked ? "—" : isSelected ? "✓" : ""}
                      </button>
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
}
