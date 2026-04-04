import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { customerApi } from '../api';
import { formatCurrency } from '../utils/format';
import PageHeader from '../components/shared/PageHeader';
import Modal from '../components/shared/Modal';
import Spinner from '../components/shared/Spinner';

const EMPTY = { name:'', phone:'', email:'', address:'', city:'', notes:'' };

export default function Customers() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);

  async function load() {
    setLoading(true);
    try { const r = await customerApi.getAll({ search }); setList(r.data.data.customers); }
    catch { toast.error('Failed'); }
    setLoading(false);
  }
  useEffect(() => { load(); }, [search]);

  function openNew()  { setEditing(null); setForm(EMPTY); setModal(true); }
  function openEdit(c){ setEditing(c); setForm({ name:c.name, phone:c.phone||'', email:c.email||'', address:c.address||'', city:c.city||'', notes:c.notes||'' }); setModal(true); }

  async function save() {
    if (!form.name) return toast.error('Name required');
    setSaving(true);
    try {
      editing ? await customerApi.update(editing.id, form) : await customerApi.create(form);
      toast.success(editing ? 'Updated' : 'Created'); setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  }

  async function remove(c) {
    if (!confirm(`Delete "${c.name}"?`)) return;
    try { await customerApi.remove(c.id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Customers" subtitle={`${list.length} customers`}
        action={<button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={15} /> Add Customer</button>} />

      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers…" className="input-base pl-9" />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <table className="table-base">
            <thead><tr><th>Name</th><th>Phone</th><th>City</th><th>Total Spent</th><th>Actions</th></tr></thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-600"><Users size={32} className="mx-auto mb-2 opacity-30" /><p>No customers</p></td></tr>
              ) : list.map(c => (
                <tr key={c.id}>
                  <td><p className="text-white font-medium">{c.name}</p>{c.email && <p className="text-slate-500 text-xs">{c.email}</p>}</td>
                  <td><span className="font-mono text-xs">{c.phone || '-'}</span></td>
                  <td><span className="text-slate-400">{c.city || '-'}</span></td>
                  <td><span className="font-mono text-blue-400">{formatCurrency(c.total_spent)}</span></td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"><Edit2 size={13} /></button>
                      <button onClick={() => remove(c)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Customer' : 'Add Customer'}>
        <div className="space-y-3">
          {[['name','Name *'],['phone','Phone'],['email','Email'],['city','City']].map(([k,l]) => (
            <div key={k}>
              <label className="block text-xs text-slate-400 mb-1.5">{l}</label>
              <input value={form[k]} onChange={e => f(k, e.target.value)} className="input-base" />
            </div>
          ))}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => f('notes', e.target.value)} className="input-base" rows={2} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </Modal>
    </div>
  );
}
