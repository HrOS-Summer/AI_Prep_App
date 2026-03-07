import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const AppLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Determine if we should hide the sidebar
  // Hide if the user is an admin OR if the path starts with /admin
  const isAdminPath = location.pathname.startsWith("/admin");
  const shouldHideSidebar = user?.role === "admin" || isAdminPath;

  if (shouldHideSidebar) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        {/* Full width main content for Admin */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex flex-col">
            <Navbar />
            <div className="flex items-center px-4 h-10 bg-muted/30 border-b">
              <SidebarTrigger className="h-7 w-7" />
              <span className="ml-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Workspace
              </span>
            </div>
          </div>
          
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;