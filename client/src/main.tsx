import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/contexts/auth-context";
import { BookingProvider } from "@/contexts/booking-context";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BookingProvider>
          <App />
        </BookingProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);
