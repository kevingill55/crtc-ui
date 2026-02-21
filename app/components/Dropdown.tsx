"use client";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect, useRef } from "react";
import { normalizeString } from "../utils";

export type DropdownOption = {
  label: string;
  value: string | number;
  subtext?: string;
};

export const Dropdown = ({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string | number;
  widthNum?: number;
  onSelect: (val: string | number) => void;
  options: DropdownOption[];
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
        <div className="bg-white px-2.5 min-w-24 py-2 hover:cursor-pointer text-nowrap hover:bg-gray-200 flex items-center justify-center border rounded-lg border-gray-300 text-sm">
          {normalizeString(label) || "Select"}
          <FontAwesomeIcon
            icon={!isOpen ? faCaretDown : faCaretUp}
            className="ml-1"
          />
        </div>
      </div>
      {isOpen && (
        <div
          className={`absolute right-0 min-w-36 w-full z-10 mt-2 origin-top-right bg-white outline-1 outline-gray-300 text-primary rounded-md`}
        >
          <div className="py-1">
            {options.map((it) => (
              <div
                onClick={() => {
                  onSelect(it.value);
                  setIsOpen(false);
                }}
                className={`block hover:cursor-pointer hover:bg-gray-200 px-2.5 py-2 ${
                  value === it.value && "bg-gray-200"
                }`}
                key={it.label}
              >
                <p className="text-sm">{it.label}</p>
                {it.subtext && (
                  <p className="leading-3 text-xs text-gray-600">
                    {it.subtext}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
