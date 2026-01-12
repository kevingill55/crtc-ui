"use client";
import MemberNavbar from "../components/MemberNavbar";
import { useProtectedRoute } from "../hooks/useProtectedRoute";

export default function Leagues() {
  return (
    <div>
      <MemberNavbar />
      <div>this is the leagues page</div>
    </div>
  );
}
