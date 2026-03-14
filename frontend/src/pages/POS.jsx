import { useState, useEffect, useRef } from 'react';
import { Search, X, Plus, Minus, ShoppingBag, User, Tag, Percent, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { productApi, salesApi, customerApi } from '../api';
import { formatCurrency } from '../utils/format';
import PaymentModal from '../components/pos/PaymentModal';

export default function POS() {
  const [search, setSearch]       = useState('');
  const [products, setProducts]   = useState([]);
  const [searching, setSearching] = useState(false);
  const [payOpen, setPayOpen]     = useState(false);
  const [discModal, setDiscModal] = useState(false);
  const [discType, setDiscType]   = useState('percentage');
  const [discVal, setDiscVal]     = useState('');
  const [custSearch, setCustSearch]   = useState('');
  const [custResults, setCustResults] = useState([]);
  const searchRef = useRef();
  const cart = useCartStore();
  const { user } = useAuthStore();

  // Focus search on mount
  useEffect(() => { searchRef.current?.focus(); }, []);

  // Barcode / product search
  useEffect(() => {
    if (!search.trim()) { setProducts([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        // Try barcode first
        if (/^\d{4,}$/.test(search.trim())) {
          try {
            const r = await productApi.getByBarcode(search.trim());
            cart.addItem(r.data.data.product);
            setSearch(''); setProducts([]);
            toast.success(`Added: ${r.data.data.product.name}`);
            setSearching(false); return;
          } catch {}
        }
        const r = await productApi.getAll({ search, limit: 12 });
        setProducts(r.data.data.products);
      } catch {}
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Customer search
  useEffect(() => {
    if (!custSearch.trim()) { setCustResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const r = await customerApi.getAll({ search: custSearch });
        setCustResults(r.data.data.customers);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [custSearch]);

  function applyDiscount() {
    if (!discVal) return;
    cart.setDiscount(discType, parseFloat(discVal));
    setDiscModal(false);
    toast.success('Discount applied');
  }

  return (
    <div className="flex h-[calc(100vh-65px)] gap-4 -m-6 p-4 bg-[#0a0f1e]">

      {/* LEFT — product search */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search bar */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input ref={searchRef} type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search product name or scan barcode…"
            className="input-base pl-10 pr-4 py-3 text-base" />
          {search && (
            <button onClick={() => { setSearch(''); setProducts([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map(p => (
                <button key={p.id} onClick={() => { cart.addItem(p); setSearch(''); setProducts([]); }}
                  className="glass rounded-xl p-3 text-left hover:border-blue-500/50 hover:bg-blue-600/5 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center mb-2">
                    <ShoppingBag size={15} className="text-blue-400" />
                  </div>
                  <p className="text-white text-xs font-medium leading-tight line-clamp-2 mb-1">{p.name}</p>
                  <p className="text-blue-400 text-sm font-bold font-mono">{formatCurrency(p.selling_price)}</p>
                  <p className="text-slate-600 text-[10px] mt-0.5">Stock: {p.stock_quantity} {p.unit}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-700">
              <ShoppingBag size={48} className="mb-3 opacity-30" />
              <p className="text-sm">Search a product or scan a barcode</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — cart */}
      <div className="w-80 xl:w-96 flex flex-col glass rounded-2xl overflow-hidden">

        {/* Cart header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-display font-semibold text-white flex items-center gap-2">
            <Receipt size={16} className="text-blue-400" />
            Current Sale
          </h2>
          {cart.items.length > 0 && (
            <button onClick={cart.clearCart} className="text-xs text-slate-500 hover:text-red-400 transition-colors">Clear</button>
          )}
        </div>

        {/* Customer */}
        <div className="px-4 py-2 border-b border-slate-800/60">
          {cart.customer ? (
            <div className="flex items-center justify-between bg-blue-600/10 border border-blue-500/20 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <User size={13} className="text-blue-400" />
                <span className="text-white text-xs font-medium">{cart.customer.name}</span>
              </div>
              <button onClick={() => cart.setCustomer(null)} className="text-slate-500 hover:text-red-400"><X size={13} /></button>
            </div>
          ) : (
            <div className="relative">
              <input type="text" value={custSearch} onChange={e => setCustSearch(e.target.value)}
                placeholder="Search customer (optional)…"
                className="input-base py-2 text-xs" />
              {custResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 bg-slate-900 border border-slate-700 rounded-lg mt-1 shadow-xl max-h-40 overflow-y-auto">
                  {custResults.map(c => (
                    <button key={c.id} onClick={() => { cart.setCustomer(c); setCustSearch(''); setCustResults([]); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 text-sm text-slate-300 hover:text-white transition-colors">
                      {c.name} {c.phone && <span className="text-slate-500 text-xs">· {c.phone}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {cart.items.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">Cart is empty</p>
          ) : (
            <ul className="space-y-1">
              {cart.items.map(item => (
                <li key={item.product_id} className="bg-slate-800/40 rounded-lg p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-xs font-medium leading-tight flex-1">{item.product_name}</p>
                    <button onClick={() => cart.removeItem(item.product_id)} className="text-slate-600 hover:text-red-400 flex-shrink-0">
                      <X size={12} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => cart.updateQty(item.product_id, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors">
                        <Minus size={10} />
                      </button>
                      <span className="text-white text-xs font-mono w-6 text-center">{item.quantity}</span>
                      <button onClick={() => cart.updateQty(item.product_id, item.quantity + 1)}
                        className="w-6 h-6 rounded-md bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors">
                        <Plus size={10} />
                      </button>
                    </div>
                    <span className="text-blue-400 text-xs font-mono font-bold">{formatCurrency(item.line_total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-slate-800 px-4 py-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="font-mono">{formatCurrency(cart.subtotal())}</span>
          </div>
          {cart.discountAmount() > 0 && (
            <div className="flex justify-between text-amber-400">
              <span>Discount {cart.discountType === 'percentage' ? `(${cart.discountValue}%)` : ''}</span>
              <span className="font-mono">-{formatCurrency(cart.discountAmount())}</span>
            </div>
          )}
          {cart.taxAmount() > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Tax ({cart.taxRate}%)</span>
              <span className="font-mono">{formatCurrency(cart.taxAmount())}</span>
            </div>
          )}
          <div className="flex justify-between text-white font-semibold text-sm pt-1 border-t border-slate-800">
            <span>Total</span>
            <span className="font-mono text-blue-400">{formatCurrency(cart.total())}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 pt-2 space-y-2">
          <button onClick={() => setDiscModal(true)}
            className="btn-secondary w-full flex items-center justify-center gap-2 py-2 text-xs">
            <Tag size={13} /> Add Discount
          </button>
          <button onClick={() => setPayOpen(true)} disabled={cart.items.length === 0}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold">
            <Receipt size={15} /> Charge {formatCurrency(cart.total())}
          </button>
        </div>
      </div>

      {/* Discount modal */}
      {discModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDiscModal(false)} />
          <div className="relative w-80 glass rounded-2xl p-6 animate-scaleIn">
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2"><Percent size={16} className="text-blue-400" /> Add Discount</h3>
            <div className="flex gap-2 mb-4">
              {['percentage','fixed'].map(t => (
                <button key={t} onClick={() => setDiscType(t)}
                  className={`flex-1 py-2 rounded-lg text-sm transition-all ${discType===t ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {t === 'percentage' ? '%' : 'Rs. Fixed'}
                </button>
              ))}
            </div>
            <input type="number" value={discVal} onChange={e => setDiscVal(e.target.value)}
              placeholder={discType === 'percentage' ? 'e.g. 10' : 'e.g. 500'}
              className="input-base mb-4" />
            <div className="flex gap-2">
              <button onClick={() => setDiscModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={applyDiscount} className="btn-primary flex-1">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment modal */}
      <PaymentModal open={payOpen} onClose={() => setPayOpen(false)} />
    </div>
  );
}
