import { useParams, useNavigate } from "react-router-dom";
import { useRef, useState } from "react"; // Added useRef and useState
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, BookOpen, Mic, Brain, Target, AlertTriangle, Download, Loader2 } from "lucide-react";

// PDF Libraries
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Create a reference to the content area
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const downloadPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;

    setIsExporting(true);
    try {
      // Capture the element as a canvas
      // scale: 2 improves resolution for text clarity
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff" // Ensure a clean background for PDF
      });

      const imgData = canvas.toDataURL("image/png");
      
      // Initialize jsPDF (A4 size)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4"
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Student_Report_${id}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Action Bar (Not part of the PDF) */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="rounded-full gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Admin
        </Button>
        
        <Button 
          onClick={downloadPDF} 
          disabled={isExporting}
          className="gradient-primary text-white gap-2 shadow-lg"
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isExporting ? "Generating PDF..." : "Download Report"}
        </Button>
      </div>

      {/* Wrapper to be captured in PDF */}
      <div ref={pdfRef} className="space-y-6 bg-background p-4 rounded-xl">
        {/* Header with quick stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{mockStudent.name}</h1>
              <p className="text-sm text-muted-foreground font-mono">ID: {id} • {mockStudent.domain}</p>
            </div>
          </div>
          <div className="flex gap-4">
              <div className="text-center px-4 border-r">
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Interviews</p>
                  <p className="text-xl font-bold">{mockStudent.interviews.length}</p>
              </div>
              <div className="text-center px-4">
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Domain Standing</p>
                  <p className="text-xl font-bold text-primary">#14</p>
              </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Progress Card */}
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Curriculum Mastery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                      <span className="font-medium">Total Completion</span>
                      <span className="text-primary font-bold">{mockStudent.progress}%</span>
                  </div>
                  <Progress value={mockStudent.progress} className="h-3" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 border">
                      <p className="text-xs text-muted-foreground mb-1">Topics Mastered</p>
                      <p className="text-2xl font-bold">{mockStudent.topicsCompleted} / {mockStudent.totalTopics}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border">
                      <p className="text-xs text-muted-foreground mb-1">Avg Interview Score</p>
                      <p className="text-2xl font-bold">84%</p>
                  </div>
               </div>
            </CardContent>
          </Card>

          {/* AI Insight Card */}
          <Card className="border-primary/20 bg-primary/5 shadow-sm">
             <CardHeader>
               <CardTitle className="text-lg flex items-center gap-2">
                 <Brain className="h-5 w-5 text-primary" /> AI Evaluation
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Identified Weaknesses</p>
                  <div className="flex flex-wrap gap-2">
                      {["Asynchronous JS", "CSS Grid", "Token Auth"].map(w => (
                          <span key={w} className="text-[10px] bg-destructive/10 text-destructive px-2 py-1 rounded-full font-bold flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> {w}
                          </span>
                      ))}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {mockStudent.name} shows strong logical reasoning but struggles with complex layouts.
                </p>
             </CardContent>
          </Card>
        </div>

        {/* Detailed Logs and Proficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Interview Performance Log</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                 {mockStudent.interviews.map((iv, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-xl border">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${iv.passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                              <Mic className="h-4 w-4" />
                          </div>
                          <div>
                              <p className="text-sm font-bold">{iv.topic}</p>
                              <p className="text-[10px] text-muted-foreground">March 04, 2026</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className={`text-sm font-black ${iv.passed ? "text-success" : "text-destructive"}`}>{iv.score}%</p>
                          <p className="text-[10px] font-bold text-muted-foreground">{iv.passed ? "QUALIFIED" : "RETAKE"}</p>
                      </div>
                   </div>
                 ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Skill Proficiency</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                 {skills.map(skill => (
                   <div key={skill.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                          <span className="font-bold">{skill.name}</span>
                          <span className="text-muted-foreground">{skill.level}</span>
                      </div>
                      <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(step => (
                              <div key={step} className={`h-1.5 flex-1 rounded-full ${step <= skill.val ? "bg-primary" : "bg-muted"}`} />
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

const skills = [
    { name: "Logic & Problem Solving", level: "Expert", val: 5 },
    { name: "Framework Knowledge", level: "Intermediate", val: 3 },
    { name: "Styling & UI", level: "Beginner", val: 2 },
    { name: "API Integration", level: "Advanced", val: 4 },
];

const mockStudent = {
    name: "Alice Johnson",
    domain: "Quality Engineering",
    progress: 75,
    topicsCompleted: 9,
    totalTopics: 12,
    interviews: [
      { topic: "Manual Testing Basics", score: 85, passed: true },
      { topic: "API Automation", score: 72, passed: true },
      { topic: "Selenium Grid", score: 55, passed: false },
    ]
};

export default StudentDetails;