import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items          : [],
  customer       : null,
  discountType   : null,   // 'percentage' | 'fixed'
  discountValue  : 0,
  taxRate        : 0,
  note           : '',

  addItem: (product) => {
    const items = get().items;
    const existing = items.find(i => i.product_id === product.id);
    if (existing) {
      set({ items: items.map(i =>
        i.product_id === product.id
          ? { ...i, quantity: i.quantity + 1, line_total: (i.quantity + 1) * i.unit_price }
          : i
      )});
    } else {
      set({ items: [...items, {
        product_id  : product.id,
        product_name: product.name,
        barcode     : product.barcode,
        unit        : product.unit,
        unit_price  : parseFloat(product.selling_price),
        cost_price  : parseFloat(product.cost_price),
        tax_rate    : parseFloat(product.tax_rate || 0),
        quantity    : 1,
        discount_amount: 0,
        line_total  : parseFloat(product.selling_price),
      }]});
    }
  },

  updateQty: (product_id, quantity) => {
    if (quantity <= 0) return get().removeItem(product_id);
    set({ items: get().items.map(i =>
      i.product_id === product_id
        ? { ...i, quantity, line_total: quantity * i.unit_price }
        : i
    )});
  },

  removeItem: (product_id) => set({ items: get().items.filter(i => i.product_id !== product_id) }),

  clearCart: () => set({ items: [], customer: null, discountType: null, discountValue: 0, taxRate: 0, note: '' }),

  setCustomer    : (c)    => set({ customer: c }),
  setDiscount    : (type, value) => set({ discountType: type, discountValue: value }),
  setTaxRate     : (r)    => set({ taxRate: r }),
  setNote        : (n)    => set({ note: n }),

  // Computed
  subtotal: () => get().items.reduce((s, i) => s + i.line_total, 0),
  discountAmount: () => {
    const s = get().subtotal();
    if (get().discountType === 'percentage') return s * get().discountValue / 100;
    if (get().discountType === 'fixed') return Math.min(get().discountValue, s);
    return 0;
  },
  taxAmount: () => {
    const taxable = get().subtotal() - get().discountAmount();
    return taxable * get().taxRate / 100;
  },
  total: () => get().subtotal() - get().discountAmount() + get().taxAmount(),
}));

export default useCartStore;
