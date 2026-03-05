import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, Play, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const topics = [
  { id: 1, name: "HTML Fundamentals", resources: ["MDN Docs", "W3Schools"], completed: true, unlocked: true },
  { id: 2, name: "CSS Layouts", resources: ["CSS Tricks", "Flexbox Froggy"], completed: true, unlocked: true },
  { id: 3, name: "JavaScript Basics", resources: ["JavaScript.info", "Eloquent JS"], completed: false, unlocked: true },
  { id: 4, name: "React Fundamentals", resources: ["React Docs", "React Tutorial"], completed: false, unlocked: false },
  { id: 5, name: "State Management", resources: ["Redux Docs", "Zustand"], completed: false, unlocked: false },
  { id: 6, name: "APIs & Data Fetching", resources: ["REST API Guide", "GraphQL Intro"], completed: false, unlocked: false },
];

const LearningPath = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Learning Path</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete topics sequentially to unlock the next one</p>
      </div>

      <div className="space-y-3">
        {topics.map((topic, i) => (
          <motion.div key={topic.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className={`shadow-card border-border/50 ${!topic.unlocked ? "opacity-50" : ""}`}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                    topic.completed ? "bg-success/10" : topic.unlocked ? "bg-accent" : "bg-muted"
                  }`}>
                    {topic.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : topic.unlocked ? (
                      <span className="text-sm font-bold text-accent-foreground">{topic.id}</span>
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{topic.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {topic.resources.map((r) => (
                        <span key={r} className="text-xs text-primary flex items-center gap-1 cursor-pointer hover:underline">
                          <ExternalLink className="h-3 w-3" /> {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {topic.unlocked && !topic.completed && (
                  <Button size="sm" onClick={() => navigate("/interview")} className="gradient-primary text-primary-foreground shrink-0">
                    <Play className="h-3.5 w-3.5 mr-1" /> Interview
                  </Button>
                )}
                {topic.completed && (
                  <span className="text-xs font-medium text-success shrink-0">Completed</span>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LearningPath;
