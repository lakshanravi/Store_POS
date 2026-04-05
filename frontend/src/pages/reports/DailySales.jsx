import { useState, useEffect } from 'react';
import { BarChart2, ShoppingCart, TrendingUp, Tag, Receipt } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { reportApi } from '../../api';
import { formatCurrency, today } from '../../utils/format';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import Spinner from '../../components/shared/Spinner';
import toast from 'react-hot-toast';

export default function DailySales() {
  const [date, setDate]       = useState(today());
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { const r = await reportApi.daily(date); setData(r.data.data); }
    catch { toast.error('Failed to load report'); }
    setLoading(false);
  }
  useEffect(() => { load(); }, [date]);

  const s = data?.summary || {};

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Daily Sales Report"
        action={<input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-base w-auto" />} />

      {loading ? <div className="flex justify-center py-16"><Spinner /></div> : (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6 stagger">
            <StatCard label="Transactions"   value={s.total_transactions || 0}            icon={ShoppingCart} color="bg-blue-600" />
            <StatCard label="Net Revenue"    value={formatCurrency(s.net_revenue)}         icon={TrendingUp}   color="bg-emerald-600" sub="After discounts" />
            <StatCard label="Discounts Given"value={formatCurrency(s.total_discounts)}     icon={Tag}          color="bg-amber-600" />
            <StatCard label="Tax Collected"  value={formatCurrency(s.total_tax)}           icon={Receipt}      color="bg-violet-600" />
          </div>

          {/* Payment breakdown */}
          {data?.payments?.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
              <div className="glass rounded-xl p-5">
                <h3 className="font-display font-semibold text-white mb-4">Payment Methods</h3>
                <div className="space-y-2">
                  {data.payments.map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                      <span className="text-slate-300 text-sm capitalize">{p.name}</span>
                      <span className="font-mono text-blue-400 font-medium">{formatCurrency(p.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top products */}
              {data?.top_products?.length > 0 && (
                <div className="glass rounded-xl p-5">
                  <h3 className="font-display font-semibold text-white mb-4">Top Products</h3>
                  <div className="space-y-2">
                    {data.top_products.slice(0, 6).map((p, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-800/60 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600 font-mono text-xs w-4">{i+1}</span>
                          <span className="text-slate-300 text-sm">{p.product_name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xs text-blue-400">{formatCurrency(p.revenue)}</p>
                          <p className="text-slate-600 text-[10px]">{p.qty_sold} sold</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Summary box */}
          <div className="glass rounded-xl p-5">
            <h3 className="font-display font-semibold text-white mb-4">Summary — {date}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {[
                ['Gross Revenue',  formatCurrency(s.gross_revenue)],
                ['Total Discounts',formatCurrency(s.total_discounts)],
                ['Tax Amount',     formatCurrency(s.total_tax)],
                ['Net Revenue',    formatCurrency(s.net_revenue)],
                ['Void Count',     s.void_count || 0],
                ['Transactions',   s.total_transactions || 0],
              ].map(([label, val]) => (
                <div key={label} className="bg-slate-800/40 rounded-lg p-3">
                  <p className="text-slate-500 text-xs">{label}</p>
                  <p className="text-white font-mono font-medium mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
