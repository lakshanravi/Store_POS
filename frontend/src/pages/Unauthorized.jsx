import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
      <div className="text-center animate-scaleIn">
        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldOff size={28} className="text-red-400" />
        </div>
        <h1 className="font-display font-bold text-2xl text-white mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-6">You don't have permission to view this page.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
      </div>
    </div>
  );
}
