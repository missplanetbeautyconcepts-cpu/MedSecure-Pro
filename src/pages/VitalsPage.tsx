import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Search, ChevronRight, Thermometer, Heart, Wind, Gauge } from "lucide-react";
import { apiService } from "../services/api";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { RecordMetadata } from "../types";
import { formatDate } from "../lib/utils";
import { useNavigate } from "react-router-dom";

export default function VitalsPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["records"],
    queryFn: () => apiService.getRecords().then(res => res.data),
  });

  const filteredRecords = records.filter(r => 
    r.note.toLowerCase().includes(search.toLowerCase()) || 
    r.id.toString().includes(search)
  );

  const columns = [
    {
      header: "Patient / Record ID",
      accessor: (item: RecordMetadata) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 text-xs">#REC{item.id}</span>
          <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">{item.note}</span>
        </div>
      ),
    },
    {
      header: "Last Activity",
      accessor: (item: RecordMetadata) => (
        <span className="text-[10px] font-mono text-slate-400">{formatDate(item.created_at)}</span>
      ),
    },
    {
      header: "Status",
      accessor: () => (
        <span className="px-2 py-0.5 bg-sky-50 text-sky-600 rounded text-[9px] font-bold uppercase border border-sky-100">
          In-Patient
        </span>
      ),
    },
    {
      header: "",
      accessor: (item: RecordMetadata) => (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-2 bg-white"
          onClick={() => navigate(`/vitals/${item.id}`)}
        >
          <span className="text-[10px] font-bold uppercase">Take Vitals</span>
          <ChevronRight className="h-3 w-3" />
        </Button>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Physiological Record Station</h1>
          <p className="text-slate-500 text-sm">Select a patient to document new manual vitals entries.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 w-72">
          <Search className="h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or #REC..." 
            className="bg-transparent border-none outline-none text-sm w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Records", value: isLoading ? "..." : records.length, icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Service Mode", value: "Strict", icon: Heart, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Threats", value: "0", icon: Gauge, color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Storage", value: "ECC-AES", icon: Wind, color: "text-sky-600", bg: "bg-sky-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <DataTable data={filteredRecords} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
