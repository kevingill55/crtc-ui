"use client";
import MemberNavbar from "../components/MemberNavbar";
import { useProtectedRoute } from "../hooks/useProtectedRoute";

export default function Dashboard() {
  const { user } = useProtectedRoute();

  if (!user) return null;

  return (
    <main className="h-full min-w-full text-primary">
      <MemberNavbar />
      <div className="w-full flex flex-col md:p-10">
        <div className="w-1/2 bg-gray-100 p-6">{`Hey, ${user.first_name}!`}</div>
      </div>
    </main>
  );
}
