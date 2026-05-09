import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  FileText, 
  Lock, 
  Unlock, 
  Eye, 
  MoreVertical,
  Trash2,
  Edit2,
  User as UserIcon,
  Microscope,
  Stethoscope,
  ShieldAlert,
  Activity,
  CheckCircle2
} from "lucide-react";
import { motion } from "motion/react";
import { apiService } from "../services/api";
import { useUIStore } from "../store/uiStore";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { DataTable } from "../components/ui/DataTable";
import { Modal } from "../components/ui/Modal";
import { ReAuthModal } from "../components/ui/ReAuthModal";
import { RecordMetadata, RecordFull, PatientData, ReAuthRequest } from "../types";
import { formatDate, cn } from "../lib/utils";

function RecordDetail({ record, onClose }: { record: RecordFull; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "diagnosis" | "labs" | "vitals">("overview");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [note, setNote] = useState(record.note || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReAuthOpen, setIsReAuthOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);
  const { user } = useAuthStore();
  
  const isNurse = user?.role === "nurse";
  const data: PatientData = JSON.parse(record.plaintext);

  const handleUpdateNote = async (reauth: ReAuthRequest) => {
    setIsUpdating(true);
    try {
      await apiService.updateRecord(record.id, { note }, reauth);
      addToast("Record metadata updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["records"] });
      setIsEditingNote(false);
      setIsReAuthOpen?.(false);
    } catch (error) {
      addToast("Failed to update record metadata. Verify your credentials.", "error");
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const allTabs = [
    { id: "overview", label: "Patient Overview", icon: UserIcon, roles: ["admin", "doctor", "nurse", "lab"] },
    { id: "diagnosis", label: "Diagnosis & Notes", icon: Stethoscope, roles: ["admin", "doctor"] },
    { id: "labs", label: "Lab Tests", icon: Microscope, roles: ["admin", "doctor", "lab"] },
    { id: "vitals", label: "Vitals History", icon: Activity, roles: ["admin", "doctor", "nurse"] },
  ] as const;

  const tabs = allTabs.filter(t => (t.roles as readonly string[]).includes(user?.role || ""));

  // Ensure default tab is allowed
  useEffect(() => {
    if (!tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0]?.id || "overview");
    }
  }, [user?.role]);

  return (
    <div className="space-y-6">
      {/* Decryption Status */}
      <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl">
        <div className="flex items-center gap-2 text-emerald-700">
          <Unlock className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Live Decryption Active</span>
        </div>
        <div className="text-[10px] font-mono text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded">
          KEY_ID: {record.id.toString(16).toUpperCase()}
        </div>
      </div>

      {/* Basic Info Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">{data.patient_name}</h2>
          <div className="flex items-center gap-3 text-slate-500 text-xs text-medium">
            <span>Age: {data.age}</span>
            <span className="text-slate-300">|</span>
            <span>Record ID: #REC{record.id}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {isEditingNote ? (
            <div className="flex items-center gap-2">
              <Input 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                className="h-8 w-48 text-xs"
              />
              <Button size="sm" className="h-8" onClick={() => setIsReAuthOpen(true)}>Save</Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={() => setIsEditingNote(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Short Note:</span>
              <span className="text-xs font-medium text-slate-600">{record.note}</span>
              {["doctor", "admin"].includes(user?.role || "") && (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsEditingNote(true)}>
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <ReAuthModal 
        isOpen={isReAuthOpen} 
        onClose={() => setIsReAuthOpen(false)} 
        onConfirm={handleUpdateNote}
        title="Authorize Record Update"
        description="Verify your identity to modify the encrypted record's plaintext metadata."
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all relative",
              activeTab === tab.id ? "text-sky-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <div className="flex items-center gap-2">
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </div>
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px] py-4">
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Blood Type</p>
                <p className="font-bold text-slate-900">{data.bio_data?.blood_type || "A+"}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Allergies</p>
                <p className="font-bold text-rose-600 truncate">{data.bio_data?.allergies || "None Disclosed"}</p>
              </div>
            </div>
            
            {isNurse && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 leading-tight">
                  Clinical diagnosis and physician notes are restricted to prescribing clinicians. Contact the attending physician for diagnostic data.
                </p>
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 text-center">Current Vitals Snapshots</p>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">BP</p>
                  <p className="text-sm font-bold text-slate-900">{data.vitals?.blood_pressure || "120/80"}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Heart Rate</p>
                  <p className="text-sm font-bold text-slate-900">{data.vitals?.heart_rate || 72} BPM</p>
                </div>
                <div className="text-center">
                   <p className="text-[9px] font-bold text-slate-400 uppercase">Temp</p>
                   <p className="text-sm font-bold text-slate-900">{data.vitals?.temperature || 98.6}°F</p>
                </div>
                <div className="text-center">
                   <p className="text-[9px] font-bold text-slate-400 uppercase">Respiration</p>
                   <p className="text-sm font-bold text-slate-900">{data.vitals?.respiratory_rate || 16}/m</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "diagnosis" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="p-5 bg-rose-50 border border-rose-100 rounded-xl">
              <label className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-2 block">Primary Impression</label>
              <p className="text-lg font-bold text-rose-900 leading-tight">{data.diagnosis}</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinical Commentary</label>
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 leading-relaxed italic">
                "{data.doctor_notes || "No additional commentary was provided for this assessment."}"
              </div>
            </div>
          </div>
        )}

        {activeTab === "labs" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Requested Diagnostic Tests</h3>
            {data.lab_tests?.requested && data.lab_tests.requested.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {data.lab_tests.requested.map((test, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-sky-50 text-sky-600 rounded flex items-center justify-center">
                        <Microscope className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{test}</span>
                        {data.lab_tests?.results?.[test] && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            Result: {data.lab_tests.results[test].value} {data.lab_tests.results[test].unit}
                          </span>
                        )}
                      </div>
                    </div>
                    {data.lab_tests?.results?.[test] ? (
                      <div className="flex items-center gap-2">
                         <span className={cn(
                           "text-[9px] font-bold uppercase px-2 py-1 rounded",
                           data.lab_tests.results[test].status === "critical" ? "bg-rose-100 text-rose-700" :
                           data.lab_tests.results[test].status === "abnormal" ? "bg-amber-100 text-amber-700" :
                           "bg-emerald-100 text-emerald-700"
                         )}>
                           {data.lab_tests.results[test].status}
                         </span>
                         <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>
                    ) : (
                      <span className="text-[9px] font-bold uppercase px-2 py-1 bg-amber-50 text-amber-600 rounded">Analysis Pending</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
                <Microscope className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400 italic">No lab tests requested for this encounter.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "vitals" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="relative h-48 w-full bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">
               {/* Visual placeholder for a graph */}
               <div className="absolute inset-x-0 bottom-0 top-1/2 bg-sky-500/5 border-t border-sky-500/20" />
               <div className="relative z-10 text-center">
                 <Activity className="h-8 w-8 text-sky-200 mx-auto mb-2 animate-pulse" />
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Telemetry Feed Offline</p>
                 <p className="text-[9px] text-slate-400 mt-1">Real-time vitals monitoring requires hospital network bridge.</p>
               </div>
            </div>
            <div className="space-y-3">
               <h3 className="text-[10px] font-bold text-slate-900 uppercase">Encryption Log</h3>
               <div className="space-y-1">
                 <div className="flex justify-between text-xs py-2 border-b border-slate-50">
                   <span className="text-slate-500">Baseline Entry</span>
                   <span className="font-mono text-slate-700">{record.created_at}</span>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Print / Export Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
          <Plus className="h-4 w-4" />
          Print PDF Report
        </Button>
        <Button size="sm" onClick={onClose}>Close Viewer</Button>
      </div>
    </div>
  );
}

export default function MedicalRecordsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [isReAuthOpen, setIsReAuthOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<RecordFull | null>(null);
  const [reAuthAction, setReAuthAction] = useState<"view" | "delete" | "edit">("view");

  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);
  const { user } = useAuthStore();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["records"],
    queryFn: () => apiService.getRecords().then(res => res.data),
  });

  const handleAction = (id: number, action: "view" | "delete" | "edit") => {
    setSelectedRecordId(id);
    setReAuthAction(action);
    setIsReAuthOpen(true);
  };

  const onReAuthConfirm = async (reauth: ReAuthRequest) => {
    if (!selectedRecordId) return;

    if (reAuthAction === "view") {
      const response = await apiService.getRecordFull(selectedRecordId, reauth);
      setViewingRecord(response.data);
    } else if (reAuthAction === "delete") {
      await apiService.deleteRecord(selectedRecordId, reauth);
      addToast("Record deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["records"] });
    }
    // Handle edit similarly...
  };

  const columns = [
    {
      header: "Record ID",
      accessor: (item: RecordMetadata) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-900">#REC{item.id}</span>
        </div>
      ),
    },
    {
      header: "Created At",
      accessor: (item: RecordMetadata) => formatDate(item.created_at),
    },
    {
      header: "Status",
      accessor: () => (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-sky-50 text-sky-700 rounded-full w-fit">
          <Lock className="h-3 w-3" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Encrypted</span>
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (item: RecordMetadata) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAction(item.id, "view")}
            className="h-8 px-2 gap-1"
          >
            <Eye className="h-4 w-4" />
            Decrypt
          </Button>
          {user?.role === "admin" && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleAction(item.id, "delete")}
              className="h-8 px-2 text-red-600 hover:bg-red-50 hover:border-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Medical Records</h1>
          <p className="text-slate-500 text-sm">Browse and manage patient health documentation secured with ECC-AES.</p>
        </div>
        <div className="flex items-center gap-2">
          {["doctor", "admin"].includes(user?.role || "") && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Record
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <DataTable 
          data={records} 
          columns={columns} 
          isLoading={isLoading} 
        />
      </div>

      {/* Record Creation Modal */}
      <CreateRecordModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      {/* Re-Auth Modal */}
      <ReAuthModal 
        isOpen={isReAuthOpen}
        onClose={() => setIsReAuthOpen(false)}
        onConfirm={onReAuthConfirm}
        title={reAuthAction === "view" ? "Decrypt Medical Record" : "Delete Record"}
        description={reAuthAction === "view" 
          ? "Standard protocol: Re-verify identity to decrypt protected PHI." 
          : "Are you sure you want to permanently delete this record? This action is logged."}
      />

      {/* Record View Modal */}
      <Modal
        isOpen={!!viewingRecord}
        onClose={() => setViewingRecord(null)}
        title={`Patient Record #REC${viewingRecord?.id}`}
        className="max-w-3xl"
      >
        {viewingRecord && (
          <RecordDetail 
            record={viewingRecord} 
            onClose={() => setViewingRecord(null)} 
          />
        )}
      </Modal>
    </div>
  );
}

function CreateRecordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const patientData = {
        patient_name: patientName,
        age: parseInt(age),
        diagnosis,
        doctor_notes: notes,
      };

      await apiService.createRecord({
        plaintext: JSON.stringify(patientData),
        note: `Record for ${patientName}`,
      });

      addToast("Record created and encrypted", "success");
      queryClient.invalidateQueries({ queryKey: ["records"] });
      onClose();
      // Reset form
      setPatientName("");
      setAge("");
      setDiagnosis("");
      setNotes("");
    } catch (err) {
      addToast("Failed to create record", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New encrypted Record">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Patient Name" 
            value={patientName} 
            onChange={(e) => setPatientName(e.target.value)} 
            required 
          />
          <Input 
            label="Age" 
            type="number" 
            value={age} 
            onChange={(e) => setAge(e.target.value)} 
            required 
          />
        </div>
        <Input 
          label="Diagnosis" 
          value={diagnosis} 
          onChange={(e) => setDiagnosis(e.target.value)} 
          required 
        />
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Clinical Notes</label>
          <textarea
            className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Encrypt & Save</Button>
        </div>
      </form>
    </Modal>
  );
}
