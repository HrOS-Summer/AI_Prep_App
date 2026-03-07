import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { 
  BrainCircuit, Map, Mic, Trophy, ArrowRight, 
  PlayCircle, Moon, Sun, Lock, CheckCircle2, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Use Global Theme

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto sticky top-0 z-50 backdrop-blur-md border-b border-border/10">
        <div className="flex items-center gap-2">
          <img src="/logo_img.png" alt="Logo" className="h-8 w-8" />
          <span className="text-xl font-black tracking-tighter">Prepzen</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium opacity-70">
          <button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors">Features</button>
          <button onClick={() => scrollToSection('preview')} className="hover:text-primary transition-colors">Path Preview</button>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button 
            onClick={() => navigate(user ? "/dashboard" : "/login")} 
            variant="outline" 
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            {user ? "Dashboard" : "Sign In"}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-6">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] blur-[120px] rounded-full -z-10 opacity-30 ${theme === 'dark' ? 'bg-primary' : 'bg-primary/40'}`} />
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
            Next-Gen Interview Preparation
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Level up with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-indigo-400">Adaptive AI Roadmaps</span>
          </motion.h1>
          <p className="text-lg opacity-70 max-w-2xl mx-auto leading-relaxed">
            Personalized learning paths, topic-wise quizzes, and real-time AI interviews to ensure you're qualified for your dream role.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={() => navigate("/signup")} size="lg" className="h-14 px-8 text-lg font-bold gradient-primary shadow-lg shadow-primary/20 group">
              Get Started <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
          </div>
        </div>
      </section>

      {/* Path Preview Section */}
      <section id="preview" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeInUp} className={`p-4 rounded-2xl border shadow-2xl ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
            <div className="space-y-3">
              <div className={`p-3 rounded-xl border-l-4 border-l-success flex items-center gap-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                <CheckCircle2 className="text-success h-5 w-5" />
                <span className="text-sm font-bold">Frontend Fundamentals</span>
              </div>
              <motion.div animate={{ scale: [1, 1.01, 1] }} transition={{ repeat: Infinity, duration: 3 }} className={`p-3 rounded-xl border-l-4 border-l-primary flex items-center justify-between ${theme === 'dark' ? 'bg-primary/10' : 'bg-primary/5'}`}>
                <span className="text-sm font-bold">State Management (Active)</span>
                <Button size="sm" className="h-7 text-[10px]">Start Quiz</Button>
              </motion.div>
              <div className="p-3 rounded-xl border-l-4 border-l-muted opacity-40 flex items-center gap-3">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-bold">Advanced Backend Architecture</span>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            <h3 className="text-3xl font-bold">A Roadmap That Evolves With You</h3>
            <p className="opacity-70 leading-relaxed">
              Our AI analyzes your performance. Reach a **75% score** to unlock advanced modules and high-tier mock interviews.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm font-medium"><BookOpen className="text-primary h-4 w-4" /> Curated Resources</div>
              <div className="flex items-center gap-2 text-sm font-medium"><Trophy className="text-primary h-4 w-4" /> Global Rankings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div key={f.title} {...fadeInUp} transition={{ delay: i * 0.1 }}>
              <Card className={`transition-all hover:border-primary/50 ${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <CardContent className="p-8 space-y-4">
                  <f.icon className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-bold">{f.title}</h3>
                  <p className="opacity-70 text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="py-12 text-center opacity-50 text-xs font-mono">
        © 2026 Prepzen AI • Crafted for Growth
      </footer>
    </div>
  );
};

const features = [
  { title: "AI Roadmaps", desc: "Dynamic paths based on your domain choice.", icon: Map },
  { title: "Quizzes", desc: "Test your knowledge after every module.", icon: BrainCircuit },
  { title: "Voice Interviews", desc: "Simulated AI mock interviews.", icon: Mic }
];

export default Index;