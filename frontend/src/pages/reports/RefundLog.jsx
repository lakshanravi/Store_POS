import { useState, useEffect } from 'react';
import { reportApi } from '../../api';
import { formatCurrency, formatDateTime, monthStart, today } from '../../utils/format';
import PageHeader from '../../components/shared/PageHeader';
import Spinner from '../../components/shared/Spinner';
import toast from 'react-hot-toast';

export default function RefundLog() {
  const [from, setFrom]     = useState(monthStart());
  const [to, setTo]         = useState(today());
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { const r = await reportApi.refundLog(from, to); setRefunds(r.data.data.refunds); }
    catch { toast.error('Failed'); }
    setLoading(false);
  }
  useEffect(() => { load(); }, [from, to]);

  const total = refunds.reduce((s, r) => s + parseFloat(r.total_refunded), 0);

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Refund Log"
        action={
          <div className="flex gap-2 items-center">
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input-base w-auto" />
            <span className="text-slate-500 text-sm">to</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input-base w-auto" />
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="glass rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Total Refunds</p>
          <p className="font-display font-bold text-2xl text-white">{refunds.length}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">Total Amount Refunded</p>
          <p className="font-display font-bold text-2xl text-red-400 font-mono">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <table className="table-base">
            <thead>
              <tr><th>Refund #</th><th>Invoice</th><th>Date</th><th>Cashier</th><th>Method</th><th>Reason</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {refunds.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-600">No refunds in this period</td></tr>
              ) : refunds.map((r, i) => (
                <tr key={i}>
                  <td><span className="font-mono text-amber-400 text-xs">{r.refund_number}</span></td>
                  <td><span className="font-mono text-blue-400 text-xs">{r.invoice_number}</span></td>
                  <td><span className="text-xs">{formatDateTime(r.refunded_at)}</span></td>
                  <td><span className="text-slate-400 text-xs">{r.cashier_name}</span></td>
                  <td><span className="text-slate-400 text-xs capitalize">{r.refund_method}</span></td>
                  <td><span className="text-slate-500 text-xs">{r.reason || '-'}</span></td>
                  <td><span className="font-mono text-red-400 font-medium">{formatCurrency(r.total_refunded)}</span></td>
                  <td><span className={`badge ${r.status==='completed'?'badge-green':'badge-yellow'}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
