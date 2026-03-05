import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { BookOpen, Mic, HelpCircle, Trophy, TrendingUp, CheckCircle2 } from "lucide-react";

const recentInterviews = [
  { topic: "React Hooks", score: 85, date: "2026-03-01", passed: true },
  { topic: "REST APIs", score: 72, date: "2026-02-28", passed: true },
  { topic: "CSS Flexbox", score: 60, date: "2026-02-25", passed: false },
];

const stats = [
  { label: "Topics Completed", value: "5/12", icon: BookOpen, color: "text-primary" },
  { label: "Interviews Done", value: "8", icon: Mic, color: "text-accent-foreground" },
  { label: "Quizzes Passed", value: "3/4", icon: HelpCircle, color: "text-success" },
  { label: "Avg Score", value: "78%", icon: Trophy, color: "text-warning" },
];

const StudentDashboard = () => {
  const { user } = useAuth();

  const displayName = user?.username || user?.employee_id || "User";

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Fix: use displayName to ensure something is always visible */}
        <h1 className="text-2xl font-bold italic">Welcome back, {displayName}!</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Domain: <span className="font-medium text-foreground">{user?.domain || "Not selected"}</span>
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="shadow-card border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Progress */}
      <Card className="shadow-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Learning Path Completion</span>
              <span className="font-semibold">42%</span>
            </div>
            <Progress value={42} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Interviews */}
      <Card className="shadow-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentInterviews.map((interview) => (
              <div key={interview.topic} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`h-4 w-4 ${interview.passed ? "text-success" : "text-destructive"}`} />
                  <div>
                    <p className="text-sm font-medium">{interview.topic}</p>
                    <p className="text-xs text-muted-foreground">{interview.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${interview.passed ? "text-success" : "text-destructive"}`}>
                    {interview.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
