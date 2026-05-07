import React from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="h-24 w-24 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-8 border border-rose-100">
        <ShieldAlert className="h-12 w-12" />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Access Restricted</h1>
      <p className="text-slate-500 max-w-md mb-8">
        You do not have the required medical or administrative clearance to access this encrypted resource. 
        All attempts to bypass protocol are logged in the audit trail.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <Button onClick={() => navigate(-1)} variant="outline" className="gap-2 bg-white">
          <ArrowLeft className="h-4 w-4" />
          Return to Deck
        </Button>
        <Button onClick={() => navigate("/")} variant="primary">
          Dashboard Home
        </Button>
      </div>

      <div className="mt-12 p-4 bg-slate-50 rounded-xl border border-slate-100 max-w-sm">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Incident Reference</p>
        <p className="text-[10px] font-mono text-slate-400">ERR_RBAC_PROTOCOL_VIOLATION_{new Date().getTime()}</p>
      </div>
    </div>
  );
}
