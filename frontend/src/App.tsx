import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DomainSelection from "./pages/DomainSelection";
import StudentDashboard from "./pages/StudentDashboard";
import LearningPath from "./pages/LearningPath";
import InterviewPage from "./pages/InterviewPage";
import QuizPage from "./pages/QuizPage";
import ReportCards from "./pages/ReportCards";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDetails from "./pages/StudentDetails";
import NotFound from "./pages/NotFound";
import LoadingCube from "@/components/animations/LoadingCube";

const queryClient = new QueryClient();

/**
 * Smart Dashboard Redirector
 * Ensures admins go to /admin and students go to /dashboard
 */
const DashboardRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingCube />;
  
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  return <StudentDashboard />; // Students see the standard dashboard
};

/**
 * Guard: Only Guests (Unauthenticated)
 */
const GuestOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingCube />;
  if (user && user.employee_id) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }
  return <>{children}</>;
};

/**
 * Guard: Any Logged In User
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingCube />;
  if (!user || !user.employee_id) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

/**
 * Guard: Admin Only
 */
const AdminOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingCube />;
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

/**
 * Guard: Student Only (Prevents Admins from seeing Learning Path)
 */
const StudentOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingCube />;
  if (user?.role !== "student") return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
            <Route path="/signup" element={<GuestOnlyRoute><SignupPage /></GuestOnlyRoute>} />

            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              {/* Intelligent Dashboard Route */}
              <Route path="/dashboard" element={<DashboardRedirect />} />

              {/* Student Specific Routes */}
              <Route path="/learning-path" element={<StudentOnlyRoute><LearningPath /></StudentOnlyRoute>} />
              <Route path="/interview" element={<StudentOnlyRoute><InterviewPage /></StudentOnlyRoute>} />
              <Route path="/quiz" element={<StudentOnlyRoute><QuizPage /></StudentOnlyRoute>} />
              <Route path="/report-cards" element={<StudentOnlyRoute><ReportCards /></StudentOnlyRoute>} />
              <Route path="/domain-selection" element={<StudentOnlyRoute><DomainSelection /></StudentOnlyRoute>} />
              
              {/* Admin Specific Routes */}
              <Route path="/admin" element={<AdminOnlyRoute><AdminDashboard /></AdminOnlyRoute>} />
              <Route path="/admin/students" element={<AdminOnlyRoute><AdminDashboard /></AdminOnlyRoute>} />
              <Route path="/admin/students/:id" element={<AdminOnlyRoute><StudentDetails /></AdminOnlyRoute>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;