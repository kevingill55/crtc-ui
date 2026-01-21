"use client";

import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import { Member } from "@/app/types";

const actionsDropdownOptions: DropdownOption[] = [
  { label: "Edit", value: "Edit" },
  { label: "Delete", value: "Delete" },
];

export const ActionsDropdown = ({
  setEditMember,
  setDeleteMember,
  member,
}: {
  member: Member;
  setEditMember: (str: Member | null) => void;
  setDeleteMember: (str: Member | null) => void;
}) => {
  return (
    <Dropdown
      onSelect={(value: string) => {
        if (value === "Edit") setEditMember(member);
        else if (value === "Delete") setDeleteMember(member);
      }}
      label={"Actions"}
      value={""}
      options={actionsDropdownOptions}
    />
  );
};
