import { useState, useEffect, useRef, useCallback } from 'react';
import {
  LiveTrain,
  LiveBlock,
  LiveEvent,
  RealtimeSnapshot,
  fetchRealtimeSnapshot,
  triggerEmergencyTrackDefect,
  triggerTrainDelay
} from '../api/realtime';

export interface UseRealtimeFeedReturn {
  trains: LiveTrain[];
  blocks: LiveBlock[];
  events: LiveEvent[];
  systemHealth: RealtimeSnapshot['system_health'] | null;
  isConnected: boolean;
  lastUpdated: string | null;
  triggerEmergency: (section: string, description: string) => Promise<void>;
  simulateTrainDelay: (trainNumber: string, delayMinutes: number) => Promise<void>;
  refreshSnapshot: () => Promise<void>;
}

export const useRealtimeFeed = (): UseRealtimeFeedReturn => {
  const [trains, setTrains] = useState<LiveTrain[]>([]);
  const [blocks, setBlocks] = useState<LiveBlock[]>([]);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [systemHealth, setSystemHealth] = useState<RealtimeSnapshot['system_health'] | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSnapshot = useCallback((snapshot: RealtimeSnapshot) => {
    if (snapshot.trains) setTrains(snapshot.trains);
    if (snapshot.blocks) setBlocks(snapshot.blocks);
    if (snapshot.events) setEvents(snapshot.events);
    if (snapshot.system_health) setSystemHealth(snapshot.system_health);
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  const refreshSnapshot = useCallback(async () => {
    try {
      const snap = await fetchRealtimeSnapshot();
      handleSnapshot(snap);
      setIsConnected(true);
    } catch (err) {
      console.warn('[RealtimeFeed] Snapshot fetch error (running in local fallback mode):', err);
    }
  }, [handleSnapshot]);

  // Connect WebSocket with auto-reconnection and polling fallback
  useEffect(() => {
    let unmounted = false;

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // In dev, Vite proxies /ws to backend port 8000
        const wsUrl = `${protocol}//${window.location.host}/ws/live`;

        console.log(`[RealtimeFeed] Connecting to WebSocket: ${wsUrl}`);
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (unmounted) return;
          console.log('[RealtimeFeed] WebSocket connection established');
          setIsConnected(true);
          // Cancel any fallback polling while WS is healthy
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
        };

        ws.onmessage = (event) => {
          if (unmounted) return;
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'INITIAL_SNAPSHOT' || payload.type === 'TELEMETRY_UPDATE') {
              handleSnapshot(payload.data);
            } else if (payload.snapshot) {
              handleSnapshot(payload.snapshot);
            }
          } catch (e) {
            // Ignore non-json frames (e.g. pong)
          }
        };

        ws.onerror = (err) => {
          console.warn('[RealtimeFeed] WebSocket error, starting polling fallback...', err);
          setIsConnected(false);
        };

        ws.onclose = () => {
          if (unmounted) return;
          setIsConnected(false);
          console.log('[RealtimeFeed] WebSocket disconnected. Attempting reconnect in 3s...');

          // Fallback to polling every 3 seconds
          if (!pollTimerRef.current) {
            pollTimerRef.current = setInterval(refreshSnapshot, 3000);
          }

          reconnectTimerRef.current = setTimeout(() => {
            if (!unmounted) connectWebSocket();
          }, 3000);
        };
      } catch (err) {
        console.warn('[RealtimeFeed] WebSocket initiation failed, using polling fallback', err);
        if (!pollTimerRef.current) {
          pollTimerRef.current = setInterval(refreshSnapshot, 3000);
        }
      }
    };

    // Initial snapshot load
    refreshSnapshot();
    connectWebSocket();

    return () => {
      unmounted = true;
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [handleSnapshot, refreshSnapshot]);

  const triggerEmergency = async (section: string, description: string) => {
    try {
      await triggerEmergencyTrackDefect(section, description);
      await refreshSnapshot();
    } catch (e) {
      console.error('[RealtimeFeed] Error triggering emergency defect:', e);
    }
  };

  const simulateTrainDelay = async (trainNumber: string, delayMinutes: number) => {
    try {
      await triggerTrainDelay(trainNumber, delayMinutes);
      await refreshSnapshot();
    } catch (e) {
      console.error('[RealtimeFeed] Error simulating train delay:', e);
    }
  };

  return {
    trains,
    blocks,
    events,
    systemHealth,
    isConnected,
    lastUpdated,
    triggerEmergency,
    simulateTrainDelay,
    refreshSnapshot
  };
};
