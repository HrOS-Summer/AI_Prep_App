import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Code, Brain, Globe, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Interface matching your FastAPI response structure
interface Domain {
  domain_id: string;
  domain_name: string;
  description: string;
}

// Map dynamic domain names to icons
const getIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("web")) return Code;
  if (n.includes("machine") || n.includes("learning")) return Brain;
  return Globe;
};

const DomainSelection = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  const { selectDomain } = useAuth();
  const navigate = useNavigate();

  // Fetch domains from the API on component mount
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetch("https://prepzen-api.onrender.com/domain/get-domain");
        const data = await response.json();
        
        if (data.status_code === 200) {
          setDomains(data.domains);
        } else {
          toast.error("Failed to load domains");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Network error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, []);

  const handleSelect = async (domainName: string, domainId: string) => {
    setIsUpdating(domainId);
    try {
      // FIX: Passing both required arguments (domain_name and domain_id)
      await selectDomain(domainName, domainId);
      toast.success(`Domain set to ${domainName}`);
      navigate("/dashboard");
    } catch (error) {
      toast.error("Could not save your selection. Please try again.");
    } finally {
      setIsUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading domains...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Choose Your Domain</h1>
        <p className="text-muted-foreground max-w-md">
          Select a specialization to begin your journey. This sets your learning path and cannot be changed later.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full">
        {domains.map((d, i) => {
          const Icon = getIcon(d.domain_name);
          const processing = isUpdating === d.domain_id;

          return (
            <motion.div 
              key={d.domain_id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={`group relative overflow-hidden cursor-pointer border-border/50 shadow-card hover:shadow-elevated hover:border-primary/30 transition-all ${
                  processing ? "opacity-70 pointer-events-none" : ""
                }`}
                onClick={() => handleSelect(d.domain_name, d.domain_id)}
              >
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mb-6 group-hover:gradient-primary transition-all duration-300">
                    {processing ? (
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    ) : (
                      <Icon className="h-8 w-8 text-accent-foreground group-hover:text-primary-foreground transition-colors" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{d.domain_name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {d.description}
                  </p>
                  
                  {/* Hover indicator */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DomainSelection;