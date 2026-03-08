import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, Mic, Loader2, Trophy, BookOpen, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Progress } from "@/components/ui/progress";

const LearningPath = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Pull employeeId from persistent storage or context
  const storedUser = JSON.parse(localStorage.getItem("ai_interview_user") || "{}");
  const employeeId = user?.employee_id || storedUser?.employee_id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["learningPath", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("No Employee ID found");

      const response = await fetch("https://prepzen-api.onrender.com/learning/get-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: String(employeeId) }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server Error: ${response.status}`);
      }
      
      const json = await response.json();
      return json.response;
    },
    staleTime: Infinity, 
    enabled: !!employeeId,
  });

  if (isLoading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse font-medium">Syncing your Prepzen roadmap...</p>
    </div>
  );

  if (error) return (
    <div className="p-10 text-center space-y-4 max-w-md mx-auto">
      <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
      <h2 className="text-lg font-bold text-destructive">Connection Issue</h2>
      <p className="text-sm text-muted-foreground">
        We couldn't reach your learning path. Please try again or contact support.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>Retry Connection</Button>
    </div>
  );

  if (!data) return null;

  const isCheckpointReached = data.overall_progress >= 75;

  return (
    <div className="space-y-8 max-w-4xl pb-20">
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Learning Path</h1>
            <p className="text-muted-foreground mt-1">
              Domain: <span className="text-foreground font-medium">{data.domain_name}</span>
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm font-semibold">Progress: {Math.round(data.overall_progress)}%</p>
            <Progress value={data.overall_progress} className="w-full md:w-64 h-2" />
          </div>
        </div>

        {isCheckpointReached && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center gap-4 shadow-sm"
          >
            <Trophy className="h-8 w-8 text-primary shrink-0" />
            <div className="text-sm">
              <p className="font-bold text-primary">75% Checkpoint reached!</p>
              <p>Great work, {data.username}! You've officially unlocked the next interview tier.</p>
            </div>
          </motion.div>
        )}
      </section>

      <div className="space-y-4">
        {data.assignments_status.map((assignment: any, i: number) => {
          const isActive = assignment.status === "pending";
          const isDone = assignment.status === "completed";
          const isLocked = assignment.status === "disabled";

          return (
            <motion.div 
              key={assignment.assignment_id} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`relative transition-all border-l-4 ${
                isDone ? "border-l-success" : isActive ? "border-l-primary shadow-md" : "border-l-muted opacity-60"
              }`}>
                <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-start gap-5 min-w-0 flex-1">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                      isDone ? "bg-success text-success-foreground" : 
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground shadow-inner"
                    }`}>
                      {isDone ? <CheckCircle2 className="h-6 w-6" /> : isLocked ? <Lock className="h-5 w-5" /> : assignment.assignment_id}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{assignment.curriculum}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {assignment.links.map((link: string, idx: number) => (
                          <a 
                            key={idx} 
                            href={link} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[11px] flex items-center gap-1 px-3 py-1.5 rounded-md bg-accent/50 hover:bg-accent border border-transparent hover:border-accent-foreground/10 transition-colors"
                          >
                            <BookOpen className="h-3 w-3" /> Resource {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isActive ? (
                      <Button 
                        onClick={() => navigate("/interview", { 
                          state: { 
                            title: assignment.title, 
                            topics: assignment.curriculum,
                            assignmentId: assignment.assignment_id 
                          } 
                        })} 
                        className="gradient-primary text-primary-foreground font-bold px-8 shadow-lg hover:scale-105 transition-transform"
                      >
                        <Mic className="h-4 w-4 mr-2" /> Start Interview
                      </Button>
                    ) : isDone ? (
                      <div className="text-right bg-success/5 p-2 rounded-lg border border-success/10">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Score</p>
                        <p className="text-xl font-black text-success">{assignment.score}%</p>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm flex items-center gap-1 bg-muted/30 px-3 py-1.5 rounded-md">
                        <Lock className="h-4 w-4" /> Locked
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPath;