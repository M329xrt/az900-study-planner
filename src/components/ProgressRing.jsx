import React from 'react';

/**
 * Lightweight SVG ring — no animation loop, so it costs nothing on battery.
 */
export default function ProgressRing({
  value = 0,
  size = 116,
  thickness = 9,
  label,
  caption,
  tone = 'primary'
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;
  const strokeClass =
    tone === 'gold' ? 'stroke-gold' : tone === 'sage' ? 'stroke-sage' : 'stroke-primary';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          className="stroke-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className={`${strokeClass} transition-[stroke-dasharray] duration-700 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label ? <span className="font-heading text-2xl leading-none">{label}</span> : null}
        {caption ? (
          <span className="mt-1 max-w-[80%] text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
            {caption}
          </span>
        ) : null}
      </div>
    </div>
  );
}