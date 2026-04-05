import api from './axios';

// Auth
export const authApi = {
  login        : (u, p)    => api.post('/auth/login',           { username: u, password: p }),
  loginPin     : (u, pin)  => api.post('/auth/login-pin',        { username: u, pin }),
  me           : ()        => api.get('/auth/me'),
  refresh      : (rt)      => api.post('/auth/refresh',          { refreshToken: rt }),
  logout       : ()        => api.post('/auth/logout'),
  changePass   : (cur, nw) => api.post('/auth/change-password',  { currentPassword: cur, newPassword: nw }),
  setPin       : (pin)     => api.post('/auth/set-pin',          { pin }),
};

// Products
export const productApi = {
  getAll      : (params) => api.get('/products', { params }),
  getOne      : (id)     => api.get(`/products/${id}`),
  getByBarcode: (code)   => api.get(`/products/barcode/${code}`),
  create      : (data)   => api.post('/products', data),
  update      : (id, d)  => api.put(`/products/${id}`, d),
  remove      : (id)     => api.delete(`/products/${id}`),
};

// Categories
export const categoryApi = {
  getAll : ()        => api.get('/categories'),
  create : (data)    => api.post('/categories', data),
  update : (id, d)   => api.put(`/categories/${id}`, d),
  remove : (id)      => api.delete(`/categories/${id}`),
};

// Suppliers
export const supplierApi = {
  getAll : ()        => api.get('/suppliers'),
  create : (data)    => api.post('/suppliers', data),
  update : (id, d)   => api.put(`/suppliers/${id}`, d),
  remove : (id)      => api.delete(`/suppliers/${id}`),
};

// Customers
export const customerApi = {
  getAll  : (params) => api.get('/customers', { params }),
  create  : (data)   => api.post('/customers', data),
  update  : (id, d)  => api.put(`/customers/${id}`, d),
  remove  : (id)     => api.delete(`/customers/${id}`),
};

// Sales
export const salesApi = {
  getAll  : (params) => api.get('/sales', { params }),
  getOne  : (id)     => api.get(`/sales/${id}`),
  create  : (data)   => api.post('/sales', data),
  void    : (id)     => api.put(`/sales/${id}/void`),
};

// Refunds
export const refundApi = {
  getAll : (params) => api.get('/refunds', { params }),
  getOne : (id)     => api.get(`/refunds/${id}`),
  create : (data)   => api.post('/refunds', data),
};

// Inventory
export const inventoryApi = {
  getStock    : ()       => api.get('/inventory/stock'),
  getLowStock : ()       => api.get('/inventory/low-stock'),
  getMovements: (params) => api.get('/inventory/movements', { params }),
  adjust      : (data)   => api.post('/inventory/adjust', data),
};

// Reports
export const reportApi = {
  daily      : (date)         => api.get('/reports/daily',       { params: { date } }),
  profitLoss : (from, to)     => api.get('/reports/profit-loss', { params: { from, to } }),
  refundLog  : (from, to)     => api.get('/reports/refunds',     { params: { from, to } }),
};

// Settings
export const settingsApi = {
  get    : ()     => api.get('/settings'),
  update : (data) => api.put('/settings', data),
};

// Payment methods
export const paymentMethodApi = {
  getAll: () => api.get('/settings/payment-methods'),
};
