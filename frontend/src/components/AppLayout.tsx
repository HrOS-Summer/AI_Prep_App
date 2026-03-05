import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Combined Header Area */}
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