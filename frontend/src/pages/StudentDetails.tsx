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
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Logged in admin info
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const [isExporting, setIsExporting] = useState(false);
  const [isUpdatingDomain, setIsUpdatingDomain] = useState(false);
  const [availableDomains, setAvailableDomains] = useState<any[]>([]);
  
  // Notification State
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState("performance");
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Confirmation state for domain change
  const [confirmSelection, setConfirmSelection] = useState<{ id: string, name: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 1. Fetch Student Details
  const { data: studentData, isLoading, error } = useQuery({
    queryKey: ["studentDetails", id],
    queryFn: async () => {
      const res = await fetch(`https://prepzen-api.onrender.com/admin/student-details/${id}`);
      if (!res.ok) throw new Error("Failed to fetch student details");
      return res.json();
    },
    enabled: !!id,
  });

  // 2. Fetch All Available Domains
  useEffect(() => {
    fetch("https://prepzen-api.onrender.com/domain/get-domain")
      .then(res => res.json())
      .then(data => { if (data.status_code === 200) setAvailableDomains(data.domains); });
  }, []);

  // 3. Admin Function to Change Domain
  const handleChangeDomain = async () => {
    if (!confirmSelection) return;
    setIsUpdatingDomain(true);
    try {
      const response = await fetch(`https://prepzen-api.onrender.com/domain/update-user-domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: id, domain_id: confirmSelection.id }),
      });
      if (!response.ok) throw new Error("Update failed");
      toast.success(`Domain successfully changed to ${confirmSelection.name}`);
      queryClient.invalidateQueries({ queryKey: ["studentDetails", id] });
      setConfirmSelection(null);
      setIsDialogOpen(false);
    } catch (err) {
      toast.error("Failed to change student domain");
    } finally {
      setIsUpdatingDomain(false);
    }
  };

  // 4. NEW: Interaction Logic - Send Notification to Student
  const handleSendNotification = async () => {
    if (!notifMessage.trim()) return;
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
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Report_${studentData?.header.username || id}.pdf`);
    } finally { setIsExporting(false); }
  };

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (error || !studentData) return <div className="text-center py-20 text-destructive font-bold">Student record not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 px-4">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="rounded-full gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Overview
        </Button>
        
        <div className="flex gap-2">
          {/* --- SEND NOTIFICATION DIALOG --- */}
          <Dialog open={isNotifOpen} onOpenChange={setIsNotifOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-primary/50 text-primary hover:bg-primary/5">
                <MessageSquare className="h-4 w-4" /> Send Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Message to {studentData.header.username}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Message Type</label>
                  <div className="flex gap-2">
                    {["performance", "event", "general"].map((t) => (
                      <Button 
                        key={t} 
                        variant={notifType === t ? "default" : "outline"} 
                        size="sm" 
                        className="capitalize text-[10px] h-7 px-3"
                        onClick={() => setNotifType(t)}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>
                <textarea
                  className="w-full min-h-[120px] p-3 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Tell them about their progress..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                />
                <Button 
                  className="w-full gap-2" 
                  onClick={handleSendNotification}
                  disabled={isSendingNotif || !notifMessage.trim()}
                >
                  {isSendingNotif ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Notification
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* --- CHANGE DOMAIN DIALOG --- */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setConfirmSelection(null);
          }}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-2">
                <Edit3 className="h-4 w-4" /> Change Domain
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{confirmSelection ? "Confirm Critical Action" : "Reassign Student Domain"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {!confirmSelection ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Current: <span className="font-bold text-foreground">{studentData.header.domain}</span>
                    </p>
                    <div className="space-y-2">
                      {availableDomains.map((d) => (
                        <Button
                          key={d.domain_id}
                          variant={studentData.header.domain === d.domain_name ? "default" : "outline"}
                          className="w-full justify-between"
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
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                      <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-bold">Are you 100% sure?</p>
                        <p>Changing the domain will reassign the student's learning path.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setConfirmSelection(null)} disabled={isUpdatingDomain}>Cancel</Button>
                      <Button variant="destructive" className="flex-1" onClick={handleChangeDomain} disabled={isUpdatingDomain}>
                        {isUpdatingDomain ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Confirm Change
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={downloadPDF} disabled={isExporting} className="gradient-primary text-white gap-2 shadow-lg">
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            PDF Report
          </Button>
        </div>
      </div>

      <div ref={pdfRef} className="space-y-6 bg-background p-4 rounded-xl border border-border/50">
        {/* ... Rest of Header and Cards ... */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {studentData.header.rank}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{studentData.header.username}</h1>
              <p className="text-sm text-muted-foreground font-mono italic">{studentData.header.domain}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Employee ID: {studentData.header.employee_id}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center px-4 border-r">
              <p className="text-[10px] text-muted-foreground uppercase font-black">Interviews</p>
              <p className="text-xl font-bold">{studentData.header.total_interviews}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-[10px] text-muted-foreground uppercase font-black">Rank</p>
              <p className="text-xl font-bold text-primary">{studentData.header.rank}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Progress</CardTitle></CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                      <span className="font-medium">Completion</span>
                      <span className="text-primary font-bold">{studentData.curriculum.total_completion}%</span>
                  </div>
                  <Progress value={studentData.curriculum.total_completion} className="h-3" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 border">
                      <p className="text-xs text-muted-foreground mb-1">Topics</p>
                      <p className="text-2xl font-bold">{studentData.curriculum.topics_mastered}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border">
                      <p className="text-xs text-muted-foreground mb-1">Avg Score</p>
                      <p className="text-2xl font-bold">{studentData.curriculum.avg_interview_score}</p>
                  </div>
               </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5 shadow-sm">
             <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> AI Insights</CardTitle></CardHeader>
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
                <p className="text-xs leading-relaxed text-muted-foreground italic">"{studentData.ai_evaluation.summary}"</p>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;