import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </ThemeProvider>
  );
}
