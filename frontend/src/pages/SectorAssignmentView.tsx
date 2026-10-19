import React, { useState, useMemo } from 'react';
import { MaintenanceTaskItem, Department, SectorWorkStatus } from '../types/railblock';
import { SECTORS, SECTOR_CREWS, SECTOR_MACHINERY, SECTOR_SUPERVISORS } from '../data/sectorData';
import { useLine, matchesLine } from '../context/LineContext';
import { DepartmentChip } from '../components/ui/Badge';
import { LineBadge } from '../components/ui/LineBadge';
import { Button } from '../components/ui/Buttons';
import {
  Wrench,
  Zap,
  Radio,
  Users,
  Cpu,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';

interface SectorAssignmentViewProps {
  onOpenAssignModal: (task: MaintenanceTaskItem) => void;
  onSelectTask: (task: MaintenanceTaskItem) => void;
}

export const SectorAssignmentView: React.FC<SectorAssignmentViewProps> = ({
  onOpenAssignModal,
  onSelectTask
}) => {
  const { tasks, selectedLine, updateSectorStatus } = useLine();
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<Department | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks based on line, sector, and search
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!matchesLine(selectedLine, t.section)) return false;
      if (selectedSectorFilter !== 'ALL' && t.department !== selectedSectorFilter) return false;
      if (statusFilter !== 'ALL') {
        const currentSectorStatus = t.sector_status || (t.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : t.assigned_crew ? 'ASSIGNED' : 'REQUISITIONED');
        if (currentSectorStatus !== statusFilter) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.section.toLowerCase().includes(q) ||
          (t.assigned_crew && t.assigned_crew.toLowerCase().includes(q)) ||
          (t.assigned_equipment && t.assigned_equipment.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [tasks, selectedLine, selectedSectorFilter, statusFilter, searchQuery]);

  // Sector-wise task counts
  const sectorCounts = useMemo(() => {
    const engg = tasks.filter((t) => t.department === 'ENGINEERING').length;
    const trd = tasks.filter((t) => t.department === 'TRACTION_DISTRIBUTION').length;
    const snt = tasks.filter((t) => t.department === 'SIGNAL_TELECOMMUNICATION').length;
    return { engg, trd, snt, total: tasks.length };
  }, [tasks]);

  // Workflow pipeline buckets
  const pipeline = useMemo(() => {
    const buckets: Record<SectorWorkStatus, MaintenanceTaskItem[]> = {
      REQUISITIONED: [],
      ASSIGNED: [],
      PERMIT_ISSUED: [],
      IN_PROGRESS: [],
      FIT_CERTIFIED: []
    };

    filteredTasks.forEach((t) => {
      const st: SectorWorkStatus =
        t.sector_status ||
        (t.status === 'IN_PROGRESS'
          ? 'IN_PROGRESS'
          : t.status === 'COMPLETED'
          ? 'FIT_CERTIFIED'
          : t.assigned_crew
          ? 'ASSIGNED'
          : 'REQUISITIONED');
      if (buckets[st]) {
        buckets[st].push(t);
      } else {
        buckets.REQUISITIONED.push(t);
      }
    });

    return buckets;
  }, [filteredTasks]);

  // Active cross-sector joint blocks
  const jointBlockTasks = useMemo(() => {
    return filteredTasks.filter(
      (t) => t.co_requisite_sectors && t.co_requisite_sectors.length > 0
    );
  }, [filteredTasks]);

  const stages: {
    id: SectorWorkStatus;
    title: string;
    sub: string;
    color: string;
    icon: any;
  }[] = [
    {
      id: 'REQUISITIONED',
      title: 'Requisitioned',
      sub: 'Awaiting Crew / Machinery',
      color: '#A1A1AA',
      icon: Clock
    },
    {
      id: 'ASSIGNED',
      title: 'Assigned',
      sub: 'Crew & Machine Dispatched',
      color: '#0070F3',
      icon: Users
    },
    {
      id: 'PERMIT_ISSUED',
      title: 'Permit Issued',
      sub: 'Traffic / Power Block Granted',
      color: '#F5A623',
      icon: FileCheck
    },
    {
      id: 'IN_PROGRESS',
      title: 'Work In Progress',
      sub: 'Live Track Occupation',
      color: '#E5484D',
      icon: AlertTriangle
    },
    {
      id: 'FIT_CERTIFIED',
      title: 'Track Fit Certified',
      sub: 'Speed Restored / Complete',
      color: '#30A46C',
      icon: CheckCircle2
    }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0070F3]/15 text-[#0070F3] border border-[#0070F3]/30">
              ADMIN CONTROL SYSTEM
            </span>
            <span className="text-xs font-mono text-[var(--fg-subtle)]">
              Operations & Sector Dispatch
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--fg)] mt-1">
            Sector Work & Task Assignment
          </h1>
          <p className="text-xs sm:text-sm text-[var(--fg-muted)] mt-0.5">
            Manage field working systems across{' '}
            <span className="font-semibold text-[#0070F3]">Engineering (Engg)</span>,{' '}
            <span className="font-semibold text-[#F5A623]">Traction Distribution (TRD)</span>, and{' '}
            <span className="font-semibold text-[#8E4EC6]">Signal & Telecom (S&T)</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filteredTasks.length > 0 && (
            <Button
              variant="primary"
              size="md"
              icon={<Wrench size={14} />}
              onClick={() => onOpenAssignModal(filteredTasks[0])}
            >
              Assign Next Task
            </Button>
          )}
        </div>
      </div>

      {/* 2. Three Sector Operation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Engineering (Engg) Card */}
        <div
          onClick={() => setSelectedSectorFilter(selectedSectorFilter === 'ENGINEERING' ? 'ALL' : 'ENGINEERING')}
          className={`p-4 rounded-[12px] border transition-all cursor-pointer relative overflow-hidden ${
            selectedSectorFilter === 'ENGINEERING'
              ? 'ring-2 ring-[#0070F3] bg-[#0070F3]/10 border-[#0070F3]'
              : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-[8px] bg-[#0070F3]/15 text-[#0070F3] flex items-center justify-center font-bold text-xs border border-[#0070F3]/30">
                ENG
              </span>
              <div>
                <h3 className="font-semibold text-sm text-[var(--fg)]">Engineering</h3>
                <span className="text-[11px] text-[var(--fg-subtle)] font-mono">Civil / Track / P-Way</span>
              </div>
            </div>
            <span className="text-xl font-bold font-mono text-[#0070F3]">
              {sectorCounts.engg}
            </span>
          </div>

          <p className="text-xs text-[var(--fg-muted)] mt-2.5 line-clamp-2">
            Rails, sleepers, tamping machines (CSM/BCM), USFD flaw testing, and bridge anchors.
          </p>

          <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-mono text-[var(--fg-subtle)]">
            <span>Primary: Traffic Block</span>
            <span className="text-[var(--fg)] font-semibold">5 Active Gangs</span>
          </div>
        </div>

        {/* TRD Card */}
        <div
          onClick={() => setSelectedSectorFilter(selectedSectorFilter === 'TRACTION_DISTRIBUTION' ? 'ALL' : 'TRACTION_DISTRIBUTION')}
          className={`p-4 rounded-[12px] border transition-all cursor-pointer relative overflow-hidden ${
            selectedSectorFilter === 'TRACTION_DISTRIBUTION'
              ? 'ring-2 ring-[#F5A623] bg-[#F5A623]/10 border-[#F5A623]'
              : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-[8px] bg-[#F5A623]/15 text-[#F5A623] flex items-center justify-center font-bold text-xs border border-[#F5A623]/30">
                TRD
              </span>
              <div>
                <h3 className="font-semibold text-sm text-[var(--fg)]">Traction Distribution</h3>
                <span className="text-[11px] text-[var(--fg-subtle)] font-mono">Electrical / 25kV OHE</span>
              </div>
            </div>
            <span className="text-xl font-bold font-mono text-[#F5A623]">
              {sectorCounts.trd}
            </span>
          </div>

          <p className="text-xs text-[var(--fg-muted)] mt-2.5 line-clamp-2">
            Overhead catenary & contact wire, droppers, neutral sections, and 8-Wheeler Tower Wagons.
          </p>

          <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-mono text-[var(--fg-subtle)]">
            <span>Primary: Power Block (PTW)</span>
            <span className="text-[var(--fg)] font-semibold">4 Tower Units</span>
          </div>
        </div>

        {/* S&T Card */}
        <div
          onClick={() => setSelectedSectorFilter(selectedSectorFilter === 'SIGNAL_TELECOMMUNICATION' ? 'ALL' : 'SIGNAL_TELECOMMUNICATION')}
          className={`p-4 rounded-[12px] border transition-all cursor-pointer relative overflow-hidden ${
            selectedSectorFilter === 'SIGNAL_TELECOMMUNICATION'
              ? 'ring-2 ring-[#8E4EC6] bg-[#8E4EC6]/10 border-[#8E4EC6]'
              : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-[8px] bg-[#8E4EC6]/15 text-[#8E4EC6] flex items-center justify-center font-bold text-xs border border-[#8E4EC6]/30">
                S&T
              </span>
              <div>
                <h3 className="font-semibold text-sm text-[var(--fg)]">Signal & Telecom</h3>
                <span className="text-[11px] text-[var(--fg-subtle)] font-mono">Electronic Interlocking</span>
              </div>
            </div>
            <span className="text-xl font-bold font-mono text-[#8E4EC6]">
              {sectorCounts.snt}
            </span>
          </div>

          <p className="text-xs text-[var(--fg-muted)] mt-2.5 line-clamp-2">
            Point machines, digital axle counters (SSDAC), track circuits, signals, and optic fiber lines.
          </p>

          <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-mono text-[var(--fg-subtle)]">
            <span>Primary: SI-420 Memo</span>
            <span className="text-[var(--fg)] font-semibold">4 Test Squads</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-3 rounded-[10px] bg-[var(--surface)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, assigned gangs, tower wagons, supervisors..."
            className="w-full h-8 px-3 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none focus:border-[#0070F3]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[var(--fg-subtle)] font-mono">Sector:</span>
          <select
            value={selectedSectorFilter}
            onChange={(e) => setSelectedSectorFilter(e.target.value as any)}
            className="h-8 px-2 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none"
          >
            <option value="ALL">All Sectors ({tasks.length})</option>
            <option value="ENGINEERING">Engineering ({sectorCounts.engg})</option>
            <option value="TRACTION_DISTRIBUTION">TRD ({sectorCounts.trd})</option>
            <option value="SIGNAL_TELECOMMUNICATION">Signal & Telecom ({sectorCounts.snt})</option>
          </select>

          <span className="text-[var(--fg-subtle)] font-mono ml-2">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none"
          >
            <option value="ALL">All Stages</option>
            <option value="REQUISITIONED">Requisitioned</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="PERMIT_ISSUED">Permit Issued</option>
            <option value="IN_PROGRESS">Live On Track</option>
            <option value="FIT_CERTIFIED">Track Fit Certified</option>
          </select>
        </div>
      </div>

      {/* 4. Cross-Sector Joint Block Callout (if any exist) */}
      {jointBlockTasks.length > 0 && (
        <div className="p-3.5 rounded-[10px] bg-[#F5A623]/10 border border-[#F5A623]/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F5A623]">
              <Sparkles size={15} />
              <span>Co-Requisite Cross-Sector Joint Blocks ({jointBlockTasks.length} Active)</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
              Integrated Multi-Disciplinary Blocks
            </span>
          </div>
          <p className="text-xs text-[var(--fg-muted)]">
            These tasks involve simultaneous presence of multiple sectors (e.g. Engg track renewal requires S&T bond wire disconnection and TRD bonding jumpers). The AI optimizer bundles them into single shadow windows to save train delay penalties.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
            {jointBlockTasks.map((jt) => (
              <div
                key={jt.id}
                onClick={() => onOpenAssignModal(jt)}
                className="p-2.5 rounded-[7px] bg-[var(--surface)] border border-[var(--border)] hover:border-[#F5A623] cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-[var(--fg)]">{jt.id}</span>
                  <LineBadge section={jt.section} variant="short" />
                </div>
                <div className="text-xs font-medium text-[var(--fg)] line-clamp-1">{jt.title}</div>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#0070F3]/15 text-[#0070F3]">
                    Lead: {jt.department.slice(0, 4)}
                  </span>
                  {jt.co_requisite_sectors?.map((cr) => (
                    <span key={cr} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F5A623]/15 text-[#F5A623]">
                      + {cr.slice(0, 4)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Pipeline Columns (5 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
        {stages.map((stage) => {
          const list = pipeline[stage.id] || [];
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-3 space-y-3 flex flex-col min-h-[380px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[var(--fg)] leading-tight">
                      {stage.title}
                    </h4>
                    <span className="text-[10px] text-[var(--fg-subtle)] font-mono block">
                      {stage.sub}
                    </span>
                  </div>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: `${stage.color}18`,
                    color: stage.color,
                    border: `1px solid ${stage.color}44`
                  }}
                >
                  {list.length}
                </span>
              </div>

              {/* Task Cards in Column */}
              <div className="space-y-2.5 flex-1">
                {list.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-3 rounded-[8px] border border-dashed border-[var(--border)] text-[var(--fg-subtle)] text-xs">
                    <span>No tasks in this stage</span>
                  </div>
                ) : (
                  list.map((task) => {
                    const sectorDef = SECTORS[task.department];
                    return (
                      <div
                        key={task.id}
                        className="p-3 rounded-[9px] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all space-y-2 shadow-xs text-left"
                      >
                        {/* Top Line: ID & Sector Code */}
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => onSelectTask(task)}
                            className="font-mono text-[11px] font-bold text-[var(--fg)] hover:text-[#0070F3] transition-colors"
                          >
                            {task.id}
                          </button>
                          <span
                            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase"
                            style={{
                              backgroundColor: sectorDef.badgeBg,
                              color: sectorDef.color,
                              border: `1px solid ${sectorDef.badgeBorder}`
                            }}
                          >
                            {sectorDef.code}
                          </span>
                        </div>

                        {/* Title & Section */}
                        <div
                          onClick={() => onSelectTask(task)}
                          className="cursor-pointer"
                        >
                          <h5 className="text-xs font-medium text-[var(--fg)] leading-snug line-clamp-2 hover:text-[#0070F3] transition-colors">
                            {task.title}
                          </h5>
                          <div className="mt-1 flex items-center gap-1">
                            <LineBadge section={task.section} variant="short" />
                            <span className="text-[10px] font-mono text-[var(--fg-subtle)] truncate max-w-[140px]">
                              {task.section.split('–')[0]}
                            </span>
                          </div>
                        </div>

                        {/* Crew & Machinery Badges */}
                        <div className="space-y-1 pt-1 border-t border-[var(--border)] text-[10px]">
                          {task.assigned_crew ? (
                            <div className="flex items-center gap-1.5 text-[var(--fg)] truncate">
                              <Users size={11} className="text-[#0070F3] shrink-0" />
                              <span className="truncate font-medium">{task.assigned_crew}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[#F5A623] italic">
                              <Users size={11} className="shrink-0" />
                              <span>Crew Unassigned</span>
                            </div>
                          )}

                          {task.assigned_equipment && (
                            <div className="flex items-center gap-1.5 text-[var(--fg-subtle)] truncate">
                              <Cpu size={11} className="text-[#F5A623] shrink-0" />
                              <span className="truncate">{task.assigned_equipment}</span>
                            </div>
                          )}

                          {task.supervisor && (
                            <div className="flex items-center gap-1.5 text-[var(--fg-subtle)] truncate">
                              <FileCheck size={11} className="text-[#8E4EC6] shrink-0" />
                              <span className="truncate">{task.supervisor}</span>
                            </div>
                          )}
                        </div>

                        {/* Safety Tags */}
                        {(task.speed_restriction || task.power_isolation || task.signal_disconnection) && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {task.speed_restriction && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30">
                                {task.speed_restriction}
                              </span>
                            )}
                            {task.power_isolation && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30">
                                25kV Isolated
                              </span>
                            )}
                            {task.signal_disconnection && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#8E4EC6]/15 text-[#8E4EC6] border border-[#8E4EC6]/30">
                                SI-420 Memo
                              </span>
                            )}
                          </div>
                        )}

                        {/* Card Actions: Assign button & Quick advance */}
                        <div className="pt-2 flex items-center justify-between gap-1 border-t border-[var(--border)]">
                          <button
                            type="button"
                            onClick={() => onOpenAssignModal(task)}
                            className="px-2 py-1 rounded-[5px] text-[10px] font-medium bg-[var(--surface-hover)] hover:bg-[var(--border)] text-[var(--fg)] transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Wrench size={10} />
                            <span>Assign</span>
                          </button>

                          {/* Quick Workflow Advance Button */}
                          {stage.id === 'REQUISITIONED' && (
                            <button
                              type="button"
                              onClick={() => updateSectorStatus(task.id, 'ASSIGNED', 'Quick-assigned by Admin')}
                              className="px-2 py-1 rounded-[5px] text-[10px] font-semibold bg-[#0070F3]/15 hover:bg-[#0070F3]/25 text-[#0070F3] transition-colors cursor-pointer"
                            >
                              Dispatch →
                            </button>
                          )}

                          {stage.id === 'ASSIGNED' && (
                            <button
                              type="button"
                              onClick={() => updateSectorStatus(task.id, 'PERMIT_ISSUED', 'Line block permit granted')}
                              className="px-2 py-1 rounded-[5px] text-[10px] font-semibold bg-[#F5A623]/15 hover:bg-[#F5A623]/25 text-[#F5A623] transition-colors cursor-pointer"
                            >
                              Grant Block →
                            </button>
                          )}

                          {stage.id === 'PERMIT_ISSUED' && (
                            <button
                              type="button"
                              onClick={() => updateSectorStatus(task.id, 'IN_PROGRESS', 'Work started on track')}
                              className="px-2 py-1 rounded-[5px] text-[10px] font-semibold bg-[#E5484D]/15 hover:bg-[#E5484D]/25 text-[#E5484D] transition-colors cursor-pointer"
                            >
                              Start Track Work →
                            </button>
                          )}

                          {stage.id === 'IN_PROGRESS' && (
                            <button
                              type="button"
                              onClick={() => updateSectorStatus(task.id, 'FIT_CERTIFIED', 'Track fit certificate signed')}
                              className="px-2 py-1 rounded-[5px] text-[10px] font-semibold bg-[#30A46C]/15 hover:bg-[#30A46C]/25 text-[#30A46C] transition-colors cursor-pointer"
                            >
                              Certify Fit ✓
                            </button>
                          )}

                          {stage.id === 'FIT_CERTIFIED' && (
                            <span className="text-[10px] font-mono text-[#30A46C] font-semibold flex items-center gap-0.5">
                              <CheckCircle2 size={12} /> Fit
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
