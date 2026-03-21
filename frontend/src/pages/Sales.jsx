import { useState, useEffect } from 'react';
import { Eye, Ban, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { salesApi } from '../api';
import { formatCurrency, formatDateTime } from '../utils/format';
import PageHeader from '../components/shared/PageHeader';
import Modal from '../components/shared/Modal';
import Spinner from '../components/shared/Spinner';

export default function Sales() {
  const [sales, setSales]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail]   = useState(null);
  const [viewModal, setView]  = useState(false);

  async function load() {
    setLoading(true);
    try { const r = await salesApi.getAll({ limit: 100 }); setSales(r.data.data.sales); }
    catch { toast.error('Failed to load'); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function viewSale(id) {
    try { const r = await salesApi.getOne(id); setDetail(r.data.data.sale); setView(true); }
    catch { toast.error('Failed'); }
  }

  async function voidSale(id, num) {
    if (!confirm(`Void invoice ${num}?`)) return;
    try { await salesApi.void(id); toast.success('Voided'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  }

  const statusBadge = s => ({
    completed: 'badge-green', voided: 'badge-red', refunded: 'badge-yellow', partial_refund: 'badge-yellow'
  })[s] || 'badge-slate';

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Sales History" subtitle={`${sales.length} transactions`} />

      <div className="glass rounded-xl overflow-hidden">
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <table className="table-base">
            <thead><tr><th>Invoice</th><th>Date</th><th>Cashier</th><th>Customer</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {sales.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-600"><FileText size={32} className="mx-auto mb-2 opacity-30" /><p>No sales yet</p></td></tr>
              ) : sales.map(s => (
                <tr key={s.id}>
                  <td><span className="font-mono text-blue-400 text-xs">{s.invoice_number}</span></td>
                  <td><span className="text-xs">{formatDateTime(s.sale_date)}</span></td>
                  <td><span className="text-slate-400 text-xs">{s.cashier?.full_name}</span></td>
                  <td><span className="text-slate-400 text-xs">{s.customer?.name || 'Walk-in'}</span></td>
                  <td><span className="font-mono text-white font-medium">{formatCurrency(s.total_amount)}</span></td>
                  <td><span className={`badge ${statusBadge(s.status)}`}>{s.status}</span></td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => viewSale(s.id)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"><Eye size={13} /></button>
                      {s.status === 'completed' && <button onClick={() => voidSale(s.id, s.invoice_number)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Ban size={13} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={viewModal} onClose={() => setView(false)} title={`Invoice ${detail?.invoice_number}`} size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-slate-500 text-xs">Date</p><p className="text-white">{formatDateTime(detail.sale_date)}</p></div>
              <div><p className="text-slate-500 text-xs">Cashier</p><p className="text-white">{detail.cashier?.full_name}</p></div>
              <div><p className="text-slate-500 text-xs">Customer</p><p className="text-white">{detail.customer?.name || 'Walk-in'}</p></div>
              <div><p className="text-slate-500 text-xs">Status</p><span className={`badge ${({completed:'badge-green',voided:'badge-red'})[detail.status]||'badge-yellow'}`}>{detail.status}</span></div>
            </div>
            <table className="table-base text-xs">
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
              <tbody>
                {detail.items?.map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.product_name}</td>
                    <td>{i.quantity} {i.unit}</td>
                    <td className="font-mono">{formatCurrency(i.unit_price)}</td>
                    <td className="font-mono">{formatCurrency(i.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-slate-800/40 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between text-slate-400"><span>Subtotal</span><span className="font-mono">{formatCurrency(detail.subtotal)}</span></div>
              {parseFloat(detail.discount_amount) > 0 && <div className="flex justify-between text-amber-400"><span>Discount</span><span className="font-mono">-{formatCurrency(detail.discount_amount)}</span></div>}
              {parseFloat(detail.tax_amount) > 0 && <div className="flex justify-between text-slate-400"><span>Tax</span><span className="font-mono">{formatCurrency(detail.tax_amount)}</span></div>}
              <div className="flex justify-between text-white font-semibold pt-1 border-t border-slate-700"><span>Total</span><span className="font-mono text-blue-400">{formatCurrency(detail.total_amount)}</span></div>
            </div>
            {detail.payments?.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-slate-400 bg-slate-800/30 rounded-lg px-3 py-2">
                <span>{p.method?.name}</span><span className="font-mono">{formatCurrency(p.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
