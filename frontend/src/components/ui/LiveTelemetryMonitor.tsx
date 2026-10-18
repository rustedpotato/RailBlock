import React, { useState } from 'react';
import { useRealtimeFeed } from '../../hooks/useRealtimeFeed';
import { useLine } from '../../context/LineContext';
import {
  Radio,
  AlertTriangle,
  Zap,
  Clock,
  Gauge,
  ShieldAlert,
  Train,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const LiveTelemetryMonitor: React.FC = () => {
  const {
    trains,
    blocks,
    events,
    systemHealth,
    isConnected,
    lastUpdated,
    triggerEmergency,
    simulateTrainDelay,
    refreshSnapshot
  } = useRealtimeFeed();

  const { selectedLine } = useLine();
  const [isTriggering, setIsTriggering] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const filteredTrains = selectedLine === 'all'
    ? trains
    : trains.filter((t) => t.line === selectedLine);

  const filteredBlocks = selectedLine === 'all'
    ? blocks
    : blocks.filter((b) => b.line === selectedLine);

  const handleTriggerEmergency = async () => {
    setIsTriggering(true);
    setStatusMsg('Broadcasting emergency USFD rail flaw detection...');
    try {
      await triggerEmergency(
        'Mumbai Central – Bandra Fast',
        'Severe transverse ultrasonic flaw at KM 14/18. Immediate 20 km/h caution imposed.'
      );
      setStatusMsg('Emergency caution order broadcasted across network!');
      setTimeout(() => setStatusMsg(null), 4000);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleSimulateDelay = async () => {
    setIsTriggering(true);
    setStatusMsg('Simulating Rajdhani Express delay (+25 min)...');
    try {
      await simulateTrainDelay('12951', 25);
      setStatusMsg('Rajdhani delay injected. Dynamic clash detector triggered!');
      setTimeout(() => setStatusMsg(null), 4000);
    } finally {
      setIsTriggering(false);
    }
  };

  const getSignalBadge = (signal: string) => {
    switch (signal) {
      case 'GREEN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            PROCEED (GREEN)
          </span>
        );
      case 'DOUBLE_YELLOW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            ATTENTION (2Y)
          </span>
        );
      case 'YELLOW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#EAB308]/15 text-[#EAB308] border border-[#EAB308]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308]" />
            CAUTION (YELLOW)
          </span>
        );
      case 'RED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            DANGER (RED)
          </span>
        );
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm p-4 space-y-4">
      {/* 1. Header with live status & simulation triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <Radio className={`w-5 h-5 ${isConnected ? 'text-[#10B981] animate-pulse' : 'text-[var(--fg-muted)]'}`} />
            {isConnected && (
              <span className="absolute w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--fg)]">
                Live Railway Telemetry Engine
              </h2>
              <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-bold border ${
                isConnected
                  ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                  : 'bg-[var(--surface-hover)] text-[var(--fg-muted)] border-[var(--border)]'
              }`}>
                {isConnected ? '● WEBSOCKET LIVE' : '○ CONNECTING / STANDBY'}
              </span>
            </div>
            <p className="text-xs text-[var(--fg-muted)] font-mono">
              Real-time track circuits, train positions & Kavach/signaling telemetry • Synced at {lastUpdated || 'Connecting...'}
            </p>
          </div>
        </div>

        {/* Action Controls for Interactive Demo */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleTriggerEmergency}
            disabled={isTriggering}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/20 transition-all disabled:opacity-50"
            title="Simulate sudden track flaw and emergency block requirement"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Simulate Track Flaw</span>
          </button>

          <button
            onClick={handleSimulateDelay}
            disabled={isTriggering}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 hover:bg-[#F59E0B]/20 transition-all disabled:opacity-50"
            title="Simulate Rajdhani +25 min delay"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Delay Rajdhani (+25m)</span>
          </button>

          <button
            onClick={() => refreshSnapshot()}
            className="p-1.5 rounded-lg text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all"
            title="Force refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Status banner if action fired */}
      {statusMsg && (
        <div className="p-2.5 rounded-lg bg-[#0070F3]/10 border border-[#0070F3]/30 text-xs font-mono text-[#0070F3] flex items-center gap-2 animate-fade-in">
          <Zap className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 2. Live Moving Trains Roster */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider font-mono">
            Active Train Telemetry ({filteredTrains.length} Services Monitored)
          </span>
          {systemHealth && (
            <span className="text-[11px] font-mono text-[var(--fg-muted)]">
              Axle Counters: <strong className="text-[#10B981]">{systemHealth.axle_counters}</strong>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredTrains.slice(0, 8).map((train) => (
            <div
              key={train.train_number}
              className="p-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-1">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Train className="w-3.5 h-3.5 text-[#0070F3]" />
                    <span className="text-xs font-mono font-bold text-[var(--fg)]">
                      {train.train_number}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[var(--surface)] text-[var(--fg-muted)] border border-[var(--border)]">
                      {train.direction}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-[var(--fg)] truncate max-w-[170px]" title={train.name}>
                    {train.name}
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  train.delay_minutes > 0
                    ? 'bg-[#EF4444]/15 text-[#EF4444]'
                    : 'bg-[#10B981]/15 text-[#10B981]'
                }`}>
                  {train.delay_minutes > 0 ? `+${train.delay_minutes}m` : 'RT'}
                </span>
              </div>

              {/* Progress & Speed bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[var(--fg-muted)] flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-[#10B981]" />
                    <strong>{Math.round(train.speed)}</strong> km/h
                  </span>
                  <span className="text-[var(--fg-muted)]">KM {train.km.toFixed(1)}</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0070F3] to-[#10B981] transition-all duration-1000"
                    style={{ width: `${Math.min(100, (train.speed / 130) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Current Section & Signal Aspect */}
              <div className="pt-1 border-t border-[var(--border)] flex items-center justify-between text-[11px]">
                <span className="text-[var(--fg-muted)] truncate max-w-[120px] text-[10px] font-mono" title={train.section}>
                  {train.section.split('–')[0]}
                </span>
                {getSignalBadge(train.signal_aspect)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Live Block Occupancy & Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
        {/* Block Occupancy Strip */}
        <div className="lg:col-span-2 space-y-2">
          <span className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider font-mono">
            Track Block Possession & Occupancy Status
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredBlocks.slice(0, 6).map((block) => (
              <div
                key={block.section}
                className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[var(--fg)] truncate">
                    {block.section}
                  </div>
                  <div className="text-[11px] font-mono text-[var(--fg-muted)] flex items-center gap-1">
                    <span>Limit: {block.speed_limit} km/h</span>
                    {block.active_train && (
                      <span className="text-[#0070F3] font-bold">• {block.active_train}</span>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {block.status === 'OCCUPIED' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
                      OCCUPIED
                    </span>
                  ) : block.status === 'CAUTION' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 animate-pulse">
                      CAUTION (20k)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                      CLEAR
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Operational Events */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider font-mono">
            Live Stream Feed
          </span>
          <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] space-y-2 max-h-[160px] overflow-y-auto">
            {events.slice(-4).reverse().map((evt) => (
              <div key={evt.id} className="text-xs space-y-0.5 border-b border-[var(--border)] pb-1.5 last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={`font-bold ${
                    evt.severity === 'CRITICAL' ? 'text-[#EF4444]' : evt.severity === 'WARNING' ? 'text-[#F59E0B]' : 'text-[#0070F3]'
                  }`}>
                    {evt.title}
                  </span>
                  <span className="text-[var(--fg-muted)]">{evt.timestamp}</span>
                </div>
                <p className="text-[11px] text-[var(--fg-muted)] leading-tight">
                  {evt.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
