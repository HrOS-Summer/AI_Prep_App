import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users, BookOpen, Mic, HelpCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const adminStats = [
  { label: "Total Students", value: "124", icon: Users },
  { label: "Active Courses", value: "6", icon: BookOpen },
  { label: "Interviews Today", value: "18", icon: Mic },
  { label: "Quizzes Taken", value: "342", icon: HelpCircle },
];

const students = [
  { id: 1, name: "Alice Johnson", domain: "Web Development", progress: 75, interviews: 12, avgScore: 82 },
  { id: 2, name: "Bob Smith", domain: "Data Structures", progress: 45, interviews: 6, avgScore: 68 },
  { id: 3, name: "Carol Williams", domain: "Machine Learning", progress: 90, interviews: 15, avgScore: 91 },
  { id: 4, name: "David Chen", domain: "Backend Development", progress: 30, interviews: 4, avgScore: 55 },
  { id: 5, name: "Eve Martinez", domain: "Cybersecurity", progress: 60, interviews: 9, avgScore: 74 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="shadow-card border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="shadow-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Student Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Student</th>
                  <th className="pb-2 font-medium">Domain</th>
                  <th className="pb-2 font-medium">Progress</th>
                  <th className="pb-2 font-medium">Interviews</th>
                  <th className="pb-2 font-medium">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/admin/students/${s.id}`)}
                  >
                    <td className="py-3 font-medium">{s.name}</td>
                    <td className="py-3 text-muted-foreground">{s.domain}</td>
                    <td className="py-3 w-40">
                      <div className="flex items-center gap-2">
                        <Progress value={s.progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{s.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3">{s.interviews}</td>
                    <td className="py-3">
                      <span className={`font-medium ${s.avgScore >= 70 ? "text-success" : "text-warning"}`}>{s.avgScore}%</span>
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

export default AdminDashboard;
