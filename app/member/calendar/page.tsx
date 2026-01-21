"use client";
import ProtectedPage from "@/app/components/ProtectedPage";

export default function Calendar() {
  return (
    <ProtectedPage title="Calendar">
      <div>This is the calendar page</div>
    </ProtectedPage>
  );
}
