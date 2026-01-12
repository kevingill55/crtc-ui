"use client";
import MemberNavbar from "../components/MemberNavbar";
import { useProtectedRoute } from "../hooks/useProtectedRoute";

export default function Calendar() {
  useProtectedRoute();
  return (
    <div>
      <MemberNavbar />
      <div>this is the calendar page</div>
    </div>
  );
}
