import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Send, Clock, BarChart3 } from "lucide-react";

const mockQuestion = "Explain the concept of closures in JavaScript. How do they work and when would you use them in a real-world application?";

const mockEvaluation = {
  technical: 82,
  communication: 75,
  confidence: 88,
  reasoning: 70,
  strengths: ["Clear explanation of scope chain", "Good real-world example usage"],
  weaknesses: ["Could elaborate more on memory implications"],
  feedback: "Strong understanding of closures demonstrated. Consider discussing garbage collection implications and performance considerations for a more comprehensive answer.",
};

const InterviewPage = () => {
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showEval, setShowEval] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunks = useRef<Blob[]>([]);

  // Canvas for waveform
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d")!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      ctx.fillStyle = "hsl(var(--muted))";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "hsl(var(--primary))";
      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      chunks.current = [];
      recorder.ondataavailable = (e) => chunks.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        cancelAnimationFrame(animFrameRef.current);
      };
      recorder.start();
      setRecording(true);
      setTimeLeft(120);
      drawWaveform();

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            recorder.stop();
            setRecording(false);
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      console.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setShowEval(true), 1500);
  };

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const scoreItems = [
    { label: "Technical", value: mockEvaluation.technical },
    { label: "Communication", value: mockEvaluation.communication },
    { label: "Confidence", value: mockEvaluation.confidence },
    { label: "Reasoning", value: mockEvaluation.reasoning },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">AI Interview</h1>

      {/* Question */}
      <Card className="shadow-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Question</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{mockQuestion}</p>
        </CardContent>
      </Card>

      {/* Recording */}
      {!showEval && (
        <Card className="shadow-card border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className={`font-mono font-bold ${timeLeft < 30 ? "text-destructive" : ""}`}>{formatTime(timeLeft)}</span>
              </div>
              {recording && <span className="flex items-center gap-1.5 text-xs text-destructive font-medium"><span className="h-2 w-2 rounded-full bg-destructive animate-pulse" /> Recording</span>}
            </div>

            <canvas ref={canvasRef} width={600} height={80} className="w-full h-20 rounded-lg bg-muted" />

            <div className="flex items-center gap-3">
              {!recording && !audioBlob && (
                <Button onClick={startRecording} className="gradient-primary text-primary-foreground">
                  <Mic className="h-4 w-4 mr-2" /> Start Recording
                </Button>
              )}
              {recording && (
                <Button variant="destructive" onClick={stopRecording}>
                  <Square className="h-4 w-4 mr-2" /> Stop
                </Button>
              )}
              {audioBlob && !submitted && (
                <>
                  <Button variant="outline" onClick={() => { setAudioBlob(null); setTimeLeft(120); }}>Re-record</Button>
                  <Button onClick={handleSubmit} className="gradient-primary text-primary-foreground">
                    <Send className="h-4 w-4 mr-2" /> Submit Answer
                  </Button>
                </>
              )}
              {submitted && !showEval && (
                <p className="text-sm text-muted-foreground animate-pulse">Evaluating your answer...</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evaluation */}
      <AnimatePresence>
        {showEval && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="shadow-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Evaluation Scores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {scoreItems.map((s) => (
                  <div key={s.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-semibold">{s.value}%</span>
                    </div>
                    <Progress value={s.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="shadow-card border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-base text-success">Strengths</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {mockEvaluation.strengths.map((s) => <li key={s} className="text-sm flex items-start gap-2"><span className="text-success mt-0.5">✓</span>{s}</li>)}
                  </ul>
                </CardContent>
              </Card>
              <Card className="shadow-card border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-base text-destructive">Areas to Improve</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {mockEvaluation.weaknesses.map((w) => <li key={w} className="text-sm flex items-start gap-2"><span className="text-destructive mt-0.5">✗</span>{w}</li>)}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-card border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-base">Feedback</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{mockEvaluation.feedback}</p></CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewPage;
