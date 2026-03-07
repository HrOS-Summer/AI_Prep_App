import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { BookOpen, Mic, HelpCircle, Trophy, TrendingUp, CheckCircle2, Crown, XCircle, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
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
    path_percentage: string;
  };
  quiz_overview: QuizRecord[];
}

interface LeaderboardEntry {
  employee_id: string;
  username: string;
  avg_score: number;
  rank: number;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const displayName = user?.username || user?.employee_id || "User";

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user?.employee_id) return;

      try {
        // Fetch Dashboard Metrics
        const dashboardRes = await fetch("https://prepzen-api.onrender.com/dashboard/get-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employee_id: user.employee_id }),
        });
        
        if (dashboardRes.ok) {
          const dResult = await dashboardRes.json();
          setData(dResult);
        }

        // Fetch Leaderboard
        const leaderboardRes = await fetch(`https://prepzen-api.onrender.com/leaderboard/${user.domain || 'General'}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (leaderboardRes.ok) {
          const lResult = await leaderboardRes.json();
          setLeaderboard(lResult.top_performers);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        toast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user?.employee_id, user?.domain]);

  const currentUserRank = useMemo(() => {
    return leaderboard.find(entry => entry.employee_id === user?.employee_id);
  }, [leaderboard, user?.employee_id]);

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
        <LoadingCube />
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

  const statCards = [
    { label: "Learning Path", value: user?.domain || "General", icon: BookOpen, color: "text-primary", path: "/learning-path" },
    { label: "Interviews Done", value: data?.metrics.total_interviews.toString() || "0", icon: Mic, color: "text-accent-foreground", path: "/interview" },
    { label: "Quizzes Passed", value: data?.metrics.quiz_ratio || "0/0", icon: HelpCircle, color: "text-success", path: "/quiz" },
    { label: "Avg Score", value: data?.metrics.avg_interview_score || "0%", icon: Trophy, color: "text-warning", path: "/report-cards" },
  ];

  return (
    <div className="space-y-6 max-w-6xl pb-10 px-4 md:px-0">
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
            <Link to={s.path}>
              <Card className="shadow-card border-border/50 hover:border-primary/20 transition-colors cursor-pointer">
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
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Row 1: Left Side - Goal Completion (Lg: 5 cols) */}
        <div className="lg:col-span-5 h-full">
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
                  <span className="font-semibold text-primary">
                    {data?.metrics.path_percentage || "0%"}
                  </span>
                </div>
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

        {/* Row 1: Right Side - Leaderboard (Lg: 7 cols) */}
        <div className="lg:col-span-7 h-full">
          <Card className="shadow-card border-border/50 h-[320px] lg:h-full flex flex-col overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-warning" /> {user?.domain || "General"} Rankings
                </div>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Top Performers</span>
              </CardTitle>
            </CardHeader>
            
            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, i) => (
                  <div 
                    key={entry.employee_id} 
                    className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                      entry.employee_id === user?.employee_id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold w-4 text-muted-foreground">
                        {i + 1}.
                      </span>
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                        {i === 0 ? <Trophy className="h-4 w-4 text-warning" /> : <UserIcon className="h-4 w-4" />}
                      </div>
                      <p className="text-sm font-medium truncate max-w-[150px]">{entry.username}</p>
                    </div>
                    <span className="text-xs font-bold text-primary">{entry.avg_score}%</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs py-10 text-muted-foreground">No rankings available yet.</p>
              )}
            </div>

            {/* FIXED Current User Rank */}
            {currentUserRank && (
              <div className="p-4 border-t bg-primary text-primary-foreground mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                      {currentUserRank.rank}
                    </div>
                    <div>
                      <p className="text-xs font-bold">Your Rank</p>
                      <p className="text-[10px] opacity-70 uppercase tracking-tighter">Based on avg score</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold">{currentUserRank.avg_score}%</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Row 2: Recent Activity (Full Width Lg: 12 cols) */}
        <div className="lg:col-span-12 mt-2">
          <Card className="shadow-card border-border/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Quiz Activity</CardTitle>
              <span className="text-xs text-muted-foreground">Last {data?.quiz_overview.length} attempts</span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data?.quiz_overview && data.quiz_overview.length > 0 ? (
                  [...data.quiz_overview].reverse().slice(0, 4).map((quiz, i) => {
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
                            <p className="text-sm font-semibold">Quiz #{attemptNumber}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">
                              {new Date(quiz.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold px-2 py-1 rounded-md ${quiz.status === "pass" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                          {quiz.score}%
                        </span>
                      </motion.div>
                    );
                  })
                ) : (
                  <p className="text-sm text-center py-6 text-muted-foreground md:col-span-2">No quiz activity found.</p>
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