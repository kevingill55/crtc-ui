"use client";

import { useRef, useEffect, useState } from "react";
import { normalizeString } from "@/app/utils";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const StatusDropdown = ({
  setStatus,
  status,
}: {
  status: string;
  setStatus: (str: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // @ts-expect-error cant figure out the type just yet
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        <div className="bg-white px-2.5 py-1.5 hover:cursor-pointer text-nowrap hover:bg-gray-200 border rounded-lg border-gray-300">
          {normalizeString(status) || "Select"}
          <FontAwesomeIcon
            icon={!isOpen ? faCaretDown : faCaretUp}
            className="ml-1"
          />
        </div>
      </div>
      {isOpen && (
        <div className="absolute right-0 w-50 z-10 mt-2 origin-top-right bg-white outline-1 outline-gray-300 text-primary rounded-md">
          <div className="py-1">
            <div
              onClick={() => {
                setStatus("SUBMITTED");
                setIsOpen(false);
              }}
              className="block hover:cursor-pointer hover:bg-gray-200 px-2.5 py-2"
            >
              <p>Submitted</p>
              <p className="leading-3 text-xs text-gray-600">
                New waitlist member application
              </p>
            </div>
            <div
              onClick={() => {
                setStatus("PENDING");
                setIsOpen(false);
              }}
              className="block hover:cursor-pointer hover:bg-gray-200 px-2.5 py-2"
            >
              <p>Pending</p>
              <p className="leading-3 text-xs text-gray-600">
                Waiting on payment
              </p>
            </div>
            <div
              onClick={() => {
                setStatus("INACTIVE");
                setIsOpen(false);
              }}
              className="block hover:cursor-pointer hover:bg-gray-200 px-2.5 py-2"
            >
              <p>Inactive</p>
              <p className="leading-3 text-xs text-gray-600"></p>
            </div>
            <div
              onClick={() => {
                setStatus("ACTIVE");
                setIsOpen(false);
              }}
              className="block hover:cursor-pointer hover:bg-gray-200 px-2.5 py-2"
            >
              Active
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
