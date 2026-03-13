import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import useAuthStore from '../../store/authStore';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="flex h-screen bg-[#0a0f1e] overflow-hidden">
      <Sidebar collapsed={collapsed} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-3.5 bg-slate-900/60 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setCollapsed(!collapsed)}
            className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800">
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                {user?.full_name?.[0]?.toUpperCase()}
              </div>
              <span className="text-slate-300 text-xs font-medium">{user?.full_name}</span>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
