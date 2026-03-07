import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains number", test: (p: string) => /\d/.test(p) },
  { label: "Contains special character", test: (p: string) => /[!@#$%^&*]/.test(p) },
];

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const employeeIdRegex = /^\d{7}$/; // Fixed to exactly 7 digits

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // States to track if user has finished interacting with a field
  const [touched, setTouched] = useState({
    employeeId: false,
    email: false,
  });

  const { signup } = useAuth();
  const navigate = useNavigate();

  // Validation logic
  const isPasswordValid = passwordRules.every((r) => r.test(password));
  const isEmailValid = emailRegex.test(email);
  const isIdValid = employeeIdRegex.test(employeeId);
  const isFormValid = isPasswordValid && isEmailValid && isIdValid && username.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setLoading(true);
    setServerError(null);

    try {
      await signup(username, email, password, employeeId);
      navigate("/domain-selection");
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-md shadow-elevated border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-12 w-12 rounded-xl flex items-center justify-center mb-3">
              <img src="/logo_img.png" alt="Logo" className="h-8 w-8 object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Start your interview preparation journey</CardDescription>
          </CardHeader>
          
          <CardContent>
            <AnimatePresence>
              {serverError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Employee ID */}
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input 
                  id="employeeId" 
                  value={employeeId} 
                  onChange={(e) => {
                    setEmployeeId(e.target.value);
                    if (serverError) setServerError(null);
                  }} 
                  onBlur={() => handleBlur("employeeId")}
                  placeholder="Enter 7-digit ID" 
                  className={touched.employeeId && !isIdValid ? "border-destructive" : ""}
                  required 
                />
                {touched.employeeId && !isIdValid && (
                  <p className="text-[10px] text-destructive font-medium">Must be exactly 7 numeric digits.</p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" required />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  onBlur={() => handleBlur("email")}
                  placeholder="you@example.com" 
                  className={touched.email && !isEmailValid ? "border-destructive" : ""}
                  required 
                />
                {touched.email && !isEmailValid && (
                  <p className="text-[10px] text-destructive font-medium">Please enter a valid email address.</p>
                )}
              </div>

              {/* Password - Rule validation remains visible while typing */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required />
                {password && (
                  <div className="space-y-1 mt-2">
                    {passwordRules.map((rule) => (
                      <div key={rule.label} className="flex items-center gap-2 text-xs">
                        {rule.test(password) ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-destructive" />
                        )}
                        <span className={rule.test(password) ? "text-success" : "text-muted-foreground"}>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading || !isFormValid}>
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignupPage;