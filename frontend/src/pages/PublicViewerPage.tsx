import React, { useState, useMemo } from 'react';
import { useLine, matchesLine } from '../context/LineContext';
import { getLine } from '../data/lines';
import { MOCK_REGULATED_TRAINS } from '../data/trainStatusData';
import { LineBadge } from '../components/ui/LineBadge';
import { DepartmentChip } from '../components/ui/Badge';
import { SECTORS } from '../data/sectorData';
import {
  AlertTriangle,
  Clock,
  Train,
  MapPin,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  Info,
  CheckCircle2,
  PhoneCall,
  ExternalLink,
  Flame,
  Zap,
  Radio,
  Construction
} from 'lucide-react';

export const PublicViewerPage: React.FC = () => {
  const { selectedLine, tasks } = useLine();
  const [activeTab, setActiveTab] = useState<'works' | 'trains'>('trains');
  const [trainFilter, setTrainFilter] = useState<'ALL' | 'HELD_BACK' | 'DIVERTED' | 'SPEED_CAUTION' | 'LOCAL' | 'EXPRESS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const activeLine = getLine(selectedLine);

  // Filter ongoing/active works (tasks with IN_PROGRESS, SCHEDULED, or PERMIT_ISSUED)
  const activeWorks = useMemo(() => {
    return tasks.filter((t) => {
      if (!matchesLine(selectedLine, t.section)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.section.toLowerCase().includes(q) ||
          (t.assigned_crew && t.assigned_crew.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [tasks, selectedLine, searchQuery]);

  // Filter regulated trains
  const regulatedTrains = useMemo(() => {
    return MOCK_REGULATED_TRAINS.filter((tr) => {
      if (selectedLine !== 'all' && tr.lineId !== selectedLine) return false;
      if (trainFilter === 'HELD_BACK' && tr.impact_status !== 'HELD_BACK') return false;
      if (trainFilter === 'DIVERTED' && tr.impact_status !== 'DIVERTED') return false;
      if (trainFilter === 'SPEED_CAUTION' && tr.impact_status !== 'SPEED_CAUTION') return false;
      if (trainFilter === 'LOCAL' && tr.type !== 'Local') return false;
      if (trainFilter === 'EXPRESS' && tr.type !== 'Express') return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          tr.train_number.toLowerCase().includes(q) ||
          tr.name.toLowerCase().includes(q) ||
          tr.section.toLowerCase().includes(q) ||
          tr.current_location.toLowerCase().includes(q) ||
          tr.reason.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [selectedLine, trainFilter, searchQuery]);

  const heldBackCount = MOCK_REGULATED_TRAINS.filter((t) => t.impact_status === 'HELD_BACK').length;
  const divertedCount = MOCK_REGULATED_TRAINS.filter((t) => t.impact_status === 'DIVERTED').length;
  const cautionCount = MOCK_REGULATED_TRAINS.filter((t) => t.impact_status === 'SPEED_CAUTION').length;

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* 1. Public Portal Banner */}
      <div className="p-4 sm:p-5 rounded-[12px] bg-gradient-to-r from-blue-950/40 via-[var(--surface)] to-[var(--surface)] border border-[var(--border-strong)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
              LIVE PASSENGER & STATION BULLETIN
            </span>
            <span className="text-xs font-mono text-[var(--fg-subtle)]">
              · Official Railway Information
            </span>
          </div>
          <div className="text-[11px] font-mono text-[var(--fg-subtle)]">
            Corridor: <span className="text-[var(--fg)] font-semibold">{activeLine?.name || 'All Mumbai Suburban Corridors'}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--fg)]">
              Live Track Works & Regulated Trains
            </h1>
            <p className="text-xs sm:text-sm text-[var(--fg-muted)] mt-1 max-w-2xl">
              Real-time public visibility on track maintenance zones and trains held back, regulated, or diverted due to safety blocks across Mumbai Suburban Railway.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="px-3 py-2 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] text-center">
              <span className="block text-lg font-bold font-mono text-[#E5484D]">{heldBackCount}</span>
              <span className="text-[10px] font-mono text-[var(--fg-subtle)] uppercase">Held Back</span>
            </div>
            <div className="px-3 py-2 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] text-center">
              <span className="block text-lg font-bold font-mono text-[#F5A623]">{divertedCount}</span>
              <span className="text-[10px] font-mono text-[var(--fg-subtle)] uppercase">Diverted</span>
            </div>
            <div className="px-3 py-2 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] text-center">
              <span className="block text-lg font-bold font-mono text-[#0070F3]">{activeWorks.length}</span>
              <span className="text-[10px] font-mono text-[var(--fg-subtle)] uppercase">Work Zones</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Switcher (Where work is going on vs Trains held back) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-[8px] bg-[var(--surface)] border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setActiveTab('trains')}
            className={`px-4 py-2 rounded-[6px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'trains'
                ? 'bg-[#E5484D] text-white shadow-xs'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            <Train size={15} />
            <span>Trains Held Back & Regulated ({regulatedTrains.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('works')}
            className={`px-4 py-2 rounded-[6px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'works'
                ? 'bg-[#0070F3] text-white shadow-xs'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            <Construction size={15} />
            <span>Where Work is Going On ({activeWorks.length})</span>
          </button>
        </div>

        {/* Global Search inside viewer */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-2.5 text-[var(--fg-subtle)]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'trains'
                ? 'Search train no., name, station...'
                : 'Search section, gang, work...'
            }
            className="w-full h-9 pl-9 pr-3 rounded-[7px] bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none focus:border-[#0070F3]"
          />
        </div>
      </div>

      {/* TAB 1: TRAINS HELD BACK & REGULATED */}
      {activeTab === 'trains' && (
        <div className="space-y-4">
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[var(--fg-subtle)] font-mono text-[11px] mr-1">Filter by:</span>
            {[
              { id: 'ALL', label: `All Impacted (${MOCK_REGULATED_TRAINS.length})` },
              { id: 'HELD_BACK', label: `Held Back (${heldBackCount})` },
              { id: 'DIVERTED', label: `Diverted (${divertedCount})` },
              { id: 'SPEED_CAUTION', label: `Speed Caution (${cautionCount})` },
              { id: 'LOCAL', label: 'Suburban Locals' },
              { id: 'EXPRESS', label: 'Express / Mail' }
            ].map((f) => {
              const active = trainFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTrainFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-[6px] text-xs font-medium transition-colors cursor-pointer border ${
                    active
                      ? 'bg-[var(--fg)] text-[var(--bg)] border-transparent font-semibold'
                      : 'bg-[var(--surface)] border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Trains Cards List */}
          {regulatedTrains.length === 0 ? (
            <div className="p-12 text-center rounded-[12px] bg-[var(--surface)] border border-dashed border-[var(--border)] space-y-2">
              <CheckCircle2 size={32} className="text-[#30A46C] mx-auto" />
              <h3 className="text-sm font-semibold text-[var(--fg)]">No trains held back matching filter</h3>
              <p className="text-xs text-[var(--fg-muted)]">All trains on this line are running smoothly as per schedule.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regulatedTrains.map((train) => {
                const sectorDef = SECTORS[train.responsible_sector];
                const isHeld = train.impact_status === 'HELD_BACK';
                const isDiverted = train.impact_status === 'DIVERTED';

                return (
                  <div
                    key={train.id}
                    className="p-4 rounded-[12px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all space-y-3 relative overflow-hidden shadow-xs"
                    style={{
                      borderLeftWidth: '4px',
                      borderLeftColor: isHeld ? '#E5484D' : isDiverted ? '#F5A623' : '#0070F3'
                    }}
                  >
                    {/* Header: Train Number, Name & Type */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[var(--fg)]">
                            #{train.train_number}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--surface-hover)] text-[var(--fg-muted)] border border-[var(--border)]">
                            {train.type}
                          </span>
                          <LineBadge section={train.section} variant="short" />
                        </div>
                        <h3 className="text-sm font-semibold text-[var(--fg)] mt-1 leading-snug">
                          {train.name}
                        </h3>
                      </div>

                      {/* Delay Tag */}
                      <div className="text-right shrink-0">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30">
                          +{train.delay_minutes}m Late
                        </span>
                        <span className="block text-[10px] font-mono text-[var(--fg-subtle)] mt-0.5">
                          Sched: {train.scheduled_passing}
                        </span>
                      </div>
                    </div>

                    {/* Current Regulation Location */}
                    <div className="p-2.5 rounded-[7px] bg-[var(--bg)] border border-[var(--border)] space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-[var(--fg)]">
                        <MapPin size={13} className={isHeld ? 'text-[#E5484D]' : 'text-[#F5A623]'} />
                        <span>Status: {train.impact_badge}</span>
                      </div>
                      <p className="text-[11px] text-[var(--fg-muted)] pl-4">
                        Current Position: <strong className="text-[var(--fg)]">{train.current_location}</strong>
                      </p>
                    </div>

                    {/* Cause & Sector In-Charge */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-[var(--fg-subtle)] font-mono">
                        <span>Root Cause of Regulation:</span>
                        <span
                          className="px-1.5 py-0.2 rounded font-bold"
                          style={{ color: sectorDef.color }}
                        >
                          {sectorDef.shortName}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--fg)] leading-relaxed">
                        {train.reason}
                      </p>
                    </div>

                    {/* Passenger Advisory Note */}
                    <div className="p-2.5 rounded-[7px] bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
                      <div className="flex items-center gap-1 font-semibold text-blue-400 text-[11px]">
                        <Info size={12} />
                        <span>Passenger & Commuter Advisory</span>
                      </div>
                      <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed">
                        {train.passenger_advisory}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WHERE WORK IS GOING ON (ACTIVE WORK ZONES) */}
      {activeTab === 'works' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] pb-1">
            <span>Showing active block windows and ongoing track engineering works:</span>
            <span className="font-mono">{activeWorks.length} active locations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activeWorks.map((work) => {
              const sectorDef = SECTORS[work.department];
              const isLive = work.status === 'IN_PROGRESS' || work.sector_status === 'IN_PROGRESS';

              return (
                <div
                  key={work.id}
                  className="p-4 rounded-[12px] bg-[var(--surface)] border border-[var(--border)] space-y-3 text-left relative overflow-hidden"
                >
                  {/* Top Bar: Sector & Line */}
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: sectorDef.badgeBg,
                        color: sectorDef.color,
                        border: `1px solid ${sectorDef.badgeBorder}`
                      }}
                    >
                      {sectorDef.code} · {sectorDef.shortName}
                    </span>

                    {isLive ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#E5484D] px-2 py-0.5 rounded bg-[#E5484D]/15 border border-[#E5484D]/30 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D]" />
                        TRACK OCCUPIED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                        {work.assigned_slot || 'Pending Slot'}
                      </span>
                    )}
                  </div>

                  {/* Section & Title */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <LineBadge section={work.section} variant="full" />
                    </div>
                    <h4 className="text-sm font-semibold text-[var(--fg)] leading-snug line-clamp-2">
                      {work.title}
                    </h4>
                    <p className="text-xs text-[var(--fg-muted)] mt-1.5 line-clamp-2">
                      {work.description}
                    </p>
                  </div>

                  {/* Deployment Details */}
                  <div className="p-2.5 rounded-[7px] bg-[var(--bg)] border border-[var(--border)] text-[11px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-[var(--fg-muted)]">
                      <span>Gang / Crew:</span>
                      <span className="text-[var(--fg)] font-semibold">{work.assigned_crew || 'Sector Maintenance Unit'}</span>
                    </div>
                    {work.assigned_equipment && (
                      <div className="flex items-center justify-between text-[var(--fg-muted)]">
                        <span>Machinery:</span>
                        <span className="text-[var(--fg)]">{work.assigned_equipment}</span>
                      </div>
                    )}
                    {work.assigned_slot && (
                      <div className="flex items-center justify-between text-[var(--fg-muted)]">
                        <span>Time Window:</span>
                        <span className="text-[#0070F3] font-bold">{work.assigned_slot}</span>
                      </div>
                    )}
                  </div>

                  {/* Caution / Permit Tags */}
                  {(work.speed_restriction || work.power_isolation || work.signal_disconnection) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {work.speed_restriction && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30">
                          {work.speed_restriction}
                        </span>
                      )}
                      {work.power_isolation && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30">
                          25kV De-energized
                        </span>
                      )}
                      {work.signal_disconnection && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#8E4EC6]/15 text-[#8E4EC6] border border-[#8E4EC6]/30">
                          S&T SI-420 Notice
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Passenger Helpline & Information Notice */}
      <div className="p-4 rounded-[10px] bg-[var(--surface)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[var(--fg-muted)]">
          <PhoneCall size={16} className="text-[#0070F3]" />
          <span>
            For immediate passenger assistance, call Indian Railways Helpline: <strong className="text-[var(--fg)] font-mono">139</strong> (24x7 Toll-Free).
          </span>
        </div>
        <div className="text-[11px] font-mono text-[var(--fg-subtle)]">
          Mumbai Suburban Central Control Room
        </div>
      </div>
    </div>
  );
};
