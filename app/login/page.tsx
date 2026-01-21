"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import type { Session, User } from "@supabase/auth-js";
import { supabase } from "../clients/supabase";
import { PublicPage } from "../components/PublicPage";
import {
  NotificationStatus,
  useNotificationsContext,
} from "../providers/Notifications";

const emailRegex = new RegExp(
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

export default function Login() {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const { addNotification } = useNotificationsContext();

  async function handleLogin() {
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    const {
      error,
    }: { data: { session: Session; user: User }; error: Error | null } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      // @ts-expect-error will handle this later
      if (error.code === "invalid_credentials") {
        setError("Failed to login — invalid credentials.");
        return;
      } else {
        setError(error.message);
      }
    } else {
      addNotification({
        id: "temp",
        expiresIn: 5000,
        title: "Logged in successfully",
        status: NotificationStatus.SUCCESS,
      });
      router.push("/member/home");
    }
  }

  const isDisabled = useMemo(() => {
    if (email.length === 0 || password.length === 0) return true;
    return false;
  }, [email, password]);

  return (
    <PublicPage>
      <div className="w-full pt-10 flex flex-col h-full gap-8">
        <h1 className="text-primary font-bold text-2xl">Log In</h1>
        <div className="flex flex-col gap-1">
          <label htmlFor="crtc-email" className="text-gray-600">
            Email
          </label>
          <input
            id="crtc-email"
            value={email}
            onChange={(e) => {
              if (emailError) setEmailError("");
              if (error) setError("");
              setEmail(e.target.value);
            }}
            type="text"
            placeholder="user@email.com"
            className={`w-1/3 min-w-[400px] px-4 py-2 rounded-lg border border-gray-200 focus:outline-1 focus:outline-primary hover:border-gray-400 ${
              emailError.length > 0 && "border-red-500"
            }`}
          />
          {emailError && (
            <span className="text-sm text-red-500">{emailError}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="crtc-password" className="text-gray-600">
            Password
          </label>
          <input
            id="crtc-password"
            value={password}
            onChange={(e) => {
              if (passwordError) setPasswordError("");
              if (error) setError("");
              setPassword(e.target.value);
            }}
            type="password"
            placeholder="Enter your password"
            className={`w-1/3 min-w-[400px] px-4 py-2 rounded-lg border border-gray-200 focus:outline-1 focus:outline-primary hover:border-gray-400 ${
              passwordError.length > 0 && "border-red-500"
            }`}
          />
          {passwordError && (
            <span className="text-sm text-red-500">{passwordError}</span>
          )}
        </div>

        <div className="text-sm">
          {`Can't login?`}{" "}
          <Link href="/reset-password">
            <span className="text-classic-tennis hover:cursor-pointer hover:text-classic-tennis/80 underline">
              Reset password
            </span>
          </Link>
        </div>
        <button
          disabled={isDisabled}
          onClick={handleLogin}
          className="disabled:cursor-not-allowed disabled:bg-primary/50 hover:cursor-pointer hover:bg-primary/80 rounded-lg py-2 w-1/3 min-w-[400px] flex justify-center items-center bg-primary text-white"
        >
          Log In
        </button>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    </PublicPage>
  );
}
