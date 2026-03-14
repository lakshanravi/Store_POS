import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { supplierApi } from '../api';
import PageHeader from '../components/shared/PageHeader';
import Modal from '../components/shared/Modal';
import Spinner from '../components/shared/Spinner';

const EMPTY = { name:'', contact_name:'', phone:'', email:'', address:'', city:'', payment_terms:'', notes:'' };

export default function Suppliers() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);

  async function load() {
    setLoading(true);
    try { const r = await supplierApi.getAll(); setList(r.data.data.suppliers); }
    catch { toast.error('Failed to load'); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openNew()  { setEditing(null); setForm(EMPTY); setModal(true); }
  function openEdit(s){ setEditing(s); setForm({ name:s.name, contact_name:s.contact_name||'', phone:s.phone||'', email:s.email||'', address:s.address||'', city:s.city||'', payment_terms:s.payment_terms||'', notes:s.notes||'' }); setModal(true); }

  async function save() {
    if (!form.name) return toast.error('Name required');
    setSaving(true);
    try {
      editing ? await supplierApi.update(editing.id, form) : await supplierApi.create(form);
      toast.success(editing ? 'Updated' : 'Created');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  }

  async function remove(s) {
    if (!confirm(`Delete "${s.name}"?`)) return;
    try { await supplierApi.remove(s.id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Suppliers" subtitle={`${list.length} suppliers`}
        action={<button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={15} /> Add Supplier</button>} />

      {loading ? <div className="flex justify-center py-16"><Spinner /></div> : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="table-base">
            <thead><tr><th>Supplier</th><th>Contact</th><th>Phone</th><th>City</th><th>Payment Terms</th><th>Actions</th></tr></thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-600"><Truck size={32} className="mx-auto mb-2 opacity-30" /><p>No suppliers</p></td></tr>
              ) : list.map(s => (
                <tr key={s.id}>
                  <td><p className="text-white font-medium">{s.name}</p></td>
                  <td><span className="text-slate-400">{s.contact_name || '-'}</span></td>
                  <td><span className="font-mono text-xs text-slate-400">{s.phone || '-'}</span></td>
                  <td><span className="text-slate-400">{s.city || '-'}</span></td>
                  <td><span className="text-slate-500 text-xs">{s.payment_terms || '-'}</span></td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"><Edit2 size={13} /></button>
                      <button onClick={() => remove(s)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          {[['name','Supplier Name *','col-span-2'],['contact_name','Contact Person',''],['phone','Phone',''],['email','Email',''],['city','City',''],['payment_terms','Payment Terms',''],['address','Address','col-span-2'],['notes','Notes','col-span-2']].map(([key,label,cls]) => (
            <div key={key} className={cls}>
              <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
              {key === 'notes' || key === 'address'
                ? <textarea value={form[key]} onChange={e => f(key, e.target.value)} className="input-base" rows={2} />
                : <input value={form[key]} onChange={e => f(key, e.target.value)} className="input-base" />}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </Modal>
    </div>
  );
}
