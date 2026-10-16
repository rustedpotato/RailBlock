import React, { useState } from 'react';
import { Button } from '../ui/Buttons';
import { SECTIONS } from '../../data/mockData';
import { MaintenanceTaskItem, Department } from '../../types/railblock';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: MaintenanceTaskItem) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<Department>('TRACTION_DISTRIBUTION');
  const [assetId] = useState('');
  const [section, setSection] = useState(SECTIONS[0]);
  const [duration, setDuration] = useState(180);
  const [criticality, setCriticality] = useState(4);
  const [urgency, setUrgency] = useState(4);
  const [blockType, setBlockType] = useState('Power & Traffic Block');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: MaintenanceTaskItem = {
      id: `TSK-${Math.floor(2100 + Math.random() * 900)}`,
      rank: 9,
      title,
      description: `Field requisition submitted by divisional maintenance supervisor for section ${section}.`,
      department,
      asset_id: assetId || `${department.slice(0, 3)}-${Math.floor(100 + Math.random() * 899)}`,
      section,
      duration_minutes: duration,
      criticality,
      urgency,
      overdue_days: 0,
      priority_score: Math.min(99, Math.round((criticality * 7 + urgency * 6 + 15) * 1.1)),
      earliest_start: '2026-10-21 00:00',
      deadline: '2026-10-24 06:00',
      status: 'PENDING',
      required_block_type: blockType,
      breakdown: {
        criticality: criticality * 7,
        urgency: urgency * 6,
        overdue: 5,
        operational_impact: 18
      },
      linked_defects: [],
      activity_log: [
        {
          timestamp: 'Just now',
          actor: 'Divisional Planner',
          message: 'Task submitted for AI Block Optimizer processing'
        }
      ]
    };

    onAddTask(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[520px] bg-[var(--surface)] border border-[var(--border-strong)] rounded-[12px] shadow-2xl p-6 z-10 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <h3 className="text-base font-semibold text-[var(--fg)]">Requisition Maintenance Task</h3>
          <span className="text-xs font-mono text-[var(--fg-muted)]">SIH26027 Protocol</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1">Task Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Catenary Wire Dropper Realignment"
              className="w-full h-9 px-3 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[#0070F3]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full h-9 px-2 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none"
              >
                <option value="ENGINEERING">Engineering (Civil/Track)</option>
                <option value="TRACTION_DISTRIBUTION">TRD (Electrical/OHE)</option>
                <option value="SIGNAL_TELECOMMUNICATION">Signal & Telecom (S&T)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1">Track Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full h-9 px-2 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none"
              >
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1">Duration (Min)</label>
              <input
                type="number"
                step="30"
                min="30"
                max="480"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] text-sm font-mono text-[var(--fg)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1">Criticality (1-5)</label>
              <select
                value={criticality}
                onChange={(e) => setCriticality(Number(e.target.value))}
                className="w-full h-9 px-2 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)]"
              >
                <option value="5">5 - Safety Critical</option>
                <option value="4">4 - High Priority</option>
                <option value="3">3 - Moderate</option>
                <option value="2">2 - Routine</option>
                <option value="1">1 - Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1">Urgency (1-5)</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(Number(e.target.value))}
                className="w-full h-9 px-2 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)]"
              >
                <option value="5">5 - Immediate</option>
                <option value="4">4 - Within 24h</option>
                <option value="3">3 - Within 72h</option>
                <option value="2">2 - Next Window</option>
                <option value="1">1 - Flexible</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1">Required Block Window Type</label>
            <input
              value={blockType}
              onChange={(e) => setBlockType(e.target.value)}
              placeholder="e.g. Integrated Mega Block / Traffic Block"
              className="w-full h-9 px-3 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Requisition
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
