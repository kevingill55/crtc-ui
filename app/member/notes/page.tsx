"use client";
import ProtectedPage from "@/app/components/ProtectedPage";

export default function Notes() {
  return (
    <ProtectedPage title="Meeting notes">
      <div>This is the meeting notes page</div>
    </ProtectedPage>
  );
}
