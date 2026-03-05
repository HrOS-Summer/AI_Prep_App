import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileText, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

const reports = [
  { id: 1, topic: "HTML Fundamentals", date: "2026-02-20", score: 90, passed: true, feedback: "Excellent understanding of semantic HTML, accessibility attributes, and document structure." },
  { id: 2, topic: "CSS Layouts", date: "2026-02-23", score: 78, passed: true, feedback: "Good grasp of flexbox and grid. Could improve on responsive design patterns and CSS custom properties." },
  { id: 3, topic: "JavaScript Basics", date: "2026-02-28", score: 55, passed: false, feedback: "Needs improvement on closures, prototypal inheritance, and async/await patterns. Review event loop concepts." },
  { id: 4, topic: "React Hooks", date: "2026-03-01", score: 85, passed: true, feedback: "Strong understanding of useState and useEffect. Good examples of custom hooks and memoization." },
];

const ReportCards = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const detail = reports.find((r) => r.id === selected);

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Report Cards</h1>

      {!detail ? (
        <div className="space-y-3">
          {reports.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="shadow-card border-border/50 cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => setSelected(r.id)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {r.passed ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                    <div>
                      <p className="font-medium text-sm">{r.topic}</p>
                      <p className="text-xs text-muted-foreground">{r.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${r.passed ? "text-success" : "text-destructive"}`}>{r.score}%</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                      {r.passed ? "PASS" : "FAIL"}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="mb-4">← Back to Reports</Button>
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{detail.topic}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">{detail.date}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold">{detail.score}%</div>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${detail.passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {detail.passed ? "PASSED" : "FAILED"}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Feedback</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{detail.feedback}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ReportCards;
