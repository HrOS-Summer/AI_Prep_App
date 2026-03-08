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

  // 2. ALL Students (Default View)
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
      // FIXED: Properly encode the ID/Name to prevent 404s
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
    if (!selectedDomain || !domainUsers) {
      return [
        { label: "Total Candidates", value: dashboardData?.total_students || 0, icon: Users, color: "bg-blue-500/10 text-blue-600" },
        { label: "Completion Rate", value: `${dashboardData?.completion_stats.percentage || 0}%`, icon: BookOpen, color: "bg-purple-500/10 text-purple-600" },
        { label: "Interviews Held", value: dashboardData?.total_interviews || 0, icon: Mic, color: "bg-orange-500/10 text-orange-600" },
        { label: "High Performers", value: dashboardData?.high_performers_count || 0, icon: HelpCircle, color: "bg-green-500/10 text-green-600" },
      ];
    }
    
    // DYNAMIC DOMAIN STATS
    const totalInDomain = domainUsers.length;
    const avgProgress = totalInDomain > 0 
      ? Math.round(domainUsers.reduce((acc: number, curr: any) => acc + (curr.path_progress || 0), 0) / totalInDomain) 
      : 0;
    
    // Count total interviews done in this domain specifically
    const domainInterviews = domainUsers.reduce((acc: number, curr: any) => acc + (curr.total_interviews || 0), 0);
    
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
      const matchesSearch = 
        s.username?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
        s.employee_id?.includes(debouncedSearch);
      return matchesSearch && s.role !== "admin"; 
    });
    return result.sort((a: any, b: any) => {
      return sortOrder === 'asc' 
        ? (a.path_progress || 0) - (b.path_progress || 0)
        : (b.path_progress || 0) - (a.path_progress || 0);
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
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

      {/* STATS GRID */}
      <AnimatePresence mode="wait">
        <motion.div key={selectedDomain?.id || "global"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeStats.map((s) => (
            <Card key={s.label} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
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
        {/* CHART */}
        <Card className="lg:col-span-2 border-border/50 shadow-lg">
          <CardHeader><CardTitle className="text-lg">Domain Distribution</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.domain_distribution} onClick={(state) => state?.activePayload && handleBarClick(state.activePayload[0].payload)}>
                <XAxis dataKey="domain_name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} className="cursor-pointer">
                  {dashboardData?.domain_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={selectedDomain?.id === entry._id ? "#4f46e5" : (index % 2 === 0 ? "#6366f1" : "#a855f7")} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ALERTS */}
        <Card className="border-border/50 shadow-lg flex flex-col">
          <CardHeader className="border-b bg-muted/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" /> Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="overflow-y-auto max-h-[300px] p-4 space-y-3 custom-scrollbar">
              {filteredAlerts.length > 0 ? filteredAlerts.map((s: any) => (
                <div key={s._id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10 hover:bg-destructive/10 transition-colors">
                  <div>
                    <p className="text-sm font-bold">{s.username}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Score: {s.score}% • {s.status}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/students/${s.employee_id}`)} className="h-8 text-xs">Review</Button>
                </div>
              )) : (
                <div className="text-center py-10">
                  <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto opacity-20 mb-2" />
                  <p className="text-sm text-muted-foreground italic">No candidates require immediate attention.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* REGISTRY TABLE */}
      <Card className="border-border/50 overflow-hidden shadow-lg">
        <CardHeader className="bg-muted/30 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-6">
          <div>
            <CardTitle className="text-lg">{selectedDomain ? selectedDomain.name : "Platform"} Registry</CardTitle>
            <p className="text-xs text-muted-foreground font-mono">Total {filteredStudents.length} candidates found</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or ID..." 
              className="pl-9 bg-background h-9 border-border/50 focus:ring-primary" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-y-auto max-h-[450px] custom-scrollbar">
            {isDomainUsersLoading ? (
               <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
            ) : (
              <table className="w-full text-sm text-left border-collapse">
                <thead className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b">
                  <tr className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                    <th className="p-4">Candidate</th>
                    <th className="p-4">ID</th>
                    <th className="p-4">XP Points</th>
                    <th className="p-4">
                      <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="flex items-center gap-1 hover:text-primary transition-colors uppercase">
                        Progress {sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      </button>
                    </th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.length > 0 ? filteredStudents.map((s: any) => (
                    <tr key={s._id} className="hover:bg-muted/20 transition-colors group">
                      <td className="p-4">
                        <div className="font-bold text-foreground">{s.username}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">{selectedDomain ? selectedDomain.name : (s.domain || "No Domain")}</div>
                      </td>
                      <td className="p-4 text-muted-foreground font-mono text-xs">{s.employee_id}</td>
                      <td className="p-4">
                        <span className="font-black text-primary">{s.total_xp || 0}</span>
                        <span className="text-[10px] ml-1 opacity-50 font-bold">XP</span>
                      </td>
                      <td className="p-4 w-48">
                        <div className="flex items-center gap-3">
                          <Progress value={s.path_progress} className="h-1.5 flex-1" />
                          <span className="text-xs font-bold w-8">{s.path_progress}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/students/${s.employee_id}`)} className="h-8 hover:bg-primary hover:text-primary-foreground transition-all">Details</Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="p-20 text-center text-muted-foreground italic">No candidates match your current filter criteria.</td>
                    </tr>
                  )}
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