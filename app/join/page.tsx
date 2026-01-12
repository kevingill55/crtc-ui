"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { AuthSession, AuthUser } from "../types";

export type LoginResponse = {
  session: AuthSession;
  user: AuthUser;
};

const emailRegex = new RegExp(
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [rating, setRating] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const router = useRouter();

  const isDisabled = useMemo(() => {
    if (
      loading ||
      email.length === 0 ||
      password.length === 0 ||
      passwordConfirmation.length === 0 ||
      address.length === 0 ||
      phone.length === 0 ||
      gender.length === 0 ||
      rating.length === 0
    ) {
      return true;
    }
    return false;
  }, [
    email,
    loading,
    password,
    passwordConfirmation,
    phone,
    address,
    rating,
    gender,
  ]);

  async function handleSignUp() {
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (password !== passwordConfirmation) {
      setPasswordError("Passwords must match");
      return;
    }

    setLoading(true);

    try {
      const signUserUpFetch = await fetch("/api/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          gender,
          rating,
          phone,
          address,
          password,
          passwordConfirmation,
        }),
      });

      const { data } = await signUserUpFetch.json();
      if (data.user) {
        setLoading(false);
        router.push("/login");
      }
    } catch (error) {
      setLoading(false);
      console.error("There was an error signing up", error);
    }
  }

  return (
    <main className="h-full min-w-full text-primary">
      <Navbar />
      <div className="w-full h-3/4 px-36">
        <div className="w-full pt-10 pl-[10vw] flex flex-col h-full gap-4">
          <div>
            <h1 className="text-primary font-bold text-2xl">Create account</h1>
            <p className="text-sm text-gray-500">
              Create an account with CRTC to join the waitlist and a board
              member will be in touch soon afterwards.
            </p>
          </div>
          <div className="flex gap-4 w-[700px] justify-between">
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
                className="px-4 py-2 rounded-lg border-1 border-gray-200 focus:outline-1 focus:outline-primary hover:border-gray-400"
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
                className="px-4 py-2 rounded-lg border-1 border-gray-200 focus:outline-1 focus:outline-primary hover:border-gray-400"
              />
            </div>
          </div>

          <div className="flex gap-4 w-[700px] justify-between">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="crtc-email" className="text-gray-600">
                Email
              </label>
              <input
                id="crtc-email"
                value={email}
                onChange={(e) => {
                  if (emailError) setEmailError("");
                  setEmail(e.target.value);
                }}
                type="text"
                placeholder="user@email.com"
                className={`px-4 py-2 rounded-lg border-1 border-gray-200 focus:outline-1 focus:outline-primary hover:border-gray-400 ${
                  emailError && "border-red-500"
                }`}
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="crtc-phone-num" className="text-gray-600">
                Phone number
              </label>
              <input
                maxLength={12}
                id="crtc-phone-num"
                value={phone}
                onChange={(e) => {
                  const validNums = [];
                  const newValue = e.target.value.slice();
                  for (let i = 0; i < newValue.length; i++) {
                    if (Number.isInteger(Number(newValue.charAt(i)))) {
                      validNums.push(newValue.charAt(i));
                      if (validNums.length === 3 || validNums.length === 7) {
                        validNums.push("-");
                      }
                    }
                  }

                  setPhone(validNums.slice(0, 12).join(""));
                }}
                type="text"
                placeholder="xxx-xxx-xxxx"
                className="px-4 py-2 rounded-lg border-1 border-gray-200 focus:outline-1 focus:outline-primary hover:border-gray-400"
              />
            </div>
          </div>
          {emailError && (
            <span className="text-sm text-red-500">{emailError}</span>
          )}

          <div className="flex gap-4 w-[700px] justify-between">
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
                className="px-4 py-2 rounded-lg border-1 border-gray-200 focus:outline-1 focus:outline-primary hover:border-gray-400"
              />
            </div>
          </div>

          <div className="flex gap-4 w-[700px] justify-between">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="crtc-rating" className="text-gray-600">
                Rating
              </label>
              <input
                id="crtc-rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                type="text"
                maxLength={3}
                placeholder="3.5"
                className="px-4 py-2 rounded-lg border-1 border-gray-200 focus:outline-1 focus:outline-primary hover:border-gray-400"
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="crtc-gender" className="text-gray-600">
                Gender
              </label>
              <input
                id="crtc-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                type="text"
                maxLength={1}
                placeholder="M or F"
                className="px-4 py-2 rounded-lg border-1 border-gray-200 focus:outline-1 focus:outline-primary hover:border-gray-400"
              />
            </div>
          </div>

          <div className="flex gap-4 w-[700px] justify-between">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="crtc-password" className="text-gray-600">
                Password
              </label>
              <input
                id="crtc-password"
                value={password}
                onChange={(e) => {
                  if (passwordError) setPasswordError("");
                  setPassword(e.target.value);
                }}
                type="password"
                placeholder="Enter your password"
                className={`px-4 py-2 rounded-lg border-1 border-gray-200 focus:outline-1 focus:outline-primary hover:border-gray-400 ${
                  passwordError.length > 0 && "border-red-500"
                }`}
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="crtc-confirm-password" className="text-gray-600">
                Confirm password
              </label>
              <input
                id="crtc-confirm-password"
                value={passwordConfirmation}
                onChange={(e) => {
                  if (passwordError) setPasswordError("");
                  setPasswordConfirmation(e.target.value);
                }}
                type="password"
                placeholder="Re-enter your password"
                className={`px-4 py-2 rounded-lg border-1 border-gray-200 focus:outline-1 focus:outline-primary hover:border-gray-400 ${
                  passwordError.length > 0 && "border-red-500"
                }`}
              />
            </div>
          </div>
          {passwordError && (
            <span className="text-sm text-red-500">{passwordError}</span>
          )}

          <div className="flex gap-4 items-center w-[700px] mt-8 justify-between">
            <div className="w-full items-center justify-end text-classic-tennis text-sm underline flex">
              Terms and conditions
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
      </div>
    </main>
  );
}
