import React from 'react';

export interface Option<T = string> {
  label: string;
  value: T;
  count?: number;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = ''
}: {
  options: Array<{ label: string; value: T }>;
  value: T;
  onChange: (val: T) => void;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-[6px] border border-[var(--border)] bg-[var(--bg)] ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 h-[28px] text-[12px] font-medium rounded-[4px] transition-all select-none cursor-pointer ${
              active
                ? 'bg-[var(--surface-hover)] text-[var(--fg)] shadow-sm'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function TabNav<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}: {
  tabs: Array<{ id: T; label: string; count?: number }>;
  activeTab: T;
  onTabChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={`border-b border-[var(--border)] flex items-center gap-6 ${className}`}>
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`relative pb-3 text-[13px] font-medium transition-colors cursor-pointer ${
              active ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[11px] font-mono bg-[var(--surface-hover)] text-[var(--fg-subtle)]">
                  {tab.count}
                </span>
              )}
            </span>
            {active && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--fg)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }
>(({ className = '', icon, ...props }, ref) => {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <span className="absolute left-3 text-[var(--fg-subtle)] pointer-events-none">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        className={`h-[36px] w-full rounded-[6px] bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] text-[13px] px-3 transition-colors outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[#0070F3]/20 ${
          icon ? 'pl-9' : ''
        } ${className}`}
        {...props}
      />
    </div>
  );
});
Input.displayName = 'Input';

export function FilterPill<T extends string>({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: Array<{ label: string; value: T }>;
  value: T;
  onChange: (val: T) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 h-[36px] px-2.5 rounded-[6px] border border-[var(--border)] bg-[var(--bg)] text-[12px]">
      <span className="text-[var(--fg-subtle)]">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-transparent text-[var(--fg)] font-medium outline-none cursor-pointer pr-1"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[var(--surface)] text-[var(--fg)]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
