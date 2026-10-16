import React from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  subValue?: string;
  deltaText: string;
  isPositive: boolean;
  sparklineData: number[];
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  subValue,
  deltaText,
  isPositive,
  sparklineData
}) => {
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;

  const points = sparklineData
    .map((val, i) => {
      const x = (i / (sparklineData.length - 1)) * 64;
      const y = 24 - ((val - min) / range) * 20;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 transition-colors hover:border-[var(--border-strong)] flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium tracking-wide uppercase text-[var(--fg-subtle)]">
          {label}
        </span>
        <span
          className={`inline-flex items-center gap-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded-[4px] font-medium ${
            isPositive
              ? 'text-[var(--success)] bg-[var(--success)]/10'
              : 'text-[var(--danger)] bg-[var(--danger)]/10'
          }`}
        >
          {isPositive ? '▲' : '▼'} {deltaText}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-[32px] font-mono font-medium tracking-tight text-[var(--fg)] leading-none">
            {value}
          </div>
          {subValue && (
            <div className="text-[12px] text-[var(--fg-muted)] mt-1 font-mono">
              {subValue}
            </div>
          )}
        </div>

        {/* 7-point sparkline */}
        <div className="w-[64px] h-[24px] shrink-0 opacity-80">
          <svg width="64" height="24" className="overflow-visible">
            <polyline
              fill="none"
              stroke={isPositive ? 'var(--success)' : 'var(--danger)'}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
