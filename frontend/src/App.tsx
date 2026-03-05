import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/domain-selection" element={<DomainSelection />} />

            {/* Authenticated routes with sidebar */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/learning-path" element={<LearningPath />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/report-cards" element={<ReportCards />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<AdminDashboard />} />
              <Route path="/admin/students/:id" element={<StudentDetails />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
