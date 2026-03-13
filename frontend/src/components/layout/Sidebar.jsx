import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Tag, Truck,
  Users, BarChart2, FileText, RefreshCcw, Settings,
  LogOut, AlertTriangle, ChevronRight, Store,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const NAV = [
  { section: 'Main', items: [
    { label: 'Dashboard',  path: '/dashboard',  icon: LayoutDashboard, perm: null },
    { label: 'POS',        path: '/pos',         icon: ShoppingCart,    perm: 'sales' },
  ]},
  { section: 'Catalog', items: [
    { label: 'Products',   path: '/products',   icon: Package,  perm: 'products' },
    { label: 'Categories', path: '/categories', icon: Tag,      perm: 'products' },
    { label: 'Suppliers',  path: '/suppliers',  icon: Truck,    perm: 'inventory' },
  ]},
  { section: 'Operations', items: [
    { label: 'Inventory',  path: '/inventory',  icon: AlertTriangle, perm: 'inventory' },
    { label: 'Customers',  path: '/customers',  icon: Users,         perm: 'sales' },
    { label: 'Sales Log',  path: '/sales',      icon: FileText,      perm: 'sales' },
    { label: 'Refunds',    path: '/refunds',    icon: RefreshCcw,    perm: 'sales' },
  ]},
  { section: 'Reports', items: [
    { label: 'Daily Sales',  path: '/reports/daily',  icon: BarChart2, perm: 'reports' },
    { label: 'Profit & Loss',path: '/reports/pnl',    icon: FileText,  perm: 'reports' },
    { label: 'Refund Log',   path: '/reports/refunds',icon: RefreshCcw,perm: 'reports' },
  ]},
  { section: 'System', items: [
    { label: 'Settings', path: '/settings', icon: Settings, perm: 'settings' },
  ]},
];

export default function Sidebar({ collapsed }) {
  const { user, logout, can } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  }

  return (
    <aside className={`flex flex-col h-full bg-slate-900/80 border-r border-slate-800/60 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>

      {/* Logo */}
      <div className={`flex items-center gap-3 border-b border-slate-800/60 ${collapsed ? 'px-4 py-5 justify-center' : 'px-5 py-5'}`}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Store size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-display font-bold text-white text-sm leading-none">RetailPOS</p>
            <p className="text-slate-500 text-xs mt-0.5 capitalize">{user?.role?.name}</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {NAV.map(section => {
          const visible = section.items.filter(i => !i.perm || can(i.perm));
          if (!visible.length) return null;
          return (
            <div key={section.section}>
              {!collapsed && (
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-1.5">
                  {section.section}
                </p>
              )}
              <ul className="space-y-0.5">
                {visible.map(item => (
                  <li key={item.path}>
                    <NavLink to={item.path} className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group
                       ${isActive ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`
                    }>
                      <item.icon size={16} className="flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                      {!collapsed && <ChevronRight size={13} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-800/60 p-2 space-y-0.5">
        <div className={`flex items-center gap-2.5 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.full_name?.[0]?.toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.full_name}</p>
              <p className="text-slate-500 text-[10px]">{user?.email}</p>
            </div>
          )}
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm">
          <LogOut size={15} className="flex-shrink-0" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}
