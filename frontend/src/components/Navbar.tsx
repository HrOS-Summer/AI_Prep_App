import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, LogOut, User, LayoutDashboard, Users, Bell, Check, MessageSquare, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query"; // Added for sync

const NotificationBell = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient(); // Access the cache
  const [notifications, setNotifications] = useState<any[]>([]);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    if (!user?.employee_id || user.role === "admin") return;
    try {
      const res = await fetch(`https://prepzen-api.onrender.com/notification/get-notifications/${user.employee_id}`);
      const data = await res.json();
      if (data.status === "success") setNotifications(data.notifications);
    } catch (err) { console.error("Notification fetch failed", err); }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user?.employee_id]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`https://prepzen-api.onrender.com/notification/mark-read/${id}`, { method: "PATCH" });
      if (res.ok) {
        // 1. Update local popover state
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
        
        // 2. IMPORTANT: Invalidate Dashboard Query to make "NEW" badge disappear instantly
        queryClient.invalidateQueries({ queryKey: ["studentDashboard", user?.employee_id] });
      }
    } catch (err) { console.error("Update failed", err); }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full border-2 border-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b flex justify-between items-center">
          <h4 className="font-bold text-sm">Notifications</h4>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>
        </div>
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs italic">No messages yet.</div>
          ) : (
            notifications.map((n) => (
              <div key={n._id} className={`p-4 border-b last:border-0 flex gap-3 transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}>
                <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'performance' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                  {n.type === 'performance' ? <Info className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-xs leading-relaxed font-medium">{n.message}</p>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold">{new Date(n.created_at).toLocaleDateString()}</span>
                    {!n.is_read && (
                      <button onClick={() => markAsRead(n._id)} className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1">
                        <Check className="h-3 w-3" /> Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {isAuthenticated && !isAdmin && !isAdminPath && (
            <SidebarTrigger className="h-9 w-9" />
          )}

          <button 
            onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")} 
            className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-lg flex items-center justify-center">
              <img src="/logo_img.png" alt="Logo" className="h-6 w-6 object-contain" />
            </div>
            <span className="hidden sm:inline">Prepzen</span>
          </button>

          {isAuthenticated && isAdmin && (
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <NavLink to="/admin" end className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:text-primary text-muted-foreground flex items-center gap-2" activeClassName="text-primary bg-primary/10">
                <LayoutDashboard className="h-4 w-4" /> Overview
              </NavLink>
              <NavLink to="/admin/students" className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:text-primary text-muted-foreground flex items-center gap-2" activeClassName="text-primary bg-primary/10">
                <Users className="h-4 w-4" /> Registry
              </NavLink>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && !isAdmin && <NotificationBell />}

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
            {isDark ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4" />}
          </Button>

          {isAuthenticated && (
            <>
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm ml-1 border border-border/50">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium max-w-[100px] truncate">{user?.username || user?.employee_id || "User"}</span>
                <span className="hidden xs:inline text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase font-bold">{user?.role}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full text-muted-foreground hover:text-destructive transition-colors ml-1" title="Logout">
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