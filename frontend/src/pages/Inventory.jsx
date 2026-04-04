import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { inventoryApi } from '../api';
import { formatDateTime } from '../utils/format';
import PageHeader from '../components/shared/PageHeader';
import Modal from '../components/shared/Modal';
import Spinner from '../components/shared/Spinner';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('stock');
  const [adjModal, setAdjModal] = useState(false);
  const [adjForm, setAdjForm] = useState({ product_id: '', quantity_change: '', notes: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [p, m] = await Promise.all([inventoryApi.getStock(), inventoryApi.getMovements({ limit: 100 })]);
      setProducts(p.data.data.products);
      setMovements(m.data.data.movements);
    } catch { toast.error('Failed'); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function adjust() {
    if (!adjForm.product_id || !adjForm.quantity_change) return toast.error('Fill all fields');
    setSaving(true);
    try {
      await inventoryApi.adjust(adjForm);
      toast.success('Stock adjusted');
      setAdjModal(false);
      setAdjForm({ product_id: '', quantity_change: '', notes: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  }

  const lowStock = products.filter(p => p.is_stock_managed && p.stock_quantity <= p.stock_alert_qty);

  const typeIcon = (t) => t === 'sale' ? <TrendingDown size={13} className="text-red-400" /> : <TrendingUp size={13} className="text-emerald-400" />;

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Inventory" subtitle={`${lowStock.length} low stock alerts`}
        action={<button onClick={() => setAdjModal(true)} className="btn-primary flex items-center gap-2"><SlidersHorizontal size={15} /> Adjust Stock</button>} />

      {lowStock.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 font-medium text-sm">Low Stock Warning</p>
            <p className="text-slate-400 text-xs mt-0.5">{lowStock.map(p => p.name).join(' · ')}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-800/40 rounded-lg p-1 w-fit">
        {['stock','movements'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${tab===t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t === 'movements' ? 'Movement Log' : 'Stock Levels'}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-12"><Spinner /></div> : tab === 'stock' ? (
        <div className="glass rounded-xl overflow-hidden">
          <table className="table-base">
            <thead><tr><th>Product</th><th>SKU</th><th>Unit</th><th>Stock</th><th>Alert At</th><th>Status</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td><p className="text-white font-medium text-sm">{p.name}</p></td>
                  <td><span className="font-mono text-xs text-slate-500">{p.sku || '-'}</span></td>
                  <td><span className="text-slate-400 text-xs">{p.unit}</span></td>
                  <td><span className={`font-mono font-bold text-sm ${p.stock_quantity <= p.stock_alert_qty ? 'text-red-400' : 'text-emerald-400'}`}>{p.stock_quantity}</span></td>
                  <td><span className="font-mono text-xs text-slate-500">{p.stock_alert_qty}</span></td>
                  <td>
                    {!p.is_stock_managed ? <span className="badge badge-slate">Unmanaged</span>
                      : p.stock_quantity <= p.stock_alert_qty ? <span className="badge badge-red">Low Stock</span>
                      : <span className="badge badge-green">OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="table-base">
            <thead><tr><th>Type</th><th>Product</th><th>Change</th><th>Before</th><th>After</th><th>By</th><th>Date</th></tr></thead>
            <tbody>
              {movements.map(m => (
                <tr key={m.id}>
                  <td><div className="flex items-center gap-1.5">{typeIcon(m.movement_type)}<span className="text-xs capitalize">{m.movement_type}</span></div></td>
                  <td><span className="text-white text-xs">{m.product?.name}</span></td>
                  <td><span className={`font-mono text-sm font-bold ${m.quantity_change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{m.quantity_change > 0 ? '+' : ''}{m.quantity_change}</span></td>
                  <td><span className="font-mono text-xs text-slate-500">{m.quantity_before}</span></td>
                  <td><span className="font-mono text-xs text-slate-400">{m.quantity_after}</span></td>
                  <td><span className="text-xs text-slate-500">{m.performer?.full_name}</span></td>
                  <td><span className="text-xs">{formatDateTime(m.created_at)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={adjModal} onClose={() => setAdjModal(false)} title="Adjust Stock">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Product</label>
            <select value={adjForm.product_id} onChange={e => setAdjForm(p => ({...p, product_id: e.target.value}))} className="input-base">
              <option value="">-- Select product --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (stock: {p.stock_quantity})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Quantity Change (+ to add, - to remove)</label>
            <input type="number" value={adjForm.quantity_change} onChange={e => setAdjForm(p => ({...p, quantity_change: e.target.value}))} className="input-base font-mono" placeholder="e.g. +50 or -10" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Notes</label>
            <textarea value={adjForm.notes} onChange={e => setAdjForm(p => ({...p, notes: e.target.value}))} className="input-base" rows={2} placeholder="Reason for adjustment…" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setAdjModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={adjust} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Apply Adjustment'}</button>
        </div>
      </Modal>
    </div>
  );
}
