import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, LogOut, User, LayoutDashboard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Determine if we should show Admin-specific links
  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")} 
            className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-lg flex items-center justify-center">
              <img src="/logo_img.png" alt="Logo" className="h-6 w-6 object-contain" />
            </div>
            <span className="hidden sm:inline">Prepzen</span>
          </button>

          {/* ADMIN NAVIGATION LINKS (Visible only to Admins since they have no sidebar) */}
          {isAuthenticated && isAdmin && (
            <nav className="hidden md:flex items-center gap-1">
              <NavLink 
                to="/admin" 
                end
                className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:text-primary text-muted-foreground flex items-center gap-2"
                activeClassName="text-primary bg-primary/10"
              >
                <LayoutDashboard className="h-4 w-4" /> Overview
              </NavLink>
              <NavLink 
                to="/admin/students" 
                className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:text-primary text-muted-foreground flex items-center gap-2"
                activeClassName="text-primary bg-primary/10"
              >
                <Users className="h-4 w-4" /> Registry
              </NavLink>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Global Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="rounded-full"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4" />}
          </Button>

          {isAuthenticated && (
            <>
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm ml-1 border border-border/50">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium max-w-[100px] truncate">
                  {user?.username || user?.employee_id || "User"}
                </span>
                <span className="hidden xs:inline text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase font-bold">
                  {user?.role}
                </span>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout} 
                className="rounded-full text-muted-foreground hover:text-destructive transition-colors ml-1"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;