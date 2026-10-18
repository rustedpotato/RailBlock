import React, { useState } from 'react';
import { KPICard } from '../components/ui/KPICard';
import { SegmentedControl } from '../components/ui/Controls';
import { DepartmentChip, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Buttons';
import { LineBadge } from '../components/ui/LineBadge';
import { useLine, useLineData } from '../context/LineContext';
import { getLine } from '../data/lines';
import { MaintenanceTaskItem, ConflictItem } from '../types/railblock';
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

import { LiveTelemetryMonitor } from '../components/ui/LiveTelemetryMonitor';

interface DashboardViewProps {
  onSelectTask: (task: MaintenanceTaskItem) => void;
  onNavigateTab: (tab: string) => void;
  onResolveConflict: (conflict: ConflictItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTask,
  onNavigateTab,
  onResolveConflict
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const { selectedLine } = useLine();
  const activeLine = getLine(selectedLine);
  const lineData = useLineData();

  const topTasks = lineData.MOCK_TASKS.slice(0, 8);
  const activeConflicts = lineData.MOCK_CONFLICTS.filter(c => c.status === 'ACTIVE').slice(0, 5);

  const allSectionUtilization = [
    // Central Line
    { section: 'Kalyan – Kasara Up', util: 91, allocated: '4h 00m / 4h', lineId: 'central' },
    { section: 'Thane – Dombivli Fast', util: 86, allocated: '3h 30m / 4h', lineId: 'central' },
    { section: 'Kasara – Igatpuri Ghat', util: 82, allocated: '4h 10m / 5h', lineId: 'central' },
    { section: 'Thane – Dombivli Slow', util: 78, allocated: '3h 00m / 4h', lineId: 'central' },
    { section: 'Kalyan – Kasara Down', util: 74, allocated: '2h 45m / 4h', lineId: 'central' },
    // Western Line
    { section: 'Churchgate – Mumbai Central Fast', util: 94, allocated: '4h 15m / 4h 30m', lineId: 'western' },
    { section: 'Mumbai Central – Bandra Fast', util: 89, allocated: '3h 45m / 4h', lineId: 'western' },
    { section: 'Bandra – Borivali Fast', util: 85, allocated: '3h 20m / 4h', lineId: 'western' },
    { section: 'Borivali – Virar Fast', util: 80, allocated: '3h 10m / 4h', lineId: 'western' },
    { section: 'Virar – Dahanu Road Mainline', util: 72, allocated: '2h 30m / 3h 30m', lineId: 'western' },
    // Harbour Line
    { section: 'CSMT – Vadala Road Harbour', util: 88, allocated: '3h 00m / 3h 30m', lineId: 'harbour' },
    { section: 'Vadala Road – Kurla Harbour', util: 83, allocated: '2h 45m / 3h 15m', lineId: 'harbour' },
    { section: 'Kurla – Vashi Harbour', util: 81, allocated: '3h 15m / 4h', lineId: 'harbour' },
    { section: 'Vashi – Panvel Harbour', util: 76, allocated: '2h 30m / 3h 15m', lineId: 'harbour' },
    { section: 'Vadala Road – Andheri Harbour Branch', util: 70, allocated: '2h 10m / 3h', lineId: 'harbour' },
    { section: 'CSMT – Kurla Harbor', util: 68, allocated: '2h 15m / 3h', lineId: 'harbour' }
  ];

  const sectionUtilization = selectedLine === 'all'
    ? allSectionUtilization.slice(0, 6)
    : allSectionUtilization.filter(s => s.lineId === selectedLine);

  const departmentWorkload = [
    {
      name: 'Engineering',
      color: '#0070F3',
      scheduled: 68,
      unscheduled: 14,
      overdue: 8,
      total: 90
    },
    {
      name: 'Traction Distribution (TRD)',
      color: '#F5A623',
      scheduled: 62,
      unscheduled: 18,
      overdue: 11,
      total: 91
    },
    {
      name: 'Signal & Telecom (S&T)',
      color: '#8E4EC6',
      scheduled: 43,
      unscheduled: 16,
      overdue: 8,
      total: 67
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <h1 className="text-[32px] font-semibold tracking-[-0.03em] leading-tight text-[var(--fg)]">
            Dashboard
          </h1>
          <p className="text-[13px] text-[var(--fg-muted)] mt-1 font-mono">
            Week 43 · 19 – 25 Oct 2026 · {activeLine ? `${activeLine.zone} (${activeLine.name})` : 'Mumbai Suburban Network (All Lines: Central · Western · Harbour)'}
          </p>
        </div>
        <SegmentedControl
          value={timeRange}
          onChange={setTimeRange}
          options={[
            { label: 'Week', value: 'week' },
            { label: 'Month', value: 'month' }
          ]}
        />
      </div>

      {/* 2. KPI Strip (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Open Tasks"
          value="248"
          subValue="Across 3 depts"
          deltaText="+12%"
          isPositive={false}
          sparklineData={[220, 226, 230, 235, 240, 244, 248]}
        />
        <KPICard
          label="Scheduled This Week"
          value="173"
          subValue="70% of open tasks"
          deltaText="+8%"
          isPositive={true}
          sparklineData={[132, 140, 145, 152, 160, 168, 173]}
        />
        <KPICard
          label="Block Utilization"
          value="82%"
          subValue="+18 pts vs baseline"
          deltaText="+5%"
          isPositive={true}
          sparklineData={[64, 68, 71, 75, 78, 80, 82]}
        />
        <KPICard
          label="Asset Availability"
          value="96.4%"
          subValue="Target: 95.0%"
          deltaText="+1.2%"
          isPositive={true}
          sparklineData={[93.1, 93.8, 94.2, 94.9, 95.5, 96.0, 96.4]}
        />
      </div>

      {/* 2.5 Real-Time Track & Train Telemetry Feed */}
      <LiveTelemetryMonitor />

      {/* 3. Schedule Timeline Preview (Compact 7-day Gantt) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[var(--fg)]">
              Schedule Timeline Preview (7-Day Multi-Department Gantt)
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--surface-hover)] text-[var(--fg-muted)]">
              19 – 25 Oct
            </span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => onNavigateTab('scheduler')}>
            Open Full Scheduler <ArrowRight size={14} />
          </Button>
        </div>

        {/* Gantt Container */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px] border border-[var(--border)] rounded-[8px] bg-[var(--bg)] p-3 space-y-3">
            {/* Days Header */}
            <div className="grid grid-cols-7 text-center font-mono text-[11px] text-[var(--fg-subtle)] pb-2 border-b border-[var(--border)]">
              <div>Mon 19</div>
              <div className="text-[var(--accent)] font-semibold">Tue 20 (Today)</div>
              <div>Wed 21</div>
              <div>Thu 22</div>
              <div>Fri 23</div>
              <div>Sat 24</div>
              <div>Sun 25 (Mega)</div>
            </div>

            {/* Department Rows */}
            <div className="space-y-2">
              {/* Engineering */}
              <div className="flex items-center text-xs">
                <span className="w-28 text-[11px] font-medium text-[var(--fg-muted)] shrink-0 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0070F3]" />
                  Engineering
                </span>
                <div className="flex-1 grid grid-cols-7 gap-1 h-7 relative">
                  <div className="col-start-2 col-span-1 bg-[#0070F3]/90 text-white rounded-[6px] px-2 flex items-center text-[10px] font-mono truncate shadow-sm">
                    TSK-2044 · USFD 3h
                  </div>
                  <div className="col-start-3 col-span-2 bg-[#0070F3]/90 text-white rounded-[6px] px-2 flex items-center text-[10px] font-mono truncate shadow-sm">
                    TSK-2051 · Tamping 5h
                  </div>
                  <div className="col-start-7 col-span-1 hatched-band rounded-[6px] flex items-center justify-center text-[10px] font-mono text-[var(--fg-muted)]">
                    Mega Block
                  </div>
                </div>
              </div>

              {/* TRD */}
              <div className="flex items-center text-xs">
                <span className="w-28 text-[11px] font-medium text-[var(--fg-muted)] shrink-0 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F5A623]" />
                  TRD (OHE)
                </span>
                <div className="flex-1 grid grid-cols-7 gap-1 h-7 relative">
                  <div className="col-start-3 col-span-1 bg-[#F5A623]/90 text-black font-medium rounded-[6px] px-2 flex items-center text-[10px] font-mono truncate shadow-sm">
                    TSK-2043 · Wire 4h
                  </div>
                  <div className="col-start-4 col-span-1 bg-[#F5A623]/90 text-black font-medium rounded-[6px] px-2 flex items-center text-[10px] font-mono truncate shadow-sm">
                    TSK-2019 · Cantilever
                  </div>
                  <div className="col-start-7 col-span-1 hatched-band rounded-[6px] flex items-center justify-center text-[10px] font-mono text-[var(--fg-muted)]">
                    Power Cut
                  </div>
                </div>
              </div>

              {/* S&T */}
              <div className="flex items-center text-xs">
                <span className="w-28 text-[11px] font-medium text-[var(--fg-muted)] shrink-0 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8E4EC6]" />
                  Signal & Telecom
                </span>
                <div className="flex-1 grid grid-cols-7 gap-1 h-7 relative">
                  <div className="col-start-2 col-span-1 bg-[#8E4EC6]/90 text-white rounded-[6px] px-2 flex items-center text-[10px] font-mono truncate shadow-sm">
                    TSK-1982 · Axle 2h
                  </div>
                  <div className="col-start-3 col-span-1 bg-[#8E4EC6]/90 text-white rounded-[6px] px-2 flex items-center text-[10px] font-mono truncate shadow-sm">
                    TSK-2035 · Point 2.5h
                  </div>
                  <div className="col-start-5 col-span-1 bg-[#8E4EC6]/90 text-white rounded-[6px] px-2 flex items-center text-[10px] font-mono truncate shadow-sm">
                    TSK-2011 · OFC 3h
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Row: Top Priority Tasks (8 cols) & Active Conflicts (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Top Priority Tasks Table (8 cols) */}
        <div className="lg:col-span-8 bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-[var(--fg)]">
                Top Priority Tasks
              </h3>
              <p className="text-[12px] text-[var(--fg-muted)] font-mono">
                Ranked by Multi-Criteria Priority Engine
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onNavigateTab('tasks')}>
              View All 248 <ArrowRight size={14} />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-[36px] border-b border-[var(--border)] text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
                  <th className="w-12 text-center">Rank</th>
                  <th className="w-24">ID</th>
                  <th>Asset</th>
                  <th>Dept</th>
                  <th className="w-32">Priority Score</th>
                  <th className="w-20 text-center">Overdue</th>
                  <th className="w-24 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {topTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="h-[44px] hover:bg-[var(--surface-hover)] cursor-pointer transition-colors text-[13px]"
                  >
                    <td className="font-mono text-center text-[var(--fg-muted)]">
                      #{task.rank}
                    </td>
                    <td className="font-mono font-medium text-[var(--fg)]">
                      <div className="flex items-center gap-1.5">
                        <LineBadge section={task.section} variant="short" />
                        <span>{task.id}</span>
                      </div>
                    </td>
                    <td className="truncate max-w-[160px] text-[var(--fg-muted)] font-mono text-[12px]">
                      {task.asset_id}
                    </td>
                    <td>
                      <DepartmentChip department={task.department} />
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs w-8 text-right font-medium">
                          {task.priority_score.toFixed(0)}
                        </span>
                        <div className="w-[64px] h-1.5 rounded-full bg-[var(--surface-hover)] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${task.priority_score}%`,
                              backgroundColor:
                                task.priority_score > 90
                                  ? 'var(--danger)'
                                  : task.priority_score > 75
                                  ? 'var(--warning)'
                                  : 'var(--accent)'
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-center text-xs">
                      {task.overdue_days > 0 ? (
                        <span className="text-[var(--danger)] font-medium">
                          +{task.overdue_days}d
                        </span>
                      ) : (
                        <span className="text-[var(--fg-subtle)]">0d</span>
                      )}
                    </td>
                    <td className="text-right">
                      <StatusBadge status={task.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Active Conflicts (4 cols) */}
        <div className="lg:col-span-4 bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--fg)]">
                  Active Conflicts
                </h3>
                <p className="text-[12px] text-[var(--fg-muted)] font-mono">
                  {activeConflicts.length} bottlenecks detected
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onNavigateTab('conflicts')}>
                All <ArrowRight size={14} />
              </Button>
            </div>

            <div className="space-y-3">
              {activeConflicts.map((conf) => (
                <div
                  key={conf.id}
                  className="p-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          conf.severity === 'CRITICAL'
                            ? 'bg-[#E5484D]'
                            : conf.severity === 'MAJOR'
                            ? 'bg-[#F5A623]'
                            : 'bg-[#0070F3]'
                        }`}
                      />
                      <LineBadge section={conf.section} variant="short" />
                      <span className="font-mono text-[11px] font-medium text-[var(--fg)]">
                        {conf.id}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onResolveConflict(conf)}
                    >
                      Resolve
                    </Button>
                  </div>
                  <p className="text-[12px] text-[var(--fg-muted)] line-clamp-2 leading-snug">
                    {conf.title}
                  </p>
                  <div className="text-[11px] font-mono text-[var(--fg-subtle)] flex items-center justify-between">
                    <span>{conf.section}</span>
                    <span>{conf.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border)] text-center">
            <span className="text-[12px] text-[var(--fg-subtle)]">
              AI Suggestion engine has 3 feasible mitigations ready.
            </span>
          </div>
        </div>
      </div>

      {/* 5. Block Utilization by Section (6 cols) & Department Workload (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section Utilization Chart (6 cols) */}
        <div className="lg:col-span-6 bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[var(--fg)]">
              Block Utilization by Section
            </h3>
            <span className="text-xs font-mono text-[var(--fg-muted)]">Track Occupancy %</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {sectionUtilization.map((sec) => (
              <div key={sec.section} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-1.5 truncate max-w-[280px]">
                    <LineBadge section={sec.section} variant="short" />
                    <span className="text-[var(--fg)] font-medium truncate">
                      {sec.section}
                    </span>
                  </div>
                  <span className="text-[var(--fg-muted)] shrink-0">{sec.util}% ({sec.allocated})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--border)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--fg)] rounded-full transition-all duration-500"
                    style={{ width: `${sec.util}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Workload (6 cols) */}
        <div className="lg:col-span-6 bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[var(--fg)]">
              Department Workload Distribution
            </h3>
            <span className="text-xs font-mono text-[var(--fg-muted)]">Scheduled vs Overdue</span>
          </div>

          <div className="space-y-4 pt-1">
            {departmentWorkload.map((dept) => {
              const schedPct = (dept.scheduled / dept.total) * 100;
              const unschedPct = (dept.unscheduled / dept.total) * 100;
              const overduePct = (dept.overdue / dept.total) * 100;

              return (
                <div key={dept.name} className="space-y-1.5 p-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--fg)] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                      {dept.name}
                    </span>
                    <span className="font-mono text-[var(--fg-muted)]">
                      {dept.scheduled} scheduled · {dept.unscheduled} queue · {dept.overdue} overdue
                    </span>
                  </div>

                  {/* 3-Row Stacked Bar */}
                  <div className="w-full h-2.5 rounded-full bg-[var(--surface-hover)] overflow-hidden flex">
                    <div
                      className="h-full bg-[var(--success)]"
                      style={{ width: `${schedPct}%` }}
                      title={`Scheduled: ${dept.scheduled}`}
                    />
                    <div
                      className="h-full bg-[var(--warning)]"
                      style={{ width: `${unschedPct}%` }}
                      title={`Unscheduled: ${dept.unscheduled}`}
                    />
                    <div
                      className="h-full bg-[var(--danger)]"
                      style={{ width: `${overduePct}%` }}
                      title={`Overdue: ${dept.overdue}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-[11px] font-mono text-[var(--fg-subtle)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--success)]" /> Scheduled (70%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--warning)]" /> In Queue (19%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--danger)]" /> Overdue (11%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
