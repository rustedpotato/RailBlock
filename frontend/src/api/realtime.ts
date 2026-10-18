import { apiClient } from './client';

export interface LiveTrain {
  train_number: string;
  name: string;
  type: string;
  line: 'western' | 'central' | 'harbour';
  section: string;
  direction: 'UP' | 'DOWN';
  km: number;
  speed: number;
  target_speed: number;
  delay_minutes: number;
  status: 'RUNNING' | 'STOPPED' | 'DELAYED';
  next_stop: string;
  signal_aspect: 'GREEN' | 'DOUBLE_YELLOW' | 'YELLOW' | 'RED';
  priority: number;
}

export interface LiveBlock {
  section: string;
  line: string;
  status: 'FREE' | 'OCCUPIED' | 'CAUTION' | 'MAINTENANCE_BLOCK';
  signal: 'GREEN' | 'DOUBLE_YELLOW' | 'YELLOW' | 'RED';
  speed_limit: number;
  active_train: string | null;
  active_task_id?: string | null;
  occupancy_pct: number;
}

export interface LiveEvent {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
}

export interface RealtimeSnapshot {
  timestamp: string;
  tick: number;
  trains_count: number;
  trains: LiveTrain[];
  blocks: LiveBlock[];
  events: LiveEvent[];
  system_health: {
    gps_sync: string;
    axle_counters: string;
    active_speed_restrictions: number;
    occupied_blocks: number;
  };
}

export const fetchRealtimeSnapshot = async (): Promise<RealtimeSnapshot> => {
  const res = await apiClient.get<RealtimeSnapshot>('/api/realtime/snapshot');
  return res.data;
};

export const triggerEmergencyTrackDefect = async (section: string, description: string) => {
  const res = await apiClient.post('/api/realtime/trigger-defect', { section, description });
  return res.data;
};

export const triggerTrainDelay = async (train_number: string, delay_minutes: number) => {
  const res = await apiClient.post('/api/realtime/trigger-delay', { train_number, delay_minutes });
  return res.data;
};
