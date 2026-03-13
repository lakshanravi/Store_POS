import { useState, useEffect } from 'react';
import { CreditCard, Banknote, Smartphone, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import { salesApi } from '../../api';
import { formatCurrency } from '../../utils/format';
import api from '../../api/axios';

const METHOD_ICONS = { cash: Banknote, card: CreditCard, digital: Smartphone };

export default function PaymentModal({ open, onClose }) {
  const cart = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [methods, setMethods]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [tendered, setTendered] = useState('');
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(null);

  useEffect(() => {
    if (open) {
      api.get('/settings/payment-methods').catch(() => {});
      // Use hardcoded defaults if endpoint not ready
      setMethods([
        { id: 1, name: 'Cash',        type: 'cash' },
        { id: 2, name: 'Credit Card', type: 'card' },
        { id: 3, name: 'Debit Card',  type: 'card' },
        { id: 4, name: 'QR / Mobile', type: 'digital' },
      ]);
      setSelected(1);
      setTendered('');
      setDone(null);
    }
  }, [open]);

  const total    = cart.total();
  const change   = Math.max(0, parseFloat(tendered || 0) - total);

  async function handlePay() {
    if (!selected) return toast.error('Select payment method');
    setLoading(true);
    try {
      const payload = {
        items         : cart.items,
        payments      : [{ payment_method_id: selected, amount: total }],
        customer_id   : cart.customer?.id || null,
        discount_type : cart.discountType,
        discount_value: cart.discountValue,
        tax_rate      : cart.taxRate,
        amount_tendered: parseFloat(tendered || total),
        notes         : cart.note,
      };
      const { data } = await salesApi.create(payload);
      setDone(data.data);
      cart.clearCart();
      toast.success(`Sale completed! ${data.data.invoice_number}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sale failed');
    }
    setLoading(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={!done ? onClose : undefined} />
      <div className="relative w-full max-w-md glass rounded-2xl overflow-hidden animate-scaleIn">

        {done ? (
          // Success screen
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h2 className="font-display font-bold text-xl text-white mb-1">Sale Complete!</h2>
            <p className="text-slate-400 text-sm mb-1">{done.invoice_number}</p>
            {change > 0 && <p className="text-emerald-400 font-bold text-lg mt-2">Change: {formatCurrency(change)}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="btn-secondary flex-1">New Sale</button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-slate-800">
              <h3 className="font-display font-semibold text-white">Payment</h3>
              <p className="text-blue-400 font-bold font-mono text-2xl mt-1">{formatCurrency(total)}</p>
            </div>
            <div className="p-6 space-y-5">
              {/* Method selection */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  {methods.map(m => {
                    const Icon = METHOD_ICONS[m.type] || CreditCard;
                    return (
                      <button key={m.id} onClick={() => setSelected(m.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-sm ${
                          selected === m.id
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                            : 'bg-slate-800/60 border-slate-700/40 text-slate-400 hover:text-white hover:border-slate-600'
                        }`}>
                        <Icon size={16} /> {m.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash tendered */}
              {methods.find(m => m.id === selected)?.type === 'cash' && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Amount Tendered</p>
                  <input type="number" value={tendered} onChange={e => setTendered(e.target.value)}
                    placeholder={formatCurrency(total)} className="input-base font-mono" />
                  {change > 0 && (
                    <p className="mt-2 text-emerald-400 text-sm font-medium">Change: {formatCurrency(change)}</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handlePay} disabled={loading} className="btn-primary flex-1 font-semibold">
                  {loading ? 'Processing…' : 'Complete Sale'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
