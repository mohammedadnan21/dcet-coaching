export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-stone-800 rounded-lg" />
      <div className="h-4 w-72 bg-stone-800/50 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-stone-900 rounded-xl border border-amber-900/10" />
        ))}
      </div>
      <div className="h-64 bg-stone-900 rounded-xl border border-amber-900/10" />
    </div>
  );
}
