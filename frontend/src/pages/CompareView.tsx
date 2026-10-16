import React, { useState } from 'react';
import { MOCK_COMPARE_METRICS } from '../data/mockData';
import { GitCompare, TrendingUp, BarChart2, ShieldCheck, Zap } from 'lucide-react';

export const CompareView: React.FC = () => {
  const [baselinePlan, setBaselinePlan] = useState('Manual Section Controller Draft');
  const [optimizedPlan, setOptimizedPlan] = useState('OR-Tools AI Optimized Schedule v2.4');

  const deptDowntime = [
    { dept: 'Engineering', baseline: 42, optimized: 24 },
    { dept: 'TRD (OHE)', baseline: 32, optimized: 20 },
    { dept: 'Signal & Telecom', baseline: 20, optimized: 14 }
  ];

  const dailyUtil = [
    { day: 'Mon', baseline: 58, optimized: 78 },
    { day: 'Tue', baseline: 62, optimized: 84 },
    { day: 'Wed', baseline: 60, optimized: 85 },
    { day: 'Thu', baseline: 65, optimized: 80 },
    { day: 'Fri', baseline: 64, optimized: 79 },
    { day: 'Sat', baseline: 70, optimized: 82 },
    { day: 'Sun', baseline: 69, optimized: 86 }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header with 'vs' plan selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--fg)]">
            Plan Comparison
          </h1>
          <p className="text-[13px] text-[var(--fg-muted)] mt-1 font-mono">
            Quantifiable benchmarking: Human Manual Baseline vs Mathematical Constraint Optimization
          </p>
        </div>

        {/* 'vs' Layout */}
        <div className="flex items-center gap-2 p-1.5 rounded-[8px] bg-[var(--surface)] border border-[var(--border)] text-xs">
          <select
            value={baselinePlan}
            onChange={(e) => setBaselinePlan(e.target.value)}
            className="h-8 px-2.5 rounded-[4px] bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] outline-none"
          >
            <option>Manual Section Controller Draft</option>
            <option>Baseline Week 42 Schedule</option>
          </select>
          <span className="font-mono font-bold text-[var(--fg-subtle)] px-1">VS</span>
          <select
            value={optimizedPlan}
            onChange={(e) => setOptimizedPlan(e.target.value)}
            className="h-8 px-2.5 rounded-[4px] bg-[var(--surface-hover)] border border-[var(--border-strong)] text-[var(--fg)] font-medium outline-none"
          >
            <option>OR-Tools AI Optimized Schedule v2.4</option>
            <option>Integrated Mega Block Plan</option>
          </select>
        </div>
      </div>

      {/* 2. Metrics Table (exact values from spec) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 space-y-3">
        <h3 className="text-[15px] font-semibold text-[var(--fg)]">
          Core Performance Benchmarks
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[11px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] h-9">
                <th>Metric</th>
                <th className="w-36 font-mono">Baseline</th>
                <th className="w-36 font-mono text-[var(--fg)]">Optimized</th>
                <th className="w-36 text-right font-mono pr-4">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {MOCK_COMPARE_METRICS.map((row) => (
                <tr key={row.metric} className="h-11 hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="font-medium text-[var(--fg)]">{row.metric}</td>
                  <td className="font-mono text-[var(--fg-muted)]">{row.baseline}</td>
                  <td className="font-mono text-[var(--fg)] font-semibold">{row.optimized}</td>
                  <td className="text-right font-mono pr-4 font-semibold text-[var(--success)]">
                    {row.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Two Charts Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grouped Bar Chart: Downtime by Department */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]">
              Downtime by Department (Hours)
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--fg-muted)]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#6B6B6B]" /> Baseline
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[var(--fg)]" /> Optimized
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {deptDowntime.map((item) => (
              <div key={item.dept} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[var(--fg)] font-medium">{item.dept}</span>
                  <span className="text-[var(--fg-muted)]">
                    {item.baseline}h → <span className="text-[var(--success)] font-semibold">{item.optimized}h</span>
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="w-full h-2 rounded-full bg-[var(--border)] overflow-hidden">
                    <div
                      className="h-full bg-[#6B6B6B] rounded-full"
                      style={{ width: `${(item.baseline / 50) * 100}%` }}
                    />
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--border)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--fg)] rounded-full"
                      style={{ width: `${(item.optimized / 50) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Block Utilization Chart */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]">
              Daily Block Utilization (%)
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--fg-muted)]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#6B6B6B]" /> Baseline (64% avg)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--fg)]" /> Optimized (82% avg)
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between h-40 pt-4 px-2 border-b border-[var(--border)]">
            {dailyUtil.map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-2 h-full justify-end">
                <div className="flex items-end gap-1.5 h-28">
                  {/* Baseline bar */}
                  <div
                    className="w-3.5 bg-[#6B6B6B] rounded-t-[2px] transition-all"
                    style={{ height: `${d.baseline}%` }}
                    title={`Baseline: ${d.baseline}%`}
                  />
                  {/* Optimized bar */}
                  <div
                    className="w-3.5 bg-[var(--fg)] rounded-t-[2px] transition-all"
                    style={{ height: `${d.optimized}%` }}
                    title={`Optimized: ${d.optimized}%`}
                  />
                </div>
                <span className="font-mono text-[10px] text-[var(--fg-subtle)]">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Narrative Card */}
      <div className="bg-[var(--surface)] border border-[#0070F3]/30 rounded-[12px] p-5 space-y-2 relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0070F3]">
          <Zap size={14} /> Optimization Synthesis & Operational Trade-offs
        </div>
        <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
          The OR-Tools constraint scheduler achieved a <strong className="text-[var(--fg)]">31% increase in scheduled tasks</strong> while cutting avoidable train operational downtime by <strong className="text-[var(--fg)]">38%</strong>. By grouping Traction Distribution (OHE) wire replacement with Track Renewal into joint shadow windows, conflicting track possessions dropped from 14 to 2 (-86%). The primary trade-off involves shifting 2 non-critical freight train paths to off-peak slots.
        </p>
      </div>
    </div>
  );
};
