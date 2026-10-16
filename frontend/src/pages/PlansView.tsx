import React, { useState } from 'react';
import { Button } from '../components/ui/Buttons';
import { TabNav } from '../components/ui/Controls';
import { StatusBadge, DepartmentChip } from '../components/ui/Badge';
import { MOCK_PLANS, SECTIONS, MOCK_TASKS } from '../data/mockData';
import { MaintenancePlanInfo, UnscheduledTaskInfo } from '../types/railblock';
import { Download, Calendar, HelpCircle, Lightbulb, FileText } from 'lucide-react';

export const PlansView: React.FC = () => {
  const [periodTab, setPeriodTab] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(MOCK_PLANS[0].id);
  const [fixModalTask, setFixModalTask] = useState<UnscheduledTaskInfo | null>(null);

  const plan = MOCK_PLANS.find((p) => p.id === selectedPlanId) || MOCK_PLANS[0];

  return (
    <div className="space-y-6">
      {/* 1. Header with Export and Plan Version Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--fg)]">
              Maintenance Plans
            </h1>
            <StatusBadge status={plan.version_type} />
          </div>
          <p className="text-[13px] text-[var(--fg-muted)] mt-1 font-mono">
            {plan.week} · {plan.scheduled_count} tasks committed
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Plan Version Selector */}
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="h-[36px] px-3 rounded-[6px] bg-[var(--surface)] border border-[var(--border-strong)] text-xs text-[var(--fg)] outline-none cursor-pointer"
          >
            {MOCK_PLANS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.version_type})
              </option>
            ))}
          </select>

          <Button
            variant="secondary"
            icon={<Download size={14} />}
            onClick={() => alert('Generating Official Railway Maintenance Plan PDF...')}
          >
            Export PDF
          </Button>
          <Button
            variant="secondary"
            icon={<Download size={14} />}
            onClick={() => alert('Exporting Plan Schedule to CSV...')}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* 2. Weekly / Monthly Tab Nav */}
      <TabNav
        tabs={[
          { id: 'weekly', label: 'Week Grid (Sections × 7 Days)' },
          { id: 'monthly', label: 'Month View Overview' }
        ]}
        activeTab={periodTab}
        onTabChange={setPeriodTab}
      />

      {/* 3. Plan Calendar Grid */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)] flex items-center gap-1.5">
            <Calendar size={14} className="text-[#0070F3]" /> Section Schedule Matrix
          </span>
          <span className="text-xs font-mono text-[var(--fg-muted)]">
            Indian Railways Suburban Corridors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--border)] text-[11px] font-mono text-[var(--fg-subtle)]">
                <th className="py-2 w-44">Track Section</th>
                <th className="text-center py-2">Mon 19</th>
                <th className="text-center py-2 text-[#0070F3] font-semibold">Tue 20</th>
                <th className="text-center py-2">Wed 21</th>
                <th className="text-center py-2">Thu 22</th>
                <th className="text-center py-2">Fri 23</th>
                <th className="text-center py-2">Sat 24</th>
                <th className="text-center py-2">Sun 25</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-xs">
              {SECTIONS.map((sec, idx) => (
                <tr key={sec} className="h-14 hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="font-mono text-[12px] font-medium text-[var(--fg)] pr-2">
                    {sec}
                  </td>
                  <td className="text-center p-1">
                    <span className="inline-block px-2 py-1 rounded bg-[var(--surface-hover)] font-mono text-[11px] text-[var(--fg-muted)]">
                      {idx % 2 === 0 ? '2 tasks' : '1 task'}
                    </span>
                  </td>
                  <td className="text-center p-1">
                    <span className="inline-block px-2 py-1 rounded bg-[#0070F3]/20 border border-[#0070F3]/30 font-mono text-[11px] text-[#0070F3] font-semibold">
                      3 tasks
                    </span>
                  </td>
                  <td className="text-center p-1">
                    <span className="inline-block px-2 py-1 rounded bg-[#F5A623]/20 border border-[#F5A623]/30 font-mono text-[11px] text-[#F5A623] font-semibold">
                      4 tasks (Mega)
                    </span>
                  </td>
                  <td className="text-center p-1">
                    <span className="inline-block px-2 py-1 rounded bg-[var(--surface-hover)] font-mono text-[11px] text-[var(--fg-muted)]">
                      2 tasks
                    </span>
                  </td>
                  <td className="text-center p-1">
                    <span className="inline-block px-2 py-1 rounded bg-[var(--surface-hover)] font-mono text-[11px] text-[var(--fg-muted)]">
                      1 task
                    </span>
                  </td>
                  <td className="text-center p-1">
                    <span className="inline-block px-2 py-1 rounded bg-[var(--surface-hover)] font-mono text-[11px] text-[var(--fg-muted)]">
                      2 tasks
                    </span>
                  </td>
                  <td className="text-center p-1">
                    <span className="inline-block px-2 py-1 rounded hatched-band font-mono text-[11px] text-[var(--fg)] font-semibold">
                      5 tasks (Mega)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Unscheduled Tasks Panel with mandatory "Why unscheduled" column */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-[var(--fg)]">
              Unscheduled Tasks & Explanations ({plan.unscheduled_tasks.length})
            </h3>
            <p className="text-[12px] text-[var(--fg-muted)] font-mono">
              Transparent, plain-language reasoning for all unallocated demands
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)] h-9">
                <th className="w-24">Task ID</th>
                <th>Task Title</th>
                <th className="w-28">Department</th>
                <th>Why Unscheduled (Reason)</th>
                <th className="w-28 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {plan.unscheduled_tasks.map((un) => (
                <tr key={un.task_id} className="h-12 hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="font-mono text-[var(--fg)] font-medium">{un.task_id}</td>
                  <td className="font-medium text-[var(--fg)]">{un.title}</td>
                  <td><DepartmentChip department={un.department} /></td>
                  <td className="text-[var(--danger)]/90 pr-4">{un.reason}</td>
                  <td className="text-right pr-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<Lightbulb size={13} className="text-[#F5A623]" />}
                      onClick={() => setFixModalTask(un)}
                    >
                      Suggest fix
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suggest Fix Modal */}
      {fixModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setFixModalTask(null)} />
          <div className="relative w-full max-w-[500px] bg-[var(--surface)] border border-[var(--border-strong)] rounded-[12px] p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <span className="font-mono font-semibold text-sm text-[var(--fg)]">
                AI Suggestion: {fixModalTask.task_id}
              </span>
              <DepartmentChip department={fixModalTask.department} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-[var(--fg)]">Task</span>
              <p className="text-xs text-[var(--fg-muted)]">{fixModalTask.title}</p>
            </div>

            <div className="space-y-1.5 p-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)]">
              <span className="text-[11px] font-mono text-[var(--danger)] block">Root Obstacle:</span>
              <p className="text-xs text-[var(--fg)]">{fixModalTask.reason}</p>
            </div>

            <div className="space-y-1.5 p-3 rounded-[8px] bg-[#0070F3]/10 border border-[#0070F3]/30">
              <span className="text-[11px] font-mono text-[#0070F3] block">Recommended Workaround:</span>
              <p className="text-xs text-[var(--fg)] font-medium">{fixModalTask.suggested_fix}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <Button variant="ghost" onClick={() => setFixModalTask(null)}>Close</Button>
              <Button
                variant="primary"
                onClick={() => {
                  alert(`Workaround applied for ${fixModalTask.task_id}. Re-queuing in scheduler.`);
                  setFixModalTask(null);
                }}
              >
                Apply Recommendation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
