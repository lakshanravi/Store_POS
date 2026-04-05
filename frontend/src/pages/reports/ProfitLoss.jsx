import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, RefreshCcw } from 'lucide-react';
import { reportApi } from '../../api';
import { formatCurrency, monthStart, today } from '../../utils/format';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import Spinner from '../../components/shared/Spinner';
import toast from 'react-hot-toast';

export default function ProfitLoss() {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo]     = useState(today());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { const r = await reportApi.profitLoss(from, to); setData(r.data.data); }
    catch { toast.error('Failed to load'); }
    setLoading(false);
  }
  useEffect(() => { load(); }, [from, to]);

  const rev = data?.revenue || {};
  const ref = data?.refunds  || {};
  const gp  = parseFloat(data?.gross_profit || 0);

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Profit & Loss"
        action={
          <div className="flex gap-2 items-center">
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input-base w-auto" />
            <span className="text-slate-500 text-sm">to</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input-base w-auto" />
          </div>
        }
      />

      {loading ? <div className="flex justify-center py-16"><Spinner /></div> : (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6 stagger">
            <StatCard label="Net Revenue"    value={formatCurrency(rev.net_revenue)}  icon={TrendingUp}   color="bg-blue-600" />
            <StatCard label="Cost of Goods"  value={formatCurrency(rev.cogs)}         icon={TrendingDown} color="bg-red-600" />
            <StatCard label="Gross Profit"   value={formatCurrency(gp)}               icon={DollarSign}   color={gp >= 0 ? 'bg-emerald-600' : 'bg-red-600'} />
            <StatCard label="Total Refunds"  value={formatCurrency(ref.total_refunded)} icon={RefreshCcw} color="bg-amber-600" />
          </div>

          {/* P&L Table */}
          <div className="glass rounded-xl p-6">
            <h3 className="font-display font-semibold text-white mb-5">Profit & Loss Statement</h3>
            <div className="space-y-1 text-sm max-w-lg">
              {[
                ['REVENUE', null, 'section'],
                ['Gross Sales',         formatCurrency(rev.gross_revenue),    ''],
                ['Less: Discounts',     `(${formatCurrency(rev.total_discounts)})`, 'deduction'],
                ['Net Sales Revenue',   formatCurrency(rev.net_revenue),      'subtotal'],
                ['', null, 'spacer'],
                ['COST OF GOODS SOLD', null, 'section'],
                ['Cost of Goods Sold', `(${formatCurrency(rev.cogs)})`,       'deduction'],
                ['', null, 'spacer'],
                ['GROSS PROFIT',        formatCurrency(Math.max(0, parseFloat(rev.net_revenue||0) - parseFloat(rev.cogs||0))), 'subtotal'],
                ['', null, 'spacer'],
                ['ADJUSTMENTS',        null, 'section'],
                ['Refunds & Returns',  `(${formatCurrency(ref.total_refunded)})`, 'deduction'],
                ['', null, 'spacer'],
                ['NET PROFIT',         formatCurrency(gp), 'total'],
              ].map(([label, val, type], i) => {
                if (type === 'spacer') return <div key={i} className="h-2" />;
                if (type === 'section') return <p key={i} className="text-xs font-bold text-slate-500 uppercase tracking-widest pt-2 pb-1">{label}</p>;
                if (type === 'total') return (
                  <div key={i} className="flex justify-between py-2 border-t-2 border-slate-700 mt-2 font-bold">
                    <span className="text-white">{label}</span>
                    <span className={`font-mono ${gp >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{val}</span>
                  </div>
                );
                if (type === 'subtotal') return (
                  <div key={i} className="flex justify-between py-1.5 border-t border-slate-800">
                    <span className="text-white font-medium">{label}</span>
                    <span className="font-mono text-blue-400">{val}</span>
                  </div>
                );
                return (
                  <div key={i} className="flex justify-between py-1">
                    <span className={type === 'deduction' ? 'text-red-400' : 'text-slate-300'}>{label}</span>
                    <span className={`font-mono ${type === 'deduction' ? 'text-red-400' : 'text-slate-300'}`}>{val}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[
              ['Total Sales', rev.total_sales || 0],
              ['Refund Count', ref.refund_count || 0],
              ['Tax Collected', formatCurrency(rev.total_tax)],
            ].map(([l, v]) => (
              <div key={l} className="glass rounded-xl p-4 text-center">
                <p className="font-mono font-bold text-xl text-white">{v}</p>
                <p className="text-slate-500 text-xs mt-1">{l}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
