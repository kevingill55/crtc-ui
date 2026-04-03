"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isNetworkError =
    error.message?.toLowerCase().includes("fetch") ||
    error.message?.toLowerCase().includes("network") ||
    error.message?.toLowerCase().includes("cors") ||
    error.message?.toLowerCase().includes("failed to load");

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-r from-amber-100 via-blue-50 to-blue-100">
      <div className="flex flex-col items-center gap-6 text-center max-w-md px-6">
        <div className="flex flex-col items-center gap-2">
          <p className="text-5xl font-bold text-primary/20">!</p>
          <h1 className="text-xl font-semibold text-primary">
            {isNetworkError ? "Unable to connect" : "Something went wrong"}
          </h1>
          <p className="text-sm text-gray-500">
            {isNetworkError
              ? "The server is not responding. Make sure the backend is running and try again."
              : "An unexpected error occurred. You can try refreshing the page."}
          </p>
          {error.message && !isNetworkError && (
            <p className="text-xs text-gray-400 bg-gray-100 rounded-lg px-3 py-2 mt-1 font-mono break-all">
              {error.message}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="px-5 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/80 cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
