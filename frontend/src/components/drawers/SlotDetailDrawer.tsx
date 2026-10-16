import React from 'react';
import { Drawer } from '../ui/Drawer';
import { MaintenanceTaskItem } from '../../types/railblock';
import { DepartmentChip, StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Buttons';
import { Clock } from 'lucide-react';

interface SlotDetailDrawerProps {
  task: MaintenanceTaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule?: (newSlot: string) => void;
}

export const SlotDetailDrawer: React.FC<SlotDetailDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onReschedule
}) => {
  if (!task) return null;

  const alternativeSlots = [
    {
      slot: '21 Oct 01:30 – 04:30',
      type: 'Night Mega Block',
      impact: 'Zero train disruptions · Recommended by OR-Tools',
      feasible: true
    },
    {
      slot: '22 Oct 02:00 – 05:00',
      type: 'Shadow Block with TRD',
      impact: '+24h delay · Free crew capacity available',
      feasible: true
    },
    {
      slot: '23 Oct 11:30 – 14:30',
      type: 'Day Traffic Window',
      impact: 'Cancels 1 local train · High traffic impact',
      feasible: false
    }
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Slot Allocation Details"
      subtitle={`${task.id} · ${task.section}`}
    >
      <div className="space-y-6 text-sm">
        {/* Task Summary */}
        <div className="p-3.5 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between">
            <DepartmentChip department={task.department} />
            <StatusBadge status={task.status} />
          </div>
          <h4 className="font-semibold text-[var(--fg)] text-sm">{task.title}</h4>
          <p className="text-xs text-[var(--fg-muted)]">{task.description}</p>
        </div>

        {/* Assigned Slot */}
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
            Current Assigned Slot
          </div>
          <div className="p-3.5 rounded-[8px] bg-[#0070F3]/10 border border-[#0070F3]/30 space-y-1.5">
            <div className="flex items-center gap-2 font-mono text-sm font-semibold text-[#0070F3]">
              <Clock size={16} />
              <span>{task.assigned_slot || '21 Oct 01:30 – 05:30'}</span>
            </div>
            <div className="text-xs text-[var(--fg-muted)]">
              Duration: <span className="font-mono text-[var(--fg)]">{task.duration_minutes} minutes ({task.duration_minutes / 60} hrs)</span>
            </div>
          </div>
        </div>

        {/* Reason for Assignment */}
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
            Reason for Assignment (OR-Tools Solver)
          </div>
          <div className="p-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg-muted)] leading-relaxed">
            {task.assigned_reason ||
              'Scheduled into night maintenance curfew to minimize passenger train disruption on high-density suburban corridors. Aligns with shadow block for adjacent catenary wire maintenance.'}
          </div>
        </div>

        {/* Feasible Alternative Slots */}
        <div className="space-y-3">
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
            Feasible Alternative Slots
          </div>
          <div className="space-y-2">
            {alternativeSlots.map((alt, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-[8px] border transition-all ${
                  alt.feasible
                    ? 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--border-strong)]'
                    : 'bg-[var(--bg)]/50 border-[var(--border)] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-medium text-[var(--fg)]">
                    {alt.slot}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--fg-subtle)]">
                    {alt.type}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--fg-muted)] mb-2.5">
                  {alt.impact}
                </p>
                {alt.feasible && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (onReschedule) onReschedule(alt.slot);
                      onClose();
                    }}
                  >
                    Select This Slot
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
