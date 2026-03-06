import { useState, useEffect, useRef } from "react";
import { vapi } from "@/utils/vapiHelper";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, PhoneOff, MessageSquare, Bot, User, Volume2 } from "lucide-react";

interface TranscriptMessage {
  role: "ai" | "user";
  text: string;
}

const InterviewPage = () => {
  const { user } = useAuth();
  const [isCalling, setIsCalling] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  useEffect(() => {
    vapi.on("call-start", () => setIsCalling(true));
    vapi.on("call-end", () => setIsCalling(false));
    
    vapi.on("message", (message) => {
      // We only care about the final transcripts for the UI log
      if (message.type === "transcript" && message.transcriptType === "final") {
        setTranscripts((prev) => [
          ...prev,
          { role: message.role === "assistant" ? "ai" : "user", text: message.transcript },
        ]);
      }
    });

    return () => { vapi.stop(); };
  }, []);

  const startTestInterview = async () => {
  try {
    await vapi.start({
      model: {
        provider: "openai",
        model: "gpt-3.5-turbo", // Use 3.5 for faster testing
        messages: [
          { 
            role: "system", 
            content: "You are an interviewer. Greet the user and ask: What is Node.js?" 
          }
        ]
      },
      voice: {
        provider: "openai",
        voiceId: "alloy" // Standard OpenAI voice, usually works without extra setup
      }
    });
  } catch (err) {
    console.error("Vapi start error:", err);
  }
};

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Fullstack Interview</h1>
          <p className="text-muted-foreground mt-1">Testing Vapi Voice Agent Integration</p>
        </div>
        {isCalling && (
          <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
            <Volume2 className="h-4 w-4 animate-bounce" />
            <span className="text-xs font-bold uppercase tracking-widest">Live</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interaction Controls */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-b from-card to-muted/20">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <AnimatePresence>
                  {isCalling && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 0.15 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-primary rounded-full"
                    />
                  )}
                </AnimatePresence>
                <div className={`relative h-32 w-32 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isCalling ? 'border-primary bg-primary/10' : 'border-muted bg-muted/50'}`}>
                  <Bot className={`h-16 w-16 ${isCalling ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold">{isCalling ? "Gemini is Speaking" : "Start Interview"}</h2>
                <p className="text-sm text-muted-foreground mt-2 px-4">
                  Ensure your microphone is connected and you are in a quiet environment.
                </p>
              </div>

              {!isCalling ? (
                <Button onClick={startTestInterview} size="lg" className="w-full h-14 text-lg font-bold shadow-lg gradient-primary">
                  <Mic className="mr-2 h-5 w-5" /> Start Session
                </Button>
              ) : (
                <Button onClick={() => vapi.stop()} size="lg" variant="destructive" className="w-full h-14 text-lg font-bold shadow-lg">
                  <PhoneOff className="mr-2 h-5 w-5" /> End Interview
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Real-time Transcript */}
        <Card className="lg:col-span-8 flex flex-col h-[550px] shadow-xl border-border/40">
          <CardHeader className="border-b px-6 py-4 bg-muted/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Live Transcription
            </CardTitle>
          </CardHeader>
          <CardContent 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-muted"
          >
            <AnimatePresence>
              {transcripts.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {msg.role === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className={`relative group p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                    msg.role === 'ai' 
                      ? 'bg-card border border-border/50 rounded-tl-none' 
                      : 'bg-primary text-primary-foreground rounded-tr-none'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {transcripts.length === 0 && !isCalling && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-50">
                <MessageSquare className="h-12 w-12" />
                <p className="italic">Waiting to start session...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterviewPage;