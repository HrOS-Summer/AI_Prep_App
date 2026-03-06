import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Trophy, 
  ArrowRight, 
  RefreshCcw,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  SendHorizontal,
  XCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

const QuizPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [domain, setDomain] = useState("");
  const [resultData, setResultData] = useState<{ score: string; status: string } | null>(null);
  const [direction, setDirection] = useState(0); 
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Animation variants for the card slide effect
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  // 1. Fetch or Load from Cache
  useEffect(() => {
    const initQuiz = async () => {
      if (!user?.employee_id) return;

      const cachedQuiz = localStorage.getItem(`active_quiz_${user.employee_id}`);
      const cachedAnswers = localStorage.getItem(`answers_${user.employee_id}`);

      if (cachedQuiz) {
        const parsed = JSON.parse(cachedQuiz);
        setQuestions(parsed.questions);
        setDomain(parsed.domain);
        if (cachedAnswers) setAnswers(JSON.parse(cachedAnswers));
        setLoading(false);
        return;
      }

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
          localStorage.setItem(`active_quiz_${user.employee_id}`, JSON.stringify({
            questions: data.quiz,
            domain: data.domain
          }));
        } else {
          toast.error(data.message || "Failed to load quiz");
        }
      } catch (error) {
        toast.error("Network error. Could not fetch quiz.");
      } finally {
        setLoading(false);
      }
    };
    initQuiz();
  }, [user?.employee_id]);

  useEffect(() => {
    if (user?.employee_id && Object.keys(answers).length > 0) {
      localStorage.setItem(`answers_${user.employee_id}`, JSON.stringify(answers));
    }
  }, [answers, user?.employee_id]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, questions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleOptionSelect = (optionIndex: number) => {
    if (isReviewMode) return;
    setAnswers((prev) => ({ ...prev, [questions[currentIndex].id]: optionIndex }));
    setTimeout(() => {
      if (currentIndex < questions.length - 1) handleNext();
    }, 400);
  };

  const handleSubmitQuiz = async () => {
    setSubmittingScore(true);
    const scoreCount = questions.filter((q) => answers[q.id] === q.correct).length;
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
        setResultData({ score: result.data.score, status: result.data.status });
        localStorage.removeItem(`active_quiz_${user?.employee_id}`);
        localStorage.removeItem(`answers_${user?.employee_id}`);
        toast.success("Assessment Complete!");
      }
    } catch (error) {
      toast.error("Network error syncing results.");
    } finally {
      setSubmittingScore(false);
    }
  };

  if (loading) return (
    <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse text-lg font-medium text-center px-4">
        Preparing your assessment...
      </p>
    </div>
  );

  if (resultData && !isReviewMode) {
    const isPass = resultData.status === "pass";
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto py-10 px-4">
        <Card className="text-center border-2 border-primary/10 overflow-hidden shadow-xl">
          <div className={`h-2 ${isPass ? 'bg-green-500' : 'bg-amber-500'}`} />
          <CardHeader>
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-4">
              {isPass ? <Trophy className="h-10 w-10 text-primary animate-bounce" /> : <AlertCircle className="h-10 w-10 text-amber-500" />}
            </div>
            <CardTitle className="text-3xl font-bold">{isPass ? "Excellent!" : "Keep Pushing!"}</CardTitle>
            <CardDescription className="text-lg">You secured <span className="font-bold text-foreground">{resultData.score}%</span> in {domain}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="flex flex-col gap-3">
                <Button variant="default" className="h-12 font-bold" onClick={() => setIsReviewMode(true)}>
                  Review Your Answers
                </Button>
                {isPass ? (
                  <Button className="gradient-primary h-12 text-lg font-bold" onClick={() => navigate("/interview")}>
                    Start AI Interview <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button variant="outline" className="h-12 text-lg font-bold" onClick={() => window.location.reload()}>
                    <RefreshCcw className="mr-2 h-5 w-5" /> Retake Assessment
                  </Button>
                )}
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
              </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-end gap-4">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight truncate">
              {isReviewMode ? "Review: " : ""}{domain}
            </h2>
            <p className="text-muted-foreground text-sm">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          {isReviewMode && (
            <Button variant="outline" size="sm" onClick={() => setIsReviewMode(false)}>Exit Review</Button>
          )}
        </div>
        <Progress value={progress} className="h-2 rounded-full" />
      </div>

      <div className="relative min-h-[450px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            className="w-full"
          >
            {currentQuestion && (
              <Card className="shadow-2xl border-primary/5 overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg md:text-xl leading-snug font-semibold text-card-foreground">
                    {currentQuestion.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = answers[currentQuestion.id] === idx;
                    const isCorrect = currentQuestion.correct === idx;
                    
                    let borderClass = "";
                    if (isReviewMode) {
                      if (isCorrect) borderClass = "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500";
                      else if (isSelected && !isCorrect) borderClass = "border-red-500 bg-red-50 text-red-700";
                    }

                    return (
                      <Button
                        key={idx}
                        variant={isSelected ? "default" : "outline"}
                        disabled={isReviewMode}
                        className={`h-auto min-h-[60px] py-4 px-6 justify-start text-left text-base transition-all duration-200 whitespace-normal break-words flex items-start gap-4 ${borderClass} ${
                          !isReviewMode && isSelected 
                          ? "ring-2 ring-primary ring-offset-2 scale-[1.01]" 
                          : "hover:bg-primary/5"
                        }`}
                        onClick={() => handleOptionSelect(idx)}
                      >
                        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        
                        <span className="flex-1 leading-relaxed py-0.5">{option}</span>

                        {isReviewMode && isCorrect && <CheckCircle2 className="mt-1 h-5 w-5 text-green-500 shrink-0" />}
                        {isReviewMode && isSelected && !isCorrect && <XCircle className="mt-1 h-5 w-5 text-red-500 shrink-0" />}
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" /> Previous
        </Button>

        {currentIndex === questions.length - 1 && !isReviewMode ? (
          <Button
            onClick={handleSubmitQuiz}
            disabled={Object.keys(answers).length < questions.length || submittingScore}
            className="gradient-primary px-8 h-12 text-lg font-bold shadow-xl"
          >
            {submittingScore ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <SendHorizontal className="h-5 w-5 mr-2" />}
            Final Submit
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="gap-2 bg-primary/10 text-primary hover:bg-primary/20"
          >
            Next <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {questions.map((q, i) => {
          let dotClass = "w-2 bg-muted";
          if (i === currentIndex) dotClass = "w-8 bg-primary shadow-md";
          else if (isReviewMode) {
             dotClass = answers[q.id] === q.correct ? "w-2 bg-green-500" : "w-2 bg-red-500";
          } else if (answers[q.id] !== undefined) {
             dotClass = "w-2 bg-primary/40";
          }

          return (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${dotClass}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default QuizPage;