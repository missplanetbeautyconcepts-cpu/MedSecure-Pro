/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardLayout, RoleGuard } from "./components/layout/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import MedicalRecordsPage from "./pages/MedicalRecordsPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import SecurityCenterPage from "./pages/SecurityCenterPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import { useUIStore } from "./store/uiStore";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "./lib/utils";

import UserManagementPage from "./pages/UserManagementPage";
import KeyManagementPage from "./pages/KeyManagementPage";
import CreateReportPage from "./pages/CreateReportPage";
import VitalsPage from "./pages/VitalsPage";
import VitalsEntryPage from "./pages/VitalsEntryPage";
import LabRequestsPage from "./pages/LabRequestsPage";
import LabResultEntryPage from "./pages/LabResultEntryPage";
import { useAuthStore } from "./store/authStore";
import { ShieldCheck } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={cn(
            "flex items-center justify-between p-4 rounded-xl shadow-lg border animate-in slide-in-from-right-full duration-300",
            toast.type === "success" ? "bg-white border-emerald-100" : 
            toast.type === "error" ? "bg-white border-red-100" : "bg-white border-sky-100"
          )}
        >
          <div className="flex items-center gap-3">
            {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
            {toast.type === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
            {toast.type === "info" && <Info className="h-5 w-5 text-sky-500" />}
            <p className="text-sm font-medium text-slate-700">{toast.message}</p>
          </div>
          <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const { hasHydrated } = useAuthStore();

  if (!hasHydrated) {
    return (
      <div className="h-screen w-screen bg-[#0c1e35] flex flex-col items-center justify-center p-6 text-white overflow-hidden">
        <div className="relative mb-8">
          <div className="h-20 w-20 rounded-2xl bg-sky-500 flex items-center justify-center animate-bounce shadow-2xl shadow-sky-500/50">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -inset-4 border border-sky-500/20 rounded-3xl animate-ping" />
        </div>
        <h1 className="text-xl font-bold tracking-widest uppercase mb-2">MedSecure Pro</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Initializing Secure Environment</p>
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-sky-500 animate-[loading-bar_2s_infinite_linear]" style={{
            width: "30%",
          }} />
        </div>
        <style>{`
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          {/* Protected Routes */}
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="records" element={<MedicalRecordsPage />} />
            <Route 
              path="reports/new" 
              element={
                <RoleGuard roles={["doctor"]}>
                  <CreateReportPage />
                </RoleGuard>
              } 
            />
            <Route 
              path="nurse/patients" 
              element={
                <RoleGuard roles={["nurse"]}>
                  <VitalsPage />
                </RoleGuard>
              } 
            />
            <Route 
              path="vitals" 
              element={
                <RoleGuard roles={["nurse", "doctor"]}>
                  <VitalsPage />
                </RoleGuard>
              } 
            />
            <Route 
              path="vitals/:id" 
              element={
                <RoleGuard roles={["nurse", "doctor"]}>
                  <VitalsEntryPage />
                </RoleGuard>
              } 
            />
            
            {/* Lab Technician Routes */}
            <Route 
              path="lab" 
              element={
                <RoleGuard roles={["lab", "doctor"]}>
                  <LabRequestsPage />
                </RoleGuard>
              } 
            />
            <Route 
              path="lab/results/:recordId/:testName" 
              element={
                <RoleGuard roles={["lab", "doctor"]}>
                  <LabResultEntryPage />
                </RoleGuard>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="admin/audit" 
              element={
                <RoleGuard roles={["admin"]}>
                  <AuditLogsPage />
                </RoleGuard>
              } 
            />
            <Route 
              path="admin/users" 
              element={
                <RoleGuard roles={["admin"]}>
                  <UserManagementPage />
                </RoleGuard>
              } 
            />
            <Route 
              path="admin/keys" 
              element={
                <RoleGuard roles={["admin"]}>
                  <KeyManagementPage />
                </RoleGuard>
              } 
            />
            <Route 
              path="admin/security" 
              element={
                <RoleGuard roles={["admin"]}>
                  <SecurityCenterPage />
                </RoleGuard>
              } 
            />
          </Route>

          <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
          <Route path="/admin/user" element={<Navigate to="/admin/users" replace />} />
          <Route path="/reports" element={<Navigate to="/records" replace />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </QueryClientProvider>
  );
}

