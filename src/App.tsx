import { RouterProvider } from "react-router-dom";
import { router } from "@/routes";
import { ThemeProvider } from "@/context/ThemeContext";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <AppProvider>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider>
      </ThemeProvider>
    </AppProvider>
  );
}
