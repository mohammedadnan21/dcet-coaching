export default function StudentLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 bg-gradient-to-r from-amber-900/30 to-amber-800/10 rounded-2xl" />
      <div className="h-20 bg-stone-900 rounded-xl border border-amber-900/10" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-stone-900 rounded-xl border border-amber-900/10" />
        ))}
      </div>
      <div className="h-48 bg-stone-900 rounded-xl border border-amber-900/10" />
    </div>
  );
}
