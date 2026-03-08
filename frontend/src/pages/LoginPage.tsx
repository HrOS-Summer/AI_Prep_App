import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, ShieldCheck, AlertCircle, Loader2, Eye, EyeOff, Server } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LoginPage = () => {
  const [role, setRole] = useState<UserRole>("student");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTakingLong, setIsTakingLong] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      setIsTakingLong(false);
    }
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsTakingLong(false);

    // Timer for slow server wake-up (Render Free Tier logic)
    const timer = setTimeout(() => {
      setIsTakingLong(true);
    }, 4000);

    try {
      await login(employeeId, password, role);

      const storedUser = JSON.parse(localStorage.getItem("ai_interview_user") || "{}");
      const serverRole = storedUser.role;

      if (serverRole === "admin") {
        navigate("/admin");
        return;
      }

      if (serverRole === "student") {
        if (!storedUser.domain) {
          navigate("/domain-selection");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      // Clear long-loading state immediately on error so messages don't overlap
      setIsTakingLong(false); 
      setError("Invalid credentials. Please check your Employee ID and password.");
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <style dangerouslySetInnerHTML={{ __html: `
        input::-ms-reveal,
        input::-ms-clear {
          display: none;
        }
      `}} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-elevated border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-12 w-12 rounded-xl flex items-center justify-center mb-3">
              <img src="/logo_img.png" alt="Logo" className="h-8 w-8 object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Login to your interview training account</CardDescription>
          </CardHeader>
          <CardContent>
            
            <AnimatePresence mode="wait">
              {/* Prioritize Error message */}
              {error ? (
                <motion.div
                  key="error-alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <Alert variant="destructive" className="py-2 border-destructive/50 bg-destructive/5">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              ) : loading && isTakingLong ? (
                /* Improved neutral message for slow connections */
                <motion.div
                  key="loading-alert"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4"
                >
                  <Alert className="bg-muted/50 border-border text-muted-foreground py-2 italic">
                    <Server className="h-4 w-4 animate-pulse" />
                    <AlertDescription className="text-xs ml-2">
                      Connecting to secure server... this usually takes a few seconds.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              ) : null}
            </AnimatePresence>

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
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full gradient-primary text-primary-foreground flex items-center justify-center gap-2" 
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Verifying..." : "Sign In"}
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