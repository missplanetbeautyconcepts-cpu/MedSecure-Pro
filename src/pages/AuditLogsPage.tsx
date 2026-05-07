import { useQuery } from "@tanstack/react-query";
import { History, Shield, Search } from "lucide-react";
import { apiService } from "../services/api";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/Button";
import { formatDate } from "../lib/utils";
import { AuditLog } from "../types";

export default function AuditLogsPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit_logs"],
    queryFn: () => apiService.getAuditLogs().then(res => res.data),
  });

  const exportToCSV = () => {
    const headers = ["Timestamp", "User", "Action", "Target", "Details"];
    const rows = logs.map(log => [
      formatDate(log.timestamp),
      log.username,
      log.action,
      log.target_id || "",
      log.details || ""
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_log_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      header: "Security Event Timestamp",
      accessor: (item: AuditLog) => (
        <span className="text-slate-500 font-mono text-xs">{formatDate(item.timestamp)}</span>
      ),
    },
    {
      header: "Identity Principal",
      accessor: (item: AuditLog) => (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500 uppercase">
            {item.username.substring(0, 2)}
          </div>
          <span className="font-bold text-slate-900 uppercase text-[11px] tracking-tight">{item.username}</span>
        </div>
      ),
    },
    {
      header: "Operation Action",
      accessor: (item: AuditLog) => (
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-sky-500" />
          <span className="text-slate-700 font-bold uppercase text-[10px] tracking-wider">{item.action}</span>
        </div>
      ),
    },
    {
      header: "Asset Target",
      accessor: (item: AuditLog) => item.target_id ? (
        <span className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded text-[10px] font-bold border border-sky-100">
          #REC{item.target_id}
        </span>
      ) : (
        <span className="text-slate-300 font-mono text-xs">—</span>
      ),
    },
    {
      header: "Transaction Integrity Details",
      accessor: (item: AuditLog) => (
        <span className="text-[10px] font-medium text-slate-400 max-w-xs truncate block italic leading-relaxed">
          {item.details}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Forensic Audit Logs</h1>
          <p className="text-slate-500 text-sm">Immutable history of all sensitive infrastructure actions and record translations.</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
          <History className="h-4 w-4" />
          Export Dataset (CSV)
        </Button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <DataTable 
          data={logs} 
          columns={columns} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}
