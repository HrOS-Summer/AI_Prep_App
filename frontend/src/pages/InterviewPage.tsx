import { useState, useEffect, useRef } from "react";
import { vapi } from "@/utils/vapiHelper";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, PhoneOff, Bot, User, Video, VideoOff } from "lucide-react";

interface TranscriptMessage {
  role: "ai" | "user";
  text: string;
}

const InterviewPage = () => {
  const { user } = useAuth();

  const [isCalling, setIsCalling] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptMessage[]>([]);
  const [cameraOn, setCameraOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastTranscriptRef = useRef<HTMLDivElement>(null);

  // Auto scroll captions
  useEffect(() => {
    if (lastTranscriptRef.current) {
      lastTranscriptRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcripts]);

  // CAMERA TOGGLE
  const toggleCamera = async () => {
    try {
      if (!cameraOn) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setCameraOn(true);
      } else {
        streamRef.current?.getTracks().forEach((track) => track.stop());

        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }

        streamRef.current = null;
        setCameraOn(false);
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  // Ensure video plays after camera turns on
  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraOn]);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // VAPI listeners (UNCHANGED)
  useEffect(() => {
    const handleCallStart = () => setIsCalling(true);

    const handleCallEnd = () => {
      setIsCalling(false);
      setIsAssistantSpeaking(false);
      setIsUserSpeaking(false);
    };

    const handleSpeechStart = () => setIsAssistantSpeaking(true);

    const handleSpeechEnd = () => setIsAssistantSpeaking(false);

    const handleMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        if (message.role === "assistant") {
          setIsUserSpeaking(false);
        } else {
          setIsUserSpeaking(true);
        }

        setTranscripts((prev) => [
          ...prev,
          {
            role: message.role === "assistant" ? "ai" : "user",
            text: message.transcript,
          },
        ]);
      }
    };

    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("message", handleMessage);

    return () => {
      vapi.stop();
    };
  }, []);

  const startTestInterview = async () => {
    try {
      setTranscripts([]);

      await vapi.start({
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `
You are a senior technical interviewer conducting a Fullstack Developer interview.

Rules:
- Ask ONE question at a time
- Wait for the candidate answer
- Ask follow-up questions
- Keep responses short
- Focus on React, Node.js, APIs, Databases, and System Design

Start by greeting the candidate and asking:

"Hello! Welcome to the interview. Can you please introduce yourself?"
`,
            },
          ],
        },

        voice: {
          provider: "openai",
          voiceId: "alloy",
        },
      });
    } catch (err) {
      console.error("Vapi start error:", err);
    }
  };

  const endInterview = () => {
    vapi.stop();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI Voice Interview</h1>

        {!isCalling ? (
          <Button onClick={startTestInterview}>
            <Mic className="mr-2 h-4 w-4" />
            Start Interview
          </Button>
        ) : (
          <Button variant="destructive" onClick={endInterview}>
            <PhoneOff className="mr-2 h-4 w-4" />
            End Interview
          </Button>
        )}
      </div>

      {/* Participants */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* AI */}
        <Card className="h-72 flex items-center justify-center">
          <CardContent className="flex flex-col items-center gap-4">

            <div className="relative">

              <AnimatePresence>
                {isAssistantSpeaking && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1.6, opacity: 0.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-primary rounded-full"
                  />
                )}
              </AnimatePresence>

              <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-16 w-16 text-primary" />
              </div>

            </div>

            <p className="font-semibold">AI Interviewer</p>

          </CardContent>
        </Card>

        {/* USER */}
        <Card className="h-72 flex items-center justify-center">
          <CardContent className="flex flex-col items-center gap-4">

            <div className="relative">

              <AnimatePresence>
                {isUserSpeaking && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1.6, opacity: 0.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-green-500 rounded-full"
                  />
                )}
              </AnimatePresence>

              {!cameraOn ? (
                <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-32 w-32 rounded-full object-cover border"
                />
              )}

            </div>

            <p className="font-semibold">
              {user?.username || "Candidate"}
            </p>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleCamera}
              title={cameraOn ? "Turn off camera" : "Turn on camera"}
            >
              {cameraOn ? (
                <VideoOff className="h-4 w-4" />
              ) : (
                <Video className="h-4 w-4" />
              )}
            </Button>

          </CardContent>
        </Card>

      </div>

      {/* CAPTIONS */}
      <Card className="p-6 min-h-[100px] flex items-center justify-center">
        <div className="text-lg font-medium text-center">

          {transcripts.length === 0 ? (
            <p className="text-muted-foreground">
              Waiting for interview to start...
            </p>
          ) : (
            <div ref={lastTranscriptRef}>
              {transcripts[transcripts.length - 1].role === "ai"
                ? "AI:"
                : "You:"}{" "}
              {transcripts[transcripts.length - 1].text}
            </div>
          )}

        </div>
      </Card>

    </div>
  );
};

export default InterviewPage;