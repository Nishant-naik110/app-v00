"use client";
import { mutationFunction, queryFunction } from "@/services";
import { AxiosRequestConfig } from "axios";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { queryFn: queryFunction, retry: 5 },
          mutations: {
            mutationFn: async (v) => {
              return mutationFunction(v as AxiosRequestConfig);
            },
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
