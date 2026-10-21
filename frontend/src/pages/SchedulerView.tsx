import React, { useState } from 'react';
import { Button } from '../components/ui/Buttons';
import { SegmentedControl } from '../components/ui/Controls';
import { LineBadge } from '../components/ui/LineBadge';
import { MaintenanceTaskItem } from '../types/railblock';
import { useLine, useLineData } from '../context/LineContext';
import { LINES, getLine } from '../data/lines';
import { Play, Save, Sliders, AlertTriangle, Clock, Layers } from 'lucide-react';

interface SchedulerViewProps {
  onSelectSlotTask: (task: MaintenanceTaskItem) => void;
  onRunOptimizer: () => void;
  solverStatus: 'Idle' | 'Solving' | 'Optimal' | 'Feasible';
}

export const SchedulerView: React.FC<SchedulerViewProps> = ({
  onSelectSlotTask,
  onRunOptimizer,
  solverStatus
}) => {
  const [zoom, setZoom] = useState<'day' | 'week' | 'month'>('day');
  const [respectTimetable, setRespectTimetable] = useState(true);
  const [allowNightOnly, setAllowNightOnly] = useState(true);
  const [maxCrews, setMaxCrews] = useState(6);
  const [timeLimit, setTimeLimit] = useState(30);
  const [objective, setObjective] = useState<'downtime' | 'priority'>('priority');
  const [engWeight, setEngWeight] = useState(35);
  const [trdWeight, setTrdWeight] = useState(35);
  const [stWeight, setStWeight] = useState(30);
  const { selectedLine } = useLine();
  const { tasks, SECTIONS } = useLineData();
  const activeLine = getLine(selectedLine);

  const availableSections = selectedLine === 'all'
    ? SECTIONS
    : LINES.find((l) => l.id === selectedLine)?.sections ?? SECTIONS;

  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  return (
    <div className="space-y-4">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--fg)]">
            Scheduler
          </h1>
          <span className={`px-2.5 py-0.5 rounded-[6px] text-xs font-mono font-medium border ${
            solverStatus === 'Optimal'
              ? 'bg-[var(--success)]/15 border-[var(--success)] text-[var(--success)]'
              : solverStatus === 'Solving'
              ? 'bg-[#0070F3]/15 border-[#0070F3] text-[#0070F3] animate-pulse'
              : 'bg-[var(--surface-hover)] border-[var(--border)] text-[var(--fg-muted)]'
          }`}>
            ● {solverStatus}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <SegmentedControl
            value={zoom}
            onChange={setZoom}
            options={[
              { label: 'Day', value: 'day' },
              { label: 'Week', value: 'week' },
              { label: 'Month', value: 'month' }
            ]}
          />
          <Button variant="secondary" icon={<Save size={14} />} onClick={() => alert('Plan saved as Draft candidate.')}>
            Save Plan
          </Button>
          <Button variant="primary" icon={<Play size={14} />} onClick={onRunOptimizer}>
            Run Optimizer
          </Button>
        </div>
      </div>

      {/* 2. Main Layout: Left Panel (320px) & Canvas */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Constraints Panel (320px) */}
        <div className="w-full lg:w-[320px] bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-4 space-y-5 shrink-0 text-xs">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
            <span className="font-semibold text-[var(--fg)] flex items-center gap-1.5">
              <Sliders size={14} className="text-[#0070F3]" /> Constraints & Solver Settings
            </span>
            <span className="font-mono text-[11px] text-[var(--fg-subtle)]">OR-Tools</span>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-[var(--fg)]">Respect Train Timetable</span>
              <input
                type="checkbox"
                checked={respectTimetable}
                onChange={(e) => setRespectTimetable(e.target.checked)}
                className="w-4 h-4 accent-[#0070F3] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-[var(--fg)]">Night Blocks Only (01:00-05:00)</span>
              <input
                type="checkbox"
                checked={allowNightOnly}
                onChange={(e) => setAllowNightOnly(e.target.checked)}
                className="w-4 h-4 accent-[#0070F3] cursor-pointer"
              />
            </label>

            <div className="flex items-center justify-between">
              <span className="text-[var(--fg)]">Max Concurrent Crews</span>
              <input
                type="number"
                min="1"
                max="12"
                value={maxCrews}
                onChange={(e) => setMaxCrews(Number(e.target.value))}
                className="w-16 h-7 px-2 rounded-[4px] bg-[var(--bg)] border border-[var(--border)] font-mono text-center text-[var(--fg)]"
              />
            </div>
          </div>

          {/* Objective Selector */}
          <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
            <span className="text-[var(--fg-subtle)] font-medium uppercase tracking-wider text-[11px]">
              Optimization Objective
            </span>
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value as any)}
              className="w-full h-8 px-2 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none"
            >
              <option value="priority">Maximize Scheduled Priority</option>
              <option value="downtime">Minimize Avoidable Downtime</option>
            </select>
          </div>

          {/* Department Weights Sliders */}
          <div className="space-y-3 pt-2 border-t border-[var(--border)]">
            <span className="text-[var(--fg-subtle)] font-medium uppercase tracking-wider text-[11px]">
              Department Priority Weights
            </span>

            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-[#0070F3]">Engineering</span>
                <span className="text-[var(--fg)]">{engWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={engWeight}
                onChange={(e) => setEngWeight(Number(e.target.value))}
                className="w-full h-1 accent-[#0070F3] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-[#F5A623]">TRD (OHE)</span>
                <span className="text-[var(--fg)]">{trdWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={trdWeight}
                onChange={(e) => setTrdWeight(Number(e.target.value))}
                className="w-full h-1 accent-[#F5A623] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-[#8E4EC6]">Signal & Telecom</span>
                <span className="text-[var(--fg)]">{stWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={stWeight}
                onChange={(e) => setStWeight(Number(e.target.value))}
                className="w-full h-1 accent-[#8E4EC6] cursor-pointer"
              />
            </div>
          </div>

          {/* Time Limit Input */}
          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-[var(--fg)]">Solver Time Limit</span>
            <div className="flex items-center gap-1 font-mono">
              <input
                type="number"
                min="5"
                max="300"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-14 h-7 px-2 rounded-[4px] bg-[var(--bg)] border border-[var(--border)] text-center text-[var(--fg)]"
              />
              <span className="text-[var(--fg-subtle)]">sec</span>
            </div>
          </div>
        </div>

        {/* Right Gantt Canvas */}
        <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-4 overflow-hidden w-full space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] pb-2 border-b border-[var(--border)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-[3px] bg-[#0070F3]" /> ENG
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-[3px] bg-[#F5A623]" /> TRD
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-[3px] bg-[#8E4EC6]" /> S&T
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 hatched-band rounded-[3px]" /> Block Window
              </span>
            </div>
            <div className="font-mono text-[11px] text-[var(--accent)] font-medium">
              Today: 20 Oct · Current Time 14:30 IST
            </div>
          </div>

          {/* Scrollable Gantt Body */}
          <div className="overflow-x-auto relative">
            <div className="min-w-[960px]">
              {/* Hours Header */}
              <div className="flex border-b border-[var(--border)] pb-1 mb-2 pl-44">
                {hours.map((h, i) => (
                  <div key={h} className="flex-1 text-center font-mono text-[10px] text-[var(--fg-subtle)]">
                    {i % 2 === 0 ? h : ''}
                  </div>
                ))}
              </div>

              {/* Sections Rows (48px per row) */}
              <div className="space-y-2 relative">
                {/* Red Today vertical line */}
                <div
                  className="absolute top-0 bottom-0 w-[1px] bg-[#0070F3] z-20 pointer-events-none"
                  style={{ left: 'calc(176px + ((100% - 176px) * 0.604))' }}
                >
                  <span className="absolute -top-4 -left-6 bg-[#0070F3] text-white text-[9px] font-mono px-1 rounded">
                    14:30
                  </span>
                </div>

                {availableSections.map((section, idx) => {
                  return (
                    <div key={section} className="flex items-center h-[48px] border-b border-[var(--border)]/60 relative">
                      {/* Section Label (Sticky left 176px) */}
                      <div className="w-44 flex items-center gap-1.5 text-xs font-mono font-medium text-[var(--fg)] truncate pr-2 shrink-0">
                        <LineBadge section={section} variant="short" />
                        <span className="truncate">{section}</span>
                      </div>

                      {/* Timeline track (hours 0-24) */}
                      <div className="flex-1 h-full relative flex items-center">
                        {/* Hatched block window band (01:30 - 05:30 = approx 6% to 23%) */}
                        <div
                          className="absolute h-9 rounded-[4px] hatched-band z-0"
                          style={{
                            left: idx % 2 === 0 ? '6.2%' : '8.3%',
                            width: idx % 2 === 0 ? '16.7%' : '12.5%'
                          }}
                          title="Authorized Block Window"
                        />

                        {/* Diagonal Train Path line representation */}
                        {idx === 0 && (
                          <div
                            className="absolute z-10 font-mono text-[9px] text-[#A1A1A1] border-b border-dashed border-[#A1A1A1]/60 px-1 transform -rotate-1 cursor-help"
                            style={{ left: '26%', top: '8px' }}
                            title="Train 12127 Mumbai-Pune Intercity passing 06:40"
                          >
                            ▲ 12127 (06:40)
                          </div>
                        )}

                        {/* Task bar */}
                        {idx === 0 && tasks[0] && (
                          <div
                            onClick={() => onSelectSlotTask(tasks[0])}
                            className="absolute h-[28px] rounded-[6px] bg-[#F5A623]/95 text-black font-semibold text-[11px] font-mono px-2 flex items-center justify-between cursor-pointer shadow-md hover:ring-2 hover:ring-white transition-all z-10"
                            style={{ left: '6.5%', width: '16%' }}
                          >
                            <span className="truncate">{tasks[0].id} ({tasks[0].title.slice(0, 18)}...)</span>
                            <span className="text-[#E5484D] text-[12px] font-bold ml-1" title="Conflict: Simultaneous Track Block">
                              ▲
                            </span>
                          </div>
                        )}

                        {idx === 1 && tasks[1] && (
                          <div
                            onClick={() => onSelectSlotTask(tasks[1])}
                            className="absolute h-[28px] rounded-[6px] bg-[#0070F3]/95 text-white font-medium text-[11px] font-mono px-2 flex items-center justify-between cursor-pointer shadow-md hover:ring-2 hover:ring-white transition-all z-10"
                            style={{ left: '8.5%', width: '12%' }}
                          >
                            <span className="truncate">{tasks[1].id} ({tasks[1].title.slice(0, 18)}...)</span>
                          </div>
                        )}

                        {idx === 2 && tasks[2] && (
                          <div
                            onClick={() => onSelectSlotTask(tasks[2])}
                            className="absolute h-[28px] rounded-[6px] bg-[#8E4EC6]/95 text-white font-medium text-[11px] font-mono px-2 flex items-center justify-between cursor-pointer shadow-md hover:ring-2 hover:ring-white transition-all z-10"
                            style={{ left: '2.1%', width: '8.3%' }}
                          >
                            <span className="truncate">{tasks[2].id} ({tasks[2].title.slice(0, 18)}...)</span>
                          </div>
                        )}

                        {idx === 4 && tasks[3] && (
                          <div
                            onClick={() => onSelectSlotTask(tasks[3])}
                            className="absolute h-[28px] rounded-[6px] bg-[#0070F3]/95 text-white font-medium text-[11px] font-mono px-2 flex items-center justify-between cursor-pointer shadow-md hover:ring-2 hover:ring-white transition-all z-10"
                            style={{ left: '45.8%', width: '20.8%' }}
                          >
                            <span className="truncate">{tasks[3].id} ({tasks[3].title.slice(0, 18)}...)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Docked Unscheduled Tasks Tray */}
          <div className="pt-3 border-t border-[var(--border)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)] flex items-center gap-1.5">
                <Layers size={13} className="text-[var(--warning)]" /> Docked Unscheduled Tasks Tray (3)
              </span>
              <span className="text-[11px] text-[var(--fg-subtle)] font-mono">
                Click to inspect constraints & suggestions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {tasks.slice(4, 7).map((task: MaintenanceTaskItem) => (
                <div
                  key={task.id}
                  onClick={() => onSelectSlotTask(task)}
                  className="p-2.5 rounded-[6px] bg-[var(--bg)] border border-dashed border-[var(--border)] hover:border-[var(--border-strong)] cursor-pointer text-xs space-y-1 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium text-[var(--fg)]">{task.id}</span>
                    <span className="text-[10px] text-[var(--warning)]">Unallocated</span>
                  </div>
                  <div className="text-[var(--fg-muted)] truncate">{task.title}</div>
                  <div className="text-[10px] font-mono text-[var(--fg-subtle)]">{task.section} · {task.duration_minutes}m</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
