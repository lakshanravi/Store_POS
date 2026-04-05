import { create } from 'zustand';
import { authApi } from '../api';

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    // permissions comes as a JSON string from the backend — parse it
    if (typeof payload.permissions === 'string') {
      payload.permissions = JSON.parse(payload.permissions);
    }
    return payload;
  } catch { return null; }
}

const useAuthStore = create((set, get) => ({
  user         : null,
  token        : localStorage.getItem('pos_token') || null,
  isInitialized: false,
  isLoading    : false,

  init: () => {
    const token = localStorage.getItem('pos_token');
    if (!token) { set({ isInitialized: true }); return; }
    const payload = parseJwt(token);
    if (!payload || payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('pos_token');
      localStorage.removeItem('pos_refresh');
      set({ user: null, token: null, isInitialized: true });
      return;
    }
    set({
      token,
      user: {
        id       : payload.id,
        username : payload.username,
        full_name: payload.full_name || payload.username,
        email    : payload.email || '',
        role     : {
          name       : payload.role,
          permissions: payload.permissions,
        },
      },
      isInitialized: true,
    });
  },

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.login(username, password);
      const { user, accessToken, refreshToken } = data.data;
      localStorage.setItem('pos_token',   accessToken);
      localStorage.setItem('pos_refresh', refreshToken);
      const payload = parseJwt(accessToken);
      set({
        user: { ...user, role: { name: payload?.role, permissions: payload?.permissions || {} } },
        token: accessToken,
        isLoading: false,
      });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  },

  loginPin: async (username, pin) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.loginPin(username, pin);
      const { user, accessToken, refreshToken } = data.data;
      localStorage.setItem('pos_token',   accessToken);
      localStorage.setItem('pos_refresh', refreshToken);
      const payload = parseJwt(accessToken);
      set({
        user: { ...user, role: { name: payload?.role, permissions: payload?.permissions || {} } },
        token: accessToken,
        isLoading: false,
      });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message || 'Invalid PIN' };
    }
  },

  fetchMe: async () => { get().init(); },

  logout: async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_refresh');
    set({ user: null, token: null, isInitialized: true });
  },

  can    : (perm) => !!get().user?.role?.permissions?.[perm],
  isRole : (role) => get().user?.role?.name === role,
}));

export default useAuthStore;