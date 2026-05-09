import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { 
  ClipboardList, 
  Activity, 
  Microscope, 
  ShieldAlert, 
  Users, 
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  ShieldCheck,
  History,
  FlaskConical
} from "lucide-react";
import { cn, formatDate } from "../lib/utils";
import { Button } from "../components/ui/Button";

interface StatProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  trendType?: "up" | "down";
  color: string;
}

function Stat({ title, value, icon: Icon, trend, trendType, color }: StatProps) {
  const isStrict = title === "Security Status";

  return (
    <div className={cn(
      "p-5 rounded-xl border shadow-sm transition-all hover:shadow-md",
      isStrict ? "bg-rose-50 border-rose-100" : "bg-white border-slate-200"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn("text-[10px] font-bold uppercase tracking-widest", isStrict ? "text-rose-600" : "text-slate-500")}>
          {title}
        </div>
        {trend && (
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter",
            trendType === "up" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className={cn("text-2xl font-bold tracking-tight", isStrict ? "text-rose-700" : "text-slate-900")}>
          {value}
        </p>
        <p className={cn("text-[10px] font-medium mt-2", isStrict ? "text-rose-500 italic" : "text-slate-400")}>
          {isStrict ? "RBAC Enforcement: 100%" : (trend ? trend : "Encrypted Data Pool")}
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: records = [], isLoading: isLoadingRecords } = useQuery({
    queryKey: ["records"],
    queryFn: () => apiService.getRecords().then(res => res.data),
  });

  const { data: threatStatus } = useQuery({
    queryKey: ["threat_status"],
    queryFn: () => apiService.getThreatStatus().then(res => res.data),
    enabled: user?.role === "admin",
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ["audit_logs"],
    queryFn: () => apiService.getAuditLogs().then(res => res.data),
    enabled: user?.role === "admin",
  });

  const getStats = () => {
    const baseStats = [
      { title: "Encrypted Records", value: isLoadingRecords ? "..." : records.length.toLocaleString(), icon: FileText, color: "text-sky-600", trend: "🔒 ECC-AES Hybrid" },
      { title: "Security Status", value: "STRICT", icon: ShieldAlert, color: "text-rose-600" },
    ];

    switch (user?.role) {
      case "admin":
        return [
          { title: "Active Threats (1h)", value: threatStatus?.active_threats_last_hour.length || 0, icon: ShieldAlert, color: "text-emerald-600", trend: "↑ System Optimal", trendType: "up" },
          { title: "Total Blocked", value: threatStatus?.total_blocked_attempts || 0, icon: ShieldAlert, color: "text-slate-600", trend: "Since last key rotation" },
          ...baseStats
        ];
      case "doctor":
        return [
          { title: "Personal Caseload", value: records.length, icon: Users, color: "text-sky-600", trend: "Total unique patients", trendType: "up" },
          { title: "Pending Labs", value: "...", icon: Microscope, color: "text-amber-600", trend: "Check lab module", trendType: "down" },
          { title: "Today's Consults", value: "-", icon: Activity, color: "text-emerald-600", trend: "Queue inactive", trendType: "up" },
          ...baseStats
        ];
      case "lab":
        return [
          { title: "Analysis Queue", value: "Active", icon: FlaskConical, color: "text-amber-600", trend: "Real-time bridge", trendType: "down" },
          { title: "Completed Feed", value: records.length, icon: CheckCircle2, color: "text-emerald-600", trend: "Historical data", trendType: "up" },
          { title: "Avg Turnaround", value: "N/A", icon: Clock, color: "text-sky-600", trend: "Monitoring disabled", trendType: "up" },
          ...baseStats
        ];
      case "nurse":
        return [
          { title: "Unit Capacity", value: "STABLE", icon: Users, color: "text-sky-600", trend: "Normal operation", trendType: "up" },
          { title: "Telemetry Status", value: "N/A", icon: Activity, color: "text-amber-600", trend: "Link required", trendType: "down" },
          { title: "Response Latency", value: "OPTIMAL", icon: Clock, color: "text-emerald-600", trend: "Stable", trendType: "up" },
          ...baseStats
        ];
      default:
        return [
          ...baseStats
        ];
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.username}</h1>
        <p className="text-slate-500">Here's what's happening in your department today.</p>
      </div>

      {/* Role-specific Quick Actions */}
      {user?.role === "doctor" && (
        <div className="bg-sky-600 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-sky-600/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold">New Clinical Examination</h3>
              <p className="text-sm text-sky-100 italic">Initiate a secure encrypted patient record encounter.</p>
            </div>
          </div>
          <Button 
            className="bg-white text-sky-600 hover:bg-sky-50 shadow-none font-bold"
            onClick={() => navigate("/reports/new")}
          >
            Start Encounter
          </Button>
        </div>
      )}

      {user?.role === "nurse" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-20 bg-white border-slate-200 justify-start px-6 gap-4"
            onClick={() => navigate("/nurse/patients")}
          >
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
              <Activity className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900">Take Vitals</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Entry Panel</p>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 bg-white border-slate-200 justify-start px-6 gap-4"
            onClick={() => navigate("/nurse/patients")}
          >
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <History className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900">Vitals History</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Telemetry Feed</p>
            </div>
          </Button>
        </div>
      )}

      {user?.role === "lab" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-20 bg-white border-slate-200 justify-start px-6 gap-4"
            onClick={() => navigate("/lab")}
          >
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900">Process Queue</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Pending Requests</p>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 bg-white border-slate-200 justify-start px-6 gap-4"
            onClick={() => navigate("/lab")}
          >
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <History className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900">Lab History</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Completed Results</p>
            </div>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStats().map((stat, idx) => (
          <Stat key={idx} {...(stat as any)} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            {user?.role === "admin" && (
              <button className="text-xs text-sky-600 font-semibold hover:underline">View Audit Database</button>
            )}
          </div>
          <div className="space-y-6">
            {user?.role === "admin" ? (
              auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <ShieldCheck className="h-5 w-5 text-sky-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900 capitalize">{log.action.replace(/_/g, ' ')}</p>
                      <span className="text-[10px] font-mono text-slate-400">{formatDate(log.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-500">Initiated by <span className="font-bold uppercase text-[10px]">{log.username}</span> {log.details}</p>
                  </div>
                </div>
              ))
            ) : user?.role === "lab" ? (
              [
                { action: "Result Uploaded", time: "5m ago", details: "CBC Result for #REC842", icon: FlaskConical },
                { action: "New Request", time: "45m ago", details: "MRI Request for #REC849", icon: Microscope },
                { action: "Protocol Scan", time: "2h ago", details: "Lab systems integrity verified", icon: ShieldCheck },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                    <item.icon className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{item.action}</p>
                      <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-500">{item.details}</p>
                  </div>
                </div>
              ))
            ) : user?.role === "nurse" ? (
              [
                { action: "Vitals Recorded", time: "12m ago", details: "Vitals recorded for #REC842", icon: Activity },
                { action: "Patient Arrival", time: "1h ago", details: "#REC845 moved to Ward B", icon: Users },
                { action: "Shift Handover", time: "4h ago", details: "NURSE_42 assigned to Ward A", icon: Clock },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-sky-50 flex items-center justify-center border border-sky-100">
                    <item.icon className="h-5 w-5 text-sky-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{item.action}</p>
                      <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-500">{item.details}</p>
                  </div>
                </div>
              ))
            ) : (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">Medical Record Updated</p>
                      <span className="text-xs text-slate-400">24m ago</span>
                    </div>
                    <p className="text-xs text-slate-500">Patient #REC842 was updated (Diagnosis: Hypertension)</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-emerald-700">Records Database</span>
              </div>
              <span className="text-xs font-bold text-emerald-700">ONLINE</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-emerald-700">Auth Server</span>
              </div>
              <span className="text-xs font-bold text-emerald-700">ONLINE</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-amber-500 rounded-full" />
                <span className="text-sm font-medium text-amber-700">Encryption Engine</span>
              </div>
              <span className="text-xs font-bold text-amber-700">ECC-AES</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
