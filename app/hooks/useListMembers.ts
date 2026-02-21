import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../clients/api";
import { memberMatchesFilter } from "../utils";
import { Member } from "../types";

export const useListMembers = ({
  filter,
  status,
}: {
  filter: string;
  status: string;
}) => {
  const { data: getMembersResponse, isLoading } = useQuery<{ data: Member[] }>({
    queryKey: ["getMembers", status.toLowerCase()],
    select: (data) => {
      if (!filter)
        return {
          data: data.data.sort((a, b) =>
            a.first_name.localeCompare(b.first_name)
          ),
        };
      const updatedResults = data.data.filter((it) =>
        memberMatchesFilter(it, filter)
      );
      return {
        data: updatedResults.sort((a, b) =>
          a.first_name.localeCompare(b.first_name)
        ),
      };
    },
    queryFn: async () => {
      const listMembersFetch = await apiFetch(`/api/members?status=${status}`, {
        method: "GET",
      });

      return listMembersFetch.json();
    },
  });

  return { isLoading, members: getMembersResponse };
};
