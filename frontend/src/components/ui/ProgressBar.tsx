export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div>
      {(label != null || true) && (
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-zinc-400">{label}</span>
          <span className="font-mono text-zinc-500">{pct}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-teal-500 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
