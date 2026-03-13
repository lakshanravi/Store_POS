export default function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size];
  return (
    <div className={`${s} border-2 border-blue-600 border-t-transparent rounded-full animate-spin`} />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
