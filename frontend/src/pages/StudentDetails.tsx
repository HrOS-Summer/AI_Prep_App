import { useParams, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Mic, Brain, Target, AlertTriangle, Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // FETCH REAL DATA
  const { data: studentData, isLoading, error } = useQuery({
    queryKey: ["studentDetails", id],
    queryFn: async () => {
      const res = await fetch(`https://prepzen-api.onrender.com/admin/student-details/${id}`);
      if (!res.ok) throw new Error("Failed to fetch student details");
      return res.json();
    },
    enabled: !!id,
  });

  const downloadPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Report_${studentData?.header.username || id}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (error || !studentData) return <div className="text-center py-20 text-destructive font-bold">Student record not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="rounded-full gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Overview
        </Button>
        <Button onClick={downloadPDF} disabled={isExporting} className="gradient-primary text-white gap-2 shadow-lg">
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download PDF Report
        </Button>
      </div>

      <div ref={pdfRef} className="space-y-6 bg-background p-4 rounded-xl">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {studentData.header.rank}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{studentData.header.username}</h1>
              <p className="text-sm text-muted-foreground font-mono">ID: {studentData.header.employee_id} • {studentData.header.domain}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center px-4 border-r">
              <p className="text-[10px] text-muted-foreground uppercase font-black">Interviews</p>
              <p className="text-xl font-bold">{studentData.header.total_interviews}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-[10px] text-muted-foreground uppercase font-black">Global Rank</p>
              <p className="text-xl font-bold text-primary">{studentData.header.rank}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PROGRESS CARD */}
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Curriculum Mastery</CardTitle></CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                      <span className="font-medium">Path Completion</span>
                      <span className="text-primary font-bold">{studentData.curriculum.total_completion}%</span>
                  </div>
                  <Progress value={studentData.curriculum.total_completion} className="h-3" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 border">
                      <p className="text-xs text-muted-foreground mb-1">Topics Mastered</p>
                      <p className="text-2xl font-bold">{studentData.curriculum.topics_mastered}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border">
                      <p className="text-xs text-muted-foreground mb-1">Avg Interview Score</p>
                      <p className="text-2xl font-bold">{studentData.curriculum.avg_interview_score}</p>
                  </div>
               </div>
            </CardContent>
          </Card>

          {/* AI EVALUATION CARD */}
          <Card className="border-primary/20 bg-primary/5 shadow-sm">
             <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> AI Evaluation</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Weaknesses</p>
                  <div className="flex flex-wrap gap-2">
                      {studentData.ai_evaluation.weaknesses.map((w: string) => (
                          <span key={w} className="text-[10px] bg-destructive/10 text-destructive px-2 py-1 rounded-full font-bold flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> {w}
                          </span>
                      ))}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground italic">"{studentData.ai_evaluation.summary}"</p>
             </CardContent>
          </Card>
        </div>

        {/* LOGS AND SKILLS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Performance Log</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                 {studentData.performance_log.map((log: any, i: number) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-xl border">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${log.status === "QUALIFIED" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                              <Mic className="h-4 w-4" />
                          </div>
                          <div>
                              <p className="text-sm font-bold">Interview Topic {log.topic}</p>
                              <p className="text-[10px] text-muted-foreground">{log.date}</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className={`text-sm font-black ${log.status === "QUALIFIED" ? "text-success" : "text-destructive"}`}>{log.score}</p>
                          <p className="text-[10px] font-bold text-muted-foreground">{log.status}</p>
                      </div>
                   </div>
                 ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Skill Proficiency</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                 {Object.entries(studentData.skill_proficiency).map(([name, value]: [string, any]) => (
                   <div key={name} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                          <span className="font-bold">{name}</span>
                          <span className="text-muted-foreground">{value}%</span>
                      </div>
                      <div className="flex gap-1">
                          {[20, 40, 60, 80, 100].map(step => (
                              <div key={step} className={`h-1.5 flex-1 rounded-full ${Number(value) >= step ? "bg-primary" : "bg-muted"}`} />
                          ))}
                      </div>
                   </div>
                 ))}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;