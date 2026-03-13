export default function StatCard({ label, value, sub, icon: Icon, color = 'bg-blue-600' }) {
  return (
    <div className="glass rounded-xl p-5 animate-fadeIn">
      <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-4`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="font-display font-bold text-2xl text-white leading-none">{value}</p>
      <p className="text-slate-400 text-sm mt-1">{label}</p>
      {sub && <p className="text-slate-600 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}
