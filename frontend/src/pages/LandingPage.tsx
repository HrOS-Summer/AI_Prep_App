import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  BrainCircuit, 
  Map, 
  Mic, 
  Trophy, 
  ArrowRight, 
  PlayCircle, 
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LandingPage = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* --- Navbar --- */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/logo_img.png" alt="Logo" className="h-8 w-8" />
          <span className="text-xl font-black tracking-tighter uppercase italic">PrepZen</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">Roadmap</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Domain Rankings</a>
        </div>
        <Button onClick={() => navigate("/login")} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
          Sign In
        </Button>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-20 pb-32 px-6">
        {/* Animated Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10 opacity-50" />
        
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            Next-Gen Interview Preparation
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
          >
            Master Your Career with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-indigo-400">
              AI-Driven Roadmaps
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            PrepZen generates personalized domain roadmaps, topic-wise quizzes, and real-time AI interviews to ensure you're qualified for your dream role.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button onClick={() => navigate("/signup")} size="lg" className="h-14 px-8 text-lg font-bold gradient-primary shadow-lg shadow-primary/20 group">
              Start Free Journey <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="ghost" className="h-14 px-8 text-lg font-bold hover:bg-white/5">
              <PlayCircle className="mr-2" /> Watch Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={f.title}
              {...fadeInUp}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-white/[0.03] border-white/10 hover:border-primary/50 transition-colors h-full group">
                <CardContent className="p-8 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <f.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- The Learning Path Preview --- */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeInUp} className="space-y-6">
            <h2 className="text-4xl font-bold">Dynamic Roadmaps for <br /> Every Technical Domain.</h2>
            <p className="text-muted-foreground">
              Don't just learn; learn what matters. Our AI analyzes your chosen domain (Web Dev, QA, Java, etc.) and constructs a step-by-step path with curated external resources.
            </p>
            <ul className="space-y-4">
              {['Topic-wise Quizzes', 'Curated Documentation Links', 'AI Mock Interviews'].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium">
                  <ChevronRight className="text-primary h-4 w-4" /> {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="relative"
          >
             {/* Mock UI Element */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                <div className="h-3 w-3 rounded-full bg-red-500/50" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                <div className="h-3 w-3 rounded-full bg-green-500/50" />
              </div>
              <div className="space-y-4">
                {[80, 45, 90].map((w, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${w}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-primary" 
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                <span className="text-xs font-bold text-primary">AI RECOMMENDATION: Focus on API Security</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Leaderboard/Rank Section --- */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto space-y-8">
        <motion.div {...fadeInUp}>
          <h2 className="text-4xl font-bold">Competitive Edge with Domain Rankings</h2>
          <p className="text-muted-foreground mt-4">
            See where you stand globally. Our leaderboard ranks you based on interview accuracy, quiz scores, and roadmap progress within your specific domain.
          </p>
        </motion.div>
        
        <motion.div 
           initial={{ scale: 0.95, opacity: 0 }}
           whileInView={{ scale: 1, opacity: 1 }}
           className="p-6 bg-gradient-to-b from-white/5 to-transparent rounded-3xl border border-white/10"
        >
          <div className="flex justify-around items-end gap-4 h-48">
             <div className="w-20 bg-primary/40 rounded-t-lg h-[60%]" />
             <div className="w-20 bg-primary rounded-t-lg h-[90%] flex flex-col items-center justify-start pt-4">
               <Trophy className="text-yellow-400" size={32} />
             </div>
             <div className="w-20 bg-primary/20 rounded-t-lg h-[40%]" />
          </div>
          <p className="mt-6 text-xl font-bold italic">Top 1% in Web Development</p>
        </motion.div>
      </section>

      {/* --- Footer / CTA --- */}
      <footer className="py-20 px-6 border-t border-white/5 text-center space-y-8">
        <h2 className="text-3xl font-bold">Ready toZen through your next interview?</h2>
        <Button onClick={() => navigate("/signup")} size="lg" className="h-14 px-12 text-lg font-bold gradient-primary shadow-xl">
          Get Started Now
        </Button>
        <div className="pt-12 text-muted-foreground text-xs font-mono uppercase tracking-widest">
          © 2026 PrepZen AI • All Rights Reserved
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    title: "AI Domain Roadmaps",
    desc: "Personalized learning paths generated specifically for your tech stack and experience level.",
    icon: Map
  },
  {
    title: "Topic Quizzes",
    desc: "Test your granular knowledge after every module to unlock the next level of your roadmap.",
    icon: BrainCircuit
  },
  {
    title: "Voice AI Interviews",
    desc: "Simulate real pressure with our AI interviewer that assesses your verbal communication and logic.",
    icon: Mic
  }
];

export default LandingPage;