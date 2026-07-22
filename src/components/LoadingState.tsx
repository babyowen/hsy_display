export default function LoadingState() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-full bg-ember-500/30" />
        <div className="h-8 w-48 rounded bg-white/10" />
      </div>
      <div className="glass-panel overflow-hidden rounded-2xl">
        <div className="space-y-3 p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 rounded bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}
