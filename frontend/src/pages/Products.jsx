import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { productApi, categoryApi, supplierApi } from '../api';
import { formatCurrency } from '../utils/format';
import PageHeader from '../components/shared/PageHeader';
import Modal from '../components/shared/Modal';
import Spinner from '../components/shared/Spinner';

const EMPTY = { name:'', barcode:'', sku:'', category_id:'', supplier_id:'', cost_price:'', selling_price:'', unit:'pcs', stock_quantity:'', stock_alert_qty:'5', description:'' };

export default function Products() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [modal, setModal]           = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [p, c, s] = await Promise.all([
        productApi.getAll({ search, limit: 50 }),
        categoryApi.getAll(),
        supplierApi.getAll(),
      ]);
      setProducts(p.data.data.products);
      setCategories(c.data.data.categories);
      setSuppliers(s.data.data.suppliers);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  }

  useEffect(() => { load(); }, [search]);

  function openNew() { setEditing(null); setForm(EMPTY); setModal(true); }
  function openEdit(p) {
    setEditing(p);
    setForm({ name: p.name, barcode: p.barcode||'', sku: p.sku||'', category_id: p.category_id||'',
      supplier_id: p.supplier_id||'', cost_price: p.cost_price, selling_price: p.selling_price,
      unit: p.unit, stock_quantity: p.stock_quantity, stock_alert_qty: p.stock_alert_qty, description: p.description||'' });
    setModal(true);
  }

  async function save() {
    if (!form.name || !form.selling_price) return toast.error('Name and selling price required');
    setSaving(true);
    try {
      editing ? await productApi.update(editing.id, form) : await productApi.create(form);
      toast.success(editing ? 'Product updated' : 'Product created');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  }

  async function remove(p) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try { await productApi.remove(p.id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  }

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Products" subtitle={`${products.length} products`}
        action={<button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={15} /> Add Product</button>} />

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="input-base pl-9" />
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-slate-600">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p>No products found</p>
          </div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>Product</th><th>Barcode</th><th>Category</th>
                <th>Cost</th><th>Price</th><th>Stock</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div>
                      <p className="text-white font-medium">{p.name}</p>
                      {p.sku && <p className="text-slate-600 text-xs">{p.sku}</p>}
                    </div>
                  </td>
                  <td><span className="font-mono text-xs text-slate-500">{p.barcode || '-'}</span></td>
                  <td>
                    {p.category ? (
                      <span className="badge badge-blue">{p.category.name}</span>
                    ) : <span className="text-slate-600">-</span>}
                  </td>
                  <td><span className="font-mono">{formatCurrency(p.cost_price)}</span></td>
                  <td><span className="font-mono text-blue-400 font-medium">{formatCurrency(p.selling_price)}</span></td>
                  <td>
                    <span className={`font-mono text-xs font-medium px-2 py-0.5 rounded ${
                      p.stock_quantity <= p.stock_alert_qty ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                    }`}>{p.stock_quantity} {p.unit}</span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"><Edit2 size={13} /></button>
                      <button onClick={() => remove(p)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'Add Product'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs text-slate-400 mb-1.5">Product Name *</label>
            <input value={form.name} onChange={e => f('name', e.target.value)} className="input-base" placeholder="Product name" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Barcode</label>
            <input value={form.barcode} onChange={e => f('barcode', e.target.value)} className="input-base font-mono" placeholder="EAN / UPC" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">SKU</label>
            <input value={form.sku} onChange={e => f('sku', e.target.value)} className="input-base font-mono" placeholder="Internal code" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Cost Price *</label>
            <input type="number" value={form.cost_price} onChange={e => f('cost_price', e.target.value)} className="input-base font-mono" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Selling Price *</label>
            <input type="number" value={form.selling_price} onChange={e => f('selling_price', e.target.value)} className="input-base font-mono" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Category</label>
            <select value={form.category_id} onChange={e => f('category_id', e.target.value)} className="input-base">
              <option value="">-- Select --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Supplier</label>
            <select value={form.supplier_id} onChange={e => f('supplier_id', e.target.value)} className="input-base">
              <option value="">-- Select --</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Unit</label>
            <input value={form.unit} onChange={e => f('unit', e.target.value)} className="input-base" placeholder="pcs / kg / litre" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Initial Stock</label>
            <input type="number" value={form.stock_quantity} onChange={e => f('stock_quantity', e.target.value)} className="input-base font-mono" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Low Stock Alert</label>
            <input type="number" value={form.stock_alert_qty} onChange={e => f('stock_alert_qty', e.target.value)} className="input-base font-mono" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => f('description', e.target.value)} className="input-base" rows={2} placeholder="Optional description" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save Product'}</button>
        </div>
      </Modal>
    </div>
  );
}
