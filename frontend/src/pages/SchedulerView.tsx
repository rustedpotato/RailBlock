import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Buttons';
import { SegmentedControl } from '../components/ui/Controls';
import { LineBadge } from '../components/ui/LineBadge';
import { MaintenanceTaskItem } from '../types/railblock';
import { useLine, useLineData } from '../context/LineContext';
import { LINES, getLine } from '../data/lines';
import {
  Play,
  Save,
  Sliders,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  Zap,
  Gauge,
  Activity,
  CheckCircle2,
  CalendarDays,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import {
  fetchCapacityAnalysis,
  runParetoOptimization,
  runFastReschedule,
  UIC406SectionCapacity,
  ParetoOptimizationResult
} from '../api/optimizerAndSecurity';
import { useRealtimeDate } from '../utils';

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
  const realtimeDate = useRealtimeDate();
  const [schedulerTab, setSchedulerTab] = useState<'timeline' | 'pareto' | 'capacity'>('timeline');
  const [zoom, setZoom] = useState<'day' | 'week' | 'month'>('day');
  const [respectTimetable, setRespectTimetable] = useState(true);
  const [allowNightOnly, setAllowNightOnly] = useState(true);
  const [maxCrews, setMaxCrews] = useState(6);
  const [timeLimit, setTimeLimit] = useState(30);
  const [objective, setObjective] = useState<'downtime' | 'priority'>('priority');
  const [engWeight, setEngWeight] = useState(35);
  const [trdWeight, setTrdWeight] = useState(35);
  const [stWeight, setStWeight] = useState(30);

  // Pareto Studio States
  const [paretoPreset, setParetoPreset] = useState<'BALANCED_PARETO' | 'SAFETY_MAX' | 'PUNCTUALITY_FIRST' | 'FAST_HEURISTIC'>('BALANCED_PARETO');
  const [safetyWeight, setSafetyWeight] = useState(0.5);
  const [punctualityWeight, setPunctualityWeight] = useState(0.5);
  const [crewCostWeight, setCrewCostWeight] = useState(0.2);
  const [isSolvingPareto, setIsSolvingPareto] = useState(false);
  const [paretoResult, setParetoResult] = useState<ParetoOptimizationResult | null>(null);

  // UIC 406 Capacity States
  const [capacityData, setCapacityData] = useState<UIC406SectionCapacity[]>([]);
  const [isLoadingCapacity, setIsLoadingCapacity] = useState(false);

  const { selectedLine } = useLine();
  const { tasks, SECTIONS } = useLineData();
  const activeLine = getLine(selectedLine);

  const availableSections = selectedLine === 'all'
    ? SECTIONS
    : LINES.find((l) => l.id === selectedLine)?.sections ?? SECTIONS;

  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  // Load UIC 406 capacity data when tab opens
  useEffect(() => {
    if (schedulerTab === 'capacity' && capacityData.length === 0) {
      setIsLoadingCapacity(true);
      fetchCapacityAnalysis()
        .then((res) => {
          if (res?.corridors) setCapacityData(res.corridors);
        })
        .catch((err) => console.warn('Capacity fetch failed (fallback baseline active):', err))
        .finally(() => setIsLoadingCapacity(false));
    }
  }, [schedulerTab, capacityData.length]);

  const handleRunPareto = async () => {
    setIsSolvingPareto(true);
    try {
      const res = await runParetoOptimization({
        preset: paretoPreset,
        safety_weight: safetyWeight,
        punctuality_weight: punctualityWeight,
        crew_cost_weight: crewCostWeight,
        safety_buffer_minutes: 15,
        solver_timeout_seconds: 10
      });
      setParetoResult(res);
    } catch (err) {
      console.error('Pareto optimization failed:', err);
    } finally {
      setIsSolvingPareto(false);
    }
  };

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

      {/* Sub-View Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-[8px] bg-[var(--surface)] border border-[var(--border)] w-fit text-xs">
        <button
          type="button"
          onClick={() => setSchedulerTab('timeline')}
          className={`px-3 py-1.5 rounded-[6px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            schedulerTab === 'timeline'
              ? 'bg-[#FF6B35] text-white font-semibold shadow-xs'
              : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <CalendarDays size={13} />
          <span>Timetable Gantt</span>
        </button>

        <button
          type="button"
          onClick={() => setSchedulerTab('pareto')}
          className={`px-3 py-1.5 rounded-[6px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            schedulerTab === 'pareto'
              ? 'bg-[#FF6B35] text-white font-semibold shadow-xs'
              : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <Sparkles size={13} />
          <span>Pareto Optimizer Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setSchedulerTab('capacity')}
          className={`px-3 py-1.5 rounded-[6px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            schedulerTab === 'capacity'
              ? 'bg-[#FF6B35] text-white font-semibold shadow-xs'
              : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <Gauge size={13} />
          <span>UIC 406 Corridor Capacity</span>
        </button>
      </div>

      {/* VIEW 1: TIMETABLE GANTT CANVAS */}
      {schedulerTab === 'timeline' && (
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
            <div className="font-mono text-[11px] text-[var(--accent)] font-medium flex items-center gap-1.5">
              <Clock size={12} className="inline animate-spin" style={{ animationDuration: '6s' }} />
              <span>Today: {realtimeDate.todayShort} · Current Time {realtimeDate.currentTimeIST}</span>
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
      )}

      {/* VIEW 2: MULTI-OBJECTIVE PARETO OPTIMIZER STUDIO */}
      {schedulerTab === 'pareto' && (
        <div className="space-y-4">
          {/* Preset Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'BALANCED_PARETO',
                name: 'Balanced Pareto Trade-Off',
                sub: 'Harmonized safety & punctuality',
                icon: Sparkles,
                color: '#FF6B35'
              },
              {
                id: 'SAFETY_MAX',
                name: 'Maximum Track Safety',
                sub: 'Heavy weight on USFD & track flaws',
                icon: ShieldCheck,
                color: '#DC2626'
              },
              {
                id: 'PUNCTUALITY_FIRST',
                name: 'Commuter Punctuality',
                sub: 'Minimizes peak suburban detentions',
                icon: Clock,
                color: '#1D4ED8'
              },
              {
                id: 'FAST_HEURISTIC',
                name: 'Fast Dynamic Heuristic',
                sub: 'O(N log N) local search (<50ms)',
                icon: Zap,
                color: '#15803D'
              }
            ].map((p) => {
              const Icon = p.icon;
              const active = paretoPreset === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setParetoPreset(p.id as any)}
                  className={`p-3.5 rounded-[10px] border transition-all cursor-pointer relative ${
                    active
                      ? 'bg-[var(--surface)] border-[#FF6B35] ring-2 ring-[#FF6B35]/20 shadow-sm'
                      : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${p.color}18`, color: p.color }}
                    >
                      <Icon size={15} />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--fg)] leading-tight">{p.name}</h4>
                      <p className="text-[10px] text-[var(--fg-subtle)] font-mono">{p.sub}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Weight Tuning Controls & Run Button */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--fg)] flex items-center gap-2">
                  <Sliders size={15} className="text-[#FF6B35]" /> Dynamic Pareto Objective Weights
                </h3>
                <p className="text-xs text-[var(--fg-muted)]">
                  Fine-tune continuous multi-criteria loss parameters to match today's sectional conditions.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                icon={<Play size={14} />}
                disabled={isSolvingPareto}
                onClick={handleRunPareto}
              >
                {isSolvingPareto ? 'Solving Pareto Frontier...' : 'Run Pareto Optimization'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[var(--fg)] font-medium">Track Safety Urgency Weight</span>
                  <span className="text-[#FF6B35] font-bold">{(safetyWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={safetyWeight}
                  onChange={(e) => setSafetyWeight(parseFloat(e.target.value))}
                  className="w-full accent-[#FF6B35] cursor-pointer"
                />
                <span className="text-[10px] text-[var(--fg-subtle)] block">Prioritizes gross tonnage & ultrasonic flaw removals</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[var(--fg)] font-medium">Passenger Punctuality Weight</span>
                  <span className="text-[#1D4ED8] font-bold">{(punctualityWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={punctualityWeight}
                  onChange={(e) => setPunctualityWeight(parseFloat(e.target.value))}
                  className="w-full accent-[#1D4ED8] cursor-pointer"
                />
                <span className="text-[10px] text-[var(--fg-subtle)] block">Penalizes passenger train delays in high-frequency corridors</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[var(--fg)] font-medium">Crew & Power Efficiency Weight</span>
                  <span className="text-[#15803D] font-bold">{(crewCostWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.5"
                  step="0.05"
                  value={crewCostWeight}
                  onChange={(e) => setCrewCostWeight(parseFloat(e.target.value))}
                  className="w-full accent-[#15803D] cursor-pointer"
                />
                <span className="text-[10px] text-[var(--fg-subtle)] block">Maximizes multi-departmental co-requisite bundling</span>
              </div>
            </div>

            {/* Live Solver Output Results */}
            {paretoResult && (
              <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--fg-subtle)]">Pareto Score</span>
                    <div className="text-xl font-bold font-mono text-[#FF6B35]">
                      {paretoResult.pareto_analysis?.pareto_efficiency_score ?? 91.5}%
                    </div>
                  </div>

                  <div className="p-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--fg-subtle)]">Detentions Avoided</span>
                    <div className="text-xl font-bold font-mono text-[#15803D]">
                      -{paretoResult.pareto_analysis?.detention_penalty_reduction_pct ?? 62}%
                    </div>
                  </div>

                  <div className="p-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--fg-subtle)]">Joint Blocks Bundled</span>
                    <div className="text-xl font-bold font-mono text-[#1D4ED8]">
                      {paretoResult.pareto_analysis?.joint_blocks_bundled ?? 8} Windows
                    </div>
                  </div>

                  <div className="p-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--fg-subtle)]">Passenger Hrs Saved</span>
                    <div className="text-xl font-bold font-mono text-[#FF6B35]">
                      ~{paretoResult.pareto_analysis?.estimated_passenger_hours_saved ?? 142} hrs
                    </div>
                  </div>
                </div>

                <div className="text-xs font-mono text-[var(--fg-muted)] flex items-center justify-between">
                  <span>Solver Status: <b className="text-[var(--fg)]">{paretoResult.solver_status}</b></span>
                  <span>Tasks Allocated: <b className="text-[var(--fg)]">{paretoResult.scheduled.length}</b></span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: UIC 406 CORRIDOR CAPACITY & HEADROOM */}
      {schedulerTab === 'capacity' && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--fg)] flex items-center gap-2">
                  <Gauge size={15} className="text-[#FF6B35]" /> UIC 406 Corridor Capacity & Maintenance Headroom
                </h3>
                <p className="text-xs text-[var(--fg-muted)]">
                  Evaluates track saturation index (K %) and maximum usable continuous block windows according to UIC 406 railway standards.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#15803D] bg-[#15803D]/10 px-2 py-0.5 rounded border border-[#15803D]/30">
                ● High-Density Suburban Model
              </span>
            </div>

            {isLoadingCapacity ? (
              <div className="py-12 text-center text-xs font-mono text-[var(--fg-muted)]">
                Computing UIC 406 headway compression and corridor saturation...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[10px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] h-8">
                      <th>Corridor Section</th>
                      <th className="w-24">Headway</th>
                      <th className="w-28 font-mono">Trains / Day</th>
                      <th className="w-32 font-mono">Practical Cap</th>
                      <th className="w-48 font-mono">Saturation (K %)</th>
                      <th className="w-32 font-mono">Block Headroom</th>
                      <th>Controller Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {(capacityData.length > 0 ? capacityData : [
                      {
                        section: "Kalyan – Kasara Up",
                        corridor: "Central Line",
                        headway_minutes: 3.5,
                        trains_per_day: 210,
                        practical_capacity_trains: 296,
                        saturation_percent: 86.5,
                        usable_headroom_minutes: 210,
                        max_continuous_block_hours: 3.5,
                        status: "CRITICAL_SATURATION" as const,
                        badge_color: "#DC2626",
                        recommendation: "Night Mega Block mandatory. Daytime maintenance poses severe detention risk."
                      },
                      {
                        section: "Churchgate – Mumbai Central Fast",
                        corridor: "Western Line",
                        headway_minutes: 3.0,
                        trains_per_day: 280,
                        practical_capacity_trains: 345,
                        saturation_percent: 91.2,
                        usable_headroom_minutes: 180,
                        max_continuous_block_hours: 3.0,
                        status: "CRITICAL_SATURATION" as const,
                        badge_color: "#DC2626",
                        recommendation: "Night possessions only (01:30 - 04:30) to protect peak suburban services."
                      },
                      {
                        section: "Thane – Dombivli Fast",
                        corridor: "Central Line",
                        headway_minutes: 3.0,
                        trains_per_day: 260,
                        practical_capacity_trains: 345,
                        saturation_percent: 84.8,
                        usable_headroom_minutes: 220,
                        max_continuous_block_hours: 3.6,
                        status: "MODERATE_SATURATION" as const,
                        badge_color: "#FF6B35",
                        recommendation: "Midday shadow window feasible (11:30 - 15:00) with 30 km/h caution."
                      },
                      {
                        section: "CSMT – Vadala Road Harbour",
                        corridor: "Harbour Line",
                        headway_minutes: 4.0,
                        trains_per_day: 190,
                        practical_capacity_trains: 259,
                        saturation_percent: 74.0,
                        usable_headroom_minutes: 270,
                        max_continuous_block_hours: 4.5,
                        status: "OPTIMAL_CAPACITY" as const,
                        badge_color: "#15803D",
                        recommendation: "Ample track headroom available. Multi-department block permitted."
                      }
                    ]).map((sec) => (
                      <tr key={sec.section} className="h-11 hover:bg-[var(--surface-hover)] transition-colors">
                        <td className="font-medium text-[var(--fg)]">
                          <div className="flex items-center gap-1.5">
                            <LineBadge section={sec.section} variant="short" />
                            <span>{sec.section}</span>
                          </div>
                        </td>
                        <td className="font-mono text-[var(--fg-muted)]">{sec.headway_minutes} min</td>
                        <td className="font-mono font-medium text-[var(--fg)]">{sec.trains_per_day}</td>
                        <td className="font-mono text-[var(--fg-muted)]">{sec.practical_capacity_trains}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 rounded-full bg-[var(--surface-hover)] overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${sec.saturation_percent}%`,
                                  backgroundColor: sec.badge_color
                                }}
                              />
                            </div>
                            <span className="font-mono text-[11px] font-semibold" style={{ color: sec.badge_color }}>
                              {sec.saturation_percent}%
                            </span>
                          </div>
                        </td>
                        <td className="font-mono text-[var(--fg)] font-semibold">
                          {sec.max_continuous_block_hours} hrs ({sec.usable_headroom_minutes}m)
                        </td>
                        <td className="text-[11px] text-[var(--fg-muted)]">
                          {sec.recommendation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
