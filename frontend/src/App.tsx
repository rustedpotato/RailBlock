import React, { useEffect, useState, useCallback } from 'react';
import {
  Activity,
  Server,
  Database,
  Train,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Radio,
  Layers,
  ShieldCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  Zap
} from 'lucide-react';
import { getHealthStatus } from './api/health';
import { HealthResponse } from './types';
import { formatDate } from './utils';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [autoPoll, setAutoPoll] = useState<boolean>(false);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();
    try {
      const data = await getHealthStatus();
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setHealth(data);
      setLastChecked(new Date());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reach RailBlock AI backend server.';
      setError(msg);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    if (!autoPoll) return;
    const interval = setInterval(() => {
      fetchHealth();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPoll, fetchHealth]);

  const departments = [
    {
      code: 'ENG',
      name: 'Engineering',
      subtitle: 'Civil / Track & Bridges',
      description: 'Track renewal, deep screening, tamping, ballast regulation, ultrasonic rail testing.',
      color: 'from-amber-500/20 to-amber-700/10 border-amber-500/40 text-amber-300'
    },
    {
      code: 'TRD',
      name: 'Traction Distribution',
      subtitle: 'Electrical / OHE',
      description: 'Overhead 25kV line maintenance, power block isolations, cantilever adjustments.',
      color: 'from-cyan-500/20 to-cyan-700/10 border-cyan-500/40 text-cyan-300'
    },
    {
      code: 'S&T',
      name: 'Signal & Telecom',
      subtitle: 'Interlocking & Point Machines',
      description: 'Axle counter testing, electronic interlocking, point machines, signal post overhauls.',
      color: 'from-emerald-500/20 to-emerald-700/10 border-emerald-500/40 text-emerald-300'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070B19] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Train className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  RailBlock AI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-950 border border-cyan-500/40 text-cyan-400 rounded-full">
                  SIH26027
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Ministry of Railways • Automated Maintenance Block Planning
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoPoll(!autoPoll)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center space-x-1.5 transition-all ${
                autoPoll
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle automatic 5-second polling"
            >
              <Radio className={`h-3.5 w-3.5 ${autoPoll ? 'animate-pulse text-cyan-400' : ''}`} />
              <span>{autoPoll ? 'Live Polling ON' : 'Live Polling OFF'}</span>
            </button>

            <button
              onClick={fetchHealth}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-500/20"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Checking...' : 'Check Connection'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-[#0E172E]/80 to-slate-950 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              <span>Smart India Hackathon 2026 Ready</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
              AI-Powered Automatic Block Planning System
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Consolidating maintenance tasks across <span className="text-amber-300 font-semibold">Engineering</span>,{' '}
              <span className="text-cyan-300 font-semibold">Traction Distribution</span>, and{' '}
              <span className="text-emerald-300 font-semibold">S&T</span> departments against train timetable constraints
              to maximize rail asset availability and minimize train detention.
            </p>
          </div>
        </section>

        {/* Live System Integration Card */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading text-slate-200 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              <span>Backend Service & Connectivity Health</span>
            </h2>
            {lastChecked && (
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Last verified: {lastChecked.toLocaleTimeString()}</span>
              </span>
            )}
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-6 text-red-200 space-y-4 shadow-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-red-300">Backend Server Unreachable</h3>
                  <p className="text-sm text-red-200/90">{error}</p>
                </div>
              </div>
              <div className="bg-slate-900/80 rounded-lg p-4 border border-red-500/20 text-xs font-mono space-y-2">
                <p className="text-slate-300 font-sans font-semibold">To start the FastAPI backend server:</p>
                <div className="text-cyan-300 bg-slate-950 p-2.5 rounded border border-slate-800 select-all">
                  cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
                </div>
                <p className="text-slate-400">Ensure virtual environment is activated and requirements are installed.</p>
              </div>
            </div>
          ) : health ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Overall Status */}
              <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-slate-900/60 p-5 shadow-lg backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">FastAPI Core</span>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold font-heading text-emerald-300 capitalize">{health.status}</div>
                  <p className="text-xs text-slate-400 mt-1">{health.app_name} (v{health.version})</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Latency</span>
                  <span className="font-mono text-cyan-400 font-semibold">{latency !== null ? `${latency} ms` : '—'}</span>
                </div>
              </div>

              {/* Database Layer */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Database Layer</span>
                  <Database className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold font-heading text-white capitalize">{health.database.status}</div>
                  <p className="text-xs text-slate-400 mt-1">Engine: <span className="text-cyan-300 font-mono uppercase">{health.database.engine}</span></p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 truncate">
                  {health.database.details || 'Active connection pool'}
                </div>
              </div>

              {/* Constraint Optimization Subsystem */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">OR-Tools Solver</span>
                  <Cpu className="h-5 w-5 text-amber-400" />
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold font-heading text-amber-300 capitalize">
                    {health.services.or_tools_solver}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">CP-SAT Block Engine</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Prioritization</span>
                  <span className="text-emerald-400 font-semibold">{health.services.prioritization_engine}</span>
                </div>
              </div>

              {/* Environment Info */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Environment</span>
                  <Server className="h-5 w-5 text-purple-400" />
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold font-heading text-purple-300 capitalize">{health.environment}</div>
                  <p className="text-xs text-slate-400 mt-1">Time: {formatDate(health.timestamp)}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <a
                    href="http://localhost:8000/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 inline-flex items-center space-x-1"
                  >
                    <span>Swagger UI</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href="http://localhost:8000/health"
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-slate-200 inline-flex items-center space-x-1"
                  >
                    <span>Raw JSON</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* 3 Department Modules Overview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading text-slate-200 flex items-center space-x-2">
              <Layers className="h-5 w-5 text-cyan-400" />
              <span>Multi-Departmental Integration Scope</span>
            </h2>
            <span className="text-xs text-slate-400">Indian Railways Maintenance Coordination</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {departments.map((dept) => (
              <div
                key={dept.code}
                className={`rounded-xl border bg-gradient-to-br p-5 shadow-lg relative overflow-hidden transition-all hover:scale-[1.01] ${dept.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10">
                    {dept.code}
                  </span>
                  <ShieldCheck className="h-4 w-4 opacity-75" />
                </div>
                <h3 className="mt-3 text-lg font-bold font-heading text-white">{dept.name}</h3>
                <h4 className="text-xs font-medium text-slate-300 mb-2">{dept.subtitle}</h4>
                <p className="text-xs text-slate-300/90 leading-relaxed">{dept.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* System Architecture & Next Phases */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <h2 className="text-base font-bold font-heading text-slate-200">System Architecture & Hackathon Roadmap</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="font-semibold text-cyan-300">Phase 1: Foundation (Current)</div>
              <p className="text-slate-400">
                Modular full-stack scaffold, health diagnostics, CORS cross-communication, and typed data interfaces.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="font-semibold text-slate-200">Phase 2: Asset & Demands Intake</div>
              <p className="text-slate-400">
                Corridor section schemas, synthetic Indian Railways demo dataset, and multi-department demand submission.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="font-semibold text-slate-200">Phase 3: OR-Tools Optimization</div>
              <p className="text-slate-400">
                Constraint satisfaction engine, shadow block consolidation, conflict matrix, and interactive timetable visualizer.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>RailBlock AI — SIH 2026 Problem Statement SIH26027</span>
          <span className="flex items-center space-x-1">
            <span>Built with React + Vite + FastAPI + OR-Tools</span>
            <ArrowRight className="h-3 w-3 text-cyan-400" />
          </span>
        </div>
      </footer>
    </div>
  );
};
