"use client";
import ProtectedPage from "@/app/components/ProtectedPage";

export default function Open() {
  return (
    <ProtectedPage title="Open tennis">
      <div>This is the open tennis page</div>
    </ProtectedPage>
  );
}
