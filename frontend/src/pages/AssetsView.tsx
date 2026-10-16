import React, { useState } from 'react';
import { FilterPill } from '../components/ui/Controls';
import { StatusBadge } from '../components/ui/Badge';
import { LineBadge } from '../components/ui/LineBadge';
import { MOCK_ASSETS, SECTIONS } from '../data/mockData';
import { useLine, matchesLine } from '../context/LineContext';
import { LINES, getLine } from '../data/lines';

export const AssetsView: React.FC = () => {
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const { selectedLine } = useLine();
  const activeLine = getLine(selectedLine);

  const availableSections = selectedLine === 'all'
    ? SECTIONS
    : LINES.find((l) => l.id === selectedLine)?.sections ?? SECTIONS;

  const filteredAssets = MOCK_ASSETS.filter((a) => {
    if (!matchesLine(selectedLine, a.section)) return false;
    if (deptFilter !== 'ALL' && a.department !== deptFilter) return false;
    return true;
  });

  const days14 = Array.from({ length: 14 }, (_, i) => `D${i + 1}`);

  return (
    <div className="space-y-6">
      {/* 1. Header with Dept Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--fg)]">
            Assets & Availability
          </h1>
          <p className="text-[13px] text-[var(--fg-muted)] mt-1 font-mono">
            Critical infrastructure health monitoring across Mumbai suburban divisions
          </p>
        </div>

        <FilterPill
          label="Department"
          value={deptFilter}
          onChange={setDeptFilter}
          options={[
            { label: 'All Departments', value: 'ALL' },
            { label: 'Engineering (Track)', value: 'ENGINEERING' },
            { label: 'TRD (OHE Masts)', value: 'TRACTION_DISTRIBUTION' },
            { label: 'Signal & Telecom', value: 'SIGNAL_TELECOMMUNICATION' }
          ]}
        />
      </div>

      {/* 2. KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-[12px] bg-[var(--surface)] border border-[var(--border)]">
          <span className="text-[11px] font-mono uppercase text-[var(--fg-subtle)]">Tracked Assets</span>
          <div className="text-2xl font-mono font-medium text-[var(--fg)] mt-1">482</div>
          <span className="text-[11px] text-[var(--fg-muted)]">Across 6 divisions</span>
        </div>
        <div className="p-4 rounded-[12px] bg-[var(--surface)] border border-[var(--border)]">
          <span className="text-[11px] font-mono uppercase text-[var(--fg-subtle)]">Under Defect</span>
          <div className="text-2xl font-mono font-medium text-[var(--danger)] mt-1">18</div>
          <span className="text-[11px] text-[var(--danger)]/80">Require safety window</span>
        </div>
        <div className="p-4 rounded-[12px] bg-[var(--surface)] border border-[var(--border)]">
          <span className="text-[11px] font-mono uppercase text-[var(--fg-subtle)]">Planned Maintenance</span>
          <div className="text-2xl font-mono font-medium text-[var(--warning)] mt-1">34</div>
          <span className="text-[11px] text-[var(--fg-muted)]">In current week</span>
        </div>
        <div className="p-4 rounded-[12px] bg-[var(--surface)] border border-[var(--border)]">
          <span className="text-[11px] font-mono uppercase text-[var(--fg-subtle)]">Availability %</span>
          <div className="text-2xl font-mono font-medium text-[var(--success)] mt-1">96.4%</div>
          <span className="text-[11px] text-[var(--success)]/80">+3.3 pts improvement</span>
        </div>
      </div>

      {/* 3. Availability Heatmap (grid of 14 days by section) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]">
            14-Day Section Availability Heatmap
          </span>
          <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--fg-muted)]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[var(--success)]" /> Available (&gt;95%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[var(--warning)]" /> Partial Block (80-95%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[var(--danger)]" /> Mega Block / Outage
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--border)] text-[11px] font-mono text-[var(--fg-subtle)]">
                <th className="py-2 w-48">Section</th>
                {days14.map((d) => (
                  <th key={d} className="text-center py-2 px-1">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {availableSections.map((sec, sIdx) => (
                <tr key={sec} className="h-10 hover:bg-[var(--surface-hover)]">
                  <td className="font-mono text-xs font-medium text-[var(--fg)] truncate max-w-[220px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <LineBadge section={sec} variant="short" />
                      <span className="truncate">{sec}</span>
                    </div>
                  </td>
                  {days14.map((d, dIdx) => {
                    const status =
                      (sIdx + dIdx) % 7 === 0
                        ? 'danger'
                        : (sIdx + dIdx) % 3 === 0
                        ? 'warning'
                        : 'success';
                    const color =
                      status === 'danger'
                        ? 'bg-[var(--danger)]/80'
                        : status === 'warning'
                        ? 'bg-[var(--warning)]/80'
                        : 'bg-[var(--success)]/80';
                    return (
                      <td key={d} className="text-center p-1">
                        <div
                          className={`w-6 h-6 mx-auto rounded-[3px] ${color} transition-all hover:scale-110 cursor-pointer`}
                          title={`${sec} - ${d}: ${status}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Asset Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 space-y-3">
        <h3 className="text-[15px] font-semibold text-[var(--fg)]">
          Registered Railway Track & OHE Assets
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)] h-9">
                <th className="w-28 font-mono">Asset ID</th>
                <th>Asset Name</th>
                <th className="w-24">Type</th>
                <th className="w-40">Section</th>
                <th className="w-24 font-mono">KM Marker</th>
                <th className="w-24">Health</th>
                <th className="w-20 text-center">Defects</th>
                <th className="w-24 font-mono">Next Due</th>
                <th className="w-24 text-right pr-2">14d Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="h-12 hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="font-mono font-medium text-[#0070F3]">
                    <div className="flex items-center gap-1.5">
                      <LineBadge section={asset.section} variant="short" />
                      <span>{asset.id}</span>
                    </div>
                  </td>
                  <td className="font-medium text-[var(--fg)] truncate max-w-[220px]">
                    {asset.name}
                  </td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--surface-hover)] text-[var(--fg-muted)]">
                      {asset.type}
                    </span>
                  </td>
                  <td className="font-mono text-[var(--fg-muted)] truncate max-w-[160px]">
                    {asset.section}
                  </td>
                  <td className="font-mono text-[var(--fg-subtle)]">{asset.km_marker}</td>
                  <td>
                    <StatusBadge status={asset.health_status} />
                  </td>
                  <td className="text-center font-mono">
                    {asset.open_defects > 0 ? (
                      <span className="text-[var(--danger)] font-bold">{asset.open_defects}</span>
                    ) : (
                      <span className="text-[var(--fg-subtle)]">0</span>
                    )}
                  </td>
                  <td className="font-mono text-[var(--fg-muted)]">{asset.next_due}</td>
                  <td className="text-right pr-2">
                    <span className="font-mono text-[11px] text-[var(--success)]">
                      {asset.availability_sparkline[asset.availability_sparkline.length - 1]}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
