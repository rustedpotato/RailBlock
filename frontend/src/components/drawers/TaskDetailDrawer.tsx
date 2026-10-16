import React from 'react';
import { Drawer } from '../ui/Drawer';
import { MaintenanceTaskItem } from '../../types/railblock';
import { DepartmentChip, StatusBadge } from '../ui/Badge';
import { Clock, AlertTriangle } from 'lucide-react';

interface TaskDetailDrawerProps {
  task: MaintenanceTaskItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({ task, isOpen, onClose }) => {
  if (!task) return null;

  const { breakdown } = task;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      subtitle={`${task.id} · ${task.asset_id}`}
    >
      <div className="space-y-6 text-sm">
        {/* Status & Department Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <DepartmentChip department={task.department} />
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[var(--fg-muted)]">Rank #{task.rank}</span>
            <StatusBadge status={task.status} />
          </div>
        </div>

        {/* Section & Description */}
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
            Corridor & Asset
          </div>
          <div className="p-3 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] space-y-1">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-[var(--fg-muted)]">Section:</span>
              <span className="text-[var(--fg)] font-medium">{task.section}</span>
            </div>
            <div className="flex justify-between font-mono text-xs">
              <span className="text-[var(--fg-muted)]">Asset ID:</span>
              <span className="text-[#0070F3]">{task.asset_id}</span>
            </div>
            <div className="flex justify-between font-mono text-xs">
              <span className="text-[var(--fg-muted)]">Required Block:</span>
              <span className="text-[var(--fg)]">{task.required_block_type}</span>
            </div>
          </div>
          <p className="text-xs text-[var(--fg-muted)] leading-relaxed mt-2">
            {task.description}
          </p>
        </div>

        {/* Priority Score Breakdown (Spec: 4 horizontal bars) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
              AI Priority Engine Breakdown
            </span>
            <span className="text-sm font-mono font-semibold text-[var(--fg)]">
              {task.priority_score.toFixed(1)} / 100
            </span>
          </div>

          <div className="space-y-2.5 p-3 rounded-[6px] bg-[var(--bg)] border border-[var(--border)]">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[var(--fg-muted)]">Safety Criticality (35% weight)</span>
                <span className="text-[var(--fg)]">{breakdown.criticality}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--surface-hover)] overflow-hidden">
                <div
                  className="h-full bg-[#E5484D] rounded-full"
                  style={{ width: `${(breakdown.criticality / 35) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[var(--fg-muted)]">Urgency & Speed Caution (30% weight)</span>
                <span className="text-[var(--fg)]">{breakdown.urgency}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--surface-hover)] overflow-hidden">
                <div
                  className="h-full bg-[#F5A623] rounded-full"
                  style={{ width: `${(breakdown.urgency / 30) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[var(--fg-muted)]">Overdue Penalty (20% weight)</span>
                <span className="text-[var(--fg)]">
                  {task.overdue_days > 0 ? `+${task.overdue_days}d (${breakdown.overdue}%)` : 'None'}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--surface-hover)] overflow-hidden">
                <div
                  className="h-full bg-[#8E4EC6] rounded-full"
                  style={{ width: `${(breakdown.overdue / 20) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[var(--fg-muted)]">Operational Impact (15% weight)</span>
                <span className="text-[var(--fg)]">{breakdown.operational_impact.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--surface-hover)] overflow-hidden">
                <div
                  className="h-full bg-[#0070F3] rounded-full"
                  style={{ width: `${(breakdown.operational_impact / 15) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Slot & Time Bounds */}
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
            Time Bounds & Allocation
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-[6px] bg-[var(--bg)] border border-[var(--border)]">
              <span className="text-[var(--fg-subtle)] block text-[11px]">Earliest Start</span>
              <span className="text-[var(--fg)] mt-0.5 block">{task.earliest_start}</span>
            </div>
            <div className="p-2.5 rounded-[6px] bg-[var(--bg)] border border-[var(--border)]">
              <span className="text-[var(--fg-subtle)] block text-[11px]">Strict Deadline</span>
              <span className="text-[#E5484D] mt-0.5 block">{task.deadline}</span>
            </div>
          </div>
          {task.assigned_slot && (
            <div className="p-2.5 rounded-[6px] bg-[var(--surface-hover)] border border-[var(--border)] text-xs">
              <div className="flex items-center gap-1.5 font-medium text-[var(--fg)]">
                <Clock size={13} className="text-[#0070F3]" />
                <span>Optimized Assigned Slot: {task.assigned_slot}</span>
              </div>
              {task.assigned_reason && (
                <p className="text-[11px] text-[var(--fg-muted)] mt-1 font-sans">
                  {task.assigned_reason}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Linked Asset Defects */}
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
            Linked Asset Defects ({task.linked_defects.length})
          </div>
          {task.linked_defects.length > 0 ? (
            <div className="space-y-1.5">
              {task.linked_defects.map((defect, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-[6px] bg-[var(--bg)] border border-[#E5484D]/20 text-xs text-[var(--fg-muted)]"
                >
                  <AlertTriangle size={13} className="text-[#E5484D] shrink-0 mt-0.5" />
                  <span>{defect}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[var(--fg-subtle)] italic p-2 border border-dashed border-[var(--border)] rounded-[6px]">
              No active safety defects linked to this asset.
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
            Activity Log
          </div>
          <div className="space-y-2 border-l border-[var(--border)] ml-2 pl-3">
            {task.activity_log.map((log, i) => (
              <div key={i} className="text-xs space-y-0.5 relative">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--fg-subtle)] absolute -left-[16px] top-1.5" />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[var(--fg)]">{log.actor}</span>
                  <span className="font-mono text-[var(--fg-subtle)]">{log.timestamp}</span>
                </div>
                <div className="text-[var(--fg-muted)]">{log.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
