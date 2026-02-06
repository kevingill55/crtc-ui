"use client";
import ProtectedPage from "@/app/components/ProtectedPage";
import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const slots = [
  "8:30",
  "10:00",
  "11:30",
  "1:00",
  "2:30",
  "4:00",
  "5:30",
  "7:00",
  "8:30",
  "10:00",
];

export default function Calendar() {
  return (
    <ProtectedPage title="Calendar">
      <div className="h-full w-full">
        <div>
          <div className="flex gap-6 items-center">
            <h2 className="text-primary font-bold text-lg">February 2026</h2>
            <div className="flex rounded-lg gap-1 border text-gray-600 p-1 border-gray-200 items-center bg-white">
              <button className="hover:cursor-pointer rounded-lg hover:bg-gray-100 px-1.5 py-1">
                <FontAwesomeIcon size="sm" icon={faCaretLeft} />
              </button>
              <div className="text-gray-300">|</div>
              <button className="hover:cursor-pointer rounded-lg hover:bg-gray-100 px-4 py-1">
                Today
              </button>
              <div className="text-gray-300">|</div>
              <button className="hover:cursor-pointer rounded-lg hover:bg-gray-100 px-1.5 py-1">
                <FontAwesomeIcon size="sm" icon={faCaretRight} />
              </button>
            </div>
          </div>
        </div>
        <div className="w-full flex h-full mt-2 bg-white">
          <div className="flex border border-gray-200 w-full">
            <div>
              {slots.map((slot, i) => (
                <div key={`${slot}-${i}`}>{slot}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
