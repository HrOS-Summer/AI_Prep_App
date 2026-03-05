import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  Trophy, 
  ArrowRight, 
  RefreshCcw 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

const QuizPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State Management
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [domain, setDomain] = useState("");
  
  // New state to hold the response data from FastAPI
  const [resultData, setResultData] = useState<{ score: string; status: string } | null>(null);

  // 1. Fetch Quiz Data Dynamically
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!user?.employee_id) return;

      try {
        const response = await fetch("https://prepzen-api.onrender.com/quiz/get-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employee_id: user.employee_id }),
        });

        const data = await response.json();

        if (data.status_code === 200) {
          setQuestions(data.quiz);
          setDomain(data.domain);
        } else {
          toast.error(data.message || "Failed to load quiz");
        }
      } catch (error) {
        console.error("Quiz fetch error:", error);
        toast.error("Network error. Could not fetch quiz.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [user?.employee_id]);

  const scoreCount = questions.filter((q) => answers[q.id] === q.correct).length;

  // 2. Submit Quiz and Sync with Backend
  const handleSubmitQuiz = async () => {
    setSubmitted(true);
    setSubmittingScore(true);

    const percentage = Math.round((scoreCount / questions.length) * 100);

    try {
      const response = await fetch("https://prepzen-api.onrender.com/quiz/get-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: user?.employee_id,
          score: percentage.toString(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.status_code === 200) {
        setResultData({
          score: result.data.score,
          status: result.data.status,
        });
        toast.success(result.message);
      } else {
        toast.error("Failed to save result on server.");
      }
    } catch (error) {
      console.error("Error submitting score:", error);
      toast.error("Network error syncing results.");
    } finally {
      setSubmittingScore(false);
    }
  };

  // --- VIEW: LOADING ---
  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Generating your {user?.domain} quiz...</p>
      </div>
    );
  }

  // --- VIEW: COMPLETION SCREEN (Triggered after resultData is set) ---
  if (resultData) {
    const isPass = resultData.status === "pass";

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="text-center shadow-elevated border-primary/20">
            <CardHeader>
              <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {isPass ? (
                  <Trophy className="h-10 w-10 text-primary animate-bounce" />
                ) : (
                  <AlertCircle className="h-10 w-10 text-destructive" />
                )}
              </div>
              <CardTitle className="text-3xl font-bold">
                {isPass ? "Congratulations!" : "Keep Practicing!"}
              </CardTitle>
              <CardDescription className="text-lg">
                You scored <span className="font-bold text-foreground">{resultData.score}%</span> in {domain}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 text-sm">
                {isPass 
                  ? "Great job! You have cleared the baseline for this domain. You are now eligible to proceed to the AI Interview stage."
                  : "You need at least 75% to pass. Review the correct answers below and try again to unlock the interview stage."
                }
              </div>

              <div className="flex flex-col gap-3">
                {isPass ? (
                  <Button 
                    className="gradient-primary text-primary-foreground h-12 text-lg font-bold"
                    onClick={() => navigate("/interview")}
                  >
                    Start AI Interview <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    className="h-12 text-lg font-bold"
                    onClick={() => {
                      setResultData(null);
                      setSubmitted(false);
                      setAnswers({});
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <RefreshCcw className="mr-2 h-5 w-5" /> Try Again
                  </Button>
                )}
                
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // --- VIEW: QUIZ IN PROGRESS ---
  if (questions.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">No Quiz Available</h2>
        <p className="text-muted-foreground">We couldn't find a quiz for your current domain.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{domain} Quiz</h1>
          <p className="text-sm text-muted-foreground">Answer all {questions.length} questions to proceed</p>
        </div>
        {submitted && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="text-right"
          >
            <p className="text-2xl font-bold">{scoreCount}/{questions.length}</p>
            <p className={`text-sm font-bold ${scoreCount >= 7 ? "text-success" : "text-destructive"}`}>
              {scoreCount >= 7 ? "Passed!" : "Try again"}
            </p>
          </motion.div>
        )}
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <motion.div 
            key={q.id} 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`shadow-card border-border/50 transition-all ${submitted && answers[q.id] !== q.correct ? "border-destructive/20" : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-start gap-3">
                  <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">Q{i + 1}</span>
                  <span className="flex-1 leading-relaxed">{q.question}</span>
                  {submitted && (
                    answers[q.id] === q.correct
                      ? <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                      : <XCircle className="h-5 w-5 text-destructive shrink-0" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[q.id] === oi;
                    const isCorrect = q.correct === oi;
                    let extraClass = "text-sm h-auto py-3 px-4 justify-start text-left whitespace-normal leading-snug ";

                    if (submitted) {
                      if (isCorrect) {
                        extraClass += "border-success bg-success/10 text-success font-medium shadow-[0_0_10px_rgba(34,197,94,0.1)]";
                      } else if (selected && !isCorrect) {
                        extraClass += "border-destructive bg-destructive/10 text-destructive";
                      } else {
                        extraClass += "opacity-50";
                      }
                    } else if (selected) {
                      extraClass += "border-primary bg-primary/5 ring-1 ring-primary";
                    }

                    return (
                      <Button
                        key={oi}
                        variant="outline"
                        className={extraClass}
                        disabled={submitted}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                      >
                        <span className="mr-3 h-5 w-5 flex items-center justify-center rounded-full border text-[10px] shrink-0">
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {opt}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {!submitted && (
        <Button
          onClick={handleSubmitQuiz}
          className="gradient-primary text-primary-foreground w-full h-12 text-lg font-bold shadow-lg"
          disabled={Object.keys(answers).length < questions.length || submittingScore}
        >
          {submittingScore ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : null}
          Submit Quiz ({Object.keys(answers).length}/{questions.length} answered)
        </Button>
      )}

      {submitted && !resultData && scoreCount < 7 && (
        <Button 
          variant="outline" 
          className="w-full" 
          disabled={submittingScore}
          onClick={() => {
            setAnswers({});
            setSubmitted(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          Retake Quiz
        </Button>
      )}
    </div>
  );
};

export default QuizPage;