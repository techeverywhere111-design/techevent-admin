import { lazy, Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "@/routes";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import AppLoader from "@/components/ui/AppLoader";

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((module) => ({
        default: module.ReactQueryDevtools,
      }))
    )
  : null;

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AuthProvider>
          <ThemeProvider>
            <Suspense fallback={<AppLoader />}>
              <RouterProvider router={router} />
            </Suspense>
            <ToastContainer position="top-right" autoClose={3000} style={{ zIndex: 99999 }} />
          </ThemeProvider>
        </AuthProvider>
      </AppProvider>
      {ReactQueryDevtools ? (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} position="bottom" />
        </Suspense>
      ) : null}
    </QueryClientProvider>
  );
}
