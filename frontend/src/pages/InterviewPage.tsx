import { useState, useEffect, useRef } from "react";
import { vapi } from "@/utils/vapiHelper";
import { useAuth } from "@/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, PhoneOff, Bot, User, Video, VideoOff, 
  Loader2, AlertTriangle, Download, CheckCircle2, XCircle, TrendingUp, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const InterviewPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { title, topics, assignmentId } = location.state || {};

  // UI States
  const [isCalling, setIsCalling] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcripts, setTranscripts] = useState<{role: string, text: string}[]>([]);
  const [cameraOn, setCameraOn] = useState(false);
  
  // Backend Sync States
  const [isInitializing, setIsInitializing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [interviewId, setInterviewId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to explicitly stop the camera
  const stopCameraHardware = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  // --- 1. CAMERA FIX ---
  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(console.error);
    }
  }, [cameraOn]);

  const toggleCamera = async () => {
    try {
      if (!cameraOn) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        setCameraOn(true);
      } else {
        stopCameraHardware();
      }
    } catch (err) { toast.error("Camera access denied"); }
  };

  // --- 2. VAPI LISTENERS ---
  useEffect(() => {
    vapi.on("call-start", () => {
      setIsCalling(true);
      setIsInitializing(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    });
    vapi.on("call-end", () => {
      setIsCalling(false);
      setIsAssistantSpeaking(false);
      // Automatically switch off camera when call ends
      stopCameraHardware();
    });
    vapi.on("speech-start", () => setIsAssistantSpeaking(true));
    vapi.on("speech-end", () => setIsAssistantSpeaking(false));
    vapi.on("message", (msg: any) => {
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        setIsUserSpeaking(msg.role === "user");
        setTranscripts(prev => [...prev, { 
          role: msg.role === "assistant" ? "ai" : "user", 
          text: msg.transcript 
        }]);
      }
    });
    return () => { 
      vapi.stop();
      stopCameraHardware(); // Cleanup hardware on unmount
    };
  }, []);

  // --- 3. START INTERVIEW PROCESS ---
  const handleStartProcess = async () => {
    const mongoId = user?.user_id;

    if (!mongoId || mongoId.length !== 24) {
      toast.error("Authentication Sync Error. Please logout and login again to refresh your session.");
      return;
    }

    setIsInitializing(true);
    try {
      const scheduleRes = await fetch("https://prepzen-api.onrender.com/response/schedule-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: mongoId,
          proficiency: "Intermediate",
          topic: parseInt(assignmentId) || 0,
          numQuestions: "5"
        })
      });

      const sessionData = await scheduleRes.json();
      if (!scheduleRes.ok) throw new Error(sessionData.detail || "Server failed to start session");

      setInterviewId(sessionData.interview_id);
      const aiQuestionsList = sessionData.response.questions.join(", ");

      timeoutRef.current = setTimeout(() => {
        if (!isCalling) {
          vapi.stop();
          setIsInitializing(false);
          toast.error("Vapi connection timed out. Please try again.");
        }
      }, 12000);

      await vapi.start({
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [{
            role: "system",
            content: `You are a technical interviewer. You must interview the candidate on these specific topics: ${aiQuestionsList}.
            
            Rules:
            1. Ask one question at a time.
            2. Wait for the candidate to answer before proceeding.
            3. Start by saying: "Hello! Welcome to the interview for ${title}. I hope you have successfully completed your checkpoint. Are you ready and excited to begin?"`
          }]
        }
      });
    } catch (err: any) {
      setIsInitializing(false);
      toast.error(err.message || "Failed to initialize interview.");
    }
  };

  // --- 4. FINISH & ANALYZE ---
  const handleFinishAndAnalyze = async () => {
    vapi.stop();
    stopCameraHardware(); // Explicitly stop camera when user ends interview

    if (transcripts.length < 4) {
      toast.warning("The session was too short. Please answer at least a few questions for an accurate report.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const formattedTranscribe = transcripts.reduce((acc: any, curr, idx) => {
        acc[String(idx)] = `${curr.role.toUpperCase()}: ${curr.text}`;
        return acc;
      }, {});

      const res = await fetch("https://prepzen-api.onrender.com/feedback/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interview_id: interviewId,
          transcribe: formattedTranscribe
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Evaluation failed");

      setReport(data.response);
      if (data.response.percentage >= 75) {
        toast.success("Congratulations! You've mastered this checkpoint.");
      }
    } catch (err) {
      toast.error("Could not generate report. Check your dashboard for updates.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadPDF = async () => {
    const element = reportRef.current;
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Prepzen_Report_${user?.username}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 pb-20">
      {!report ? (
        <>
          <div className="flex justify-between items-center bg-card p-6 rounded-2xl border shadow-sm">
            <div>
              <h1 className="text-2xl font-bold">{title || "Interview Session"}</h1>
              <p className="text-muted-foreground text-sm italic">Curriculum: {topics}</p>
            </div>
            {!isCalling ? (
              <Button onClick={handleStartProcess} disabled={isInitializing} size="lg" className="gradient-primary px-8">
                {isInitializing ? <Loader2 className="animate-spin mr-2" /> : <Mic className="mr-2 h-5 w-5" />}
                Start Interview
              </Button>
            ) : (
              <Button variant="destructive" onClick={handleFinishAndAnalyze} size="lg">
                <PhoneOff className="mr-2 h-5 w-5" /> Finish & Analyze
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="h-80 flex flex-col items-center justify-center relative bg-muted/20 border-2">
              <AnimatePresence>
                {isAssistantSpeaking && (
                  <motion.div initial={{ scale: 1 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ repeat: Infinity, duration: 1 }} className="absolute h-32 w-32 bg-primary/20 rounded-full" />
                )}
              </AnimatePresence>
              <Bot className={`h-20 w-20 ${isAssistantSpeaking ? "text-primary" : "text-muted-foreground"}`} />
              <p className="mt-4 font-bold uppercase text-[10px] tracking-widest opacity-50">AI Interviewer</p>
            </Card>

            <Card className="h-80 flex flex-col items-center justify-center p-0 relative border-2 overflow-hidden bg-black">
              {cameraOn ? (
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
              ) : (
                <User className="h-20 w-20 text-muted-foreground" />
              )}
              <div className="absolute bottom-4 right-4">
                <Button variant={cameraOn ? "destructive" : "secondary"} size="icon" onClick={toggleCamera}>
                  {cameraOn ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                </Button>
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-accent/5 border-dashed border-2 min-h-[100px] flex items-center justify-center">
            {isAnalyzing ? (
              <div className="flex items-center gap-3 font-medium text-primary">
                <Loader2 className="animate-spin" /> Analyzing your responses with AI...
              </div>
            ) : transcripts.length > 0 ? (
              <p className="text-lg text-center font-medium">"{transcripts[transcripts.length - 1].text}"</p>
            ) : (
              <p className="text-muted-foreground italic">Connect your camera and click start to begin.</p>
            )}
          </Card>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setReport(null)}><ArrowLeft className="mr-2 h-4 w-4" /> Retake</Button>
            <Button onClick={downloadPDF} className="gradient-primary"><Download className="mr-2 h-4 w-4" /> Download PDF Report</Button>
          </div>

          <div ref={reportRef} className="space-y-8 bg-background p-8 border rounded-3xl shadow-xl">
             <div className="flex justify-between items-start border-b pb-6">
                <div>
                  <h2 className="text-3xl font-black">Performance Report</h2>
                  <p className="text-muted-foreground uppercase text-xs font-bold tracking-widest">{title}</p>
                </div>
                <div className="text-right">
                  <p className={`text-5xl font-black ${report.percentage >= 75 ? 'text-success' : 'text-primary'}`}>{report.percentage}%</p>
                  <p className="text-[10px] font-bold uppercase opacity-50">Mastery Score</p>
                </div>
             </div>

             <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-muted/30 border-none shadow-none">
                  <CardHeader className="py-4"><CardTitle className="text-xs uppercase opacity-60">Result</CardTitle></CardHeader>
                  <CardContent className="flex items-center gap-2 text-xl font-bold">
                     {report.percentage >= 75 ? <CheckCircle2 className="text-success h-6 w-6" /> : <XCircle className="text-destructive h-6 w-6" />}
                     {report.overall_feedback}
                  </CardContent>
                </Card>
                <div className="md:col-span-2 space-y-4">
                  {Object.entries(report.metrics).map(([key, value]: any) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold uppercase opacity-70">
                        <span>{key.replace(/_/g, ' ')}</span>
                        <span>{value}/100</span>
                      </div>
                      <Progress value={value} className="h-1.5" />
                    </div>
                  ))}
                </div>
             </div>

             <div className="grid md:grid-cols-2 gap-8 pt-6">
                <div className="space-y-4">
                  <h4 className="font-bold flex items-center gap-2 text-primary text-sm uppercase tracking-wider"><TrendingUp className="h-4 w-4" /> Actionable Feedback</h4>
                  <div className="space-y-2">
                    {report.areas_for_improvement.map((item: string, i: number) => (
                      <div key={i} className="text-xs bg-primary/5 p-3 rounded-xl border border-primary/10 leading-relaxed">{item}</div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold flex items-center gap-2 text-destructive text-sm uppercase tracking-wider"><AlertTriangle className="h-4 w-4" /> Technical Gaps</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.weaknesses.map((w: string) => (
                      <span key={w} className="px-3 py-1 bg-destructive/10 text-destructive text-[10px] font-black rounded-full uppercase">{w}</span>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InterviewPage;