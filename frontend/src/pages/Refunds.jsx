import { useState, useEffect } from 'react';
import { Plus, Eye, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { refundApi, salesApi } from '../api';
import { formatCurrency, formatDateTime } from '../utils/format';
import PageHeader from '../components/shared/PageHeader';
import Modal from '../components/shared/Modal';
import Spinner from '../components/shared/Spinner';

export default function Refunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [invoiceNum, setInvoiceNum] = useState('');
  const [saleData, setSaleData]     = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [refundMethod, setRefundMethod]   = useState('cash');
  const [reason, setReason]               = useState('');
  const [processing, setProcessing]       = useState(false);

  async function load() {
    setLoading(true);
    try { const r = await refundApi.getAll(); setRefunds(r.data.data.refunds); }
    catch { toast.error('Failed'); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function lookupSale() {
    if (!invoiceNum) return;
    try {
      const r = await salesApi.getAll({ limit: 1 });
      // Search by invoice_number manually
      const all = await salesApi.getAll({ limit: 500 });
      const sale = all.data.data.sales.find(s => s.invoice_number === invoiceNum);
      if (!sale) return toast.error('Invoice not found');
      const detail = await salesApi.getOne(sale.id);
      setSaleData(detail.data.data.sale);
      setSelectedItems(detail.data.data.sale.items?.map(i => ({ ...i, selected: false, refund_qty: i.quantity })) || []);
    } catch { toast.error('Invoice not found'); }
  }

  async function processRefund() {
    const items = selectedItems.filter(i => i.selected);
    if (!items.length) return toast.error('Select at least one item');
    setProcessing(true);
    try {
      await refundApi.create({
        sale_id: saleData.id,
        items: items.map(i => ({ sale_item_id: i.id, product_id: i.product_id, quantity: i.refund_qty, unit_price: i.unit_price, restock: true })),
        refund_method: refundMethod, reason,
      });
      toast.success('Refund processed');
      setModal(false); setSaleData(null); setInvoiceNum(''); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setProcessing(false);
  }

  const totalRefund = selectedItems.filter(i => i.selected).reduce((s, i) => s + i.unit_price * i.refund_qty, 0);

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Refunds & Returns" subtitle={`${refunds.length} refunds`}
        action={<button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus size={15} /> New Refund</button>} />

      <div className="glass rounded-xl overflow-hidden">
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <table className="table-base">
            <thead><tr><th>Refund #</th><th>Invoice</th><th>Date</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {refunds.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-600"><RefreshCcw size={32} className="mx-auto mb-2 opacity-30" /><p>No refunds</p></td></tr>
              ) : refunds.map(r => (
                <tr key={r.id}>
                  <td><span className="font-mono text-amber-400 text-xs">{r.refund_number}</span></td>
                  <td><span className="font-mono text-blue-400 text-xs">{r.sale?.invoice_number}</span></td>
                  <td><span className="text-xs">{formatDateTime(r.refunded_at)}</span></td>
                  <td><span className="text-slate-400 text-xs capitalize">{r.refund_method}</span></td>
                  <td><span className="font-mono text-red-400 font-medium">{formatCurrency(r.total_refunded)}</span></td>
                  <td><span className={`badge ${r.status==='completed'?'badge-green':'badge-yellow'}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modal} onClose={() => { setModal(false); setSaleData(null); setInvoiceNum(''); }} title="Process Refund" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Invoice Number</label>
            <div className="flex gap-2">
              <input value={invoiceNum} onChange={e => setInvoiceNum(e.target.value)} placeholder="e.g. INV-2026-000001" className="input-base flex-1" />
              <button onClick={lookupSale} className="btn-secondary px-4">Find</button>
            </div>
          </div>

          {saleData && (
            <>
              <div className="bg-slate-800/40 rounded-lg p-3 text-xs text-slate-400">
                <p>Sale: <span className="text-white">{saleData.invoice_number}</span> · Total: <span className="text-blue-400 font-mono">{formatCurrency(saleData.total_amount)}</span></p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-widest">Select Items to Return</p>
                <div className="space-y-2">
                  {selectedItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-800/40 rounded-lg p-2.5">
                      <input type="checkbox" checked={item.selected}
                        onChange={e => setSelectedItems(prev => prev.map((i,ii) => ii===idx ? {...i, selected: e.target.checked} : i))}
                        className="rounded" />
                      <span className="text-white text-xs flex-1">{item.product_name}</span>
                      <input type="number" value={item.refund_qty} min={0.001} max={item.quantity} step="0.001"
                        onChange={e => setSelectedItems(prev => prev.map((i,ii) => ii===idx ? {...i, refund_qty: parseFloat(e.target.value)} : i))}
                        className="input-base w-20 py-1 text-xs font-mono" />
                      <span className="text-slate-500 text-xs">/ {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Refund Method</label>
                  <select value={refundMethod} onChange={e => setRefundMethod(e.target.value)} className="input-base">
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="store_credit">Store Credit</option>
                    <option value="exchange">Exchange</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Refund Amount</label>
                  <div className="input-base font-mono text-red-400">{formatCurrency(totalRefund)}</div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Reason</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} className="input-base" rows={2} placeholder="Return reason…" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setModal(false); setSaleData(null); }} className="btn-secondary flex-1">Cancel</button>
                <button onClick={processRefund} disabled={processing} className="btn-danger flex-1">{processing ? 'Processing…' : 'Process Refund'}</button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
