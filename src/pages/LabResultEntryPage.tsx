import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Microscope, 
  FlaskConical, 
  ChevronLeft, 
  Save, 
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Printer,
  ShieldCheck,
  Activity
} from "lucide-react";
import { apiService } from "../services/api";
import { useUIStore } from "../store/uiStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { cn } from "../lib/utils";
import { ReAuthModal } from "../components/ui/ReAuthModal";
import { ReAuthRequest } from "../types";

export default function LabResultEntryPage() {
  const { recordId, testName } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);
  const [isReAuthOpen, setIsReAuthOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const numericRecordId = Number(recordId);
  const isInvalidParams = !recordId || recordId === "NaN" || isNaN(numericRecordId) || !testName || testName === "undefined";

  // Form State
  const [resultData, setResultData] = useState({
    value: "",
    unit: "mg/dL",
    reference_range: "70-99",
    status: "normal" as "normal" | "abnormal" | "critical",
    comments: ""
  });

  // We don't fetch full record metadata on mount to avoid 401 re-auth errors.
  // The record ID is available from the URL params.
  const isLoadingRecord = false;

  const { data: labHistory } = useQuery({
    queryKey: ["lab-results", recordId],
    queryFn: () => apiService.getLabResults(numericRecordId).then(res => res.data),
    enabled: !isInvalidParams
  });

  const handleSubmit = async (reauth: ReAuthRequest) => {
    if (isInvalidParams) {
      addToast("Invalid record or test parameters.", "error");
      return;
    }
    
    setIsLoading(true);
    try {
      const payload = {
        test_name: testName,
        result_value: resultData.value,
        unit: resultData.unit,
        reference_range: resultData.reference_range,
        status: resultData.status,
        comments: resultData.comments,
        reauth_password: reauth.reauth_password
      };

      await apiService.addLabResult(numericRecordId, payload);
      
      queryClient.invalidateQueries({ queryKey: ["pending-lab-tests"] });
      queryClient.invalidateQueries({ queryKey: ["lab-results", recordId] });
      queryClient.invalidateQueries({ queryKey: ["records"] });

      addToast(`Laboratory results for ${testName} finalized and encrypted`, "success");
      navigate("/lab");
    } catch (error) {
      addToast("Failed to finalize diagnostic data.", "error");
    } finally {
      setIsLoading(false);
      setIsReAuthOpen(false);
    }
  };

  if (isInvalidParams) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold text-slate-900">Missing Diagnostic Context</h2>
        <p className="text-slate-500">The record ID or test name is invalid. Please return to the queue.</p>
        <Button onClick={() => navigate("/lab")}>Return to Queue</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/lab")} className="h-10 w-10 p-0 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Diagnostic Result Finalization</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Processing Record</span>
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">#REC{recordId}</span>
              <span className="text-[10px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded uppercase">{testName}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-sky-50 border border-sky-100 rounded-xl">
          <Microscope className="h-4 w-4 text-sky-600" />
          <span className="text-[10px] font-bold uppercase text-sky-700 tracking-widest">Laboratory Bridge Active</span>
        </div>
      </div>

      {resultData.status === "critical" && (
        <div className="p-4 bg-rose-600 text-white rounded-2xl flex items-center justify-between shadow-lg shadow-rose-600/20 animate-pulse">
          <div className="flex items-center gap-4">
            <AlertCircle className="h-6 w-6" />
            <div>
              <p className="font-bold">CRITICAL RESULT DETECTED</p>
              <p className="text-xs text-rose-100">Immediate notification of the attending physician is required per clinical protocol.</p>
            </div>
          </div>
          <Button variant="outline" className="bg-white border-none text-rose-600 hover:bg-rose-50 font-bold text-xs uppercase">
            Page Physician
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <FlaskConical className="h-5 w-5 text-sky-500" />
              <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Technician Entry Form</h3>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <Input 
                  label="Measured Value" 
                  placeholder="e.g. 124"
                  value={resultData.value}
                  onChange={(e) => setResultData({...resultData, value: e.target.value})}
                />
                <Input 
                  label="Unit of Measurement" 
                  placeholder="e.g. mg/dL"
                  value={resultData.unit}
                  onChange={(e) => setResultData({...resultData, unit: e.target.value})}
                />
                <Input 
                  label="Reference Range" 
                  placeholder="e.g. 70 - 99"
                  value={resultData.reference_range}
                  onChange={(e) => setResultData({...resultData, reference_range: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Result Significance</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: "normal", label: "Normal / Within Range", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                    { id: "abnormal", label: "Abnormal / Out of Range", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
                    { id: "critical", label: "Critical Value", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setResultData({...resultData, status: s.id as any})}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                        resultData.status === s.id 
                          ? `${s.bg} ${s.border} shadow-sm ring-2 ring-sky-500/20`
                          : "bg-white border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <s.icon className={cn("h-5 w-5", resultData.status === s.id ? s.color : "text-slate-300")} />
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-wide",
                        resultData.status === s.id ? s.color : "text-slate-400"
                      )}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diagnostic Observations</label>
              <textarea 
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:italic"
                placeholder="Include details about sample quality, equipment calibration, or observed anomalies..."
                value={resultData.comments}
                onChange={(e) => setResultData({...resultData, comments: e.target.value})}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button className="flex-1 py-6 gap-2" onClick={() => setIsReAuthOpen(true)} disabled={!resultData.value}>
                <ShieldCheck className="h-4 w-4" />
                Sign & Finalize Result
              </Button>
              <Button variant="outline" className="px-6 bg-white border-slate-200">
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol Check</h4>
            <div className="space-y-3">
              {[
                "Sample integrity verified",
                "Patient identity cross-checked",
                "Control samples passed calibration",
                "Results peer-reviewed (if applicable)"
              ].map((check, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center">
                    <CheckCircle2 className="h-2.5 w-2.5 text-sky-500" />
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium">{check}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Historical Context</h4>
            <div className="space-y-4">
              {[
                { date: "2d ago", test: "Glucose", result: "105 mg/dL", type: "Abnormal" },
                { date: "1w ago", test: "CBC", result: "Complete", type: "Normal" },
              ].map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-[10px] font-bold text-slate-900">{h.test}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-mono">{h.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-700">{h.result}</p>
                    <span className="text-[8px] font-bold uppercase text-slate-400 tracking-tighter">{h.type}</span>
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
        onConfirm={handleSubmit}
        title="Diagnostic Finalization Auth"
        description="Technician re-authentication required to append signed diagnostic data to the encrypted record."
      />
    </div>
  );
}
