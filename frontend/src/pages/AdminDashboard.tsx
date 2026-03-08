import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, BookOpen, Mic, HelpCircle, Search, 
  RotateCcw, Loader2, ArrowUp, ArrowDown 
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
      const res = await fetch(`https://prepzen-api.onrender.com/admin/domain-users/${selectedDomain.id}`);
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

  // Updated Filter logic for Critical Alerts to follow domain selection
  const filteredAlerts = useMemo(() => {
    const alerts = dashboardData?.underperforming_students || [];
    if (!selectedDomain) return alerts;
    
    // Cross-reference alerts with domain users to filter by domain
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

      <AnimatePresence mode="wait">
        <motion.div key={selectedDomain?.id || "global"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeStats.map((s) => (
            <Card key={s.label} className="border-border/50 bg-card/50 backdrop-blur-sm">
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

        {/* Updated Critical Alerts Section with fixed title and scrolling */}
        <Card className="border-border/50 shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="overflow-y-auto max-h-[300px] px-6 pb-6 space-y-4 custom-scrollbar">
              {filteredAlerts.length > 0 ? filteredAlerts.map((s: any) => (
                <div key={s._id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                  <div>
                    <p className="text-sm font-bold">{s.username}</p>
                    <p className="text-xs text-muted-foreground">Score: {s.score}% • {s.status.toUpperCase()}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/students/${s.employee_id}`)}>Review</Button>
                </div>
              )) : (
                <p className="text-center text-sm text-muted-foreground py-10 italic">No alerts found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
                placeholder="Search candidates..." 
                className="pl-9 bg-background h-9" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
            {isDomainUsersLoading ? (
               <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-muted/95 backdrop-blur-sm z-10">
                  <tr className="text-muted-foreground border-b uppercase text-[10px] font-bold tracking-wider">
                    <th className="p-4">Candidate</th>
                    <th className="p-4">ID</th>
                    <th className="p-4">Domain</th>
                    <th className="p-4">
                      <button 
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        Progress
                        {sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      </button>
                    </th>
                    <th className="p-4">Joined</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.length > 0 ? filteredStudents.map((s: any) => (
                    <tr key={s._id} className="hover:bg-muted/30 transition-colors group">
                      <td className="p-4 font-bold">{s.username}</td>
                      <td className="p-4 text-muted-foreground font-mono text-xs">{s.employee_id}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground border border-border">
                          {selectedDomain ? selectedDomain.name : (s.domain || "N/A")}
                        </span>
                      </td>
                      <td className="p-4 w-48">
                        <div className="flex items-center gap-3">
                          <Progress value={s.path_progress} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium w-8">{s.path_progress}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/students/${s.employee_id}`)}>View Profile</Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-muted-foreground italic">No candidates found.</td>
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