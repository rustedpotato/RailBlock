import { apiClient } from './client';
import {
  MaintenanceTaskItem,
  TrainScheduleItem,
  AssetItem,
  BlockWindowItem,
  ConflictItem,
  Department,
  AssetHealth,
  AssetType,
  BlockWindowType
} from '../types/railblock';
import {
  MOCK_TASKS,
  MOCK_TRAINS,
  MOCK_ASSETS,
  MOCK_BLOCK_WINDOWS,
  MOCK_CONFLICTS
} from '../data/mockData';

export interface DashboardSummaryData {
  total_assets: number;
  assets_by_status: Record<string, number>;
  assets_by_department: Record<string, number>;
  total_tasks: number;
  tasks_by_department: Record<string, number>;
  tasks_by_status: Record<string, number>;
  overdue_tasks_count: number;
  high_criticality_tasks_count: number;
  total_trains: number;
  total_block_windows: number;
  total_corridors: number;
  latest_plan?: any;
}

export interface SyncedRailwayData {
  tasks: MaintenanceTaskItem[];
  trains: TrainScheduleItem[];
  assets: AssetItem[];
  blockWindows: BlockWindowItem[];
  conflicts: ConflictItem[];
  dashboardSummary: DashboardSummaryData | null;
  isBackendConnected: boolean;
}

// Maps corridor IDs to representative Mumbai Suburban line sections
export const corridorToSection = (corridorId?: string, fallback = 'Mumbai Central – Bandra Fast'): string => {
  if (!corridorId) return fallback;
  if (corridorId.includes('BCT-VR')) return 'Mumbai Central – Bandra Fast';
  if (corridorId.includes('HARBOUR')) return 'Kurla – Vashi Harbour';
  if (corridorId.includes('NDLS') || corridorId.includes('CR')) return 'Kalyan – Kasara Up';
  return fallback;
};

export const fetchAllRailwayData = async (): Promise<SyncedRailwayData> => {
  try {
    const [tasksRes, trainsRes, assetsRes, windowsRes, summaryRes] = await Promise.allSettled([
      apiClient.get<any[]>('/api/tasks'),
      apiClient.get<any[]>('/api/trains'),
      apiClient.get<any[]>('/api/assets'),
      apiClient.get<any[]>('/api/block-windows'),
      apiClient.get<DashboardSummaryData>('/api/dashboard/summary'),
    ]);

    let mergedTasks = [...MOCK_TASKS];
    if (tasksRes.status === 'fulfilled' && Array.isArray(tasksRes.value.data) && tasksRes.value.data.length > 0) {
      const dbTasks: MaintenanceTaskItem[] = tasksRes.value.data.map((t, idx) => {
        const existing = MOCK_TASKS.find((m) => m.id === t.id);
        const section = existing ? existing.section : corridorToSection(t.corridor_id);
        return {
          id: t.id,
          rank: existing?.rank ?? idx + 1,
          title: t.title,
          description: t.description || `Maintenance demand registered for section ${section}.`,
          department: t.department as Department,
          asset_id: t.asset_id,
          section,
          duration_minutes: t.duration_minutes,
          criticality: t.criticality,
          urgency: t.urgency,
          overdue_days: t.overdue_days,
          priority_score: existing?.priority_score ?? Math.min(99, Math.round((t.criticality * 7 + t.urgency * 6 + 15) * 1.1)),
          earliest_start: typeof t.earliest_start === 'string' ? t.earliest_start.slice(0, 16).replace('T', ' ') : '2026-10-20 01:00',
          deadline: typeof t.deadline === 'string' ? t.deadline.slice(0, 16).replace('T', ' ') : '2026-10-20 06:00',
          status: t.status,
          required_block_type: existing?.required_block_type ?? (t.department === 'TRACTION_DISTRIBUTION' ? 'Power & Traffic Block' : 'Traffic Block'),
          breakdown: existing?.breakdown ?? {
            criticality: t.criticality * 7,
            urgency: t.urgency * 6,
            overdue: t.overdue_days * 3,
            operational_impact: 14
          },
          linked_defects: existing?.linked_defects ?? [],
          activity_log: existing?.activity_log ?? [
            {
              timestamp: 'Live DB Sync',
              actor: 'FastAPI Railway Repository',
              message: 'Synchronized from RailBlock database schema'
            }
          ],
          assigned_slot: existing?.assigned_slot,
          assigned_reason: existing?.assigned_reason
        };
      });

      // Merge: DB tasks take precedence, followed by mock tasks not in DB
      const dbIds = new Set(dbTasks.map((t) => t.id));
      mergedTasks = [...dbTasks, ...MOCK_TASKS.filter((t) => !dbIds.has(t.id))];
    }

    let mergedTrains = [...MOCK_TRAINS];
    if (trainsRes.status === 'fulfilled' && Array.isArray(trainsRes.value.data) && trainsRes.value.data.length > 0) {
      const dbTrains: TrainScheduleItem[] = trainsRes.value.data.map((t) => {
        const existing = MOCK_TRAINS.find((m) => m.train_number === t.train_number);
        const formatTime = (isoStr?: string) => {
          if (!isoStr) return '06:00 – 07:00';
          const d = new Date(isoStr);
          return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
        };
        const timeSpan = `${formatTime(t.scheduled_start)} – ${formatTime(t.scheduled_end)}`;

        let trainType: 'Express' | 'Passenger' | 'Freight' | 'Local' = 'Express';
        if (t.train_type === 'FREIGHT') trainType = 'Freight';
        else if (t.train_type === 'EXPRESS' || t.train_type === 'SUPERFAST') trainType = 'Express';
        else if (t.train_type === 'VANDE_BHARAT' || t.train_type === 'RAJDHANI') trainType = 'Express';

        return {
          train_number: t.train_number,
          name: t.train_name,
          type: trainType,
          section: existing ? existing.section : corridorToSection(t.corridor_id),
          scheduled_passing: existing?.scheduled_passing ?? timeSpan,
          priority_class: t.priority_level ?? existing?.priority_class ?? 3
        };
      });

      const dbTrainNums = new Set(dbTrains.map((t) => t.train_number));
      mergedTrains = [...dbTrains, ...MOCK_TRAINS.filter((t) => !dbTrainNums.has(t.train_number))];
    }

    let mergedAssets = [...MOCK_ASSETS];
    if (assetsRes.status === 'fulfilled' && Array.isArray(assetsRes.value.data) && assetsRes.value.data.length > 0) {
      const dbAssets: AssetItem[] = assetsRes.value.data.map((a) => {
        const existing = MOCK_ASSETS.find((m) => m.id === a.id);
        const mapHealth = (status?: string): AssetHealth => {
          if (status === 'DEGRADED') return 'Degraded';
          if (status === 'MAINTENANCE_REQUIRED' || status === 'UNDER_MAINTENANCE') return 'Critical';
          return 'Good';
        };

        const mapType = (type?: string): AssetType => {
          if (type?.includes('TRACK')) return 'Track';
          if (type?.includes('OHE')) return 'OHE';
          if (type?.includes('SIGNAL')) return 'Signal';
          if (type?.includes('POINT')) return 'Point Machine';
          return 'Track';
        };

        return {
          id: a.id,
          name: a.name,
          type: existing?.type ?? mapType(a.asset_type),
          department: a.department as Department,
          section: existing ? existing.section : corridorToSection(a.corridor_id),
          km_marker: a.location_km ? `KM ${a.location_km.toFixed(1)}` : existing?.km_marker ?? 'KM 14/18',
          health_status: existing?.health_status ?? mapHealth(a.availability_status),
          open_defects: existing?.open_defects ?? 1,
          last_maintained: existing?.last_maintained ?? '2026-09-15',
          next_due: existing?.next_due ?? '2026-10-25',
          availability_sparkline: existing?.availability_sparkline ?? [98, 97, 96, 95, 96, 97, 98]
        };
      });

      const dbAssetIds = new Set(dbAssets.map((a) => a.id));
      mergedAssets = [...dbAssets, ...MOCK_ASSETS.filter((a) => !dbAssetIds.has(a.id))];
    }

    let mergedWindows = [...MOCK_BLOCK_WINDOWS];
    if (windowsRes.status === 'fulfilled' && Array.isArray(windowsRes.value.data) && windowsRes.value.data.length > 0) {
      const dbWindows: BlockWindowItem[] = windowsRes.value.data.map((w) => {
        const existing = MOCK_BLOCK_WINDOWS.find((m) => m.id === w.id);
        const formatTime = (isoStr?: string) => {
          if (!isoStr) return '01:30';
          const d = new Date(isoStr);
          return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
        };

        return {
          id: w.id,
          section: existing ? existing.section : corridorToSection(w.corridor_id),
          start_time: formatTime(w.start_time),
          end_time: formatTime(w.end_time),
          date: typeof w.start_time === 'string' ? w.start_time.slice(0, 10) : '2026-10-20',
          type: (existing?.type ?? (w.available_capacity_minutes > 180 ? 'MEGA' : 'NIGHT')) as BlockWindowType,
          capacity_minutes: w.available_capacity_minutes,
          utilized_minutes: existing?.utilized_minutes ?? Math.round(w.available_capacity_minutes * 0.75),
          allocated_tasks_count: existing?.allocated_tasks_count ?? 3
        };
      });

      const dbWinIds = new Set(dbWindows.map((w) => w.id));
      mergedWindows = [...dbWindows, ...MOCK_BLOCK_WINDOWS.filter((w) => !dbWinIds.has(w.id))];
    }

    const summary = summaryRes.status === 'fulfilled' ? summaryRes.value.data : null;

    return {
      tasks: mergedTasks,
      trains: mergedTrains,
      assets: mergedAssets,
      blockWindows: mergedWindows,
      conflicts: MOCK_CONFLICTS,
      dashboardSummary: summary,
      isBackendConnected: true
    };
  } catch (err) {
    console.warn('[DataSync] Backend fetch failed, operating in standalone demo mode:', err);
    return {
      tasks: MOCK_TASKS,
      trains: MOCK_TRAINS,
      assets: MOCK_ASSETS,
      blockWindows: MOCK_BLOCK_WINDOWS,
      conflicts: MOCK_CONFLICTS,
      dashboardSummary: null,
      isBackendConnected: false
    };
  }
};
