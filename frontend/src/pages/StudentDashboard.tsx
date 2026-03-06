import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { BookOpen, Mic, HelpCircle, Trophy, TrendingUp, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import LoadingCube from "@/components/animations/LoadingCube";

interface QuizRecord {
  _id: string;
  score: string;
  status: string;
  updatedAt: string;
}

interface DashboardData {
  metrics: {
    total_interviews: number;
    quiz_ratio: string;
    avg_interview_score: string;
    path_ratio: string;
    path_percentage: string; // Add this line
  };
  quiz_overview: QuizRecord[];
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const displayName = user?.username || user?.employee_id || "User";

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.employee_id) return;

      try {
        const response = await fetch("https://prepzen-api.onrender.com/dashboard/get-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employee_id: user.employee_id }),
        });

        const result = await response.json();
        if (response.ok) {
          setData(result);
        } else {
          toast.error("Failed to fetch dashboard metrics");
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        toast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.employee_id]);

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
        {/* Replace lucide Loader2 with your custom brand loader */}
        <LoadingCube />
        
        {/* Retain your text but change the animation for a better match */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-muted-foreground text-lg font-medium text-center px-4"
        >
          Analyzing your interview readiness...
        </motion.p>
      </div>
    );
  }

  // Map the API metrics to the UI Stat layout
  const statCards = [
    { label: "Learning Path", value: user?.domain || "General", icon: BookOpen, color: "text-primary" },
    { label: "Interviews Done", value: data?.metrics.total_interviews.toString() || "0", icon: Mic, color: "text-accent-foreground" },
    { label: "Quizzes Passed", value: data?.metrics.quiz_ratio || "0/0", icon: HelpCircle, color: "text-success" },
    { label: "Avg Score", value: data?.metrics.avg_interview_score || "0%", icon: Trophy, color: "text-warning" },
  ];

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold italic">Welcome back, {displayName}!</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your personalized preparation overview for <span className="font-medium text-foreground">{user?.domain || "your domain"}</span>
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="shadow-card border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{s.label}</p>
                  <p className="text-lg font-bold truncate max-w-[120px]">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Tracker */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-card border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Goal Completion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Readiness</span>
                  {/* Displays the string exactly as received: "0.0%" */}
                  <span className="font-semibold text-primary">
                    {data?.metrics.path_percentage || "0%"}
                  </span>
                </div>
                {/* parseFloat converts "0.0%" to 0.0 for the progress bar value */}
                <Progress 
                  value={parseFloat(data?.metrics.path_percentage || "0")} 
                  className="h-2" 
                />
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground leading-relaxed">
                Consistency is key! Complete your learning path to reach 100% readiness.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Quizzes List */}
        <div className="lg:col-span-2">
  <Card className="shadow-card border-border/50">
    <CardHeader className="pb-3 flex flex-row items-center justify-between">
      <CardTitle className="text-base">Recent Quiz Activity</CardTitle>
      <span className="text-xs text-muted-foreground">Last {data?.quiz_overview.length} attempts</span>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {data?.quiz_overview && data.quiz_overview.length > 0 ? (
          // Use [...data.quiz_overview].reverse() to show latest first
          [...data.quiz_overview].reverse().map((quiz, i) => {
            // Recalculate the attempt number based on original length
            // Latest attempt will be Attempt #TotalCount
            const attemptNumber = data.quiz_overview.length - i;

            return (
              <motion.div 
                key={quiz._id} 
                initial={{ opacity: 0, x: 10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-colors"
              >
                <div className="flex items-center gap-3">
                  {quiz.status === "pass" ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    {/* Updated logic: Correct attempt numbering for reversed list */}
                    <p className="text-sm font-semibold">Quiz Attempt #{attemptNumber}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      {new Date(quiz.updatedAt).toLocaleDateString()} at {new Date(quiz.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold px-2 py-1 rounded-md ${quiz.status === "pass" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {quiz.score}%
                  </span>
                </div>
              </motion.div>
            );
          })
        ) : (
          <p className="text-sm text-center py-10 text-muted-foreground">No quiz activity found.</p>
        )}
      </div>
    </CardContent>
  </Card>
</div>
      </div>
    </div>
  );
};

export default StudentDashboard;