import React, { useState } from 'react';
import { TabNav, Input } from '../components/ui/Controls';
import { Button } from '../components/ui/Buttons';
import { LineBadge } from '../components/ui/LineBadge';
import { MOCK_BLOCK_WINDOWS, MOCK_TRAINS } from '../data/mockData';
import { useLine, matchesLine } from '../context/LineContext';
import { BlockWindowItem, TrainScheduleItem } from '../types/railblock';
import { Plus, Search, Clock, Train, Sliders, Calendar } from 'lucide-react';

export const BlocksTimetableView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'windows' | 'timetable'>('windows');
  const [searchTrain, setSearchTrain] = useState('');
  const [showDiagram, setShowDiagram] = useState(false);
  const [windows, setWindows] = useState<BlockWindowItem[]>(MOCK_BLOCK_WINDOWS);
  const { selectedLine } = useLine();

  const filteredWindows = windows.filter((w) => matchesLine(selectedLine, w.section));

  const filteredTrains = MOCK_TRAINS.filter(
    (t) =>
      matchesLine(selectedLine, t.section) &&
      (t.train_number.includes(searchTrain) ||
        t.name.toLowerCase().includes(searchTrain.toLowerCase()) ||
        t.section.toLowerCase().includes(searchTrain.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--fg)]">
            Blocks & Timetable
          </h1>
          <p className="text-[13px] text-[var(--fg-muted)] mt-1 font-mono">
            Possession window capacities and scheduled train paths across Mumbai division
          </p>
        </div>

        {activeTab === 'windows' && (
          <Button
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => {
              const newWindow: BlockWindowItem = {
                id: `BW-${Math.floor(110 + Math.random() * 90)}`,
                section: 'Kalyan – Kasara Up',
                start_time: '02:00',
                end_time: '05:00',
                date: '2026-10-23',
                type: 'NIGHT',
                capacity_minutes: 180,
                utilized_minutes: 0,
                allocated_tasks_count: 0
              };
              setWindows([newWindow, ...windows]);
              alert(`Added new block window: ${newWindow.id}`);
            }}
          >
            Add Window
          </Button>
        )}
      </div>

      {/* 2. Tabs */}
      <TabNav
        tabs={[
          { id: 'windows', label: 'Authorized Block Windows' },
          { id: 'timetable', label: 'Train Timetable & Stringlines' }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab 1: Block Windows */}
      {activeTab === 'windows' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]">
              Scheduled Maintenance Possession Windows ({windows.length})
            </span>
            <span className="text-xs font-mono text-[var(--fg-muted)]">
              Hatched bands represent track possessions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[11px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] h-9">
                  <th className="w-24">Window ID</th>
                  <th>Section</th>
                  <th className="w-24">Type</th>
                  <th className="w-24 font-mono">Date</th>
                  <th className="w-32 font-mono">Time Span</th>
                  <th className="w-44">Capacity Utilization</th>
                  <th className="w-28 text-right pr-2">Allocated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredWindows.map((win) => {
                  const utilPct = Math.round((win.utilized_minutes / win.capacity_minutes) * 100);
                  return (
                    <tr key={win.id} className="h-12 hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="font-mono font-medium text-[#0070F3]">
                        <div className="flex items-center gap-1.5">
                          <LineBadge section={win.section} variant="short" />
                          <span>{win.id}</span>
                        </div>
                      </td>
                      <td className="font-medium text-[var(--fg)]">{win.section}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                          win.type === 'MEGA'
                            ? 'bg-[#E5484D]/15 text-[#E5484D]'
                            : win.type === 'NIGHT'
                            ? 'bg-[#0070F3]/15 text-[#0070F3]'
                            : 'bg-[#F5A623]/15 text-[#F5A623]'
                        }`}>
                          {win.type}
                        </span>
                      </td>
                      <td className="font-mono text-[var(--fg-muted)]">{win.date}</td>
                      <td className="font-mono text-[var(--fg)]">
                        {win.start_time} – {win.end_time}
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-[var(--fg-muted)]">{win.utilized_minutes} / {win.capacity_minutes}m</span>
                            <span className="text-[var(--fg)] font-semibold">{utilPct}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                            <div
                              className="h-full bg-[var(--fg)] rounded-full"
                              style={{ width: `${utilPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="text-right pr-2 font-mono text-[var(--fg-muted)]">
                        {win.allocated_tasks_count} tasks
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Train Timetable & Stringline Diagram */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="w-full sm:w-80">
              <Input
                icon={<Search size={14} />}
                placeholder="Search train number, name, section..."
                value={searchTrain}
                onChange={(e) => setSearchTrain(e.target.value)}
              />
            </div>
            <Button
              variant={showDiagram ? 'primary' : 'secondary'}
              onClick={() => setShowDiagram(!showDiagram)}
            >
              {showDiagram ? 'Show Table View' : 'Toggle Time-Distance Diagram'}
            </Button>
          </div>

          {showDiagram ? (
            /* Time-Distance Stringline Diagram Canvas */
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]">
                  Time-Distance Stringline Trajectory (Central Railway Suburban)
                </span>
                <span className="text-xs font-mono text-[var(--fg-muted)]">
                  X-Axis: Time (00:00 - 12:00) · Y-Axis: Distance (CSMT to Kasara 121 km)
                </span>
              </div>

              <div className="h-72 border border-[var(--border)] rounded-[8px] bg-[var(--bg)] p-4 relative overflow-hidden flex flex-col justify-between">
                <div className="flex justify-between text-[10px] font-mono text-[var(--fg-subtle)] border-b border-[var(--border)] pb-1">
                  <span>00:00</span>
                  <span>02:00</span>
                  <span>04:00 (Maintenance Curfew)</span>
                  <span>06:00 (Peak Begins)</span>
                  <span>08:00</span>
                  <span>10:00</span>
                  <span>12:00</span>
                </div>

                {/* SVG Diagonal Stringlines */}
                <svg className="w-full h-full overflow-visible">
                  {/* Train 12127 Intercity */}
                  <line x1="45%" y1="100%" x2="58%" y2="0%" stroke="#0070F3" strokeWidth="2" strokeDasharray="3 3" />
                  <text x="49%" y="45%" fill="#0070F3" fontSize="10" fontFamily="monospace">
                    12127 Intercity (06:40)
                  </text>

                  {/* Freight 59441 */}
                  <line x1="15%" y1="10%" x2="35%" y2="90%" stroke="#F5A623" strokeWidth="2" />
                  <text x="22%" y="60%" fill="#F5A623" fontSize="10" fontFamily="monospace">
                    59441 Container (02:15)
                  </text>

                  {/* Suburban Local 96312 */}
                  <line x1="55%" y1="90%" x2="70%" y2="10%" stroke="#EDEDED" strokeWidth="1.5" />
                  <text x="60%" y="75%" fill="#A1A1A1" fontSize="10" fontFamily="monospace">
                    96312 Kasara Local
                  </text>

                  {/* Maintenance curfew shaded rectangle */}
                  <rect x="8%" y="0" width="28%" height="100%" fill="rgba(255, 255, 255, 0.03)" />
                </svg>

                <div className="text-[11px] font-mono text-[var(--fg-subtle)] text-right">
                  Shaded region: 01:00 – 04:30 Suburban Traffic Curfew Block
                </div>
              </div>
            </div>
          ) : (
            /* Searchable Train Table */
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[11px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] h-9">
                      <th className="w-24">Train No.</th>
                      <th>Train Name</th>
                      <th className="w-24">Type</th>
                      <th className="w-48">Section</th>
                      <th className="w-32 font-mono">Passing Time</th>
                      <th className="w-24 text-right pr-2 font-mono">Priority Class</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredTrains.map((tr) => (
                      <tr key={tr.train_number} className="h-12 hover:bg-[var(--surface-hover)] transition-colors">
                        <td className="font-mono font-semibold text-[#0070F3]">
                          <div className="flex items-center gap-1.5">
                            <LineBadge section={tr.section} variant="short" />
                            <span>{tr.train_number}</span>
                          </div>
                        </td>
                        <td className="font-medium text-[var(--fg)]">{tr.name}</td>
                        <td>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--surface-hover)] text-[var(--fg-muted)]">
                            {tr.type}
                          </span>
                        </td>
                        <td className="font-mono text-[var(--fg-muted)]">{tr.section}</td>
                        <td className="font-mono text-[var(--fg)]">{tr.scheduled_passing} IST</td>
                        <td className="text-right pr-2 font-mono text-[var(--fg-subtle)]">
                          Class {tr.priority_class}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
