import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users, BookOpen, Mic, HelpCircle, ArrowUpRight, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // In a real app, this would fetch from /admin/stats and /admin/students
  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => { /* fetch logic */ return mockStats; },
    initialData: mockStats
  });

  const filteredStudents = mockStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.employee_id.includes(searchTerm)
  );

  return (
    <div className="space-y-8 max-w-7xl pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Overview</h1>
          <p className="text-muted-foreground">Monitoring candidate performance across {stats.activeDomains} domains.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Candidate ID..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Top Level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${s.color}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-success flex items-center">
                    +12% <ArrowUpRight className="h-3 w-3 ml-1" />
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Domain Distribution Chart */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Domain Distribution</CardTitle>
            <CardDescription>Number of students enrolled per technical path</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="students" radius={[4, 4, 0, 0]}>
                  {domainData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6366f1" : "#a855f7"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Critical Alerts</CardTitle>
            <CardDescription>Students requiring intervention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {lowPerformers.map(s => (
               <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                 <div>
                   <p className="text-sm font-bold">{s.name}</p>
                   <p className="text-xs text-muted-foreground">Avg Score: {s.score}%</p>
                 </div>
                 <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/students/${s.id}`)}>Review</Button>
               </div>
             ))}
          </CardContent>
        </Card>
      </div>

      {/* Student Table */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg">Candidate Registry</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground bg-muted/20">
                  <th className="p-4 font-medium uppercase tracking-wider text-[10px]">Candidate</th>
                  <th className="p-4 font-medium uppercase tracking-wider text-[10px]">ID</th>
                  <th className="p-4 font-medium uppercase tracking-wider text-[10px]">Learning Progress</th>
                  <th className="p-4 font-medium uppercase tracking-wider text-[10px]">Status</th>
                  <th className="p-4 font-medium uppercase tracking-wider text-[10px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4 font-bold">{s.name}</td>
                    <td className="p-4 text-muted-foreground font-mono text-xs">{s.employee_id}</td>
                    <td className="p-4 w-64">
                      <div className="flex items-center gap-3">
                        <Progress value={s.progress} className="h-1.5 flex-1" />
                        <span className="text-xs font-medium w-8">{s.progress}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        s.progress >= 75 ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                      }`}>
                        {s.progress >= 75 ? "INTERVIEW READY" : "LEARNING"}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/admin/students/${s.id}`)}>
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Mock Data ---
const mockStats = { activeDomains: 5 };
const statCards = [
  { label: "Total Candidates", value: "1,248", icon: Users, color: "bg-blue-500/10 text-blue-600" },
  { label: "Completion Rate", value: "64%", icon: BookOpen, color: "bg-purple-500/10 text-purple-600" },
  { label: "Interviews Held", value: "892", icon: Mic, color: "bg-orange-500/10 text-orange-600" },
  { label: "Avg Platform Score", value: "78.4", icon: HelpCircle, color: "bg-green-500/10 text-green-600" },
];

const domainData = [
  { name: "Web Dev", students: 450 },
  { name: "QA/Testing", students: 320 },
  { name: "Backend", students: 210 },
  { name: "DevOps", students: 180 },
  { name: "Mobile", students: 88 },
];

const lowPerformers = [
  { id: "4", name: "David Chen", score: 55 },
  { id: "12", name: "Sarah Miller", score: 48 },
];

const mockStudents = [
  { id: "1", employee_id: "2477195", name: "Alice Johnson", progress: 78 },
  { id: "2", employee_id: "2477196", name: "Bob Smith", progress: 45 },
  { id: "3", employee_id: "2477197", name: "Carol Williams", progress: 92 },
];

export default AdminDashboard;