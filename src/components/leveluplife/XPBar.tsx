export function XPBar({ pct, className = "" }: { pct: number; className?: string }) {
  return (
    <div className={`relative h-2.5 w-full overflow-hidden rounded-full bg-white/5 ${className}`}>
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-primary shadow-glow transition-[width] duration-700"
        style={{ width: `${Math.max(2, pct)}%` }}
      />
      <div
        className="absolute inset-y-0 left-0 rounded-full opacity-70 [background:linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] [background-size:200%_100%]"
        style={{ width: `${Math.max(2, pct)}%`, animation: "shimmer 2.4s linear infinite" }}
      />
    </div>
  );
}