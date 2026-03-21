import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoryApi } from '../api';
import PageHeader from '../components/shared/PageHeader';
import Modal from '../components/shared/Modal';
import Spinner from '../components/shared/Spinner';

export default function Categories() {
  const [cats, setCats]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState({ name: '', description: '', color_hex: '#6366f1', icon: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try { const r = await categoryApi.getAll(); setCats(r.data.data.categories); }
    catch { toast.error('Failed to load'); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openNew()  { setEditing(null); setForm({ name:'', description:'', color_hex:'#6366f1', icon:'' }); setModal(true); }
  function openEdit(c){ setEditing(c); setForm({ name: c.name, description: c.description||'', color_hex: c.color_hex, icon: c.icon||'' }); setModal(true); }

  async function save() {
    if (!form.name) return toast.error('Name required');
    setSaving(true);
    try {
      editing ? await categoryApi.update(editing.id, form) : await categoryApi.create(form);
      toast.success(editing ? 'Updated' : 'Created');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  }

  async function remove(c) {
    if (!confirm(`Delete "${c.name}"?`)) return;
    try { await categoryApi.remove(c.id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  }

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Categories" subtitle={`${cats.length} categories`}
        action={<button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={15} /> Add Category</button>} />

      {loading ? <div className="flex justify-center py-16"><Spinner /></div> : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {cats.map(c => (
            <div key={c.id} className="glass rounded-xl p-4 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: c.color_hex + '33' }}>
                  {c.icon || <Tag size={16} style={{ color: c.color_hex }} />}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(c)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"><Edit2 size={12} /></button>
                  <button onClick={() => remove(c)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={12} /></button>
                </div>
              </div>
              <p className="text-white font-medium text-sm">{c.name}</p>
              {c.description && <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{c.description}</p>}
              {c.children?.length > 0 && <p className="text-slate-600 text-xs mt-1">{c.children.length} sub-categories</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Name *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-base" placeholder="Category name" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Icon (emoji)</label>
            <input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="input-base" placeholder="e.g. 📱" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={form.color_hex} onChange={e => setForm({...form, color_hex: e.target.value})}
                className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent" />
              <span className="text-slate-400 font-mono text-sm">{form.color_hex}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-base" rows={2} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </Modal>
    </div>
  );
}
