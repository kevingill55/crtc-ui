"use client";
import { Dropdown } from "@/app/components/Dropdown";
import { EmailInput } from "@/app/components/EmailInput";
import { FormInput } from "@/app/components/FormInput";
import { Modal } from "@/app/components/Modal";
import { PhoneInput } from "@/app/components/PhoneInput";
import ProtectedPage from "@/app/components/ProtectedPage";
import { useProtectedRoute } from "@/app/hooks/useProtectedRoute";
import {
  NotificationStatus,
  useNotificationsContext,
} from "@/app/providers/Notifications";
import {
  Member,
  MemberGender,
  MemberPlanType,
  MemberStatus,
} from "@/app/types";
import { apiFetch } from "@/app/clients/api";
import { memberMatchesFilter, normalizeString } from "@/app/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActionsDropdown } from "./ActionsDropdown";
import { FilterBar } from "./FilterBar";

const deleteModalContent = (member: Member) => {
  return (
    <div className="pb-6 text-primary">
      <div>
        <span className="font-bold">Name:</span>{" "}
        <span>
          {member.first_name} {member.last_name}
        </span>
      </div>

      <div>
        <span className="font-bold">Email:</span> <span>{member.email}</span>
      </div>
      <div>
        <span className="font-bold">Phone:</span>{" "}
        <span>{member.phone_number}</span>
      </div>
      <div className="text-sm mt-2">
        <span className="font-bold">ID:</span> <span>{member.id}</span>
      </div>
    </div>
  );
};

const editModalContent = (
  member: Member,
  setMember: (x: Member) => void,
  onCreateAccount: (memberId: string) => void
) => {
  return (
    <div className="pb-6 text-primary flex flex-col gap-4">
      <div className="flex flex-col w-3/4">
        <label
          htmlFor="crtc-edit-member-first"
          className="text-gray-600 text-sm"
        >
          First name
        </label>
        <FormInput
          id="crtc-edit-member-first"
          value={member.first_name}
          placeholder="First name"
          setValue={(val: string) => {
            setMember({ ...member, first_name: val });
          }}
        />
      </div>
      <div className="flex flex-col w-3/4">
        <label
          htmlFor="crtc-edit-member-last"
          className="text-gray-600 text-sm"
        >
          Last name
        </label>
        <FormInput
          id="crtc-edit-member-last"
          value={member.last_name}
          placeholder="Last name"
          setValue={(val: string) => {
            setMember({ ...member, last_name: val });
          }}
        />
      </div>
      <div className="flex flex-col w-3/4">
        <label
          htmlFor="crtc-edit-member-email"
          className="text-gray-600 text-sm"
        >
          Email
        </label>
        <EmailInput
          id="crtc-edit-member-email"
          emailError={""}
          setEmailError={() => {}}
          email={member.email}
          setEmail={(val) => {
            setMember({ ...member, email: val });
          }}
        />
      </div>
      <div className="flex flex-col w-3/4">
        <label
          htmlFor="crtc-edit-member-phone"
          className="text-gray-600 text-sm"
        >
          Phone number
        </label>
        <PhoneInput
          id="crtc-edit-member-phone"
          setPhone={(val) => {
            setMember({ ...member, phone_number: val });
          }}
          phone={member.phone_number}
        />
      </div>
      <div className="flex flex-col w-3/4">
        <label
          htmlFor="crtc-edit-member-address"
          className="text-gray-600 text-sm"
        >
          Address
        </label>
        <FormInput
          id="crtc-edit-member-address"
          value={member.address}
          placeholder="Address"
          setValue={(val: string) => {
            setMember({ ...member, address: val });
          }}
        />
      </div>

      <div className="flex gap-6 mt-2 items-center">
        <div className="flex flex-col gap-1">
          <label className="text-gray-600 text-sm leading-4">Status</label>
          <Dropdown
            label={member.status}
            value={member.status}
            onSelect={(val) => {
              setMember({ ...member, status: val as MemberStatus });
            }}
            options={[
              {
                label: normalizeString(MemberStatus.ACTIVE),
                value: MemberStatus.ACTIVE,
              },
              {
                label: normalizeString(MemberStatus.INACTIVE),
                value: MemberStatus.INACTIVE,
              },
              {
                label: normalizeString(MemberStatus.PENDING),
                value: MemberStatus.PENDING,
              },
              {
                label: normalizeString(MemberStatus.WAITLIST),
                value: MemberStatus.WAITLIST,
              },
            ]}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-gray-600 text-sm  leading-4">Plan</label>
          <Dropdown
            label={member.plan}
            value={member.plan}
            onSelect={(val) => {
              setMember({ ...member, plan: val as MemberPlanType });
            }}
            options={[
              { label: MemberPlanType.ADULT, value: MemberPlanType.ADULT },
              { label: MemberPlanType.JUNIOR, value: MemberPlanType.JUNIOR },
            ]}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-gray-600 text-sm  leading-4">Gender</label>
          <Dropdown
            label={member.gender}
            value={member.gender}
            onSelect={(val) => {
              setMember({ ...member, gender: val as MemberGender });
            }}
            options={[
              { label: MemberGender.MALE, value: MemberGender.MALE },
              { label: MemberGender.FEMALE, value: MemberGender.FEMALE },
            ]}
          />
        </div>
      </div>
      {member.status === MemberStatus.WAITLIST && (
        <div>
          <button
            onClick={() => onCreateAccount(member.id)}
            className="hover:cursor-pointer hover:bg-gray-300/80 rounded-lg py-2 px-6 text-sm flex justify-center items-center bg-gray-100 text-primary border-primary border"
          >
            Create account
          </button>
        </div>
      )}
    </div>
  );
};

const AccountTableHeading = ({ title }: { title: string }) => (
  <th className="p-2 leading-4 text-nowrap text-sm font-medium text-center">
    {title}
  </th>
);

export default function AdminAccounts() {
  useProtectedRoute({ isAdmin: true });
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationsContext();
  const [activeView, setActiveView] = useState("Waitlist");
  const [filter, setFilter] = useState("");
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteMember, setDeleteMember] = useState<Member | null>(null);

  const { data: getMembersResponse } = useQuery<{ data: Member[] }>({
    queryKey: ["getMembers", activeView.toLowerCase()],
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
      const listMembersFetch = await apiFetch(
        `/api/members?status=${activeView.toUpperCase()}`,
        { method: "GET" }
      );

      return listMembersFetch.json();
    },
  });

  const { mutate: deleteUser } = useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getMembers"] });
      addNotification({
        status: NotificationStatus.SUCCESS,
        id: "temp",
        expiresIn: 5000,
        title: "User deleted",
      });
      setDeleteMember(null);
    },
    mutationFn: async (member: Member) => {
      const deleteUserFetch = await apiFetch(`/api/members/${member.id}`, {
        method: "DELETE",
      });

      return deleteUserFetch.json();
    },
  });

  const { mutate: updateUser } = useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`getMembers`] });
      addNotification({
        status: NotificationStatus.SUCCESS,
        id: "temp",
        expiresIn: 5000,
        title: "User updated",
      });
      setEditMember(null);
    },
    mutationFn: async (member: Member) => {
      const updateUserFetch = await apiFetch(`/api/members/${member.id}`, {
        method: "PUT",
        body: JSON.stringify(member),
      });

      return updateUserFetch.json();
    },
  });

  const { mutate: onCreateAccount } = useMutation({
    onSuccess: () => {
      addNotification({
        status: NotificationStatus.SUCCESS,
        id: "temp",
        // expiresIn: 5000,
        title: "Account created successfully",
      });
      setEditMember(null);
    },
    mutationFn: async (memberId: string) => {
      const createAccountFetch = await apiFetch(`/api/accounts/${memberId}`, {
        method: "POST",
      });

      return createAccountFetch.json();
    },
  });

  return (
    <ProtectedPage
      title="Accounts"
      subtitle="Manage accounts and the current waitlist for prospective CRTC members"
    >
      {deleteMember && (
        <Modal
          id="delete-modal"
          title="Delete member"
          subtitle="Are you sure you want to delete the following member?"
          onClose={() => setDeleteMember(null)}
          onDone={() => {
            deleteUser(deleteMember);
          }}
          content={deleteModalContent(deleteMember)}
        />
      )}
      {editMember && (
        <Modal
          id="edit-member-modal"
          title="Edit member"
          onClose={() => setEditMember(null)}
          onDone={() => {
            updateUser(editMember);
          }}
          content={editModalContent(editMember, setEditMember, onCreateAccount)}
        />
      )}
      <FilterBar
        setFilter={setFilter}
        setActiveView={setActiveView}
        filter={filter}
        activeView={activeView}
      />
      <table className="w-full mb-10">
        <thead className="bg-primary text-white">
          <tr>
            <AccountTableHeading title={"Created"} />
            <AccountTableHeading title={"Name"} />
            <AccountTableHeading title={"Email"} />
            <AccountTableHeading title={"Phone"} />
            <AccountTableHeading title={"Address"} />
            <AccountTableHeading title={"Status"} />
            <AccountTableHeading title={"Actions"} />
          </tr>
        </thead>
        <tbody className="border border-gray-200">
          {getMembersResponse?.data.map((it, i) => (
            <tr
              className={`${
                i % 2 === 0 && "bg-white"
              } bg-gray-200 hover:bg-blue-50`}
              key={it.id}
            >
              <td className="text-sm p-3">
                <div>
                  {new Date(it.created_at).toLocaleDateString("en-US", {
                    timeZone: "America/New_York",
                  })}
                </div>
                <div className="text-xs text-gray-700">
                  {new Date(it.created_at).toLocaleTimeString("en-US", {
                    timeZone: "America/New_York",
                  })}
                </div>
              </td>
              <td className="text-sm p-3 text-nowrap">
                {it.first_name} {it.last_name}
              </td>
              <td className="text-sm p-3">{it.email}</td>
              <td className="text-sm p-3 text-nowrap">{it.phone_number}</td>
              <td className="text-sm p-3 text-nowrap">{it.address}</td>
              <td className="text-sm p-3">
                <span>{normalizeString(it.status)}</span>
              </td>
              <td className="text-sm p-3">
                <ActionsDropdown
                  setEditMember={setEditMember}
                  setDeleteMember={setDeleteMember}
                  member={it}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ProtectedPage>
  );
}
