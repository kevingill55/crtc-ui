"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "../components/Navbar";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (
    <main className="h-full min-w-full text-primary">
      <Navbar />
      <div className="w-full md:gap-12 gap-4 md:p-14 px-4 py-8 flex justify-center">
        <div className="bg-gray-100 w-full shadow-sm rounded-xl p-4 md:px-12 flex justify-center flex-col md:py-8 md:min-w-[450px] max-w-[700px]">
          <h1 className="text-primary md:text-xl font-[600] font-heading">
            Member login
          </h1>
          <div className="border-[0.5px] border-gray-200 mt-4" />
          <div className="pt-6 flex flex-col gap-3 md:gap-6">
            <div className="flex gap-1 flex-col">
              <label
                htmlFor="crtc-username"
                className="font-heading font-[600] text-sm ml-2 mb-2"
              >
                Username
              </label>
              <input
                id="crtc-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                className="w-full px-6 py-3 rounded-lg bg-blue-100 focus:outline-1 focus:outline-primary"
              />
            </div>
            <div className="flex gap-1 flex-col">
              <label
                htmlFor="crtc-pw"
                className="font-heading font-[600] text-sm ml-2 mb-2"
              >
                Password
              </label>
              <input
                id="crtc-pw"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full px-6 py-3 rounded-lg bg-blue-100 focus:outline-1 focus:outline-primary"
              />
            </div>
            <div className="flex gap-6 items-center pt-6 justify-end">
              <Link href="/forgot-password">
                <button className="text-sm text-secondary underline hover:cursor-pointer">
                  Reset password
                </button>
              </Link>
              <button className="hover:cursor-pointer hover:bg-primary/80 px-6 py-3 rounded-2xl text-white bg-primary text-sm md:text-base">
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
