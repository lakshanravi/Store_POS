import { useEffect, useState } from 'react';
import { ShoppingCart, TrendingUp, Package, AlertTriangle, RefreshCcw, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import StatCard from '../components/shared/StatCard';
import { reportApi, inventoryApi } from '../api';
import { formatCurrency, today } from '../utils/format';

export default function Dashboard() {
  const { user, can } = useAuthStore();
  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    if (can('reports')) reportApi.daily(today()).then(r => setSummary(r.data.data.summary)).catch(() => {});
    if (can('inventory')) inventoryApi.getLowStock().then(r => setLowStock(r.data.data.products)).catch(() => {});
  }, []);

  const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };

  return (
    <div className="animate-fadeIn">
      <div className="mb-7">
        <h1 className="font-display font-bold text-2xl text-white">{greet()}, {user?.full_name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 text-sm mt-1">{new Date().toLocaleDateString('en-LK', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7 stagger">
        {can('reports') && <>
          <StatCard label="Today's Revenue"   value={formatCurrency(summary?.net_revenue || 0)} sub={`${summary?.total_transactions || 0} transactions`} icon={ShoppingCart} color="bg-blue-600" />
          <StatCard label="Gross Revenue"     value={formatCurrency(summary?.gross_revenue || 0)} sub="Before discounts" icon={TrendingUp} color="bg-emerald-600" />
          <StatCard label="Total Discounts"   value={formatCurrency(summary?.total_discounts || 0)} sub="Given today" icon={RefreshCcw} color="bg-amber-600" />
          <StatCard label="Tax Collected"     value={formatCurrency(summary?.total_tax || 0)} sub="Today" icon={ArrowUpRight} color="bg-violet-600" />
        </>}
        {can('inventory') && !can('reports') && <>
          <StatCard label="Low Stock Items" value={lowStock.length} sub="Need attention" icon={AlertTriangle} color="bg-red-600" />
          <StatCard label="Products" value="-" sub="In catalog" icon={Package} color="bg-blue-600" />
        </>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Quick actions */}
        <div className="glass rounded-xl p-5">
          <h2 className="font-display font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {can('sales') && (
              <Link to="/pos" className="flex items-center gap-3 p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl hover:bg-blue-600/20 transition-all group">
                <ShoppingCart size={20} className="text-blue-400" />
                <div>
                  <p className="text-white text-sm font-medium">New Sale</p>
                  <p className="text-slate-500 text-xs">Open POS</p>
                </div>
              </Link>
            )}
            {can('products') && (
              <Link to="/products" className="flex items-center gap-3 p-3 bg-emerald-600/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-600/20 transition-all">
                <Package size={20} className="text-emerald-400" />
                <div>
                  <p className="text-white text-sm font-medium">Products</p>
                  <p className="text-slate-500 text-xs">Manage catalog</p>
                </div>
              </Link>
            )}
            {can('reports') && (
              <Link to="/reports/daily" className="flex items-center gap-3 p-3 bg-violet-600/10 border border-violet-500/20 rounded-xl hover:bg-violet-600/20 transition-all">
                <TrendingUp size={20} className="text-violet-400" />
                <div>
                  <p className="text-white text-sm font-medium">Reports of details</p>
                  <p className="text-slate-500 text-xs">View analytics</p>
                </div>
              </Link>
            )}
            {can('inventory') && (
              <Link to="/inventory" className="flex items-center gap-3 p-3 bg-amber-600/10 border border-amber-500/20 rounded-xl hover:bg-amber-600/20 transition-all">
                <AlertTriangle size={20} className="text-amber-400" />
                <div>
                  <p className="text-white text-sm font-medium">Inventory</p>
                  <p className="text-slate-500 text-xs">{lowStock.length} low stock</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Low stock alert */}
        {can('inventory') && lowStock.length > 0 && (
          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-white">Low Stock Alert</h2>
              <span className="badge badge-red">{lowStock.length} items</span>
            </div>
            <ul className="space-y-2">
              {lowStock.slice(0, 6).map(p => (
                <li key={p.id} className="flex items-center justify-between py-1.5 border-b border-slate-800/60 last:border-0">
                  <span className="text-slate-300 text-sm">{p.name}</span>
                  <span className="font-mono text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                    {p.stock_quantity} {p.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
