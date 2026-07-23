//
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useHydratePermissions } from "@/hooks/useHydratePermissions";
import AppLoader from "@/components/ui/AppLoader";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoaded } = useHydratePermissions();

  if (!isLoaded) {
    return <AppLoader />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
