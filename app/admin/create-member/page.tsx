"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/app/clients/api";
import { Dropdown } from "@/app/components/Dropdown";
import { EmailInput } from "@/app/components/EmailInput";
import { FormInput } from "@/app/components/FormInput";
import { PhoneInput } from "@/app/components/PhoneInput";
import ProtectedPage from "@/app/components/ProtectedPage";
import { useProtectedRoute } from "@/app/hooks/useProtectedRoute";
import {
  NotificationStatus,
  useNotificationsContext,
} from "@/app/providers/Notifications";
import {
  MemberPlanType,
  MemberRole,
  MemberStatus,
} from "@/app/types";
import { normalizeString } from "@/app/utils";

const ROLE_LABELS: Record<MemberRole, string> = {
  [MemberRole.MEMBER]: "Member",
  [MemberRole.ADMIN]: "Admin",
};

const FIELD_CLS = "flex flex-col gap-1";
const LABEL_CLS = "text-gray-600 text-sm";

export default function CreateMember() {
  useProtectedRoute({ isAdmin: true });
  const router = useRouter();
  const { addNotification } = useNotificationsContext();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [rating, setRating] = useState("");
  const [plan, setPlan] = useState<MemberPlanType>(MemberPlanType.ADULT);
  const [status, setStatus] = useState<MemberStatus>(MemberStatus.ACTIVE);
  const [role, setRole] = useState<MemberRole>(MemberRole.MEMBER);

  const { mutate: createMember, isPending } = useMutation({
    mutationFn: async () => {
      const res = await apiFetch("/api/signup", {
        method: "POST",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          password_confirmation: passwordConfirmation,
          phone_number: phone,
          address,
          rating: parseFloat(rating),
          plan,
          status,
          role,
        }),
      });
      const data = await res.json();
      if (!data.success)
        throw new Error(data.error ?? "Failed to create member");
      return data;
    },
    onSuccess: () => {
      addNotification({
        status: NotificationStatus.SUCCESS,
        id: "create-member-success",
        expiresIn: 5000,
        title: `${firstName} ${lastName} created successfully`,
      });
      router.push("/admin/accounts");
    },
    onError: (err: Error) => {
      addNotification({
        status: NotificationStatus.ERROR,
        id: "create-member-error",
        expiresIn: 6000,
        title: err.message,
      });
    },
  });

  const passwordMismatch =
    passwordConfirmation.length > 0 && password !== passwordConfirmation;

  const canSubmit =
    firstName &&
    lastName &&
    email &&
    !emailError &&
    password &&
    !passwordMismatch &&
    phone &&
    address &&
    rating;

  return (
    <ProtectedPage title="Create member" subtitle="Create a new CRTC member">
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-2xl">
        <div className="grid grid-cols-2 gap-6">
          {/* Name */}
          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}>First name</label>
            <FormInput
              id="cm-first"
              placeholder="First name"
              value={firstName}
              setValue={setFirstName}
            />
          </div>
          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}>Last name</label>
            <FormInput
              id="cm-last"
              placeholder="Last name"
              value={lastName}
              setValue={setLastName}
            />
          </div>

          {/* Email */}
          <div className={`${FIELD_CLS} col-span-2`}>
            <label className={LABEL_CLS}>Email</label>
            <EmailInput
              id="cm-email"
              email={email}
              setEmail={setEmail}
              emailError={emailError}
              setEmailError={setEmailError}
            />
          </div>

          {/* Password */}
          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}>Password</label>
            <input
              id="cm-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary hover:border-gray-500"
            />
          </div>
          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}>Confirm password</label>
            <input
              id="cm-password-confirm"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Confirm password"
              className={`px-4 py-2 rounded-lg border focus:outline-1 hover:border-gray-500 ${
                passwordMismatch
                  ? "border-red-400 focus:outline-red-400"
                  : "border-gray-300 focus:outline-primary"
              }`}
            />
            {passwordMismatch && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          {/* Phone & Address */}
          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}>Phone number</label>
            <PhoneInput id="cm-phone" phone={phone} setPhone={setPhone} />
          </div>
          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}>Rating</label>
            <input
              id="cm-rating"
              type="number"
              min={1}
              max={7}
              step={0.5}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="e.g. 3.5"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary hover:border-gray-500"
            />
          </div>

          <div className={`${FIELD_CLS} col-span-2`}>
            <label className={LABEL_CLS}>Address</label>
            <FormInput
              id="cm-address"
              placeholder="Address"
              value={address}
              setValue={setAddress}
            />
          </div>

          {/* Dropdowns */}
          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}>Plan</label>
            <Dropdown
              label={plan}
              value={plan}
              onSelect={(v) => setPlan(v as MemberPlanType)}
              options={[
                { label: MemberPlanType.ADULT, value: MemberPlanType.ADULT },
                { label: MemberPlanType.JUNIOR, value: MemberPlanType.JUNIOR },
              ]}
            />
          </div>
          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}>Status</label>
            <Dropdown
              label={normalizeString(status)}
              value={status}
              onSelect={(v) => setStatus(v as MemberStatus)}
              options={[
                { label: "Active", value: MemberStatus.ACTIVE },
                { label: "Inactive", value: MemberStatus.INACTIVE },
                { label: "Pending", value: MemberStatus.PENDING },
                { label: "Waitlist", value: MemberStatus.WAITLIST },
              ]}
            />
          </div>
          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}>Role</label>
            <Dropdown
              label={ROLE_LABELS[role]}
              value={role}
              onSelect={(v) => setRole(v as MemberRole)}
              options={Object.values(MemberRole).map((r) => ({
                label: ROLE_LABELS[r],
                value: r,
              }))}
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => createMember()}
            disabled={!canSubmit || isPending}
            className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Creating..." : "Create member"}
          </button>
          <button
            onClick={() => router.push("/admin/accounts")}
            className="px-6 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </ProtectedPage>
  );
}
