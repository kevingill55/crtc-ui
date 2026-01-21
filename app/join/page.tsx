"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EmailInput, emailRegex } from "../components/EmailInput";
import { PhoneInput } from "../components/PhoneInput";
import { PublicPage } from "../components/PublicPage";
import {
  NotificationStatus,
  useNotificationsContext,
} from "../providers/Notifications";
import { Member } from "../types";

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [plan, setPlan] = useState("");
  const [gender, setGender] = useState("");
  const [emailError, setEmailError] = useState("");
  const router = useRouter();

  const { addNotification } = useNotificationsContext();

  const isDisabled = useMemo(() => {
    if (
      !waiverAccepted ||
      loading ||
      email.length === 0 ||
      address.length === 0 ||
      phone.length === 0 ||
      plan.length === 0 ||
      gender.length === 0
    ) {
      return true;
    }
    return false;
  }, [waiverAccepted, plan, email, loading, phone, address, gender]);

  async function handleSignUp() {
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      const addWaitlistFetch = await fetch("/api/waitlist", {
        method: "POST",
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          gender,
          phone,
          plan,
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
        setLoading(false);
        return;
      }
      if (response.data?.entry) {
        addNotification({
          id: "temp",
          status: NotificationStatus.SUCCESS,
          title:
            "You have been added to the waitlist. A confirmation will be sent to your email shortly.",
        });
        setLoading(false);
        router.push("/");
      }
    } catch (error) {
      setLoading(false);
      console.error("There was an error signing up", error);
    }
  }

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
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="crtc-plan" className="text-gray-600">
              Plan
            </label>
            <div className="flex gap-4 items-center">
              <div
                onClick={() => setPlan("ADULT")}
                className="flex items-center gap-1 hover:cursor-pointer"
              >
                <div
                  className={`rounded-full w-4 h-4 min-h-4 min-w-4 border border-gray-300 hover:cursor-pointer hover:bg-gray-200 ${
                    plan === "ADULT" && "bg-blue-400 border-blue-400"
                  }`}
                ></div>
                <div>Adult</div>
              </div>
              <div
                onClick={() => setPlan("JUNIOR")}
                className="flex items-center gap-1 hover:cursor-pointer"
              >
                <div
                  className={`rounded-full w-4 h-4 min-h-4 min-w-4 border border-gray-300 hover:cursor-pointer hover:bg-gray-200 ${
                    plan === "JUNIOR" && "bg-blue-400 border-blue-400"
                  }`}
                ></div>
                <div>Junior</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="crtc-gender" className="text-gray-600">
              Gender
            </label>
            <div className="flex gap-4 items-center">
              <div
                onClick={() => setGender("M")}
                className="flex items-center gap-1 hover:cursor-pointer"
              >
                <div
                  className={`rounded-full w-4 h-4 min-h-4 min-w-4 border border-gray-300 hover:cursor-pointer hover:bg-gray-200 ${
                    gender === "M" && "bg-blue-400 border-blue-400"
                  }`}
                ></div>
                <div>Male</div>
              </div>
              <div
                onClick={() => setGender("F")}
                className="flex items-center gap-1 hover:cursor-pointer"
              >
                <div
                  className={`rounded-full w-4 h-4 min-h-4 min-w-4 border border-gray-300 hover:cursor-pointer hover:bg-gray-200 ${
                    gender === "F" && "bg-blue-400 border-blue-400"
                  }`}
                ></div>
                <div>Female</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-175 mt-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center text-sm gap-2">
              <div
                onClick={() => setWaiverAccepted(!waiverAccepted)}
                className={`rounded-full hover:cursor-pointer hover:bg-gray-200 w-4 h-4 min-h-4 min-w-4 border border-gray-300 ${
                  waiverAccepted && "bg-blue-400 border-blue-400"
                }`}
              ></div>
              <div>
                {`I have read and agree to the`}{" "}
                <span className="hover:cursor-pointer text-blue-500 hover:text-blue-400">
                  Waiver, Release of Liability and Assumption of Risks
                </span>
              </div>
            </div>
          </div>
          <button
            disabled={isDisabled}
            onClick={handleSignUp}
            className="w-full disabled:cursor-not-allowed disabled:bg-primary/50 hover:cursor-pointer hover:bg-primary/80 rounded-lg py-2 flex justify-center items-center bg-primary text-white"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </PublicPage>
  );
}
