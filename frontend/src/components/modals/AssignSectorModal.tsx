import React, { useState, useEffect } from 'react';
import { MaintenanceTaskItem, Department, SectorWorkStatus } from '../../types/railblock';
import { SECTORS, SECTOR_CREWS, SECTOR_MACHINERY, SECTOR_SUPERVISORS } from '../../data/sectorData';
import { Button } from '../ui/Buttons';
import { LineBadge } from '../ui/LineBadge';
import { Check, Shield, AlertTriangle, Wrench, Clock, Users, Cpu, FileCheck } from 'lucide-react';

interface AssignSectorModalProps {
  task: MaintenanceTaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, assignment: {
    department: Department;
    assigned_crew: string;
    assigned_equipment: string;
    supervisor: string;
    sector_status: SectorWorkStatus;
    assigned_slot?: string;
    safety_protocol?: string;
    speed_restriction?: string;
    power_isolation?: string;
    signal_disconnection?: string;
    co_requisite_sectors?: Department[];
    note?: string;
  }) => void;
}

export const AssignSectorModal: React.FC<AssignSectorModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave
}) => {
  const [selectedDept, setSelectedDept] = useState<Department>('ENGINEERING');
  const [crew, setCrew] = useState('');
  const [equipment, setEquipment] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [sectorStatus, setSectorStatus] = useState<SectorWorkStatus>('ASSIGNED');
  const [timeSlot, setTimeSlot] = useState('');
  const [speedCaution, setSpeedCaution] = useState('');
  const [powerMemo, setPowerMemo] = useState('');
  const [signalMemo, setSignalMemo] = useState('');
  const [coReqEngg, setCoReqEngg] = useState(false);
  const [coReqTrd, setCoReqTrd] = useState(false);
  const [coReqSnt, setCoReqSnt] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  // Sync state whenever task opens
  useEffect(() => {
    if (task) {
      const dept = task.department || 'ENGINEERING';
      setSelectedDept(dept);
      setCrew(task.assigned_crew || '');
      setEquipment(task.assigned_equipment || '');
      setSupervisor(task.supervisor || '');
      setSectorStatus(task.sector_status || 'ASSIGNED');
      setTimeSlot(task.assigned_slot || '20 Oct 01:30 - 04:30');
      setSpeedCaution(task.speed_restriction || '');
      setPowerMemo(task.power_isolation || '');
      setSignalMemo(task.signal_disconnection || '');
      setCoReqEngg(task.co_requisite_sectors?.includes('ENGINEERING') || false);
      setCoReqTrd(task.co_requisite_sectors?.includes('TRACTION_DISTRIBUTION') || false);
      setCoReqSnt(task.co_requisite_sectors?.includes('SIGNAL_TELECOMMUNICATION') || false);
      setAdminNote('');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const currentSectorDef = SECTORS[selectedDept];
  const availableCrews = SECTOR_CREWS.filter((c) => c.department === selectedDept);
  const availableMachines = SECTOR_MACHINERY.filter((m) => m.department === selectedDept);
  const availableSupervisors = SECTOR_SUPERVISORS.filter((s) => s.department === selectedDept);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const coReqs: Department[] = [];
    if (coReqEngg && selectedDept !== 'ENGINEERING') coReqs.push('ENGINEERING');
    if (coReqTrd && selectedDept !== 'TRACTION_DISTRIBUTION') coReqs.push('TRACTION_DISTRIBUTION');
    if (coReqSnt && selectedDept !== 'SIGNAL_TELECOMMUNICATION') coReqs.push('SIGNAL_TELECOMMUNICATION');

    onSave(task.id, {
      department: selectedDept,
      assigned_crew: crew || availableCrews[0]?.name || 'Sector Field Gang',
      assigned_equipment: equipment || availableMachines[0]?.name || 'Standard Field Toolkit',
      supervisor: supervisor || `${availableSupervisors[0]?.name} (${availableSupervisors[0]?.role})`,
      sector_status: sectorStatus,
      assigned_slot: timeSlot,
      safety_protocol: currentSectorDef.safetyProtocol,
      speed_restriction: speedCaution || undefined,
      power_isolation: powerMemo || undefined,
      signal_disconnection: signalMemo || undefined,
      co_requisite_sectors: coReqs,
      note: adminNote.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-[680px] max-h-[92vh] overflow-y-auto bg-[var(--surface)] border border-[var(--border-strong)] rounded-[14px] shadow-2xl p-5 sm:p-6 z-10 space-y-5 text-left">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--fg-muted)] font-bold">
                {task.id}
              </span>
              <LineBadge section={task.section} variant="full" />
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Rank #{task.rank}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-[var(--fg)] mt-1.5 leading-snug">
              Assign Sector & Work Dispatch
            </h2>
            <p className="text-xs text-[var(--fg-muted)] line-clamp-1">{task.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border)] transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Sector Switcher (Engg / TRD / S&T) */}
          <div>
            <label className="block text-xs font-semibold text-[var(--fg-subtle)] uppercase tracking-wider mb-2">
              Select Primary Operational Sector
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(SECTORS) as Department[]).map((deptKey) => {
                const s = SECTORS[deptKey];
                const active = selectedDept === deptKey;
                return (
                  <button
                    key={deptKey}
                    type="button"
                    onClick={() => {
                      setSelectedDept(deptKey);
                      // Default first items of that sector
                      const crw = SECTOR_CREWS.find((c) => c.department === deptKey);
                      const mch = SECTOR_MACHINERY.find((m) => m.department === deptKey);
                      const sup = SECTOR_SUPERVISORS.find((sp) => sp.department === deptKey);
                      if (crw) setCrew(crw.name);
                      if (mch) setEquipment(mch.name);
                      if (sup) setSupervisor(`${sup.name} (${sup.role})`);
                    }}
                    className={`p-3 rounded-[9px] border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      active
                        ? 'shadow-md ring-1'
                        : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--border-strong)]'
                    }`}
                    style={{
                      borderColor: active ? s.color : undefined,
                      backgroundColor: active ? `${s.color}14` : undefined,
                      boxShadow: active ? `0 0 0 1px ${s.color}` : undefined
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded uppercase"
                        style={{ background: s.badgeBg, color: s.color, border: `1px solid ${s.badgeBorder}` }}
                      >
                        {s.code}
                      </span>
                      {active && <Check size={14} style={{ color: s.color }} />}
                    </div>
                    <span className="text-xs font-semibold text-[var(--fg)] leading-tight">{s.shortName}</span>
                    <span className="text-[10px] text-[var(--fg-subtle)] mt-1 line-clamp-1">{s.tagline}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sector Highlight Banner */}
          <div
            className="p-3 rounded-[8px] border text-xs space-y-1"
            style={{
              backgroundColor: currentSectorDef.badgeBg,
              borderColor: currentSectorDef.badgeBorder
            }}
          >
            <div className="flex items-center gap-1.5 font-semibold" style={{ color: currentSectorDef.color }}>
              <Shield size={14} />
              <span>{currentSectorDef.name} — Standard Operating Protocol</span>
            </div>
            <p className="text-[11px] text-[var(--fg-muted)]">
              {currentSectorDef.description}
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-3 text-[10px] font-mono text-[var(--fg)]">
              <span className="font-bold">Required Permit: {currentSectorDef.primaryPermit}</span>
            </div>
          </div>

          {/* 2. Crew, Equipment & Supervisor Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1 flex items-center gap-1">
                <Users size={12} className="text-[#0070F3]" />
                Assigned Gang / Field Unit
              </label>
              <select
                value={crew}
                onChange={(e) => setCrew(e.target.value)}
                className="w-full h-9 px-2.5 rounded-[7px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none focus:border-[#0070F3]"
              >
                <option value="">-- Choose Roster Crew --</option>
                {availableCrews.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.base} · {c.strength} staff · {c.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1 flex items-center gap-1">
                <Cpu size={12} className="text-[#F5A623]" />
                Specialized Machine / Equipment
              </label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full h-9 px-2.5 rounded-[7px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none focus:border-[#0070F3]"
              >
                <option value="">-- Choose Equipment --</option>
                {availableMachines.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.type} · {m.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1 flex items-center gap-1">
                <FileCheck size={12} className="text-[#8E4EC6]" />
                Designated Engineer / Supervisor
              </label>
              <select
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                className="w-full h-9 px-2.5 rounded-[7px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none focus:border-[#0070F3]"
              >
                <option value="">-- Choose In-Charge Supervisor --</option>
                {availableSupervisors.map((s) => (
                  <option key={s.id} value={`${s.name} (${s.role})`}>
                    {s.name} — {s.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1 flex items-center gap-1">
                <Clock size={12} className="text-emerald-400" />
                Target Block Window & Timing
              </label>
              <input
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="e.g. 20 Oct 01:30 - 04:30"
                className="w-full h-9 px-3 rounded-[7px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none focus:border-[#0070F3] font-mono"
              >
              </input>
            </div>
          </div>

          {/* 3. Sector Work Workflow Status */}
          <div>
            <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1.5">
              Sector Work Lifecycle Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'REQUISITIONED', label: '1. Requisition', color: '#A1A1AA' },
                { id: 'ASSIGNED', label: '2. Assigned', color: '#0070F3' },
                { id: 'PERMIT_ISSUED', label: '3. Permit Issued', color: '#F5A623' },
                { id: 'IN_PROGRESS', label: '4. Live On Track', color: '#E5484D' },
                { id: 'FIT_CERTIFIED', label: '5. Fit Certified', color: '#30A46C' }
              ].map((st) => {
                const active = sectorStatus === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSectorStatus(st.id as SectorWorkStatus)}
                    className={`h-8 rounded-[6px] text-[11px] font-mono font-semibold transition-all cursor-pointer border ${
                      active
                        ? 'text-white border-transparent shadow-xs'
                        : 'bg-[var(--bg)] border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
                    }`}
                    style={{
                      backgroundColor: active ? st.color : undefined
                    }}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Safety Memos & Caution Orders */}
          <div className="p-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] space-y-2.5">
            <span className="text-[11px] font-semibold text-[var(--fg)] uppercase tracking-wider block">
              Safety Memos & Operating Orders
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] text-[var(--fg-subtle)] mb-1 font-mono">
                  Speed Restriction (Caution Order)
                </label>
                <input
                  value={speedCaution}
                  onChange={(e) => setSpeedCaution(e.target.value)}
                  placeholder="e.g. 20 km/h Caution"
                  className="w-full h-8 px-2 rounded-[5px] bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--fg)] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[var(--fg-subtle)] mb-1 font-mono">
                  TRD 25kV Feeder Isolation Memo
                </label>
                <input
                  value={powerMemo}
                  onChange={(e) => setPowerMemo(e.target.value)}
                  placeholder="e.g. Feeder BVI-V1 Isolated"
                  className="w-full h-8 px-2 rounded-[5px] bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--fg)] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[var(--fg-subtle)] mb-1 font-mono">
                  S&T Disconnection Form SI-420
                </label>
                <input
                  value={signalMemo}
                  onChange={(e) => setSignalMemo(e.target.value)}
                  placeholder="e.g. Memo SI-420 #902"
                  className="w-full h-8 px-2 rounded-[5px] bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--fg)] outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* 5. Co-requisite Cross-Sector Coordination */}
          <div className="p-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--fg)]">
              <Wrench size={13} className="text-[#F5A623]" />
              <span>Cross-Sector Co-requisite Coordination</span>
            </div>
            <p className="text-[11px] text-[var(--fg-muted)]">
              Select other departments required on site concurrently to clear safety permits:
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs">
              {selectedDept !== 'ENGINEERING' && (
                <label className="flex items-center gap-2 cursor-pointer text-[var(--fg)]">
                  <input
                    type="checkbox"
                    checked={coReqEngg}
                    onChange={(e) => setCoReqEngg(e.target.checked)}
                    className="rounded accent-[#0070F3]"
                  />
                  <span>Engg (Track Protection / Packing)</span>
                </label>
              )}
              {selectedDept !== 'TRACTION_DISTRIBUTION' && (
                <label className="flex items-center gap-2 cursor-pointer text-[var(--fg)]">
                  <input
                    type="checkbox"
                    checked={coReqTrd}
                    onChange={(e) => setCoReqTrd(e.target.checked)}
                    className="rounded accent-[#F5A623]"
                  />
                  <span>TRD (OHE Power Block / Grounding)</span>
                </label>
              )}
              {selectedDept !== 'SIGNAL_TELECOMMUNICATION' && (
                <label className="flex items-center gap-2 cursor-pointer text-[var(--fg)]">
                  <input
                    type="checkbox"
                    checked={coReqSnt}
                    onChange={(e) => setCoReqSnt(e.target.checked)}
                    className="rounded accent-[#8E4EC6]"
                  />
                  <span>S&T (Track Bond / Point Disconnection)</span>
                </label>
              )}
            </div>
          </div>

          {/* Admin Dispatch Note */}
          <div>
            <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1">
              Admin Dispatch Instructions & Notes
            </label>
            <input
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="e.g. Priority task; ensure tower wagon arrives at Borivali siding by 01:15"
              className="w-full h-9 px-3 rounded-[7px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none focus:border-[#0070F3]"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <Button variant="secondary" size="md" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Confirm & Dispatch Assignment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
