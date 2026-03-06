import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileText, ChevronRight, CheckCircle2, XCircle, Loader2, ClipboardList } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Report {
  title: string;
  score: number;
  completed_date: string;
  // Note: Backend doesn't send 'passed' or 'feedback' yet, 
  // so we derive 'passed' from score (>= 75%)
}

const ReportCards = () => {
  const { user } = useAuth();
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  const employeeId = user?.employee_id || JSON.parse(localStorage.getItem("ai_interview_user") || "{}")?.employee_id;

  // 1. Fetch Reports from Backend
  const { data, isLoading, error } = useQuery({
    queryKey: ["reports", employeeId],
    queryFn: async () => {
      const response = await fetch("https://prepzen-api.onrender.com/report/get-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employeeId }),
      });
      if (!response.ok) throw new Error("Failed to fetch reports");
      const json = await response.json();
      return json; // Returns { reports: [], completed_count: x }
    },
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const reports: Report[] = data?.reports || [];
  const selectedReport = reports.find((r) => r.title === selectedTitle);

  if (isLoading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Retrieving your academic records...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-20">
      <p className="text-destructive">Error loading report cards.</p>
      <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Report Cards</h1>
        <div className="text-xs font-medium bg-muted px-3 py-1 rounded-full text-muted-foreground">
          Completed: {data?.completed_count || 0}
        </div>
      </div>

      {!selectedTitle ? (
        <div className="space-y-3">
          {reports.length > 0 ? (
            reports.map((r, i) => {
              const isPassed = r.score >= 75; // Logic-based pass check
              return (
                <motion.div key={r.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card 
                    className="shadow-card border-border/50 cursor-pointer hover:border-primary/30 transition-all group" 
                    onClick={() => setSelectedTitle(r.title)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isPassed ? "bg-success/10" : "bg-destructive/10"}`}>
                          {isPassed ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm group-hover:text-primary transition-colors">{r.title}</p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                            Attempted on: {new Date(r.completed_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-sm font-black ${isPassed ? "text-success" : "text-destructive"}`}>{r.score}%</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">{isPassed ? "Pass" : "Retake"}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card className="border-dashed py-12 flex flex-col items-center justify-center text-center opacity-60">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="text-muted-foreground">No Reports Found</CardTitle>
              <p className="text-sm text-muted-foreground max-w-xs mt-2">
                Complete an interview from your learning path to generate your first report card.
              </p>
            </Card>
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" size="sm" onClick={() => setSelectedTitle(null)} className="mb-4 text-muted-foreground hover:text-foreground">
            ← Back to All Reports
          </Button>
          
          {selectedReport && (
            <Card className="shadow-card border-border/50 overflow-hidden">
              <div className={`h-1.5 w-full ${selectedReport.score >= 75 ? "bg-success" : "bg-destructive"}`} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{selectedReport.title}</CardTitle>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${selectedReport.score >= 75 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {selectedReport.score >= 75 ? "Qualified" : "Disqualified"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Record ID: {btoa(selectedReport.title).substring(0, 8).toUpperCase()}</p>
              </CardHeader>
              
              <CardContent className="space-y-6 pt-4">
                <div className="flex items-end gap-2">
                  <div className="text-4xl font-black">{selectedReport.score}%</div>
                  <div className="text-xs text-muted-foreground mb-1">Overall Proficiency</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-3 rounded-lg bg-muted/50 border">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Completion Date</p>
                      <p className="text-sm font-medium">{new Date(selectedReport.completed_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                   </div>
                   <div className="p-3 rounded-lg bg-muted/50 border">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Status</p>
                      <p className={`text-sm font-medium ${selectedReport.score >= 75 ? "text-success" : "text-destructive"}`}>
                        {selectedReport.score >= 75 ? "Passed Interview" : "Retake Required"}
                      </p>
                   </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <h3 className="text-xs font-bold uppercase text-primary mb-2">Performance Insight</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedReport.score >= 75 
                      ? "Your performance indicates a strong grasp of the subject matter. You are well-prepared for the technical interview phase." 
                      : "Based on this score, we recommend reviewing the resource materials in your Learning Path before attempting this topic again."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ReportCards;