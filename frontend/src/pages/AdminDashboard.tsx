import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Users, BookOpen, Mic, HelpCircle, ArrowUpRight, Search, RotateCcw, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<{ id: string; name: string } | null>(null);
  
  // Sorting State: 'asc' | 'desc'
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 1. Fetch Global Stats with Local Storage Caching
  const { data: dashboardData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const cacheKey = "admin_dashboard_stats";
      try {
        const res = await fetch("https://prepzen-api.onrender.com/admin/dashboard");
        if (!res.ok) throw new Error();
        const data = await res.json();
        localStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      } catch (err) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached);
        throw new Error("Failed to fetch dashboard stats");
      }
    }
  });

  // 2. Fetch Domain Users with Local Storage Caching
  const { data: domainUsers, isLoading: isUsersLoading } = useQuery({
    queryKey: ["domainUsers", selectedDomain?.id],
    queryFn: async () => {
      if (!selectedDomain?.id) return [];
      const cacheKey = `admin_users_${selectedDomain.id}`;
      try {
        const res = await fetch(`https://prepzen-api.onrender.com/admin/domain-users/${selectedDomain.id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        localStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      } catch (err) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached);
        return [];
      }
    },
    enabled: !!selectedDomain?.id
  });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const activeStats = useMemo(() => {
    if (!selectedDomain || !domainUsers) {
      return [
        { label: "Total Candidates", value: dashboardData?.total_students || 0, icon: Users, color: "bg-blue-500/10 text-blue-600" },
        { label: "Completion Rate", value: `${dashboardData?.completion_stats.percentage || 0}%`, icon: BookOpen, color: "bg-purple-500/10 text-purple-600" },
        { label: "Interviews Held", value: dashboardData?.total_interviews || 0, icon: Mic, color: "bg-orange-500/10 text-orange-600" },
        { label: "High Performers", value: dashboardData?.high_performers_count || 0, icon: HelpCircle, color: "bg-green-500/10 text-green-600" },
      ];
    }
    const totalInDomain = domainUsers.length;
    const avgProgress = totalInDomain > 0 
      ? Math.round(domainUsers.reduce((acc: number, curr: any) => acc + (curr.path_progress || 0), 0) / totalInDomain) 
      : 0;
    
    return [
      { label: `${selectedDomain.name} Candidates`, value: totalInDomain, icon: Users, color: "bg-blue-500/10 text-blue-600" },
      { label: "Avg Progress", value: `${avgProgress}%`, icon: BookOpen, color: "bg-purple-500/10 text-purple-600" },
      { label: "Domain Interviews", value: "Syncing...", icon: Mic, color: "bg-orange-500/10 text-orange-600" },
      { label: "Domain Standing", value: "Top Tier", icon: HelpCircle, color: "bg-green-500/10 text-green-600" },
    ];
  }, [selectedDomain, domainUsers, dashboardData]);

  // Optimized Search and Sort
  const filteredStudents = useMemo(() => {
    if (!domainUsers) return [];
    
    let result = domainUsers.filter((s: any) => {
      const matchesSearch = 
        s.username?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
        s.employee_id?.includes(debouncedSearch);
      
      const isNotAdmin = s.role !== "admin"; // Explicitly exclude admins

      return matchesSearch && isNotAdmin;
    });

    // Sort by path_progress
    return result.sort((a: any, b: any) => {
      return sortOrder === 'asc' 
        ? (a.path_progress || 0) - (b.path_progress || 0)
        : (b.path_progress || 0) - (a.path_progress || 0);
    });
  }, [domainUsers, debouncedSearch, sortOrder]);

  const handleBarClick = (data: any) => {
    if (data && data._id) {
      setSelectedDomain({ id: data._id, name: data.domain_name });
    }
  };

  if (isStatsLoading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8 max-w-7xl pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">Executive Overview</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm">
              {selectedDomain ? `Filtering results for ${selectedDomain.name}` : `Monitoring platform-wide performance`}
            </p>
            {selectedDomain && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedDomain(null)} className="h-7 text-xs gap-1.5 text-primary hover:bg-primary/10">
                <RotateCcw className="h-3 w-3" /> Reset to Global
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <AnimatePresence mode="wait">
        <motion.div key={selectedDomain?.id || "global"} variants={containerVariants} initial="hidden" animate="show" exit="exit" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeStats.map((s) => (
            <motion.div key={s.label} variants={itemVariants}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-5 w-5" /></div>
                    <span className="text-xs font-medium text-success">+Live</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-lg">
          <CardHeader><CardTitle className="text-lg">Domain Distribution</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.domain_distribution} onClick={(state) => state?.activePayload && handleBarClick(state.activePayload[0].payload)}>
                <XAxis dataKey="domain_name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} className="cursor-pointer">
                  {dashboardData.domain_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={selectedDomain?.id === entry._id ? "#4f46e5" : (index % 2 === 0 ? "#6366f1" : "#a855f7")} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardHeader><CardTitle className="text-lg">Critical Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             {dashboardData.underperforming_students.filter((s: any) => !selectedDomain || s.domain_id === selectedDomain.id).map((s: any) => (
               <div key={s._id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                 <div>
                   <p className="text-sm font-bold">{s.username}</p>
                   <p className="text-xs text-muted-foreground">Score: {s.score}% • {s.status.toUpperCase()}</p>
                 </div>
                 <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/students/${s.employee_id}`)}>Review</Button>
               </div>
             ))}
          </CardContent>
        </Card>
      </div>

      {/* FIXED: Sorted & Scrollable Table */}
      <Card className="border-border/50 overflow-hidden shadow-lg">
        <CardHeader className="bg-muted/30 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
          <div>
            <CardTitle className="text-lg">{selectedDomain ? selectedDomain.name : "Platform"} Registry</CardTitle>
            <p className="text-xs text-muted-foreground font-mono">Showing {filteredStudents.length} candidates</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="pl-9 bg-background h-9" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!selectedDomain}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Constrained height for 4-5 students with vertical scroll */}
          <div className="overflow-y-auto max-h-[350px] custom-scrollbar">
            {isUsersLoading ? (
               <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
            ) : !selectedDomain ? (
                <div className="p-20 text-center text-muted-foreground italic flex flex-col items-center gap-2">
                   <Users className="h-8 w-8 opacity-20" />
                   <p>Click a bar in the Chart to load student data.</p>
                </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/95 backdrop-blur-sm z-10">
                  <tr className="text-left text-muted-foreground border-b shadow-sm">
                    <th className="p-4 font-medium uppercase text-[10px]">Candidate</th>
                    <th className="p-4 font-medium uppercase text-[10px]">ID</th>
                    <th className="p-4 font-medium uppercase text-[10px]">
                      <button 
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="flex items-center gap-1 hover:text-primary transition-colors uppercase"
                      >
                        Progress
                        {sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      </button>
                    </th>
                    <th className="p-4 font-medium uppercase text-[10px]">Joined Date</th>
                    <th className="p-4 font-medium uppercase text-[10px] text-right px-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.map((s: any) => (
                    <tr key={s._id} className="hover:bg-muted/30 transition-colors group">
                      <td className="p-4 font-bold">{s.username}</td>
                      <td className="p-4 text-muted-foreground font-mono text-xs">{s.employee_id}</td>
                      <td className="p-4 w-48">
                        <div className="flex items-center gap-3">
                          <Progress value={s.path_progress} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium w-8">{s.path_progress}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right px-6">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/students/${s.employee_id}`)}>View Profile</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;