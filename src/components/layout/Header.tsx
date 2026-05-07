import { Bell, Search, Menu, LogOut, Settings } from "lucide-react";
import { useUIStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../ui/Button";

export function Header() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 h-9 w-9 rounded-lg text-slate-400"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
          <span className="uppercase tracking-wider">Console</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold uppercase tracking-wider">{window.location.pathname.split('/').pop() || 'Dashboard'}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-64 group focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
          <Search className="h-4 w-4 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search clinical database..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold text-slate-900 leading-none">
              {useAuthStore.getState().user?.username}
            </span>
            <span className="text-[10px] uppercase font-bold text-sky-600 tracking-tighter mt-1">
              {useAuthStore.getState().user?.role}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs ring-2 ring-transparent hover:ring-sky-500/20 transition-all cursor-pointer">
            {useAuthStore.getState().user?.username[0].toUpperCase()}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="p-2 h-9 w-9 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
