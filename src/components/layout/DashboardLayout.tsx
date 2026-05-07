import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { cn } from "../../lib/utils";

export function DashboardLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 min-w-0",
          sidebarOpen ? "md:pl-64" : "md:pl-16"
        )}
      >
        <Header />
        <main className="p-4 md:p-8 flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

interface RoleGuardProps {
  roles: string[];
  children: ReactNode;
}

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
