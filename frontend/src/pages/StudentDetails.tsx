import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, BookOpen, Mic } from "lucide-react";

const mockStudent = {
  name: "Alice Johnson",
  domain: "Web Development",
  progress: 75,
  topicsCompleted: 9,
  totalTopics: 12,
  interviews: [
    { topic: "React Hooks", score: 85, passed: true },
    { topic: "REST APIs", score: 72, passed: true },
    { topic: "CSS Flexbox", score: 60, passed: false },
  ],
  quizScores: [
    { quiz: "HTML Quiz", score: 9, total: 10 },
    { quiz: "CSS Quiz", score: 7, total: 10 },
    { quiz: "JS Quiz", score: 8, total: 10 },
  ],
};

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{mockStudent.name}</h1>
          <p className="text-sm text-muted-foreground">Student ID: {id} · {mockStudent.domain}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Learning Progress</p>
              <p className="font-bold">{mockStudent.topicsCompleted}/{mockStudent.totalTopics} Topics</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
              <Mic className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Interviews</p>
              <p className="font-bold">{mockStudent.interviews.length} Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
              <Trophy className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Quiz Score</p>
              <p className="font-bold">80%</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card className="shadow-card border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-base">Interview Report Cards</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {mockStudent.interviews.map((iv) => (
            <div key={iv.topic} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">{iv.topic}</span>
              <div className="flex items-center gap-3">
                <span className={`font-bold text-sm ${iv.passed ? "text-success" : "text-destructive"}`}>{iv.score}%</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${iv.passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {iv.passed ? "PASS" : "FAIL"}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-card border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-base">Quiz Scores</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {mockStudent.quizScores.map((q) => (
            <div key={q.quiz} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{q.quiz}</span>
                <span className="font-medium">{q.score}/{q.total}</span>
              </div>
              <Progress value={(q.score / q.total) * 100} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDetails;
