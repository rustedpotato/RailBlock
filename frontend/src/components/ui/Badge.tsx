import React from 'react';
import { Department, TaskStatus, ConflictSeverity } from '../../types/railblock';

export const DepartmentChip: React.FC<{ department: Department; className?: string }> = ({ department, className = '' }) => {
  const meta = {
    ENGINEERING: { label: 'Engineering', color: '#0070F3' },
    TRACTION_DISTRIBUTION: { label: 'TRD', color: '#F5A623' },
    SIGNAL_TELECOMMUNICATION: { label: 'S&T', color: '#8E4EC6' }
  }[department] || { label: department, color: '#A1A1A1' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[12px] font-medium border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] ${className}`}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: meta.color }}
      />
      <span>{meta.label}</span>
    </span>
  );
};

export const StatusBadge: React.FC<{
  status: TaskStatus | 'ACTIVE' | 'RESOLVED' | 'Draft' | 'Approved' | 'Archived' | 'Good' | 'Degraded' | 'Critical';
  className?: string;
}> = ({ status, className = '' }) => {
  let color = 'var(--fg-muted)';
  let label: string = status;

  if (status === 'SCHEDULED' || status === 'RESOLVED' || status === 'Approved' || status === 'Good') {
    color = 'var(--success)';
    label = status === 'RESOLVED' ? 'Resolved' : status === 'Good' ? 'Healthy' : status;
  } else if (status === 'PENDING' || status === 'Draft' || status === 'Degraded') {
    color = 'var(--warning)';
  } else if (status === 'IN_PROGRESS') {
    color = 'var(--accent)';
    label = 'In Progress';
  } else if (status === 'Critical' || status === 'CANCELLED') {
    color = 'var(--danger)';
  } else if (status === 'Archived') {
    color = 'var(--fg-subtle)';
  }

  return (
    <span
      className={`inline-flex items-center h-[24px] px-2 rounded-[6px] text-[12px] font-medium tracking-tight border ${className}`}
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 24%, transparent)`,
        color: color
      }}
    >
      {label}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: ConflictSeverity }> = ({ severity }) => {
  const styles = {
    CRITICAL: 'bg-[#E5484D]/15 text-[#E5484D] border-[#E5484D]/30',
    MAJOR: 'bg-[#F5A623]/15 text-[#F5A623] border-[#F5A623]/30',
    MINOR: 'bg-[#0070F3]/15 text-[#0070F3] border-[#0070F3]/30'
  }[severity];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-mono font-medium border ${styles}`}>
      {severity}
    </span>
  );
};
