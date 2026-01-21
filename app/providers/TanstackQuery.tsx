"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

export const tanstackQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export const TanstackQuery = (props: PropsWithChildren) => {
  return (
    <QueryClientProvider client={tanstackQueryClient}>
      {props.children}
    </QueryClientProvider>
  );
};
