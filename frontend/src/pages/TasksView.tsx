import React, { useState } from 'react';
import { Button } from '../components/ui/Buttons';
import { Input, FilterPill } from '../components/ui/Controls';
import { DepartmentChip, StatusBadge } from '../components/ui/Badge';
import { LineBadge } from '../components/ui/LineBadge';
import { MaintenanceTaskItem, Department, TaskStatus } from '../types/railblock';
import { useLine, matchesLine } from '../context/LineContext';
import { LINES, getLine } from '../data/lines';
import {
  Plus,
  Upload,
  Search,
  Table as TableIcon,
  Kanban,
  Check,
  Download,
  Trash2,
  SlidersHorizontal,
  Clock
} from 'lucide-react';

interface TasksViewProps {
  tasks: MaintenanceTaskItem[];
  onSelectTask: (task: MaintenanceTaskItem) => void;
  onOpenNewTaskModal: () => void;
  onOpenAssignModal?: (task: MaintenanceTaskItem) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onSelectTask,
  onOpenNewTaskModal,
  onOpenAssignModal
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('ALL');
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [overdueOnly, setOverdueOnly] = useState<boolean>(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const { selectedLine } = useLine();
  const activeLine = getLine(selectedLine);

  const availableSections = selectedLine === 'all'
    ? LINES.flatMap(l => l.sections)
    : LINES.find(l => l.id === selectedLine)?.sections ?? LINES.flatMap(l => l.sections);

  // Filtering
  const filteredTasks = tasks.filter((task) => {
    if (!matchesLine(selectedLine, task.section)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        task.id.toLowerCase().includes(q) ||
        task.title.toLowerCase().includes(q) ||
        task.asset_id.toLowerCase().includes(q) ||
        task.section.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (deptFilter !== 'ALL' && task.department !== deptFilter) return false;
    if (statusFilter !== 'ALL' && task.status !== statusFilter) return false;
    if (criticalityFilter !== 'ALL' && task.criticality !== Number(criticalityFilter)) return false;
    if (sectionFilter !== 'ALL' && task.section !== sectionFilter) return false;
    if (overdueOnly && task.overdue_days <= 0) return false;
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <h1 className="text-[32px] font-semibold tracking-[-0.03em] leading-tight text-[var(--fg)]">
            Maintenance Tasks
          </h1>
          <p className="text-[13px] text-[var(--fg-muted)] mt-1 font-mono">
            {filteredTasks.length} of {tasks.length} total tasks displayed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={<Upload size={14} />}
            onClick={() => alert('CSV / Railway TMS Import template opened.')}
          >
            Import
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={14} />}
            onClick={onOpenNewTaskModal}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* 2. Filter Bar & View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="w-full sm:w-[240px]">
            <Input
              icon={<Search size={14} />}
              placeholder="Search ID, asset, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <FilterPill
            label="Dept"
            value={deptFilter}
            onChange={setDeptFilter}
            options={[
              { label: 'All', value: 'ALL' },
              { label: 'Engineering', value: 'ENGINEERING' },
              { label: 'TRD (OHE)', value: 'TRACTION_DISTRIBUTION' },
              { label: 'S&T', value: 'SIGNAL_TELECOMMUNICATION' }
            ]}
          />

          <FilterPill
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All', value: 'ALL' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Scheduled', value: 'SCHEDULED' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Completed', value: 'COMPLETED' }
            ]}
          />

          <FilterPill
            label="Criticality"
            value={criticalityFilter}
            onChange={setCriticalityFilter}
            options={[
              { label: 'All', value: 'ALL' },
              { label: 'Crit 5 (Safety)', value: '5' },
              { label: 'Crit 4', value: '4' },
              { label: 'Crit 3', value: '3' },
              { label: 'Crit 2', value: '2' },
              { label: 'Crit 1', value: '1' }
            ]}
          />

          <FilterPill
            label="Section"
            value={sectionFilter}
            onChange={setSectionFilter}
            options={[
              { label: 'All Sections', value: 'ALL' },
              ...availableSections.map((s) => ({ label: s, value: s }))
            ]}
          />

          <button
            type="button"
            onClick={() => setOverdueOnly(!overdueOnly)}
            className={`h-[36px] px-3 rounded-[6px] text-xs font-mono font-medium border transition-colors cursor-pointer ${
              overdueOnly
                ? 'bg-[var(--danger)]/15 border-[var(--danger)] text-[var(--danger)]'
                : 'bg-[var(--bg)] border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            {overdueOnly ? '✓ Overdue Only' : 'Overdue Only'}
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-0.5 rounded-[6px] border border-[var(--border)] bg-[var(--bg)] self-start lg:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`h-[30px] px-2.5 rounded-[4px] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[var(--surface-hover)] text-[var(--fg)]'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            <TableIcon size={14} /> Table
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`h-[30px] px-2.5 rounded-[4px] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'board'
                ? 'bg-[var(--surface-hover)] text-[var(--fg)]'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            <Kanban size={14} /> Board
          </button>
        </div>
      </div>

      {/* 3. Table View (dense 44px rows, sticky header) */}
      {viewMode === 'table' ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead className="sticky top-0 bg-[var(--bg-2)] border-b border-[var(--border)] z-10">
                <tr className="h-[40px] text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
                  <th className="w-10 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredTasks.length > 0 &&
                        selectedTaskIds.length === filteredTasks.length
                      }
                      onChange={toggleSelectAll}
                      className="cursor-pointer accent-[#0070F3] rounded"
                    />
                  </th>
                  <th className="w-14">Rank</th>
                  <th className="w-24">Task ID</th>
                  <th>Description</th>
                  <th className="w-32">Asset</th>
                  <th className="w-24">Dept</th>
                  <th className="w-20 text-center">Crit</th>
                  <th className="w-20 text-center">Urg</th>
                  <th className="w-24 text-center">Overdue</th>
                  <th className="w-36">Priority Score</th>
                  <th className="w-24 text-right">Duration</th>
                  <th className="w-28 text-right pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredTasks.map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  return (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={`h-[44px] hover:bg-[var(--surface-hover)] cursor-pointer transition-colors text-[13px] ${
                        isSelected ? 'bg-[var(--surface-hover)]' : ''
                      }`}
                    >
                      <td
                        className="px-3 text-center"
                        onClick={(e) => toggleSelectRow(task.id, e)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="cursor-pointer accent-[#0070F3] rounded"
                        />
                      </td>
                      <td className="font-mono text-[12px] text-[var(--fg-muted)]">
                        #{task.rank}
                      </td>
                      <td className="font-mono font-medium text-[var(--fg)]">
                        <div className="flex items-center gap-1.5">
                          <LineBadge section={task.section} variant="short" />
                          <span>{task.id}</span>
                        </div>
                      </td>
                      <td className="max-w-[320px] py-2.5">
                        <div className="truncate text-[var(--fg)] font-medium text-xs">
                          {task.title}
                        </div>
                        {task.assigned_crew ? (
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--fg-subtle)] font-mono truncate">
                            <span className="text-[#0070F3] font-semibold">{task.assigned_crew}</span>
                            {task.assigned_equipment && (
                              <span className="text-[var(--fg-muted)] truncate">· {task.assigned_equipment}</span>
                            )}
                          </div>
                        ) : (
                          <div className="mt-0.5 text-[10px] text-[#F5A623] font-mono italic">
                            Unassigned to sector crew
                          </div>
                        )}
                      </td>
                      <td className="font-mono text-xs text-[#0070F3] truncate max-w-[140px]">
                        {task.asset_id}
                      </td>
                      <td>
                        <DepartmentChip department={task.department} />
                      </td>
                      <td className="text-center">
                        <span
                          className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                            task.criticality === 5
                              ? 'bg-[var(--danger)]/20 text-[var(--danger)] font-bold'
                              : 'text-[var(--fg-muted)]'
                          }`}
                        >
                          C{task.criticality}
                        </span>
                      </td>
                      <td className="text-center font-mono text-xs text-[var(--fg-muted)]">
                        U{task.urgency}
                      </td>
                      <td className="text-center font-mono text-xs">
                        {task.overdue_days > 0 ? (
                          <span className="text-[var(--danger)] font-semibold">
                            +{task.overdue_days}d
                          </span>
                        ) : (
                          <span className="text-[var(--fg-subtle)]">0d</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs w-9 text-right font-medium">
                            {task.priority_score.toFixed(1)}
                          </span>
                          <div className="w-[64px] h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
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
                      <td className="text-right font-mono text-xs text-[var(--fg-muted)]">
                        {task.duration_minutes}m
                      </td>
                      <td className="text-right pr-4">
                        <StatusBadge status={task.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Board / Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {(['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'] as TaskStatus[]).map((status) => {
            const colTasks = filteredTasks.filter((t) => t.status === status);
            return (
              <div
                key={status}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-4 flex flex-col min-h-[480px]"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]">
                    {status.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--surface-hover)] text-[var(--fg-muted)]">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="p-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--border-strong)] cursor-pointer transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <LineBadge section={task.section} variant="short" />
                          <span className="font-mono text-xs font-semibold text-[var(--fg)]">
                            {task.id}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-[var(--danger)]">
                          {task.overdue_days > 0 ? `+${task.overdue_days}d` : ''}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[var(--fg)] line-clamp-2">
                        {task.title}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-[var(--border)] text-[11px]">
                        <DepartmentChip department={task.department} />
                        <span className="font-mono text-[var(--fg-muted)]">{task.duration_minutes}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Bulk Action Bar (appears at bottom when rows are selected) */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-[var(--surface)] border border-[var(--border-strong)] rounded-[12px] shadow-2xl px-5 py-3 flex items-center gap-4 text-xs font-medium">
          <span className="font-mono font-semibold text-[var(--fg)]">
            {selectedTaskIds.length} tasks selected
          </span>
          <div className="h-4 w-px bg-[var(--border)]" />
          <Button
            size="sm"
            variant="primary"
            onClick={() => alert(`Allocating ${selectedTaskIds.length} tasks to Block Window...`)}
          >
            Allocate to Window
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<Download size={13} />}
            onClick={() => alert('Exporting selected tasks to CSV...')}
          >
            Export Selected
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedTaskIds([])}
          >
            Deselect All
          </Button>
        </div>
      )}
    </div>
  );
};
