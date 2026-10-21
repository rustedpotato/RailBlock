import React, { useState, useEffect } from 'react';
import {
  Database,
  GitBranch,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  Clock,
  Train,
  Cpu,
  Wrench,
  Download,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
  Radio,
  RefreshCw,
  ExternalLink,
  Globe,
  Newspaper,
  Check,
  X,
  MapPin
} from 'lucide-react';
import { Button } from '../components/ui/Buttons';
import { StatusBadge, DepartmentChip } from '../components/ui/Badge';
import { useLine } from '../context/LineContext';
import {
  fetchPipelineOverview,
  fetchCorridors,
  fetchAllPlans,
  reseedDataset,
  runOptimizationPipeline,
  fetchStations,
  importOsmStations,
  fetchMegablockNotices,
  fetchMegablocksFromAI,
  approveMegablockNotice,
  rejectMegablockNotice,
  StationItem,
  BlockNoticeItem,
  PipelineOverviewData
} from '../api/dataSync';
import { apiClient } from '../api/client';

export const PipelineDatasetView: React.FC = () => {
  const { tasks, trains, assets, blockWindows, refreshData } = useLine();
  const [pipelineData, setPipelineData] = useState<PipelineOverviewData | null>(null);
  const [corridors, setCorridors] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [stations, setStations] = useState<StationItem[]>([]);
  const [notices, setNotices] = useState<BlockNoticeItem[]>([]);
  const [activeDatasetTab, setActiveDatasetTab] = useState<'corridors' | 'megablocks' | 'stations' | 'assets' | 'tasks' | 'trains' | 'windows' | 'plans'>('megablocks');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isReseeding, setIsReseeding] = useState<boolean>(false);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [isInjectingDefect, setIsInjectingDefect] = useState<boolean>(false);
  const [isImportingOsm, setIsImportingOsm] = useState<boolean>(false);
  const [isFetchingNotices, setIsFetchingNotices] = useState<boolean>(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [targetDate, setTargetDate] = useState<string>('2026-10-18');
  const [stationFilterLine, setStationFilterLine] = useState<string>('ALL');

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [pipe, corr, pln, stns, nts] = await Promise.all([
        fetchPipelineOverview(),
        fetchCorridors(),
        fetchAllPlans(),
        fetchStations(),
        fetchMegablockNotices()
      ]);
      setPipelineData(pipe);
      setCorridors(corr);
      setPlans(pln);
      setStations(stns);
      setNotices(nts);
    } catch (e) {
      console.error('Error loading pipeline data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleReseed = async () => {
    setIsReseeding(true);
    setActionMessage({ text: 'Resetting database and seeding synthetic operational dataset...', type: 'info' });
    try {
      await reseedDataset();
      await refreshData();
      await loadAll();
      setActionMessage({ text: 'Database successfully re-seeded from synthetic operational generator!', type: 'success' });
    } catch (err: any) {
      setActionMessage({ text: `Reseed failed: ${err.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setIsReseeding(false);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleRunSolver = async () => {
    setIsSolving(true);
    setActionMessage({ text: 'Executing Google OR-Tools CP-SAT multi-constraint solver pipeline...', type: 'info' });
    try {
      const result = await runOptimizationPipeline();
      await refreshData();
      await loadAll();
      setActionMessage({
        text: `Solver completed (${result.solver_status}): ${result.scheduled_count} tasks assigned, ${result.validation?.conflicts ?? 0} conflicts detected.`,
        type: 'success'
      });
    } catch (err: any) {
      setActionMessage({ text: `Solver execution failed: ${err.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setIsSolving(false);
      setTimeout(() => setActionMessage(null), 6000);
    }
  };

  const handleInjectDefect = async () => {
    setIsInjectingDefect(true);
    try {
      await apiClient.post('/api/realtime/trigger-defect', {
        section: 'Mumbai Central – Bandra Fast',
        description: 'USFD Ultrasonic Carriage identified transverse rail flaw at KM 14/18'
      });
      await refreshData();
      setActionMessage({
        text: 'Live emergency track flaw injected into telemetry pipeline and broadcast to WebSocket subscribers!',
        type: 'success'
      });
    } catch (err: any) {
      setActionMessage({ text: 'Defect trigger failed', type: 'error' });
    } finally {
      setIsInjectingDefect(false);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleImportOsm = async () => {
    setIsImportingOsm(true);
    setActionMessage({ text: 'Querying OpenStreetMap Overpass API for Mumbai Suburban railway stations...', type: 'info' });
    try {
      const res = await importOsmStations();
      const stns = await fetchStations();
      setStations(stns);
      setActionMessage({
        text: `OpenStreetMap Sync complete: ${stns.length} stations cached across Western, Central & Harbour corridors.`,
        type: 'success'
      });
    } catch (err: any) {
      setActionMessage({ text: `OSM Import failed: ${err.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setIsImportingOsm(false);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleFetchMegablocks = async () => {
    setIsFetchingNotices(true);
    setActionMessage({ text: `Consulting Gemini AI with Search Grounding / News RSS extraction for ${targetDate} mega blocks...`, type: 'info' });
    try {
      const res = await fetchMegablocksFromAI(targetDate);
      const nts = await fetchMegablockNotices();
      setNotices(nts);
      setActionMessage({
        text: `Gemini AI Extractor (${res.mode}): Found ${res.found} announcements, staged ${res.staged} new notices for controller approval!`,
        type: 'success'
      });
    } catch (err: any) {
      setActionMessage({ text: `AI Mega-block fetch failed: ${err.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setIsFetchingNotices(false);
      setTimeout(() => setActionMessage(null), 6000);
    }
  };

  const handleApproveNotice = async (noticeId: number) => {
    setApprovingId(noticeId);
    try {
      await approveMegablockNotice(noticeId);
      await refreshData();
      const nts = await fetchMegablockNotices();
      setNotices(nts);
      setActionMessage({
        text: `Mega-block notice #${noticeId} APPROVED! Active BlockWindow created and committed to SQLite corridor. Ready for OR-Tools optimizer.`,
        type: 'success'
      });
    } catch (err: any) {
      setActionMessage({ text: `Approval failed: ${err.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setApprovingId(null);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleRejectNotice = async (noticeId: number) => {
    setRejectingId(noticeId);
    try {
      await rejectMegablockNotice(noticeId);
      const nts = await fetchMegablockNotices();
      setNotices(nts);
      setActionMessage({
        text: `Mega-block notice #${noticeId} marked as REJECTED.`,
        type: 'info'
      });
    } catch (err: any) {
      setActionMessage({ text: `Rejection failed: ${err.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setRejectingId(null);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const exportDatasetJSON = () => {
    const data = {
      pipeline_metadata: pipelineData,
      corridors,
      osm_stations: stations,
      staged_mega_blocks: notices,
      assets,
      maintenance_tasks: tasks,
      train_schedules: trains,
      block_windows: blockWindows,
      maintenance_plans: plans,
      exported_at: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `railblock-dataset-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const counts = pipelineData?.dataset_counts || {
    corridors: corridors.length || 3,
    assets: assets.length || 16,
    maintenance_tasks: tasks.length || 14,
    train_schedules: trains.length || 11,
    block_windows: blockWindows.length || 8,
    plans: plans.length || 1
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-[rgba(62,139,255,0.12)] border border-[rgba(62,139,255,0.24)] flex items-center justify-center text-[var(--accent)] shadow-sm">
              <Database size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[26px] font-bold tracking-[-0.03em] text-[var(--fg)]">
                  Data Pipeline & Dataset Engine
                </h1>
                <span className="px-2 py-0.5 rounded-[4px] bg-[rgba(48,164,108,0.15)] text-[var(--success)] border border-[rgba(48,164,108,0.3)] text-[11px] font-mono font-semibold">
                  LIVE SQLITE (WAL)
                </span>
              </div>
              <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">
                Real database tables, live telemetry pipeline, and mathematical constraint solver
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            icon={<RotateCcw size={14} className={isReseeding ? 'animate-spin' : ''} />}
            onClick={handleReseed}
            disabled={isReseeding}
          >
            {isReseeding ? 'Reseeding...' : 'Reseed Clean DB'}
          </Button>

          <Button
            variant="primary"
            icon={<Play size={14} className={isSolving ? 'animate-pulse' : ''} />}
            onClick={handleRunSolver}
            disabled={isSolving}
          >
            {isSolving ? 'Solving CP-SAT...' : 'Run OR-Tools Solver'}
          </Button>

          <Button
            variant="secondary"
            icon={<Zap size={14} className={isInjectingDefect ? 'animate-bounce' : ''} />}
            onClick={handleInjectDefect}
            disabled={isInjectingDefect}
          >
            Simulate Defect
          </Button>

          <Button
            variant="ghost"
            icon={<Download size={14} />}
            onClick={exportDatasetJSON}
          >
            Export JSON
          </Button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div
          className={`p-3 rounded-[8px] text-xs font-mono flex items-center gap-2.5 border transition-all ${
            actionMessage.type === 'success'
              ? 'bg-[rgba(48,164,108,0.1)] border-[rgba(48,164,108,0.3)] text-[var(--success)]'
              : actionMessage.type === 'error'
              ? 'bg-[rgba(229,72,77,0.1)] border-[rgba(229,72,77,0.3)] text-[var(--danger)]'
              : 'bg-[rgba(62,139,255,0.1)] border-[rgba(62,139,255,0.3)] text-[var(--accent)]'
          }`}
        >
          <Activity size={14} />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* 2. Dataset Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3.5 rounded-[8px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all">
          <div className="text-[11px] text-[var(--fg-muted)] font-mono uppercase tracking-wider">Corridors</div>
          <div className="text-[22px] font-bold text-[var(--fg)] mt-1 font-mono">{counts.corridors}</div>
          <div className="text-[11px] text-[var(--fg-subtle)] mt-0.5">WR, CR, HR Lines</div>
        </div>

        <div className="p-3.5 rounded-[8px] bg-[var(--surface)] border border-[var(--border)] hover:border-[rgba(62,139,255,0.4)] transition-all">
          <div className="text-[11px] text-[var(--accent)] font-mono uppercase tracking-wider">OSM Stations</div>
          <div className="text-[22px] font-bold text-[var(--accent)] mt-1 font-mono">{stations.length}</div>
          <div className="text-[11px] text-[var(--fg-subtle)] mt-0.5">Suburban MMR</div>
        </div>

        <div className="p-3.5 rounded-[8px] bg-[var(--surface)] border border-[var(--border)] hover:border-[rgba(247,107,21,0.4)] transition-all">
          <div className="text-[11px] text-[var(--warning)] font-mono uppercase tracking-wider">AI Mega Blocks</div>
          <div className="text-[22px] font-bold text-[var(--warning)] mt-1 font-mono">{notices.length}</div>
          <div className="text-[11px] text-[var(--fg-subtle)] mt-0.5">{notices.filter(n => n.status === 'PENDING').length} awaiting review</div>
        </div>

        <div className="p-3.5 rounded-[8px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all">
          <div className="text-[11px] text-[var(--fg-muted)] font-mono uppercase tracking-wider">Physical Assets</div>
          <div className="text-[22px] font-bold text-[var(--fg)] mt-1 font-mono">{counts.assets}</div>
          <div className="text-[11px] text-[var(--fg-subtle)] mt-0.5">Track, OHE, Signals</div>
        </div>

        <div className="p-3.5 rounded-[8px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all">
          <div className="text-[11px] text-[var(--fg-muted)] font-mono uppercase tracking-wider">Tasks Registered</div>
          <div className="text-[22px] font-bold text-[var(--fg)] mt-1 font-mono">{counts.maintenance_tasks}</div>
          <div className="text-[11px] text-[var(--fg-subtle)] mt-0.5">Demands Queued</div>
        </div>

        <div className="p-3.5 rounded-[8px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all">
          <div className="text-[11px] text-[var(--fg-muted)] font-mono uppercase tracking-wider">Trains Timetabled</div>
          <div className="text-[22px] font-bold text-[var(--fg)] mt-1 font-mono">{counts.train_schedules}</div>
          <div className="text-[11px] text-[var(--fg-subtle)] mt-0.5">Locals & Express</div>
        </div>

        <div className="p-3.5 rounded-[8px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all">
          <div className="text-[11px] text-[var(--fg-muted)] font-mono uppercase tracking-wider">Block Windows</div>
          <div className="text-[22px] font-bold text-[var(--warning)] mt-1 font-mono">{counts.block_windows}</div>
          <div className="text-[11px] text-[var(--fg-subtle)] mt-0.5">Authorized Windows</div>
        </div>

        <div className="p-3.5 rounded-[8px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all">
          <div className="text-[11px] text-[var(--fg-muted)] font-mono uppercase tracking-wider">Optimized Plans</div>
          <div className="text-[22px] font-bold text-[var(--success)] mt-1 font-mono">{counts.plans}</div>
          <div className="text-[11px] text-[var(--fg-subtle)] mt-0.5">CP-SAT Generated</div>
        </div>
      </div>

      {/* Real-World Data Ingestion Hub: OpenStreetMap & Gemini AI */}
      <div className="p-5 rounded-[12px] bg-[var(--surface)] border border-[rgba(62,139,255,0.3)] shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-[6px] bg-[rgba(62,139,255,0.12)] border border-[rgba(62,139,255,0.3)] flex items-center justify-center text-[var(--accent)]">
                <Globe size={18} />
              </span>
              <div>
                <h2 className="text-[17px] font-bold text-[var(--fg)] flex items-center gap-2">
                  Real-World Data Ingestion Engine
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-[rgba(62,139,255,0.15)] text-[var(--accent)] border border-[rgba(62,139,255,0.3)]">
                    OSM + GEMINI AI
                  </span>
                </h2>
                <p className="text-xs text-[var(--fg-muted)]">
                  Live geospatial geometry from OpenStreetMap & Sunday mega-block press announcements via Gemini
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sync OSM Button */}
            <Button
              variant="secondary"
              icon={<Globe size={14} className={isImportingOsm ? 'animate-spin' : ''} />}
              onClick={handleImportOsm}
              disabled={isImportingOsm}
            >
              {isImportingOsm ? 'Querying Overpass...' : `Sync OSM Stations (${stations.length})`}
            </Button>

            {/* Target Date Input & AI Fetch */}
            <div className="flex items-center gap-1.5 p-1 rounded-[6px] bg-[var(--bg)] border border-[var(--border)] text-xs">
              <Clock size={13} className="text-[var(--fg-muted)] ml-1" />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-transparent text-[var(--fg)] text-xs font-mono outline-none px-1"
                title="Target Sunday for Mega Block News"
              />
              <Button
                variant="primary"
                size="sm"
                icon={<Newspaper size={13} className={isFetchingNotices ? 'animate-pulse' : ''} />}
                onClick={handleFetchMegablocks}
                disabled={isFetchingNotices}
              >
                {isFetchingNotices ? 'Extracting...' : 'Fetch Mega-Blocks via Gemini'}
              </Button>
            </div>
          </div>
        </div>

        {/* Ingestion Status Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: OpenStreetMap Geographic Coverage */}
          <div className="p-4 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)] flex items-center gap-1.5">
                <MapPin size={14} className="text-[var(--accent)]" /> OpenStreetMap MMR Geometry
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(48,164,108,0.12)] text-[var(--success)] border border-[rgba(48,164,108,0.25)]">
                VERIFIED CACHE
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
              <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border-subtle)]">
                <div className="text-xs text-[var(--fg-muted)]">Western (WR)</div>
                <div className="text-base font-bold text-[var(--fg)] mt-0.5">
                  {stations.filter((s) => s.line === 'WR').length}
                </div>
                <div className="text-[10px] text-[var(--fg-subtle)]">Churchgate–Dahanu</div>
              </div>
              <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border-subtle)]">
                <div className="text-xs text-[var(--fg-muted)]">Central (CR)</div>
                <div className="text-base font-bold text-[var(--fg)] mt-0.5">
                  {stations.filter((s) => s.line === 'CR').length}
                </div>
                <div className="text-[10px] text-[var(--fg-subtle)]">CSMT–Kasara/Khopoli</div>
              </div>
              <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border-subtle)]">
                <div className="text-xs text-[var(--fg-muted)]">Harbour (HR)</div>
                <div className="text-base font-bold text-[var(--fg)] mt-0.5">
                  {stations.filter((s) => s.line === 'HR').length}
                </div>
                <div className="text-[10px] text-[var(--fg-subtle)]">CSMT–Panvel/Uran</div>
              </div>
            </div>
            <div className="text-[11px] text-[var(--fg-subtle)]">
              Accurate track station coordinates prevent hallucinated corridor assignments in optimizer.
            </div>
          </div>

          {/* Card B: Gemini AI Mega-Block Intelligence */}
          <div className="p-4 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)] flex items-center gap-1.5">
                <Cpu size={14} className="text-[var(--warning)]" /> Gemini Grounded Extractor
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(247,107,21,0.12)] text-[var(--warning)] border border-[rgba(247,107,21,0.25)]">
                NEWS & PRESS RADAR
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono">
              <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border-subtle)]">
                <div className="text-xs text-[var(--fg-muted)]">Staged</div>
                <div className="text-base font-bold text-[var(--fg)] mt-0.5">{notices.length}</div>
              </div>
              <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border-subtle)]">
                <div className="text-xs text-[var(--success)]">OSM Valid</div>
                <div className="text-base font-bold text-[var(--success)] mt-0.5">
                  {notices.filter((n) => n.stations_verified).length}
                </div>
              </div>
              <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border-subtle)]">
                <div className="text-xs text-[var(--warning)]">Pending</div>
                <div className="text-base font-bold text-[var(--warning)] mt-0.5">
                  {notices.filter((n) => n.status === 'PENDING').length}
                </div>
              </div>
              <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border-subtle)]">
                <div className="text-xs text-[var(--accent)]">Approved</div>
                <div className="text-base font-bold text-[var(--accent)] mt-0.5">
                  {notices.filter((n) => n.status === 'APPROVED').length}
                </div>
              </div>
            </div>
            <div className="text-[11px] text-[var(--fg-subtle)]">
              All extracted announcements remain staged until authorized by Section Controller.
            </div>
          </div>
        </div>

        {/* Staged Notices Review Queue */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]">
              Staged Mega-Block Review & Approval Queue ({notices.length})
            </h3>
            <span className="text-[11px] text-[var(--fg-muted)] font-mono">
              Approving converts a press release notice into an active mathematical BlockWindow
            </span>
          </div>

          {notices.length === 0 ? (
            <div className="p-6 rounded-[8px] bg-[var(--bg)] border border-[var(--border-subtle)] text-center text-xs text-[var(--fg-muted)]">
              No mega-block notices staged yet. Click <strong className="text-[var(--fg)]">"Fetch Mega-Blocks via Gemini"</strong> above to extract Sunday announcements from railway press releases!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-[8px] border transition-all flex flex-col justify-between space-y-3 ${
                    n.status === 'APPROVED'
                      ? 'bg-[rgba(48,164,108,0.06)] border-[rgba(48,164,108,0.3)]'
                      : n.status === 'REJECTED'
                      ? 'bg-[var(--bg)] border-[var(--border-subtle)] opacity-60'
                      : 'bg-[var(--bg)] border-[rgba(62,139,255,0.3)] hover:border-[var(--accent)] shadow-sm'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-[var(--surface)] text-[var(--accent)] border border-[var(--border)]">
                          {n.line} Line
                        </span>
                        <span className="text-xs font-bold text-[var(--fg)]">{n.section}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          n.status === 'APPROVED'
                            ? 'bg-[rgba(48,164,108,0.15)] text-[var(--success)]'
                            : n.status === 'REJECTED'
                            ? 'bg-[rgba(229,72,77,0.15)] text-[var(--danger)]'
                            : 'bg-[rgba(247,107,21,0.15)] text-[var(--warning)] animate-pulse'
                        }`}
                      >
                        {n.status}
                      </span>
                    </div>

                    <div className="text-xs font-mono space-y-1">
                      <div className="text-[var(--fg-muted)] flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(n.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                        {new Date(n.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                      </div>
                      <div className="text-[var(--fg-subtle)] text-[11px]">
                        Type: <span className="text-[var(--fg)]">{n.block_type || 'Track & Power Block'}</span>
                      </div>
                      {n.cancelled_trains && (
                        <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border-subtle)] text-[11px] text-[var(--warning)] leading-snug">
                          {n.cancelled_trains}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {n.stations_verified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--success)] bg-[rgba(48,164,108,0.1)] px-1.5 py-0.5 rounded">
                          <Check size={11} /> OSM Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--warning)] bg-[rgba(247,107,21,0.1)] px-1.5 py-0.5 rounded">
                          <AlertTriangle size={11} /> Unverified Station
                        </span>
                      )}

                      {n.source_url && (
                        <a
                          href={n.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--accent)] hover:underline ml-auto"
                        >
                          News Bulletin <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {n.status === 'PENDING' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                      <Button
                        size="sm"
                        variant="primary"
                        className="flex-1 text-xs"
                        icon={<Check size={12} />}
                        onClick={() => handleApproveNotice(n.id)}
                        disabled={approvingId === n.id}
                      >
                        {approvingId === n.id ? 'Deploying...' : 'Approve & Create Block'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<X size={12} />}
                        onClick={() => handleRejectNotice(n.id)}
                        disabled={rejectingId === n.id}
                      >
                        Reject
                      </Button>
                    </div>
                  )}

                  {n.status === 'APPROVED' && (
                    <div className="pt-2 border-t border-[rgba(48,164,108,0.2)] text-[10px] font-mono text-[var(--success)] flex items-center justify-between">
                      <span>Linked BlockWindow:</span>
                      <strong className="underline">{n.block_window_id}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Interactive Data Pipeline Architecture */}
      <div className="p-5 rounded-[10px] bg-[var(--surface)] border border-[var(--border)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-[var(--accent)]" />
            <h2 className="text-[15px] font-semibold text-[var(--fg)]">
              End-to-End Autonomous Data Pipeline Architecture
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[var(--fg-muted)]">
            Python 3.12 · FastAPI · SQLAlchemy · OR-Tools · WebSocket
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {/* Stage 1 */}
          <div className="p-3.5 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[rgba(62,139,255,0.15)] text-[var(--accent)]">
                  STAGE 1
                </span>
                <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
              </div>
              <h3 className="text-xs font-semibold text-[var(--fg)]">Data Ingestion</h3>
              <p className="text-[11px] text-[var(--fg-muted)] mt-1">
                TMS Timetables, USFD Ultrasonic Rail Flaw Cars, SCADA 25kV OHE, EI Relays.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--fg-subtle)]">
              Rate: Real-time batch
            </div>
          </div>

          {/* Stage 2 */}
          <div className="p-3.5 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[rgba(48,164,108,0.15)] text-[var(--success)]">
                  STAGE 2
                </span>
                <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
              </div>
              <h3 className="text-xs font-semibold text-[var(--fg)]">Dataset Repository</h3>
              <p className="text-[11px] text-[var(--fg-muted)] mt-1">
                Normalized SQLite schema indexing corridors, assets, work orders & schedules.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--fg-subtle)]">
              Store: railblock.db
            </div>
          </div>

          {/* Stage 3 */}
          <div className="p-3.5 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[rgba(247,107,21,0.15)] text-[var(--warning)]">
                  STAGE 3
                </span>
                <span className="w-2 h-2 rounded-full bg-[var(--warning)]" />
              </div>
              <h3 className="text-xs font-semibold text-[var(--fg)]">OR-Tools Solver</h3>
              <p className="text-[11px] text-[var(--fg-muted)] mt-1">
                CP-SAT solver enforcing 15-min train clearance, OHE isolation & priority weights.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--fg-subtle)]">
              Model: Integer Prog
            </div>
          </div>

          {/* Stage 4 */}
          <div className="p-3.5 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[rgba(161,161,170,0.15)] text-[var(--fg-muted)]">
                  STAGE 4
                </span>
                <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
              </div>
              <h3 className="text-xs font-semibold text-[var(--fg)]">Safety Validator</h3>
              <p className="text-[11px] text-[var(--fg-muted)] mt-1">
                Independent clash auditor guaranteeing 0 collision overlap before plan commitment.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--fg-subtle)]">
              Dual-Check: Verified
            </div>
          </div>

          {/* Stage 5 */}
          <div className="p-3.5 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[rgba(62,139,255,0.15)] text-[var(--accent)]">
                  STAGE 5
                </span>
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
              </div>
              <h3 className="text-xs font-semibold text-[var(--fg)]">Live Telemetry</h3>
              <p className="text-[11px] text-[var(--fg-muted)] mt-1">
                WebSocket stream pushing 2-second train coordinates, signals & active work zones.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--fg-subtle)]">
              Feed: /ws/live
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Dataset Table Explorer */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[var(--accent)]" />
            <h2 className="text-[16px] font-semibold text-[var(--fg)]">
              Database Table Explorer
            </h2>
          </div>

          {/* Table Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-[6px] bg-[var(--surface)] border border-[var(--border)] text-xs">
            <button
              onClick={() => setActiveDatasetTab('megablocks')}
              className={`px-3 py-1 rounded-[4px] font-medium transition-all ${
                activeDatasetTab === 'megablocks'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              staged_mega_blocks ({notices.length})
            </button>
            <button
              onClick={() => setActiveDatasetTab('stations')}
              className={`px-3 py-1 rounded-[4px] font-medium transition-all ${
                activeDatasetTab === 'stations'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              osm_stations ({stations.length})
            </button>
            <button
              onClick={() => setActiveDatasetTab('corridors')}
              className={`px-3 py-1 rounded-[4px] font-medium transition-all ${
                activeDatasetTab === 'corridors'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              corridors ({counts.corridors})
            </button>
            <button
              onClick={() => setActiveDatasetTab('assets')}
              className={`px-3 py-1 rounded-[4px] font-medium transition-all ${
                activeDatasetTab === 'assets'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              assets ({counts.assets})
            </button>
            <button
              onClick={() => setActiveDatasetTab('tasks')}
              className={`px-3 py-1 rounded-[4px] font-medium transition-all ${
                activeDatasetTab === 'tasks'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              maintenance_tasks ({counts.maintenance_tasks})
            </button>
            <button
              onClick={() => setActiveDatasetTab('trains')}
              className={`px-3 py-1 rounded-[4px] font-medium transition-all ${
                activeDatasetTab === 'trains'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              train_schedules ({counts.train_schedules})
            </button>
            <button
              onClick={() => setActiveDatasetTab('windows')}
              className={`px-3 py-1 rounded-[4px] font-medium transition-all ${
                activeDatasetTab === 'windows'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              block_windows ({counts.block_windows})
            </button>
            <button
              onClick={() => setActiveDatasetTab('plans')}
              className={`px-3 py-1 rounded-[4px] font-medium transition-all ${
                activeDatasetTab === 'plans'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              maintenance_plans ({counts.plans})
            </button>
          </div>
        </div>

        {/* Tab Content Tables */}
        <div className="rounded-[8px] bg-[var(--surface)] border border-[var(--border)] overflow-hidden shadow-sm">
          {/* TAB: STAGED MEGA BLOCKS */}
          {activeDatasetTab === 'megablocks' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border)] text-[var(--fg-muted)] font-mono">
                    <th className="py-2.5 px-4 font-semibold">ID</th>
                    <th className="py-2.5 px-4 font-semibold">Line</th>
                    <th className="py-2.5 px-4 font-semibold">Section</th>
                    <th className="py-2.5 px-4 font-semibold">Stations (From → To)</th>
                    <th className="py-2.5 px-4 font-semibold">Start – End (IST)</th>
                    <th className="py-2.5 px-4 font-semibold">Type</th>
                    <th className="py-2.5 px-4 font-semibold">OSM Verified</th>
                    <th className="py-2.5 px-4 font-semibold">Source</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Controller Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                  {notices.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-6 px-4 text-center text-[var(--fg-muted)] font-sans">
                        No staged mega-block notices. Use "Fetch Mega-Blocks via Gemini" to extract Sunday maintenance announcements.
                      </td>
                    </tr>
                  ) : (
                    notices.map((n) => (
                      <tr key={n.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                        <td className="py-3 px-4 font-bold text-[var(--accent)]">#{n.id}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded font-bold bg-[var(--surface)] border border-[var(--border)] text-[10px]">
                            {n.line}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-[var(--fg)] font-sans">{n.section}</td>
                        <td className="py-3 px-4 text-[var(--fg-muted)]">{n.from_station} → {n.to_station}</td>
                        <td className="py-3 px-4 font-bold">
                          {new Date(n.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                          {new Date(n.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-[var(--fg-muted)] font-sans">{n.block_type || 'Track/Power'}</td>
                        <td className="py-3 px-4">
                          {n.stations_verified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[var(--success)] bg-[rgba(48,164,108,0.1)] px-1.5 py-0.5 rounded">
                              <Check size={11} /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[var(--warning)] bg-[rgba(247,107,21,0.1)] px-1.5 py-0.5 rounded">
                              <AlertTriangle size={11} /> Unverified
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {n.source_url ? (
                            <a href={n.source_url} target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline inline-flex items-center gap-1">
                              Link <ExternalLink size={10} />
                            </a>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            n.status === 'APPROVED' ? 'bg-[rgba(48,164,108,0.15)] text-[var(--success)]' :
                            n.status === 'REJECTED' ? 'bg-[rgba(229,72,77,0.15)] text-[var(--danger)]' :
                            'bg-[rgba(247,107,21,0.15)] text-[var(--warning)]'
                          }`}>
                            {n.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {n.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button size="sm" variant="primary" onClick={() => handleApproveNotice(n.id)} disabled={approvingId === n.id}>
                                {approvingId === n.id ? 'Approving...' : 'Approve'}
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => handleRejectNotice(n.id)} disabled={rejectingId === n.id}>
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[var(--fg-subtle)] font-sans">
                              {n.block_window_id || 'Processed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: OPENSTREETMAP STATIONS */}
          {activeDatasetTab === 'stations' && (
            <div className="overflow-x-auto">
              <div className="p-3 bg-[var(--bg-subtle)] border-b border-[var(--border)] flex items-center justify-between text-xs">
                <span className="font-mono text-[var(--fg-muted)]">
                  Total Stations in Cache: <strong>{stations.length}</strong> (Filtered: {
                    stationFilterLine === 'ALL' ? stations.length : stations.filter(s => s.line === stationFilterLine).length
                  })
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[var(--fg-muted)]">Filter Line:</span>
                  {['ALL', 'WR', 'CR', 'HR'].map((ln) => (
                    <button
                      key={ln}
                      onClick={() => setStationFilterLine(ln)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                        stationFilterLine === ln ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] text-[var(--fg-muted)] border border-[var(--border)]'
                      }`}
                    >
                      {ln}
                    </button>
                  ))}
                </div>
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border)] text-[var(--fg-muted)] font-mono">
                    <th className="py-2.5 px-4 font-semibold">OSM Identifier</th>
                    <th className="py-2.5 px-4 font-semibold">Station Name</th>
                    <th className="py-2.5 px-4 font-semibold">Suburban Line</th>
                    <th className="py-2.5 px-4 font-semibold">Latitude</th>
                    <th className="py-2.5 px-4 font-semibold">Longitude</th>
                    <th className="py-2.5 px-4 font-semibold">Coordinate Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                  {stations
                    .filter((s) => stationFilterLine === 'ALL' || s.line === stationFilterLine)
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                        <td className="py-2.5 px-4 font-bold text-[var(--accent)]">{s.id}</td>
                        <td className="py-2.5 px-4 font-sans font-medium text-[var(--fg)]">{s.name}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            s.line === 'WR' ? 'bg-[#0070F3]/15 text-[#0070F3]' :
                            s.line === 'CR' ? 'bg-[#F5A623]/15 text-[#F5A623]' :
                            'bg-[#50E3C2]/15 text-[#50E3C2]'
                          }`}>
                            {s.line} Line
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-[var(--fg-muted)]">{s.lat.toFixed(5)}</td>
                        <td className="py-2.5 px-4 text-[var(--fg-muted)]">{s.lon.toFixed(5)}</td>
                        <td className="py-2.5 px-4">
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lon}#map=16/${s.lat}/${s.lon}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 text-[11px]"
                          >
                            View on OSM <ExternalLink size={10} />
                          </a>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 1: CORRIDORS */}
          {activeDatasetTab === 'corridors' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border)] text-[var(--fg-muted)] font-mono">
                    <th className="py-2.5 px-4 font-semibold">ID</th>
                    <th className="py-2.5 px-4 font-semibold">Code</th>
                    <th className="py-2.5 px-4 font-semibold">Corridor Name</th>
                    <th className="py-2.5 px-4 font-semibold">Zone</th>
                    <th className="py-2.5 px-4 font-semibold">Length (KM)</th>
                    <th className="py-2.5 px-4 font-semibold">Assets</th>
                    <th className="py-2.5 px-4 font-semibold">Tasks</th>
                    <th className="py-2.5 px-4 font-semibold">Trains</th>
                    <th className="py-2.5 px-4 font-semibold">Windows</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                  {corridors.map((c) => (
                    <tr key={c.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-3 px-4 font-bold text-[var(--accent)]">{c.id}</td>
                      <td className="py-3 px-4">{c.code}</td>
                      <td className="py-3 px-4 font-sans font-medium text-[var(--fg)]">{c.name}</td>
                      <td className="py-3 px-4 text-[var(--fg-muted)]">{c.zone}</td>
                      <td className="py-3 px-4 font-bold">{c.total_km} km</td>
                      <td className="py-3 px-4">{c.asset_count ?? c.assets ?? 0}</td>
                      <td className="py-3 px-4 text-[var(--warning)]">{c.task_count ?? c.tasks ?? 0}</td>
                      <td className="py-3 px-4">{c.train_count ?? c.trains ?? 0}</td>
                      <td className="py-3 px-4">{c.block_window_count ?? c.windows ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: ASSETS */}
          {activeDatasetTab === 'assets' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border)] text-[var(--fg-muted)] font-mono">
                    <th className="py-2.5 px-4 font-semibold">ID</th>
                    <th className="py-2.5 px-4 font-semibold">Asset Name</th>
                    <th className="py-2.5 px-4 font-semibold">Department</th>
                    <th className="py-2.5 px-4 font-semibold">Type</th>
                    <th className="py-2.5 px-4 font-semibold">Section / KM</th>
                    <th className="py-2.5 px-4 font-semibold">Health Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                  {assets.map((a) => (
                    <tr key={a.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-3 px-4 font-bold text-[var(--accent)]">{a.id}</td>
                      <td className="py-3 px-4 font-sans font-medium text-[var(--fg)]">{a.name}</td>
                      <td className="py-3 px-4">
                        <DepartmentChip department={a.department} />
                      </td>
                      <td className="py-3 px-4 text-[var(--fg-muted)]">{a.type}</td>
                      <td className="py-3 px-4">{a.section} ({a.km_marker})</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={a.health_status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: TASKS */}
          {activeDatasetTab === 'tasks' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border)] text-[var(--fg-muted)] font-mono">
                    <th className="py-2.5 px-4 font-semibold">ID</th>
                    <th className="py-2.5 px-4 font-semibold">Title</th>
                    <th className="py-2.5 px-4 font-semibold">Department</th>
                    <th className="py-2.5 px-4 font-semibold">Asset Link</th>
                    <th className="py-2.5 px-4 font-semibold">Duration</th>
                    <th className="py-2.5 px-4 font-semibold">Crit / Urg</th>
                    <th className="py-2.5 px-4 font-semibold">Overdue</th>
                    <th className="py-2.5 px-4 font-semibold">Priority Score</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                  {tasks.map((t) => (
                    <tr key={t.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-3 px-4 font-bold text-[var(--accent)]">{t.id}</td>
                      <td className="py-3 px-4 font-sans font-medium text-[var(--fg)] max-w-xs truncate">{t.title}</td>
                      <td className="py-3 px-4">
                        <DepartmentChip department={t.department} />
                      </td>
                      <td className="py-3 px-4 text-[var(--fg-muted)]">{t.asset_id}</td>
                      <td className="py-3 px-4">{t.duration_minutes} min</td>
                      <td className="py-3 px-4 font-bold">
                        <span className="text-[var(--danger)]">{t.criticality}</span> / <span>{t.urgency}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-[var(--danger)]">{t.overdue_days}d</td>
                      <td className="py-3 px-4 font-bold text-[var(--accent)]">{t.priority_score}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: TRAINS */}
          {activeDatasetTab === 'trains' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border)] text-[var(--fg-muted)] font-mono">
                    <th className="py-2.5 px-4 font-semibold">Train No</th>
                    <th className="py-2.5 px-4 font-semibold">Name</th>
                    <th className="py-2.5 px-4 font-semibold">Type</th>
                    <th className="py-2.5 px-4 font-semibold">Corridor Section</th>
                    <th className="py-2.5 px-4 font-semibold">Scheduled Passing</th>
                    <th className="py-2.5 px-4 font-semibold">Priority Class</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                  {trains.map((trn) => (
                    <tr key={trn.train_number} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-3 px-4 font-bold text-[var(--accent)]">{trn.train_number}</td>
                      <td className="py-3 px-4 font-sans font-medium text-[var(--fg)]">{trn.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[var(--fg-muted)] border border-[var(--border)] text-[10px]">
                          {trn.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--fg-muted)]">{trn.section}</td>
                      <td className="py-3 px-4 font-bold">{trn.scheduled_passing}</td>
                      <td className="py-3 px-4 font-bold text-[var(--warning)]">Level {trn.priority_class}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: BLOCK WINDOWS */}
          {activeDatasetTab === 'windows' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border)] text-[var(--fg-muted)] font-mono">
                    <th className="py-2.5 px-4 font-semibold">Window ID</th>
                    <th className="py-2.5 px-4 font-semibold">Section</th>
                    <th className="py-2.5 px-4 font-semibold">Time Window</th>
                    <th className="py-2.5 px-4 font-semibold">Date</th>
                    <th className="py-2.5 px-4 font-semibold">Capacity</th>
                    <th className="py-2.5 px-4 font-semibold">Utilized</th>
                    <th className="py-2.5 px-4 font-semibold">Allocated Tasks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                  {blockWindows.map((w) => (
                    <tr key={w.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-3 px-4 font-bold text-[var(--accent)]">{w.id}</td>
                      <td className="py-3 px-4 font-sans font-medium text-[var(--fg)]">{w.section}</td>
                      <td className="py-3 px-4 font-bold">{w.start_time} – {w.end_time}</td>
                      <td className="py-3 px-4 text-[var(--fg-muted)]">{w.date}</td>
                      <td className="py-3 px-4 font-bold">{w.capacity_minutes} min</td>
                      <td className="py-3 px-4 text-[var(--warning)]">{w.utilized_minutes} min</td>
                      <td className="py-3 px-4">{w.allocated_tasks_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 6: MAINTENANCE PLANS */}
          {activeDatasetTab === 'plans' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border)] text-[var(--fg-muted)] font-mono">
                    <th className="py-2.5 px-4 font-semibold">Plan ID</th>
                    <th className="py-2.5 px-4 font-semibold">Plan Name</th>
                    <th className="py-2.5 px-4 font-semibold">Algorithm</th>
                    <th className="py-2.5 px-4 font-semibold">Scheduled</th>
                    <th className="py-2.5 px-4 font-semibold">Unscheduled</th>
                    <th className="py-2.5 px-4 font-semibold">Total Minutes</th>
                    <th className="py-2.5 px-4 font-semibold">Utilization</th>
                    <th className="py-2.5 px-4 font-semibold">Conflicts</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                  {plans.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-6 px-4 text-center text-[var(--fg-muted)] font-sans">
                        No maintenance plans generated yet. Click "Run OR-Tools Solver" above to generate and commit an optimization plan.
                      </td>
                    </tr>
                  ) : (
                    plans.map((p) => (
                      <tr key={p.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                        <td className="py-3 px-4 font-bold text-[var(--accent)]">{p.id}</td>
                        <td className="py-3 px-4 font-sans font-medium text-[var(--fg)]">{p.name}</td>
                        <td className="py-3 px-4 text-[var(--fg-muted)]">{p.algorithm_used}</td>
                        <td className="py-3 px-4 font-bold text-[var(--success)]">{p.scheduled_task_count}</td>
                        <td className="py-3 px-4 text-[var(--danger)]">{p.unscheduled_task_count}</td>
                        <td className="py-3 px-4 font-bold">{p.total_maintenance_minutes} min</td>
                        <td className="py-3 px-4 font-bold text-[var(--accent)]">{p.block_utilization_percent}%</td>
                        <td className="py-3 px-4 font-bold text-[var(--success)]">{p.conflicts_detected}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={p.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
