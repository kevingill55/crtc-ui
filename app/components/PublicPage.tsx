"use client";
import { PropsWithChildren } from "react";
import Navbar from "./Navbar";

export const PublicPage = (props: PropsWithChildren) => {
  return (
    <main className="h-full bg-linear-to-r from-amber-100 via-blue-50 to-blue-100 min-w-full text-primary">
      <Navbar />
      <div className="flex w-full justify-center">
        <div className="w-full max-w-200 min-w-100">{props.children}</div>
      </div>
    </main>
  );
};
