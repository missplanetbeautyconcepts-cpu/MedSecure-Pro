import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Microscope, 
  Search, 
  ChevronRight, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Filter
} from "lucide-react";
import { apiService } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/Button";
import { RecordMetadata, PatientData } from "../types";
import { formatDate, cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";

export default function LabRequestsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"pending" | "completed">(
    user?.role === "lab" ? "pending" : "completed"
  );
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: pendingTests = [], isLoading: isLoadingPending } = useQuery({
    queryKey: ["pending-lab-tests"],
    queryFn: () => apiService.getPendingLabTests().then(res => res.data),
    enabled: activeTab === "pending" && user?.role === "lab"
  });

  const { data: records = [], isLoading: isLoadingRecords } = useQuery({
    queryKey: ["records"],
    queryFn: () => apiService.getRecords().then(res => res.data),
    enabled: activeTab === "completed"
  });

  const isLoading = isLoadingPending || isLoadingRecords;

  const filteredTests = (activeTab === "pending" ? pendingTests : records).filter((t: any) => 
    (t.patient_name?.toLowerCase().includes(search.toLowerCase()) || 
     t.patient?.toLowerCase().includes(search.toLowerCase()) ||
     t.test_name?.toLowerCase().includes(search.toLowerCase()) ||
     t.name?.toLowerCase().includes(search.toLowerCase()) ||
     t.note?.toLowerCase().includes(search.toLowerCase()) ||
     t.id?.toString().includes(search))
  );

  const columns = [
    {
      header: "Test Identification",
      accessor: (item: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 text-xs">{item.test_name || item.name || item.note || "General Clinical Test"}</span>
          <span className="text-[10px] text-slate-400 font-mono">#ID-{item.id}</span>
        </div>
      ),
    },
    {
      header: "Patient",
      accessor: (item: any) => (
        <span className="text-xs font-medium text-slate-700 truncate max-w-[150px]">{item.patient_name || item.patient || "Encrypted Identity"}</span>
      ),
    },
    {
      header: "Priority",
      accessor: (item: any) => (
        <span className={cn(
          "px-2 py-0.5 rounded text-[9px] font-bold uppercase border",
          (item.priority === "Urgent" || item.is_priority)
            ? "bg-rose-50 text-rose-600 border-rose-100" 
            : "bg-slate-50 text-slate-500 border-slate-100"
        )}>
          {item.priority || (item.is_priority ? "Urgent" : "Routine")}
        </span>
      ),
    },
    {
      header: "Requested Date",
      accessor: (item: any) => (
        <span className="text-[10px] font-mono text-slate-500">{formatDate(item.created_at || item.date)}</span>
      ),
    },
    {
      header: "",
      accessor: (item: any) => {
        const recordId = item.record_id || item.recordId || item.id;
        const testName = item.test_name || item.name || "diagnostic";
        
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-2 bg-white"
            onClick={() => {
              if (activeTab === "pending") {
                navigate(`/lab/results/${recordId}/${testName}`);
              } else {
                navigate(`/records`); // Go to records to view full details
              }
            }}
          >
            <span className="text-[10px] font-bold uppercase">
              {activeTab === "pending" ? "Enter Result" : "View Record"}
            </span>
            <ChevronRight className="h-3 w-3" />
          </Button>
        );
      },
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Diagnostic Queue</h1>
          <p className="text-slate-500 text-sm">Manage and process clinical laboratory diagnostic requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 w-72">
            <Search className="h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter by patient or test..." 
              className="bg-transparent border-none outline-none text-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2 bg-white">
            <Filter className="h-4 w-4" />
            <span className="text-xs font-bold uppercase">Sort</span>
          </Button>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {user?.role === "lab" && (
          <button
            onClick={() => setActiveTab("pending")}
            className={cn(
              "px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === "pending" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Clock className="h-4 w-4" />
            Pending Requests
          </button>
        )}
        <button
          onClick={() => setActiveTab("completed")}
          className={cn(
            "px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
            activeTab === "completed" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <CheckCircle2 className="h-4 w-4" />
          {user?.role === "lab" ? "Completed Data" : "Laboratory Records"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Queue</p>
            <p className="text-lg font-bold text-slate-900">{filteredTests.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Urgent Tests</p>
            <p className="text-lg font-bold text-slate-900">{filteredTests.filter(t => t.priority === "Urgent").length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <DataTable data={filteredTests} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
