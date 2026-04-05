import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsApi } from '../api';
import PageHeader from '../components/shared/PageHeader';
import Spinner from '../components/shared/Spinner';

export default function Settings() {
  const [form, setForm]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    settingsApi.get()
      .then(r => setForm(r.data.data.settings || {}))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try { await settingsApi.update(form); toast.success('Settings saved'); }
    catch { toast.error('Save failed'); }
    setSaving(false);
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="animate-fadeIn max-w-2xl">
      <PageHeader title="Store Settings" />
      <div className="glass rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs text-slate-400 mb-1.5">Store Name</label>
            <input value={form.store_name || ''} onChange={e => f('store_name', e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Phone</label>
            <input value={form.phone || ''} onChange={e => f('phone', e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Email</label>
            <input value={form.email || ''} onChange={e => f('email', e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Currency Symbol</label>
            <input value={form.currency_symbol || ''} onChange={e => f('currency_symbol', e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Tax Rate (%)</label>
            <input type="number" step="0.01" value={form.tax_rate || ''} onChange={e => f('tax_rate', e.target.value)} className="input-base font-mono" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Tax Label</label>
            <input value={form.tax_label || ''} onChange={e => f('tax_label', e.target.value)} className="input-base" placeholder="VAT" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-400 mb-1.5">Address</label>
            <textarea value={form.address || ''} onChange={e => f('address', e.target.value)} className="input-base" rows={2} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-400 mb-1.5">Receipt Footer</label>
            <textarea value={form.receipt_footer || ''} onChange={e => f('receipt_footer', e.target.value)} className="input-base" rows={2} placeholder="Thank you for shopping with us!" />
          </div>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save size={15} /> {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
