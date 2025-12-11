"use client";

import { ReactNode, useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

export function Providers({ children }: { children: ReactNode }) {
  // Create QueryClient once (per browser session)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
