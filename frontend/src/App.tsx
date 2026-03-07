import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext"; // Ensure correct path
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

const GuestOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center bg-background"><LoadingCube /></div>;
  if (user && user.employee_id) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center bg-background"><LoadingCube /></div>;
  if (!user || !user.employee_id) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center bg-background"><LoadingCube /></div>;
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* ThemeProvider must be at the very top to affect all components */}
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Landing page is accessible to everyone */}
              <Route path="/" element={<Index />} />

              <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
              <Route path="/signup" element={<GuestOnlyRoute><SignupPage /></GuestOnlyRoute>} />

              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/domain-selection" element={<DomainSelection />} />
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/learning-path" element={<LearningPath />} />
                <Route path="/interview" element={<InterviewPage />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/report-cards" element={<ReportCards />} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/students/:id" element={<AdminRoute><StudentDetails /></AdminRoute>} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;