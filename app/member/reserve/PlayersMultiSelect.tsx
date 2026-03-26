"use client";
import { apiFetch } from "@/app/clients/api";
import { memberMatchesFilter } from "@/app/utils";
import { Member } from "@/app/types";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);

  const { data: membersData } = useQuery<{ data: Member[] }>({
    queryKey: ["getMembers", "active"],
    queryFn: async () => {
      const res = await apiFetch(`/api/members?status=ACTIVE`, { method: "GET" });
      return res.json();
    },
  });

  // Auto-focus the filter input when opening; clear it on close.
  useEffect(() => {
    if (isOpen) {
      filterRef.current?.focus();
    } else {
      setFilter("");
    }
  }, [isOpen]);

  // Close on click outside.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredMembers = useMemo(() => {
    if (!membersData) return [];
    if (filter) {
      // While searching, keep order alphabetical so the list doesn't jump on toggle.
      return membersData.data
        .filter((m) => memberMatchesFilter(m, filter))
        .sort((a, b) => a.first_name.localeCompare(b.first_name));
    }
    // No filter: selected members float to the top.
    return [...membersData.data].sort((a, b) => {
      const aSelected = players.includes(a.id);
      const bSelected = players.includes(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.first_name.localeCompare(b.first_name);
    });
  }, [membersData, filter, players]);

  const selectedMembers = useMemo(() => {
    if (!membersData) return [];
    return players
      .map((id) => membersData.data.find((m) => m.id === id))
      .filter((m): m is Member => !!m);
  }, [players, membersData]);

  const handleToggle = (id: string) => {
    onSave(players.includes(id) ? players.filter((x) => x !== id) : [...players, id]);
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSave(players.filter((x) => x !== id));
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(true)}
        className="bg-white px-2.5 min-w-24 py-1.5 cursor-pointer hover:bg-gray-50 flex flex-wrap items-center gap-1.5 border rounded-lg border-gray-300 text-sm min-h-9"
      >
        {selectedMembers.length > 0 ? (
          selectedMembers.map((m) => (
            <span
              key={m.id}
              className="bg-primary text-white pl-2 pr-1 py-0.5 rounded-full text-xs flex items-center gap-1"
            >
              {m.first_name} {m.last_name}
              <button
                type="button"
                onClick={(e) => handleRemove(e, m.id)}
                className="hover:bg-white/20 rounded-full p-0.5 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-400">Add players</span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <input
                ref={filterRef}
                type="text"
                placeholder="Search members"
                className="w-full px-3 py-1.5 rounded-md border border-gray-300 focus:outline-1 focus:outline-primary text-sm pr-7"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              {filter && (
                <button
                  type="button"
                  onClick={() => setFilter("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <div className="overflow-auto max-h-60 py-1">
            {filteredMembers.length === 0 ? (
              <p className="text-sm text-gray-400 px-3 py-2">No members found</p>
            ) : (
              filteredMembers.map((m) => {
                const isSelected = players.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => handleToggle(m.id)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <div
                      className={`w-4 h-4 rounded border shrink-0 ${
                        isSelected ? "bg-primary border-primary" : "border-gray-300"
                      }`}
                    />
                    <span className="text-sm">
                      {m.first_name} {m.last_name}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
