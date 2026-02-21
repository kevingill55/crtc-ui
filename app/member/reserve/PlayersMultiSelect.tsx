"use client";
import { apiFetch } from "@/app/clients/api";
import { memberMatchesFilter } from "@/app/utils";
import { Member } from "@/app/types";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";

export const PlayersMultiSelect = ({
  players,
  addPlayer,
  removePlayer,
}: {
  players: string[];
  addPlayer: (x: string) => void;
  removePlayer: (x: string) => void;
}) => {
  const [filter, setFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: getActiveMembersResponse } = useQuery<{ data: Member[] }>({
    queryKey: ["getMembers", "active"],
    select: (data) => {
      if (!filter)
        return {
          data: data.data.sort((a, b) => {
            const aIsSelected = players.includes(a.id);
            const bIsSelected = players.includes(b.id);

            if (aIsSelected && !bIsSelected) return -1; // a comes first
            if (!aIsSelected && bIsSelected) return 1; // b comes first

            return a.first_name.localeCompare(b.first_name);
          }),
        };
      const updatedResults = data.data.filter((it) =>
        memberMatchesFilter(it, filter)
      );
      return {
        data: updatedResults.sort((a, b) => {
          const aIsSelected = players.includes(a.id);
          const bIsSelected = players.includes(b.id);

          if (aIsSelected && !bIsSelected) return -1; // a comes first
          if (!aIsSelected && bIsSelected) return 1; // b comes first

          return a.first_name.localeCompare(b.first_name);
        }),
      };
    },
    queryFn: async () => {
      const getActiveMembersFetch = await apiFetch(`/api/members?status=ACTIVE`, {
        method: "GET",
      });

      return getActiveMembersFetch.json();
    },
  });

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
        <div className="bg-white px-2.5 min-w-24 py-1.5 hover:cursor-pointer text-nowrap hover:bg-gray-200 flex items-center justify-center border rounded-lg border-gray-300 text-sm">
          {players.length > 0 ? `${players.length} selected` : "Select players"}
          <FontAwesomeIcon
            icon={!isOpen ? faCaretDown : faCaretUp}
            className="ml-1"
          />
        </div>
      </div>
      {isOpen && (
        <div
          className={`absolute right-0 min-w-36 w-full z-10 mt-2 origin-top-right overflow-auto bg-white outline-1 outline-gray-300 text-primary rounded-md`}
        >
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Filter"
              className="px-4 py-1 w-2/3 rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary hover:border-gray-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="py-1 overflow-auto max-h-64">
            {getActiveMembersResponse?.data.map((it) => (
              <div
                key={it.id}
                onClick={() => {
                  if (players.includes(it.id)) removePlayer(it.id);
                  else addPlayer(it.id);
                }}
                className={`block hover:cursor-pointer hover:bg-gray-200 px-2.5 py-2`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-4 h-4 rounded border border-primary ${
                      players.includes(it.id) && "bg-primary"
                    }`}
                  ></div>
                  <p>
                    {it.first_name} {it.last_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
