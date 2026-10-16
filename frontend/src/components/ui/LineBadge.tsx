import React from 'react';
import { getLineForSection, getLine, LineId, LineInfo } from '../../data/lines';

interface LineBadgeProps {
  section?: string;
  lineId?: LineId;
  variant?: 'full' | 'short' | 'pill' | 'dot';
  className?: string;
}

export const LineBadge: React.FC<LineBadgeProps> = ({
  section,
  lineId,
  variant = 'pill',
  className = ''
}) => {
  const line: LineInfo | undefined = lineId && lineId !== 'all'
    ? getLine(lineId)
    : getLineForSection(section);

  if (!line) {
    if (lineId === 'all') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] font-mono text-[10px] font-semibold bg-[var(--surface-hover)] text-[var(--fg-muted)] border border-[var(--border)] ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--fg-muted)]" />
          ALL LINES
        </span>
      );
    }
    return null;
  }

  if (variant === 'dot') {
    return (
      <span
        title={`${line.name} (${line.short})`}
        className={`inline-block w-2 h-2 rounded-full shrink-0 ${className}`}
        style={{ background: line.color, boxShadow: `0 0 6px ${line.color}88` }}
      />
    );
  }

  if (variant === 'short') {
    return (
      <span
        title={line.name}
        className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] font-mono text-[10px] font-bold uppercase tracking-wider shrink-0 ${className}`}
        style={{
          background: `${line.color}18`,
          color: line.color,
          border: `1px solid ${line.color}40`
        }}
      >
        {line.short}
      </span>
    );
  }

  if (variant === 'full') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] font-mono text-[11px] font-medium shrink-0 ${className}`}
        style={{
          background: `${line.color}14`,
          color: line.color,
          border: `1px solid ${line.color}33`
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: line.color }}
        />
        <span className="font-bold">{line.short}</span>
        <span className="opacity-75">·</span>
        <span className="truncate">{line.name}</span>
      </span>
    );
  }

  // Default 'pill'
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] font-mono text-[10px] font-semibold shrink-0 ${className}`}
      style={{
        background: `${line.color}18`,
        color: line.color,
        border: `1px solid ${line.color}33`
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: line.color }}
      />
      <span>{line.short}</span>
    </span>
  );
};
