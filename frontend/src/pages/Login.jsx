import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginPin, isLoading } = useAuthStore();
  const [mode, setMode] = useState('password');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [pin, setPin] = useState(['', '', '', '']);

  async function handleLogin(e) {
    e.preventDefault();
    const r = await login(form.username, form.password);
    r.success ? (toast.success('Welcome back!'), navigate('/dashboard')) : toast.error(r.message);
  }

  async function handlePin(e) {
    e.preventDefault();
    const p = pin.join('');
    if (p.length < 4) return toast.error('Enter 4-digit PIN');
    const r = await loginPin(form.username, p);
    r.success ? (toast.success('Welcome!'), navigate('/dashboard')) : (toast.error(r.message), setPin(['','','','']));
  }

  function onPinChange(i, v) {
    if (!/^\d?$/.test(v)) return;
    const next = [...pin]; next[i] = v; setPin(next);
    if (v && i < 3) document.getElementById(`pin${i+1}`)?.focus();
  }
  function onPinKey(i, e) {
    if (e.key === 'Backspace' && !pin[i] && i > 0) document.getElementById(`pin${i-1}`)?.focus();
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm animate-scaleIn">
        {/* Card */}
        <div className="glass rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-8 py-8 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Store size={28} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white">RetailPOS</h1>
            <p className="text-blue-200 text-xs mt-1">Point of Sale System</p>
          </div>

          {/* Tab */}
          <div className="flex border-b border-slate-800">
            {['password','pin'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${
                  mode === m ? 'text-blue-400 border-b-2 border-blue-500 -mb-px' : 'text-slate-500 hover:text-slate-300'
                }`}>
                {m === 'password' ? 'Password' : 'PIN Login'}
              </button>
            ))}
          </div>

          <div className="px-7 py-7">
            {/* Username */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Username</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" value={form.username}
                  onChange={e => setForm({...form, username: e.target.value})}
                  placeholder="your username"
                  className="input-base !pl-10" />
              </div>
            </div>

            {mode === 'password' ? (
              <form onSubmit={handleLogin}>
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type={showPass ? 'text' : 'password'} value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                      placeholder="your password"
                      className="input-base !pl-10 pr-9" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center">
                  {isLoading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePin}>
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 text-center">4-Digit PIN</label>
                  <div className="flex gap-3 justify-center">
                    {pin.map((d, i) => (
                      <input key={i} id={`pin${i}`} type="password" inputMode="numeric"
                        maxLength={1} value={d}
                        onChange={e => onPinChange(i, e.target.value)}
                        onKeyDown={e => onPinKey(i, e)}
                        className="w-12 h-12 text-center text-xl font-bold bg-slate-800 border-2 border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all" />
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={isLoading || pin.join('').length < 4} className="btn-primary w-full justify-center">
                  {isLoading ? 'Verifying…' : 'Sign In with PIN'}
                </button>
              </form>
            )}
          </div>
        </div>
        <p className="text-center text-slate-700 text-xs mt-4">© 2026 RetailPOS</p>
      </div>
    </div>
  );
}
