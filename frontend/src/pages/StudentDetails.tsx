import { useParams, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, Trophy, Mic, Brain, Target, AlertTriangle, 
  Download, Loader2, Edit3, Check, AlertCircle, MessageSquare, Send 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext"; 
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>(); // Type safety for ID
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth(); 
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const [isExporting, setIsExporting] = useState(false);
  const [isUpdatingDomain, setIsUpdatingDomain] = useState(false);
  const [availableDomains, setAvailableDomains] = useState<any[]>([]);
  
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState("performance");
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const [confirmSelection, setConfirmSelection] = useState<{ id: string, name: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Redirect if not admin (Extra layer of security)
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
      toast.error("Unauthorized access.");
    }
  }, [user, navigate]);

  const { data: studentData, isLoading, error } = useQuery({
    queryKey: ["studentDetails", id],
    queryFn: async () => {
      const res = await fetch(`https://prepzen-api.onrender.com/admin/student-details/${id}`);
      if (!res.ok) throw new Error("Failed to fetch student details");
      return res.json();
    },
    enabled: !!id,
  });

  useEffect(() => {
    fetch("https://prepzen-api.onrender.com/domain/get-domain")
      .then(res => res.json())
      .then(data => { if (data.status_code === 200) setAvailableDomains(data.domains); });
  }, []);

  const handleChangeDomain = async () => {
    if (!confirmSelection || !id) return;
    setIsUpdatingDomain(true);
    try {
      const response = await fetch(`https://prepzen-api.onrender.com/domain/update-user-domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: id, domain_id: confirmSelection.id }),
      });
      if (!response.ok) throw new Error("Update failed");
      
      toast.success(`Domain changed to ${confirmSelection.name}`);
      queryClient.invalidateQueries({ queryKey: ["studentDetails", id] });
      // Also invalidate allStudents to keep registry updated
      queryClient.invalidateQueries({ queryKey: ["allStudents"] });
      
      setConfirmSelection(null);
      setIsDialogOpen(false);
    } catch (err) {
      toast.error("Failed to change student domain");
    } finally {
      setIsUpdatingDomain(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notifMessage.trim() || !id) return;
    setIsSendingNotif(true);
    try {
      const response = await fetch(`https://prepzen-api.onrender.com/notification/send-notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          employee_id: id, 
          admin_id: user?.employee_id, 
          message: notifMessage,
          type: notifType
        }),
      });

      if (!response.ok) throw new Error("Failed to send");
      
      toast.success(`Message sent to ${studentData.header.username}`);
      setNotifMessage("");
      setIsNotifOpen(false);
    } catch (err) {
      toast.error("Failed to send notification");
    } finally {
      setIsSendingNotif(false);
    }
  };

  const downloadPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        backgroundColor: "#ffffff",
        useCORS: true,
        windowWidth: 1200 // Ensures consistent layout in PDF regardless of screen size
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Prepzen_Report_${studentData?.header.username || id}.pdf`);
    } finally { setIsExporting(false); }
  };

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (error || !studentData) return <div className="text-center py-20 text-destructive font-bold">Student record not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 px-4">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="rounded-full gap-2">
          <ArrowLeft className="h-4 w-4" /> Overview
        </Button>
        
        <div className="flex gap-2">
          <Dialog open={isNotifOpen} onOpenChange={setIsNotifOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-primary/50 text-primary hover:bg-primary/5 shadow-sm">
                <MessageSquare className="h-4 w-4" /> Message Candidate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" /> Message to {studentData.header.username}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Category</label>
                  <div className="flex gap-2">
                    {["performance", "event", "general"].map((t) => (
                      <Button 
                        key={t} 
                        variant={notifType === t ? "default" : "outline"} 
                        size="sm" 
                        className="capitalize text-[10px] h-7 px-3 rounded-full"
                        onClick={() => setNotifType(t)}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>
                <textarea
                  className="w-full min-h-[120px] p-4 rounded-xl border bg-muted/30 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Provide detailed feedback or instructions..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                />
                <Button 
                  className="w-full gap-2 gradient-primary shadow-md" 
                  onClick={handleSendNotification}
                  disabled={isSendingNotif || !notifMessage.trim()}
                >
                  {isSendingNotif ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Deliver Message
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setConfirmSelection(null);
          }}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-2 shadow-sm">
                <Edit3 className="h-4 w-4" /> Reassign Domain
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{confirmSelection ? "Confirm Transfer" : "Select New Domain"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {!confirmSelection ? (
                  <>
                    <p className="text-xs text-muted-foreground px-1">
                      Moving a student will reset their current learning path progress.
                    </p>
                    <div className="space-y-2">
                      {availableDomains.map((d) => (
                        <Button
                          key={d.domain_id}
                          variant={studentData.header.domain === d.domain_name ? "default" : "outline"}
                          className="w-full justify-between h-11 px-4"
                          disabled={studentData.header.domain === d.domain_name}
                          onClick={() => setConfirmSelection({ id: d.domain_id, name: d.domain_name })}
                        >
                          {d.domain_name}
                          {studentData.header.domain === d.domain_name && <Check className="h-4 w-4" />}
                        </Button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive">
                      <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-black uppercase text-[10px] tracking-tighter mb-1">Warning: Critical Action</p>
                        <p className="leading-relaxed">This will override <b>{studentData.header.username}'s</b> current curriculum with the <b>{confirmSelection.name}</b> roadmap.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setConfirmSelection(null)} disabled={isUpdatingDomain}>Go Back</Button>
                      <Button variant="destructive" className="flex-1" onClick={handleChangeDomain} disabled={isUpdatingDomain}>
                        {isUpdatingDomain ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Confirm Reassignment"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={downloadPDF} disabled={isExporting} className="gradient-primary text-white gap-2 shadow-md">
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export PDF
          </Button>
        </div>
      </div>

      <div ref={pdfRef} className="space-y-6 bg-background p-6 rounded-3xl border border-border/50 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-muted/30 p-8 rounded-2xl border border-border/50">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-primary/20">
              {studentData.header.rank}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{studentData.header.username}</h1>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-xs font-bold uppercase px-2 py-0.5 bg-primary/10 text-primary rounded">{studentData.header.domain}</span>
                 <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">ID: {studentData.header.employee_id}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Interviews</p>
              <p className="text-3xl font-black">{studentData.header.total_interviews}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Status</p>
              <p className="text-sm font-bold text-success flex items-center gap-1"><Check className="h-4 w-4" /> Active</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 shadow-sm border-none bg-muted/20">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary"><Target className="h-4 w-4" /> Curriculum Mastery</CardTitle></CardHeader>
            <CardContent className="space-y-8 p-6 pt-2">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                      <span>Course Progression</span>
                      <span className="text-primary">{studentData.curriculum.total_completion}%</span>
                  </div>
                  <Progress value={studentData.curriculum.total_completion} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-background border shadow-sm">
                      <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Modules Cleared</p>
                      <p className="text-3xl font-black text-foreground">{studentData.curriculum.topics_mastered}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-background border shadow-sm">
                      <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Average Accuracy</p>
                      <p className="text-3xl font-black text-primary">{studentData.curriculum.avg_interview_score}</p>
                  </div>
                </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-primary/5 shadow-sm overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Brain className="h-20 w-20" /></div>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary"><Brain className="h-4 w-4" /> AI Diagnostics</CardTitle></CardHeader>
             <CardContent className="space-y-6 p-6 pt-2 relative z-10">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Identified Gaps</p>
                  <div className="flex flex-wrap gap-2">
                      {studentData.ai_evaluation.weaknesses.map((w: string) => (
                          <span key={w} className="text-[9px] bg-destructive/10 text-destructive px-3 py-1 rounded-full font-black uppercase flex items-center gap-1 border border-destructive/5">
                              <AlertTriangle className="h-2.5 w-2.5" /> {w}
                          </span>
                      ))}
                  </div>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Performance Summary</p>
                   <p className="text-xs leading-relaxed text-muted-foreground font-medium italic bg-background/50 p-4 rounded-xl border border-border/50">"{studentData.ai_evaluation.summary}"</p>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;