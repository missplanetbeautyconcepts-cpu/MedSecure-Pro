import { NavLink } from "react-router-dom";
import { 
  HeartPulse, 
  ShieldCheck, 
  Users, 
  ClipboardList, 
  ShieldAlert, 
  Key, 
  History,
  Activity,
  Microscope,
  Stethoscope,
  LayoutDashboard,
  Plus
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { cn } from "../../lib/utils";

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin", "doctor", "nurse", "lab"] },
  { name: "Medical Records", href: "/records", icon: ClipboardList, roles: ["admin", "doctor", "nurse", "lab"] },
  { name: "New Report", href: "/reports/new", icon: Plus, roles: ["doctor"] },
  { name: "Vitals Check", href: "/vitals", icon: Activity, roles: ["nurse", "doctor"] },
  { name: "Lab Requests", href: "/lab", icon: Microscope, roles: ["lab", "doctor"] },
  { name: "System Users", href: "/admin/users", icon: Users, roles: ["admin"] },
  { name: "Key Management", href: "/admin/keys", icon: Key, roles: ["admin"] },
  { name: "Security Center", href: "/admin/security", icon: ShieldAlert, roles: ["admin"] },
  { name: "Audit Logs", href: "/admin/audit", icon: History, roles: ["admin"] },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarOpen } = useUIStore();

  const filteredItems = sidebarItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-[#0c1e35] transition-all duration-300 flex flex-col text-slate-300",
        sidebarOpen ? "w-64 translate-x-0" : "w-16 -translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-700 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold">
            M
          </div>
          {sidebarOpen && (
            <span className="text-white font-semibold tracking-tight whitespace-nowrap">
              MedSafe <span className="text-sky-400">Core</span>
            </span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-6 space-y-1">
          {sidebarOpen && (
            <div className="px-6 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Main Console
            </div>
          )}
          {filteredItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all group relative",
                isActive 
                  ? "bg-sky-600/10 text-white border-r-4 border-sky-500" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110", sidebarOpen ? "" : "mx-auto")} />
              {sidebarOpen && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Status Indicator (Bottom) */}
        <div className="p-6 bg-[#091526] mt-auto">
          <div className="flex items-center mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 status-pulse mr-2"></span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Secure Backend Active</span>
          </div>
          {sidebarOpen && (
            <div className="text-slate-500 font-mono text-[9px] mt-1 opacity-60">
              v2.4.0-stable | ECC-AES
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
