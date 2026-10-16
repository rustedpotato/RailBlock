import React, { useState } from 'react';
import { Button } from '../components/ui/Buttons';
import { SeverityBadge } from '../components/ui/Badge';
import { LineBadge } from '../components/ui/LineBadge';
import { ConflictItem } from '../types/railblock';
import { AlertTriangle, Clock, CheckCircle2, ChevronRight, ShieldAlert } from 'lucide-react';

interface ConflictsViewProps {
  conflicts: ConflictItem[];
  selectedConflict: ConflictItem | null;
  onSelectConflict: (conflict: ConflictItem) => void;
  onApplyResolution: (conflictId: string, resolutionId: string) => void;
}

export const ConflictsView: React.FC<ConflictsViewProps> = ({
  conflicts,
  selectedConflict,
  onSelectConflict,
  onApplyResolution
}) => {
  const current = selectedConflict || conflicts[0];
  const [selectedResolutionId, setSelectedResolutionId] = useState<string>(
    current?.suggested_resolutions[0]?.id || ''
  );

  const overlapCount = conflicts.filter((c) => c.type === 'OVERLAP').length;
  const timetableCount = conflicts.filter((c) => c.type === 'TIMETABLE_CLASH').length;
  const deadlineCount = conflicts.filter((c) => c.type === 'DEADLINE_VIOLATION').length;

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--fg)]">
            Conflicts & Bottlenecks
          </h1>
          <p className="text-[13px] text-[var(--fg-muted)] mt-1 font-mono">
            Automated conflict detection across block requests and railway timetable
          </p>
        </div>

        {/* Summary Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-[6px] text-xs font-mono font-medium border bg-[#E5484D]/10 border-[#E5484D]/30 text-[#E5484D]">
            {overlapCount} Overlap
          </span>
          <span className="px-3 py-1 rounded-[6px] text-xs font-mono font-medium border bg-[#F5A623]/10 border-[#F5A623]/30 text-[#F5A623]">
            {timetableCount} Timetable Clash
          </span>
          <span className="px-3 py-1 rounded-[6px] text-xs font-mono font-medium border bg-[#0070F3]/10 border-[#0070F3]/30 text-[#0070F3]">
            {deadlineCount} Deadline Violation
          </span>
        </div>
      </div>

      {/* 2. Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List of Conflict Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {conflicts.map((conf) => {
            const isSelected = conf.id === current?.id;
            return (
              <div
                key={conf.id}
                onClick={() => {
                  onSelectConflict(conf);
                  setSelectedResolutionId(conf.suggested_resolutions[0]?.id || '');
                }}
                className={`p-4 rounded-[12px] border cursor-pointer transition-all space-y-2.5 ${
                  isSelected
                    ? 'bg-[var(--surface-hover)] border-[#0070F3] shadow-md ring-1 ring-[#0070F3]'
                    : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={conf.severity} />
                    <LineBadge section={conf.section} variant="short" />
                    <span className="font-mono text-xs font-medium text-[var(--fg-muted)]">
                      {conf.id}
                    </span>
                  </div>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                    conf.status === 'RESOLVED'
                      ? 'bg-[var(--success)]/15 text-[var(--success)]'
                      : 'bg-[var(--danger)]/15 text-[var(--danger)]'
                  }`}>
                    {conf.status}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-[var(--fg)] leading-snug">
                  {conf.title}
                </h4>

                <div className="flex items-center justify-between text-xs font-mono text-[var(--fg-subtle)] pt-1 border-t border-[var(--border)]">
                  <span className="truncate max-w-[200px]">{conf.section}</span>
                  <span>{conf.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Pane (7 cols) */}
        {current && (
          <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-6 space-y-6">
            <div className="space-y-1 pb-4 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LineBadge section={current.section} variant="full" />
                  <span className="font-mono text-xs text-[var(--fg-muted)]">
                    {current.id} · {current.type}
                  </span>
                </div>
                <SeverityBadge severity={current.severity} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--fg)]">
                {current.title}
              </h3>
              <p className="text-xs text-[var(--fg-muted)] leading-relaxed pt-1">
                {current.description}
              </p>
            </div>

            {/* Mini Timeline Highlighting Clash */}
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
                Clash Visualization
              </div>
              <div className="p-4 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] space-y-3">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[var(--fg)] font-semibold">{current.section}</span>
                  <span className="text-[var(--danger)] font-medium">{current.timeline_clash.timeSpan}</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2 rounded-[6px] bg-[#0070F3]/20 border border-[#0070F3]/40 text-[var(--fg)] flex items-center justify-between">
                    <span>{current.timeline_clash.taskA}</span>
                    <span className="text-[11px] text-[#0070F3]">Assigned</span>
                  </div>
                  {current.timeline_clash.taskB && (
                    <div className="p-2 rounded-[6px] bg-[#E5484D]/20 border border-[#E5484D]/40 text-[var(--fg)] flex items-center justify-between">
                      <span>{current.timeline_clash.taskB}</span>
                      <span className="text-[11px] text-[#E5484D]">Clashing Request</span>
                    </div>
                  )}
                  {current.timeline_clash.train && (
                    <div className="p-2 rounded-[6px] bg-[#F5A623]/20 border border-[#F5A623]/40 text-[var(--fg)] flex items-center justify-between">
                      <span>{current.timeline_clash.train}</span>
                      <span className="text-[11px] text-[#F5A623]">Timetable Conflict</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cause Explanation */}
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
                Root Cause Analysis
              </div>
              <p className="p-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg-muted)] leading-relaxed">
                {current.cause_explanation}
              </p>
            </div>

            {/* Three Suggested Resolutions as Radio Cards */}
            <div className="space-y-3">
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
                AI Suggested Resolutions
              </div>

              <div className="space-y-2.5">
                {current.suggested_resolutions.map((res) => {
                  const isChecked = selectedResolutionId === res.id;
                  return (
                    <div
                      key={res.id}
                      onClick={() => setSelectedResolutionId(res.id)}
                      className={`p-3.5 rounded-[8px] border cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'bg-[var(--surface-hover)] border-[#0070F3] ring-1 ring-[#0070F3]'
                          : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="resolution"
                        checked={isChecked}
                        onChange={() => setSelectedResolutionId(res.id)}
                        className="mt-1 accent-[#0070F3] cursor-pointer"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[var(--fg)]">
                            {res.title}
                          </span>
                          {res.isRecommended && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--success)]/15 text-[var(--success)]">
                              ★ Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--fg-muted)]">{res.details}</p>
                        <div className="text-[11px] font-mono text-[#0070F3] pt-0.5">
                          Impact: {res.impact}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                onClick={() => onApplyResolution(current.id, selectedResolutionId)}
                icon={<CheckCircle2 size={15} />}
              >
                Apply Resolution
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
