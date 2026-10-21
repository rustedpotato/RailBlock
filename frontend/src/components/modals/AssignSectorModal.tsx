import React, { useState, useEffect, useMemo } from 'react';
import { MaintenanceTaskItem, Department, SectorWorkStatus } from '../../types/railblock';
import { SECTORS, SECTOR_CREWS, SECTOR_MACHINERY, SECTOR_SUPERVISORS } from '../../data/sectorData';
import { Button } from '../ui/Buttons';
import { LineBadge } from '../ui/LineBadge';
import {
  Check,
  Shield,
  AlertTriangle,
  Wrench,
  Clock,
  Users,
  Cpu,
  FileCheck,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Smartphone
} from 'lucide-react';

interface AssignSectorModalProps {
  task: MaintenanceTaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, assignment: {
    department: Department;
    assigned_crew: string;
    assigned_equipment: string;
    supervisor: string;
    supervisor_phone?: string;
    send_whatsapp?: boolean;
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
  const [phone, setPhone] = useState('+91 93228 46915');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [sectorStatus, setSectorStatus] = useState<SectorWorkStatus>('ASSIGNED');
  const [timeSlot, setTimeSlot] = useState('');
  const [speedCaution, setSpeedCaution] = useState('');
  const [powerMemo, setPowerMemo] = useState('');
  const [signalMemo, setSignalMemo] = useState('');
  const [coReqEngg, setCoReqEngg] = useState(false);
  const [coReqTrd, setCoReqTrd] = useState(false);
  const [coReqSnt, setCoReqSnt] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  const currentSectorDef = SECTORS[selectedDept];
  const availableCrews = useMemo(() => SECTOR_CREWS.filter((c) => c.department === selectedDept), [selectedDept]);
  const availableMachines = useMemo(() => SECTOR_MACHINERY.filter((m) => m.department === selectedDept), [selectedDept]);
  const availableSupervisors = useMemo(() => SECTOR_SUPERVISORS.filter((s) => s.department === selectedDept), [selectedDept]);

  // Sync state whenever task opens
  useEffect(() => {
    if (task) {
      const dept = task.department || 'ENGINEERING';
      setSelectedDept(dept);
      setCrew(task.assigned_crew || availableCrews[0]?.name || '');
      setEquipment(task.assigned_equipment || availableMachines[0]?.name || '');

      const initialSupervisorObj = availableSupervisors[0];
      const initialSupervisorStr = task.supervisor || (initialSupervisorObj ? `${initialSupervisorObj.name} (${initialSupervisorObj.role})` : '');
      setSupervisor(initialSupervisorStr);

      const matchingSup = availableSupervisors.find(
        (s) => initialSupervisorStr.includes(s.name) || s.department === dept
      );
      setPhone(matchingSup?.phone || '+91 93228 46915');

      setSectorStatus(task.sector_status || 'ASSIGNED');
      setTimeSlot(task.assigned_slot || '20 Oct 01:30 - 04:30');
      setSpeedCaution(task.speed_restriction || '');
      setPowerMemo(task.power_isolation || '');
      setSignalMemo(task.signal_disconnection || '');
      setCoReqEngg(task.co_requisite_sectors?.includes('ENGINEERING') || false);
      setCoReqTrd(task.co_requisite_sectors?.includes('TRACTION_DISTRIBUTION') || false);
      setCoReqSnt(task.co_requisite_sectors?.includes('SIGNAL_TELECOMMUNICATION') || false);
      setAdminNote('');
      setSendWhatsApp(true);
      setShowPreview(false);
    }
  }, [task]);

  // Update phone whenever supervisor dropdown changes
  const handleSupervisorChange = (newSupervisorStr: string) => {
    setSupervisor(newSupervisorStr);
    const matched = availableSupervisors.find((s) => newSupervisorStr.includes(s.name));
    if (matched && matched.phone) {
      setPhone(matched.phone);
    }
  };

  // Generate preview text & WhatsApp web link
  const previewMemo = useMemo(() => {
    if (!task) return '';
    const cleanDigits = phone.replace(/[^\d]/g, '');
    const deptLabels: Record<Department, string> = {
      ENGINEERING: 'ENGG (Track / P-Way)',
      TRACTION_DISTRIBUTION: 'TRD (Overhead 25kV OHE)',
      SIGNAL_TELECOMMUNICATION: 'S&T (Signals & Telecom)'
    };

    const coReqNames: string[] = [];
    if (coReqEngg && selectedDept !== 'ENGINEERING') coReqNames.push('ENGG');
    if (coReqTrd && selectedDept !== 'TRACTION_DISTRIBUTION') coReqNames.push('TRD');
    if (coReqSnt && selectedDept !== 'SIGNAL_TELECOMMUNICATION') coReqNames.push('S&T');

    return (
      `🚆 *RAILBLOCK AI — SECTOR DISPATCH ORDER*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📋 *Work Order:* #${task.id} — ${task.title}\n` +
      `🏢 *Department:* ${deptLabels[selectedDept]}\n` +
      `📍 *Section:* ${task.section}\n` +
      `⏱ *Approved Block Slot:* ${timeSlot}\n` +
      `👷 *Supervisor:* ${supervisor || 'Field Supervisor'}\n` +
      `🛠 *Assigned Crew:* ${crew || 'Designated Gang'}\n` +
      `🚜 *Machinery:* ${equipment || 'Standard Kit'}\n\n` +
      `⚠️ *SAFETY & CAUTION ORDERS:*\n` +
      `⚡ *Power Isolation:* ${powerMemo || 'Not Required (25kV Energized)'}\n` +
      `🛑 *Speed Caution:* ${speedCaution || 'Normal Section Speed'}\n` +
      `📡 *S&T Disconnection:* ${signalMemo || 'None / Interlocking Normal'}\n` +
      (coReqNames.length > 0 ? `🤝 *Co-ordination Required:* ${coReqNames.join(', ')}\n` : '') +
      `\n📝 *Controller Directives:*\n_${adminNote.trim() || 'Proceed as per General & Subsidiary Rules (G&SR).'}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👉 *1-TAP FIELD ACTIONS (Tap to report):*\n` +
      `• ✅ *Acknowledge & Roll Out:*\n` +
      `  http://localhost:5173/action?task=${task.id}&act=ACK\n\n` +
      `• ⏳ *Report 15m Delay:*\n` +
      `  http://localhost:5173/action?task=${task.id}&act=DELAY\n\n` +
      `• 🏁 *Issue Fitment Certificate:*\n` +
      `  http://localhost:5173/action?task=${task.id}&act=FIT\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔒 _Divisional Rail Operating Control Room • RailBlock AI_`
    );
  }, [task, selectedDept, supervisor, crew, equipment, timeSlot, powerMemo, speedCaution, signalMemo, coReqEngg, coReqTrd, coReqSnt, adminNote, phone]);

  const waMeLink = useMemo(() => {
    const cleanDigits = phone.replace(/[^\d]/g, '');
    const targetDigits = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
    return `https://wa.me/${targetDigits}?text=${encodeURIComponent(previewMemo)}`;
  }, [phone, previewMemo]);

  if (!isOpen || !task) return null;

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
      supervisor_phone: phone,
      send_whatsapp: sendWhatsApp,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in bg-black/60 backdrop-blur-xs">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-hover)]">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-[8px] flex items-center justify-center font-bold text-xs"
              style={{
                backgroundColor: currentSectorDef.badgeBg,
                color: currentSectorDef.color,
                border: `1px solid ${currentSectorDef.badgeBorder}`
              }}
            >
              {currentSectorDef.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--fg)]">
                  Dispatch Sector Assignment & Work Order
                </h3>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--fg-muted)]">
                  #{task.id}
                </span>
              </div>
              <p className="text-xs text-[var(--fg-muted)] flex items-center gap-2 mt-0.5">
                <span>{task.title}</span>
                <span>•</span>
                <LineBadge section={task.section} />
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* 1. Sector Selection Tabs */}
          <div>
            <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1.5">
              Assigned Railway Sector / Engineering Department
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['ENGINEERING', 'TRACTION_DISTRIBUTION', 'SIGNAL_TELECOMMUNICATION'] as Department[]).map((dept) => {
                const def = SECTORS[dept];
                const active = selectedDept === dept;
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => {
                      setSelectedDept(dept);
                      const crews = SECTOR_CREWS.filter((c) => c.department === dept);
                      const machines = SECTOR_MACHINERY.filter((m) => m.department === dept);
                      const sups = SECTOR_SUPERVISORS.filter((s) => s.department === dept);
                      setCrew(crews[0]?.name || '');
                      setEquipment(machines[0]?.name || '');
                      if (sups[0]) {
                        setSupervisor(`${sups[0].name} (${sups[0].role})`);
                        setPhone(sups[0].phone);
                      }
                    }}
                    className={`p-2.5 rounded-[8px] border text-left transition-all cursor-pointer ${
                      active
                        ? 'border-transparent shadow-xs'
                        : 'bg-[var(--bg)] border-[var(--border)] opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: active ? def.badgeBg : undefined,
                      borderColor: active ? def.color : undefined
                    }}
                  >
                    <div className="font-semibold text-xs flex items-center justify-between" style={{ color: def.color }}>
                      <span>{def.shortName}</span>
                      {active && <Check size={14} />}
                    </div>
                    <div className="text-[10px] text-[var(--fg-muted)] mt-1 truncate">
                      {def.tagline}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Crew, Machinery, Supervisor & Block Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1 flex items-center gap-1">
                <Users size={12} className="text-[#0070F3]" />
                Designated Maintenance Gang / Crew
              </label>
              <select
                value={crew}
                onChange={(e) => setCrew(e.target.value)}
                className="w-full h-9 px-2.5 rounded-[7px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none focus:border-[#0070F3]"
              >
                {availableCrews.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.base} • {c.strength} staff)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1 flex items-center gap-1">
                <Cpu size={12} className="text-[#F5A623]" />
                Allocated Machinery & Equipment
              </label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full h-9 px-2.5 rounded-[7px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none focus:border-[#0070F3]"
              >
                {availableMachines.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1 flex items-center gap-1">
                <Shield size={12} className="text-[#8E4EC6]" />
                Site In-Charge / Supervisor
              </label>
              <select
                value={supervisor}
                onChange={(e) => handleSupervisorChange(e.target.value)}
                className="w-full h-9 px-2.5 rounded-[7px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none focus:border-[#0070F3]"
              >
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
              />
            </div>
          </div>

          {/* 3. WhatsApp Dispatch Notification Center */}
          <div className="p-3.5 rounded-[10px] bg-emerald-950/20 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <MessageSquare size={13} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-emerald-300 block">
                    WhatsApp Field Dispatch Memo
                  </span>
                  <span className="text-[10px] text-emerald-400/80">
                    Dispatches instant railway work order & 1-tap action links to supervisor's phone
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-emerald-400">Send WhatsApp</span>
              </label>
            </div>

            {sendWhatsApp && (
              <div className="pt-2 border-t border-emerald-500/20 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                  <div>
                    <label className="block text-[10px] text-emerald-300/80 mb-1 font-mono flex items-center gap-1">
                      <Smartphone size={11} />
                      Supervisor WhatsApp Phone Number:
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 93228 46915"
                      className="w-full h-8 px-2.5 rounded-[6px] bg-[var(--bg)] border border-emerald-500/40 text-xs text-emerald-200 outline-none focus:border-emerald-400 font-mono"
                    />
                    <span className="text-[9px] text-[var(--fg-muted)] mt-0.5 block">
                      Tip: Enter your own phone number to test receiving the real message!
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-3 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex-1 h-8 px-2.5 rounded-[6px] bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {showPreview ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      <span>{showPreview ? 'Hide Preview' : 'Preview Memo'}</span>
                    </button>

                    <a
                      href={waMeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-3 rounded-[6px] bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                      title="Open in WhatsApp Web / App directly"
                    >
                      <ExternalLink size={12} />
                      <span>Open WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* WhatsApp Chat Bubble Preview */}
                {showPreview && (
                  <div className="mt-2 p-3 rounded-[8px] bg-[#0c1317] border border-emerald-500/20 font-mono text-[11px] text-emerald-100 whitespace-pre-wrap leading-relaxed shadow-inner max-h-48 overflow-y-auto select-text">
                    {previewMemo}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Sector Work Workflow Status */}
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

          {/* 5. Safety Memos & Caution Orders */}
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

          {/* 6. Co-requisite Cross-Sector Coordination */}
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
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <MessageSquare size={13} />
              <span>{sendWhatsApp ? `WhatsApp -> ${phone}` : 'Internal dispatch only'}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Button variant="secondary" size="md" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                Confirm & Dispatch Assignment
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};