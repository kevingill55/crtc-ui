"use client";
import { apiFetch } from "@/app/clients/api";
import { memberMatchesFilter } from "@/app/utils";
import { Member } from "@/app/types";
import { faCaretDown, faCaretUp, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef, useMemo } from "react";

export const PlayersMultiSelect = ({
  players,
  onSave,
}: {
  players: string[];
  onSave: (players: string[]) => void;
}) => {
  const [filter, setFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [localPlayers, setLocalPlayers] = useState<string[]>(players);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: membersData } = useQuery<{ data: Member[] }>({
    queryKey: ["getMembers", "active"],
    queryFn: async () => {
      const res = await apiFetch(`/api/members?status=ACTIVE`, {
        method: "GET",
      });
      return res.json();
    },
  });

  const filteredMembers = useMemo(() => {
    if (!membersData) return [];
    const base = filter
      ? membersData.data.filter((m) => memberMatchesFilter(m, filter))
      : membersData.data;
    return [...base].sort((a, b) => {
      const aSelected = localPlayers.includes(a.id);
      const bSelected = localPlayers.includes(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.first_name.localeCompare(b.first_name);
    });
  }, [membersData, filter, localPlayers]);

  const selectedNames = useMemo(() => {
    if (!membersData) return [];
    return players
      .map((id) => membersData.data.find((m) => m.id === id))
      .filter((m): m is Member => !!m)
      .map((m) => `${m.first_name} ${m.last_name}`);
  }, [players, membersData]);

  const handleOpen = () => {
    setLocalPlayers(players);
    setIsOpen(true);
  };

  const handleSave = () => {
    onSave(localPlayers);
    setFilter("");
    setIsOpen(false);
  };

  const handleCancel = () => {
    setLocalPlayers(players);
    setFilter("");
    setIsOpen(false);
  };

  const handleToggle = (id: string) => {
    setLocalPlayers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    // @ts-expect-error cant figure out the type just yet
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleCancel();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [players]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => (isOpen ? handleCancel() : handleOpen())}>
        <div className="bg-white px-2.5 min-w-24 py-1.5 hover:cursor-pointer hover:bg-gray-200 flex flex-wrap items-center gap-1.5 border rounded-lg border-gray-300 text-sm min-h-9">
          {selectedNames.length > 0 ? (
            selectedNames.map((name) => (
              <span
                key={name}
                className="bg-primary text-white px-2 py-0.5 rounded-full text-xs"
              >
                {name}
              </span>
            ))
          ) : (
            <span className="text-gray-500">Add players</span>
          )}
          <FontAwesomeIcon
            icon={!isOpen ? faCaretDown : faCaretUp}
            className="ml-auto"
          />
        </div>
      </div>
      {isOpen && (
        <div className="absolute right-0 min-w-36 w-full z-10 mt-2 origin-top-right overflow-auto bg-white outline-1 outline-gray-300 text-primary rounded-md">
          <div className="p-3 border-b border-gray-200">
            <div className="relative w-2/3">
              <input
                type="text"
                placeholder="Filter"
                className="px-4 py-1 w-full rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary hover:border-gray-500 pr-8"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              {filter && (
                <button
                  onClick={() => setFilter("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:cursor-pointer"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>
          </div>
          <div className="py-1 overflow-auto max-h-64">
            {filteredMembers.map((it) => (
              <div
                key={it.id}
                onClick={() => handleToggle(it.id)}
                className="block hover:cursor-pointer hover:bg-gray-200 px-2.5 py-2"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-4 h-4 rounded border border-primary ${
                      localPlayers.includes(it.id) && "bg-primary"
                    }`}
                  ></div>
                  <p>
                    {it.first_name} {it.last_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 p-2 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-1.5 rounded-lg text-sm text-primary border border-primary hover:bg-gray-100 hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-sm bg-primary text-white hover:bg-primary/80 hover:cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
