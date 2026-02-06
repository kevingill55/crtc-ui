"use client";

import { Dropdown, DropdownOption } from "@/app/components/Dropdown";

export enum FilterView {
  ALL = "All",
  PENDING = "Pending",
  ACTIVE = "Active",
  WAITLIST = "Waitlist",
}

const filterDropdownOptions: DropdownOption[] = [
  {
    label: "All",
    value: FilterView.ALL,
  },
  {
    label: "Active",
    value: FilterView.ACTIVE,
  },
  {
    label: "Pending",
    value: FilterView.PENDING,
  },
  {
    label: "Waitlist",
    value: FilterView.WAITLIST,
  },
];

export const FilterBar = ({
  setFilter,
  setActiveView,
  activeView,
  filter,
}: {
  setFilter: (str: string) => void;
  filter: string;
  setActiveView: (str: string) => void;
  activeView: string;
}) => {
  return (
    <div className="flex bg-white rounded-t-xl items-center justify-between p-4">
      <input
        type="text"
        placeholder="Filter"
        className="px-4 py-1 w-1/4 rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary hover:border-gray-500"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <Dropdown
        onSelect={(value) => setActiveView(value as string)}
        label={activeView}
        value={activeView}
        options={filterDropdownOptions}
      />
    </div>
  );
};
