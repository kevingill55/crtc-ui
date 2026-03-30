"use client";

import { apiFetch } from "../clients/api";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { EmailInput, emailRegex } from "../components/EmailInput";
import { PhoneInput } from "../components/PhoneInput";
import { PublicPage } from "../components/PublicPage";
import {
  NotificationStatus,
  useNotificationsContext,
} from "../providers/Notifications";
import { Member } from "../types";
import ReCAPTCHA from "react-google-recaptcha";

export default function SignUp() {
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [plan, setPlan] = useState("");
  const [emailError, setEmailError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const router = useRouter();

  const { addNotification } = useNotificationsContext();

  const { mutate: handleSignUp, isPending: loading } = useMutation({
    mutationFn: async () => {
      if (!emailRegex.test(email)) {
        setEmailError("Please enter a valid email");
        return;
      }

      try {
        const addWaitlistFetch = await apiFetch("/api/members", {
          method: "POST",
          body: JSON.stringify({
            email,
            first_name: firstName,
            last_name: lastName,

            phone_number: phone,
            plan: plan === "ADULT" ? "Adult" : "Junior",
            address,
          }),
        });

        const response: {
          data: { entry: Member } | undefined;
          error: { message: string; code: string };
        } = await addWaitlistFetch.json();

        if (response.error) {
          if (response.error.code === "23505") {
            addNotification({
              id: "temp",
              status: NotificationStatus.ERROR,
              title: "A waitlist entry with that email already exists",
            });
          } else {
            addNotification({
              id: "temp",
              status: NotificationStatus.ERROR,
              title: "There was a problem adding you to the waitlist.",
            });
          }
          return;
        }
        if (response.data?.entry) {
          addNotification({
            id: "temp",
            status: NotificationStatus.SUCCESS,
            title:
              "You have been added to the waitlist. A confirmation will be sent to your email shortly.",
          });
          recaptchaRef.current?.reset();
          router.push("/");
        }
      } catch (error) {
        console.error("There was an error signing up", error);
      }
    },
  });

  const isDisabled = useMemo(() => {
    if (
      !waiverAccepted ||
      !captchaToken ||
      loading ||
      email.length === 0 ||
      address.length === 0 ||
      phone.length === 0 ||
      plan.length === 0
    ) {
      return true;
    }
    return false;
  }, [waiverAccepted, captchaToken, plan, email, loading, phone, address]);

  return (
    <PublicPage>
      <div className="w-full pt-10 flex flex-col h-full gap-6">
        <div>
          <h1 className="text-primary font-bold text-2xl">
            New member application (2026)
          </h1>
          <p className="text-sm text-gray-500">
            This is for first time applicants only. Previous members wishing to
            rejoin should login and complete the renewal process.
          </p>
        </div>
        <div className="flex gap-4 w-175 justify-between">
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="crtc-first-name" className="text-gray-600">
              First name
            </label>
            <input
              id="crtc-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              type="text"
              placeholder="Enter your first name"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary hover:border-gray-500"
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="crtc-last-name" className="text-gray-600">
              Last name
            </label>
            <input
              id="crtc-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              type="text"
              placeholder="Enter your last name"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary hover:border-gray-500"
            />
          </div>
        </div>

        <div className="flex gap-4 w-175 justify-between">
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="crtc-email" className="text-gray-600">
              Email
            </label>
            <EmailInput
              id="crtc-email"
              emailError={emailError}
              setEmailError={setEmailError}
              email={email}
              setEmail={setEmail}
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="crtc-phone-num" className="text-gray-600">
              Phone number
            </label>
            <PhoneInput id="crtc-phone-num" setPhone={setPhone} phone={phone} />
          </div>
        </div>
        {emailError && (
          <span className="text-sm text-red-500">{emailError}</span>
        )}

        <div className="flex gap-4 w-175 justify-between">
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="crtc-home-address" className="text-gray-600">
              Address
            </label>
            <input
              id="crtc-home-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              type="text"
              placeholder="1234 Charles River Rd, Medway, MA 02053"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary hover:border-gray-500"
            />
          </div>
        </div>

        <div className="flex gap-4 w-175 justify-between">
          <fieldset className="flex flex-col gap-2 w-full">
            <legend className="text-gray-600">Plan</legend>
            <div className="flex gap-2 mt-1">
              {(["ADULT", "JUNIOR"] as const).map((value) => (
                <label
                  key={value}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors text-sm font-medium ${
                    plan === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={value}
                    checked={plan === value}
                    onChange={() => setPlan(value)}
                    className="sr-only"
                  />
                  {value === "ADULT" ? "Adult" : "Junior"}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="flex flex-col gap-4 w-175 mt-6">
          <label className="flex items-start gap-3 cursor-pointer text-sm text-gray-700">
            <input
              type="checkbox"
              checked={waiverAccepted}
              onChange={(e) => setWaiverAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 shrink-0 accent-primary cursor-pointer"
            />
            <span>
              I have read and agree to the{" "}
              <a
                href="/CRTC_Waiver.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/70 underline"
              >
                Waiver, Release of Liability and Assumption of Risks
              </a>
            </span>
          </label>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_GOOGLE_SITE_KEY!}
            onChange={(token) => setCaptchaToken(token)}
            onExpired={() => setCaptchaToken(null)}
          />
          <button
            disabled={isDisabled}
            onClick={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
            className="w-full disabled:cursor-not-allowed disabled:bg-primary/50 hover:cursor-pointer hover:bg-primary/80 rounded-lg py-2 flex justify-center items-center bg-primary text-white"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </PublicPage>
  );
}
