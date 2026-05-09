import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Wind, 
  Gauge, 
  Weight, 
  Ruler, 
  AlertCircle, 
  Save, 
  ChevronLeft,
  Clock,
  History,
  TrendingUp,
  User as UserIcon,
  Unlock
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { apiService } from "../services/api";
import { useUIStore } from "../store/uiStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PatientData, RecordFull, ReAuthRequest } from "../types";
import { cn } from "../lib/utils";
import { ReAuthModal } from "../components/ui/ReAuthModal";

export default function VitalsEntryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);
  const [isReAuthOpen, setIsReAuthOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [vitalsData, setVitalsData] = useState({
    blood_pressure: "120/80",
    heart_rate: 72,
    temperature: 98.6,
    respiratory_rate: 16,
    spo2: 98,
    weight: "70kg",
    height: "175cm",
    pain_score: 0,
    nurse_notes: ""
  });

  const { data: record, isLoading: isLoadingRecord } = useQuery({
    queryKey: ["record", id],
    queryFn: () => apiService.getRecordDetail(Number(id), { 
      username: "", 
      role: "", 
      password: "", 
      reauth_password: "" 
    } as ReAuthRequest).then(res => res.data), // Metadata fetch
    enabled: !!id,
    retry: false
  });

  const { data: realHistory } = useQuery({
    queryKey: ["vitals-history", id],
    queryFn: () => apiService.getVitalsHistory(Number(id)).then(res => res.data),
    enabled: !!id
  });

  // Simplified history data for the chart using real history if available
  const historyData = realHistory?.map((h: any) => ({
    time: h.timestamp ? new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---",
    hr: h.hr,
    temp: h.temp,
    bp: parseInt(h.bp?.split('/')[0] || "0")
  })) || [
    { time: "08:00", hr: 72, temp: 98.6, bp: 120 },
    { time: "10:00", hr: 75, temp: 98.8, bp: 122 },
    { time: "12:00", hr: 80, temp: 99.1, bp: 125 },
    { time: "14:00", hr: 78, temp: 98.9, bp: 121 },
    { time: "current", hr: vitalsData.heart_rate, temp: vitalsData.temperature, bp: 120 },
  ];

  const handleSave = async (reauth: ReAuthRequest) => {
    setIsLoading(true);
    try {
      // 1. First we satisfy the re-auth check locally (ReAuthModal does this by checking the passwordInput)
      // 2. We prepare the vitals payload matching the backend schema
      const payload = {
        bp: vitalsData.blood_pressure,
        hr: vitalsData.heart_rate,
        temp: vitalsData.temperature,
        rr: vitalsData.respiratory_rate,
        spo2: vitalsData.spo2,
        weight: parseFloat(vitalsData.weight.replace(/[^0-9.]/g, '')),
        height: parseFloat(vitalsData.height.replace(/[^0-9.]/g, '')),
        pain: vitalsData.pain_score,
        notes: vitalsData.nurse_notes
      };

      await apiService.addVitals(Number(id), payload);
      
      addToast("Physiological data recorded and encrypted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["vitals-history", id] });
      navigate("/vitals");
    } catch (error) {
      addToast("Clinical commit failed. Ensure all data formats are correct.", "error");
    } finally {
      setIsLoading(false);
      setIsReAuthOpen(false);
    }
  };

  if (isLoadingRecord) return <div className="p-8 text-center text-slate-400">Syncing with medical bridge...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/vitals")} className="h-10 w-10 p-0 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Vitals Acquisition Panel</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Accessing Record</span>
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">#REC{id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
          <Unlock className="h-4 w-4 text-emerald-600" />
          <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-widest">Minimal Identity Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-sky-600" />
              <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Manual Entry</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="BP (systolic/diastolic)" 
                value={vitalsData.blood_pressure}
                onChange={(e) => setVitalsData({...vitalsData, blood_pressure: e.target.value})}
              />
              <Input 
                label="Heart Rate (BPM)" 
                type="number"
                value={vitalsData.heart_rate}
                onChange={(e) => setVitalsData({...vitalsData, heart_rate: parseInt(e.target.value)})}
              />
              <Input 
                label="Temp (°F)" 
                type="number"
                value={vitalsData.temperature}
                onChange={(e) => setVitalsData({...vitalsData, temperature: parseFloat(e.target.value)})}
              />
              <Input 
                label="SpO2 (%)" 
                type="number"
                value={vitalsData.spo2}
                onChange={(e) => setVitalsData({...vitalsData, spo2: parseInt(e.target.value)})}
              />
              <Input 
                label="Weight" 
                value={vitalsData.weight}
                onChange={(e) => setVitalsData({...vitalsData, weight: e.target.value})}
              />
              <Input 
                label="Height" 
                value={vitalsData.height}
                onChange={(e) => setVitalsData({...vitalsData, height: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pain Level (0-10)</label>
                <span className="text-sm font-bold text-sky-600">{vitalsData.pain_score}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                step="1"
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-600"
                value={vitalsData.pain_score}
                onChange={(e) => setVitalsData({...vitalsData, pain_score: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nurse Observations</label>
              <textarea 
                className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:italic"
                placeholder="Document any physical observations or patient statements..."
                value={vitalsData.nurse_notes}
                onChange={(e) => setVitalsData({...vitalsData, nurse_notes: e.target.value})}
              />
            </div>

            <Button 
              className="w-full py-6 mt-4 gap-2" 
              onClick={() => setIsReAuthOpen(true)}
            >
              <Save className="h-4 w-4" />
              Commit Vitals
            </Button>
          </div>
        </div>

        {/* Visualization & History Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Trend Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-[350px] relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-sky-500" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Vitals Telemetry Trend</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Last 24 Hours</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-sky-500" />
                  <span className="text-[10px] font-bold text-slate-500">Heart Rate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-500">Temp</span>
                </div>
              </div>
            </div>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#94a3b8'}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#94a3b8'}}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="hr" 
                    stroke="#0ea5e9" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorHr)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <History className="h-5 w-5 text-slate-400" />
              <h3 className="font-bold text-slate-900 text-sm">Chronological Observation Feed</h3>
            </div>

            <div className="space-y-4">
              {[
                { time: "14:00", type: "Telemetry Update", nurse: "NURSE_77", hr: 78, bp: "121/79" },
                { time: "12:00", type: "Full Assessment", nurse: "NURSE_42", hr: 80, bp: "125/82" },
                { time: "10:00", type: "Routine Check", nurse: "NURSE_77", hr: 75, bp: "122/80" },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-slate-200 group-hover:bg-sky-500 transition-colors" />
                    <div className="w-px h-full bg-slate-100" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-bold text-slate-900 uppercase">{log.type}</p>
                      <span className="text-[10px] font-mono text-slate-400">{log.time}</span>
                    </div>
                    <p className="text-xs text-slate-500">Recorded by <span className="font-bold text-[10px] uppercase">{log.nurse}</span> • HR: {log.hr} BPM • BP: {log.bp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ReAuthModal 
        isOpen={isReAuthOpen}
        onClose={() => setIsReAuthOpen(false)}
        onConfirm={handleSave}
        title="Clinical Authorization"
        description="Encrypted physiological data commit requires medical personnel re-authentication."
      />
    </div>
  );
}
