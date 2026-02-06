"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProtectedPage from "@/app/components/ProtectedPage";
import { Member, MemberStatus } from "@/app/types";
import { useListMembers } from "@/app/hooks/useListMembers";

const AccountTableHeading = ({ title }: { title: string }) => (
  <th className="p-2 leading-4 text-nowrap text-sm font-medium text-center">
    {title}
  </th>
);

export default function Members() {
  const [filter, setFilter] = useState("");

  const {} = useListMembers({ filter, status: MemberStatus.ACTIVE });

  const { data: getMembersResponse } = useQuery<{ data: Member[] }>({
    queryKey: ["getMembers", "active"],
    select: (data) => {
      if (!filter)
        return {
          data: data.data.sort((a, b) =>
            a.first_name.localeCompare(b.first_name)
          ),
        };
      const updatedResults = data.data.filter(
        (it) =>
          it.first_name.toLowerCase().includes(filter.trim().toLowerCase()) ||
          it.last_name.toLowerCase().includes(filter)
      );
      return {
        data: updatedResults.sort((a, b) =>
          a.first_name.localeCompare(b.first_name)
        ),
      };
    },
    queryFn: async () => {
      const listMembersFetch = await fetch(`/api/members?status=ACTIVE`, {
        method: "GET",
      });

      return listMembersFetch.json();
    },
  });

  return (
    <ProtectedPage subtitle="All active CRTC members" title="Members">
      <div className="p-4 bg-white rounded-t-xl border-gray-200 border border-b-0">
        <input
          type="text"
          placeholder="Filter"
          className="px-4 py-1 w-1/4 rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary hover:border-gray-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <table className="w-full mb-10">
        <thead className="bg-primary text-white">
          <tr>
            <AccountTableHeading title={"Name"} />
            <AccountTableHeading title={"Email"} />
            <AccountTableHeading title={"Phone"} />
            <AccountTableHeading title={"Address"} />
            <AccountTableHeading title={"Rating"} />
            <AccountTableHeading title={"Gender"} />
          </tr>
        </thead>
        <tbody className="border border-gray-200">
          {getMembersResponse?.data.map((it, i) => (
            <tr
              className={`${
                i % 2 === 0 && "bg-white"
              } bg-blue-50 hover:bg-gray-200`}
              key={it.id}
            >
              <td className="text-sm text-center p-3 text-nowrap">
                {it.first_name} {it.last_name}
              </td>
              <td className="text-sm text-center p-3">{it.email}</td>
              <td className="text-sm text-center p-3 text-nowrap">
                {it.phone_number}
              </td>
              <td className="text-sm text-center p-3">{it.address}</td>
              <td className="text-sm text-center p-3">
                {it.rating ? it.rating.toFixed(1) : ""}
              </td>
              <td className="text-sm text-center p-3">{it.gender}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ProtectedPage>
  );
}
