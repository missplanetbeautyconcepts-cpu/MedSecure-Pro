import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Activity, 
  AlertTriangle,
  History,
  Lock
} from "lucide-react";
import { apiService } from "../services/api";
import { useUIStore } from "../store/uiStore";
import { Button } from "../components/ui/Button";
import { ReAuthModal } from "../components/ui/ReAuthModal";
import { DataTable } from "../components/ui/DataTable";
import { formatDate, cn } from "../lib/utils";
import { ReAuthRequest } from "../types";

export default function SecurityCenterPage() {
  const [isReAuthOpen, setIsReAuthOpen] = useState(false);
  const [simulationType, setSimulationType] = useState<any>(null);

  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  const { data: status, isLoading } = useQuery({
    queryKey: ["threat_status"],
    queryFn: () => apiService.getThreatStatus().then(res => res.data),
    refetchInterval: 10000, // Poll status
  });

  const handleSimulate = (type: string) => {
    setSimulationType(type);
    setIsReAuthOpen(true);
  };

  const onReAuthConfirm = async (reauth: ReAuthRequest) => {
    await apiService.simulateAttack({ attack_type: simulationType }, reauth);
    addToast(`Attack simulation [${simulationType}] triggered`, "info");
    queryClient.invalidateQueries({ queryKey: ["threat_status"] });
  };

  const recentAttempts = status?.recent_blocked_attempts?.map((a, i) => ({ ...a, id: a.id || `at-${i}` })) || [];

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Security Command Center</h1>
          <p className="text-slate-500 text-sm">Real-time threat detection and active defense status.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-lg border border-sky-100">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Passive Defense Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Status */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-slate-900">Active Monitoring</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Blocked Attacks</p>
                <p className="text-2xl font-bold text-slate-900">{status?.total_blocked_attempts}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Security Model</p>
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wide">{status?.model_status}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Detection</p>
                <p className="text-xs font-bold text-slate-700">{status?.last_attack_detected ? formatDate(status.last_attack_detected) : "Safe"}</p>
              </div>
            </div>
          </div>

          {/* Recent Blocked Attempts */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-900">Incident History</h2>
              </div>
            </div>
            <div className="p-6">
              <DataTable 
                data={recentAttempts} 
                columns={[
                  { header: "Time", accessor: (item: any) => formatDate(item.timestamp) },
                  { header: "Type", accessor: (item: any) => (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      item.simulated ? "bg-sky-100 text-sky-700" : "bg-red-100 text-red-700"
                    )}>
                      {item.simulated ? "Simulation" : item.attack_type}
                    </span>
                  )},
                  { header: "Blocked By", accessor: "blocked_by" as any },
                ]} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Simulations */}
          <div className="bg-slate-900 p-8 rounded-2xl shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/20 rounded-xl">
                <ShieldAlert className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Stress Testing Unit</h2>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Offensive Simulation</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Manually trigger security simulations to verify defense responsiveness. Each action requires administrative confirmation and is logged as a "Simulated Attack".
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vector Source</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={simulationType || "brute_force"}
                  onChange={(e) => setSimulationType(e.target.value)}
                >
                  <option value="brute_force">Brute Force Auth Attack</option>
                  <option value="privilege_escalation">RBAC Privilege Escalation</option>
                  <option value="data_exfiltration">ECC Key Exfiltration Attempt</option>
                  <option value="injection">SQL/NoSQL Injection Vector</option>
                  <option value="unauthorized_file_access">Direct File System Access</option>
                </select>
              </div>

              <Button 
                variant="danger" 
                className="w-full h-12 uppercase text-[10px] font-bold tracking-[0.2em]"
                onClick={() => handleSimulate(simulationType || "brute_force")}
              >
                Execute Simulation
              </Button>
            </div>

            <div className="pt-4 border-t border-white/5 mt-4">
              <div className="text-[10px] font-bold text-slate-600 uppercase mb-3">Hardware HSM Status</div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-emerald-500 status-pulse">●</span>
                <span className="font-bold text-slate-300">Titan-V2 Secure Element</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-sky-600" />
              <h2 className="text-lg font-semibold text-slate-900">Key Health</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Root Key Age</span>
                <span className="font-bold text-slate-900">14 days</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full w-[14%]" />
              </div>
              <Button variant="outline" size="sm" className="w-full text-[10px] uppercase font-bold tracking-widest mt-2">
                Initiate Key Rotation
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ReAuthModal 
        isOpen={isReAuthOpen}
        onClose={() => setIsReAuthOpen(false)}
        onConfirm={onReAuthConfirm}
        title="Admin Authorization"
        description="Triggering a security simulation is a high-risk action. Please verify your credentials."
      />
    </div>
  );
}
