export function Logo({ size = 96 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="animate-pulse-glow absolute inset-0 rounded-2xl bg-gradient-primary" />
      <div className="glass-strong absolute inset-[3px] flex items-center justify-center rounded-[14px]">
        <svg viewBox="0 0 48 48" className="h-1/2 w-1/2" fill="none">
          <path d="M10 38 L24 6 L38 38 L24 30 Z" stroke="url(#lg)" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M18 30 L24 18 L30 30" stroke="url(#lg)" strokeWidth="2" strokeLinejoin="round" />
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="48" y2="48">
              <stop offset="0" stopColor="#00D4FF" />
              <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}