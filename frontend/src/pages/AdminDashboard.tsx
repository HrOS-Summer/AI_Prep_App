import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, BookOpen, Mic, HelpCircle, Search, 
  RotateCcw, Loader2, ArrowUp, ArrowDown, Star, AlertCircle,
} from "lucide-react";
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
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 1. Fetch Global Dashboard Stats
  const { data: dashboardData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const res = await fetch("https://prepzen-api.onrender.com/admin/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return res.json();
    }
  });

  // 2. ALL Students (Registry Data)
  const { data: allStudents, isLoading: isAllStudentsLoading } = useQuery({
    queryKey: ["allStudents"],
    queryFn: async () => {
      const res = await fetch("https://prepzen-api.onrender.com/admin/all-students");
      if (!res.ok) throw new Error("Failed to fetch all students");
      return res.json();
    }
  });

  // 3. Domain-Specific Users
  const { data: domainUsers, isLoading: isDomainUsersLoading } = useQuery({
    queryKey: ["domainUsers", selectedDomain?.id],
    queryFn: async () => {
      if (!selectedDomain?.id) return [];
      const res = await fetch(`https://prepzen-api.onrender.com/admin/domain-users/${encodeURIComponent(selectedDomain.id)}`);
      if (!res.ok) throw new Error("Failed to fetch domain users");
      return res.json();
    },
    enabled: !!selectedDomain?.id
  });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const activeStats = useMemo(() => {
    // GLOBAL VIEW
    if (!selectedDomain || !domainUsers) {
      return [
        { label: "Total Candidates", value: dashboardData?.total_students || 0, icon: Users, color: "bg-blue-500/10 text-blue-600" },
        { label: "Completion Rate", value: `${dashboardData?.completion_stats?.percentage || 0}%`, icon: BookOpen, color: "bg-purple-500/10 text-purple-600" },
        { label: "Interviews Held", value: dashboardData?.total_interviews || 0, icon: Mic, color: "bg-orange-500/10 text-orange-600" },
        { label: "High Performers", value: dashboardData?.high_performers_count || 0, icon: HelpCircle, color: "bg-green-500/10 text-green-600" },
      ];
    }
    
    // DOMAIN FILTERED VIEW
    const totalInDomain = domainUsers.length;
    const avgProgress = totalInDomain > 0 
      ? Math.round(domainUsers.reduce((acc: number, curr: any) => acc + (Number(curr.path_progress) || 0), 0) / totalInDomain) 
      : 0;
    
    // Calculate total interviews for this domain by summing student counts
    const domainInterviews = domainUsers.reduce((acc: number, curr: any) => acc + (Number(curr.total_interviews) || 0), 0);
    
    return [
      { label: `${selectedDomain.name} Candidates`, value: totalInDomain, icon: Users, color: "bg-blue-500/10 text-blue-600" },
      { label: "Avg Progress", value: `${avgProgress}%`, icon: BookOpen, color: "bg-purple-500/10 text-purple-600" },
      { label: "Domain Interviews", value: domainInterviews, icon: Mic, color: "bg-orange-500/10 text-orange-600" },
      { label: "Top Performer", value: domainUsers[0]?.username || "N/A", icon: Star, color: "bg-amber-500/10 text-amber-600" },
    ];
  }, [selectedDomain, domainUsers, dashboardData]);

  const filteredStudents = useMemo(() => {
    const baseList = selectedDomain ? (domainUsers || []) : (allStudents || []);
    
    let result = baseList.filter((s: any) => {
      const search = (debouncedSearch || "").toLowerCase();
      const matchesSearch = 
        (s.username || "").toLowerCase().includes(search) || 
        (s.employee_id || "").toString().includes(search);
      
      const isNotAdmin = s.role !== "admin"; 
      return matchesSearch && isNotAdmin; 
    });

    return [...result].sort((a: any, b: any) => {
      const valA = Number(a.path_progress) || 0;
      const valB = Number(b.path_progress) || 0;
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [selectedDomain, domainUsers, allStudents, debouncedSearch, sortOrder]);

  const filteredAlerts = useMemo(() => {
    const alerts = dashboardData?.underperforming_students || [];
    if (!selectedDomain) return alerts;
    return alerts.filter((alert: any) => 
      domainUsers?.some((user: any) => user.employee_id === alert.employee_id)
    );
  }, [selectedDomain, dashboardData, domainUsers]);

  const handleBarClick = (data: any) => {
    if (data && data._id) {
      setSelectedDomain({ id: data._id, name: data.domain_name });
    }
  };

  if (isStatsLoading || isAllStudentsLoading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing platform registry...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Overview</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm">
              {selectedDomain ? `Filtering results for ${selectedDomain.name}` : `Monitoring platform-wide performance`}
            </p>
            {selectedDomain && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedDomain(null)} className="h-7 text-xs gap-1.5 text-primary">
                <RotateCcw className="h-3 w-3" /> Reset to Global
              </Button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={selectedDomain?.id || "global"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeStats.map((s) => (
            <Card key={s.label} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-5 w-5" /></div>
                  <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Live</span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-lg">
          <CardHeader><CardTitle className="text-lg font-bold">Domain Distribution</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.domain_distribution} onClick={(state) => state?.activePayload && handleBarClick(state.activePayload[0].payload)}>
                <XAxis dataKey="domain_name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} className="cursor-pointer">
                  {dashboardData?.domain_distribution?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={selectedDomain?.id === entry._id ? "#4f46e5" : (index % 2 === 0 ? "#6366f1" : "#a855f7")} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg flex flex-col overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" /> Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="overflow-y-auto max-h-[300px] p-4 space-y-3 custom-scrollbar">
              {filteredAlerts.length > 0 ? filteredAlerts.map((s: any) => (
                <div key={s._id} className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/10 hover:bg-destructive/10 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-foreground">{s.username}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Score: {s.score}% • {s.status}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/students/${s.employee_id}`)} className="h-8 text-xs font-bold">Review</Button>
                </div>
              )) : (
                <div className="text-center py-10">
                  <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto opacity-20 mb-2" />
                  <p className="text-xs text-muted-foreground italic tracking-tight">Registry is healthy.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 overflow-hidden shadow-lg border-none bg-card/40">
        <CardHeader className="bg-muted/30 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 px-6">
          <div>
            <CardTitle className="text-lg font-bold">{selectedDomain ? selectedDomain.name : "Platform"} Registry</CardTitle>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Status: Online • {filteredStudents.length} Students</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by candidate name or ID..." 
              className="pl-10 bg-background h-10 border-border/50 shadow-inner" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b">
                <tr className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                  <th className="p-5">Candidate</th>
                  <th className="p-5">Registry ID</th>
                  <th className="p-5">Current Rank (XP)</th>
                  <th className="p-5">
                    <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="flex items-center gap-1 hover:text-primary transition-colors">
                      Path Progress {sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    </button>
                  </th>
                  <th className="p-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredStudents.length > 0 ? filteredStudents.map((s: any) => (
                  <tr key={s._id || s.employee_id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-5">
                      <div className="font-bold text-foreground group-hover:text-primary transition-colors">{s.username}</div>
                      <div className="text-[9px] text-muted-foreground uppercase font-black mt-0.5 tracking-tighter">
                        {selectedDomain ? selectedDomain.name : (s.domain || "No Domain Assigned")}
                      </div>
                    </td>
                    <td className="p-5 text-muted-foreground font-mono text-xs">{s.employee_id}</td>
                    <td className="p-5">
                      <span className="font-black text-primary text-base">{s.total_xp || 0}</span>
                      <span className="text-[10px] ml-1 opacity-50 font-black tracking-widest uppercase">pts</span>
                    </td>
                    <td className="p-5 w-56">
                      <div className="flex items-center gap-3">
                        <Progress value={Number(s.path_progress) || 0} className="h-1.5 flex-1" />
                        <span className="text-[10px] font-black w-8">{Number(s.path_progress) || 0}%</span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/admin/students/${s.employee_id}`)} className="h-9 px-5 hover:bg-primary hover:text-primary-foreground font-bold rounded-lg shadow-sm border-border/50">
                        View Details
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-muted-foreground italic text-sm">
                      No candidates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;