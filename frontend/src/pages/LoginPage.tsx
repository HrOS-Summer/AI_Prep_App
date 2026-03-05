import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, ShieldCheck, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LoginPage = () => {
  const [role, setRole] = useState<UserRole>("student");
  const [employeeId, setEmployeeId] = useState(""); // Changed from username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // New error state
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    await login(employeeId, password, role);
    
    // Retrieve the user data we just saved in login()
    const storedUser = JSON.parse(localStorage.getItem("ai_interview_user") || "{}");
    const serverRole = storedUser.role;

    // 1. If the user is an Admin, go to Admin Panel
    if (serverRole === "admin") {
      navigate("/admin");
      return;
    }

    // 2. If Student, check if they have already selected a domain
    if (serverRole === "student") {
      if (!storedUser.domain) {
        navigate("/domain-selection");
      } else {
        navigate("/dashboard");
      }
    }
  } catch (err: any) {
    // Displays the error from FastAPI (e.g., "Incorrect password") in the Alert UI
    setError(err.message || "Invalid credentials. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-md shadow-elevated border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-12 w-12 rounded-xl flex items-center justify-center mb-3">
              <img src="/logo_img.png" alt="Logo" className="h-8 w-8 object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Login to your interview training account</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Message Display */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Role Toggle */}
            <div className="flex rounded-lg bg-muted p-1 mb-6">
              {(["student", "admin"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
                    role === r ? "bg-card shadow-card text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {r === "student" ? <GraduationCap className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  <span className="capitalize">{r}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input 
                  id="employeeId" 
                  value={employeeId} 
                  onChange={(e) => setEmployeeId(e.target.value)} 
                  placeholder="e.g. 2477XXX" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign Up
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;