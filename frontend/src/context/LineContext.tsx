import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { LineId, LINES, getLineForSection } from '../data/lines';
import {
  MOCK_TASKS,
  MOCK_TRAINS,
  MOCK_ASSETS,
  MOCK_BLOCK_WINDOWS,
  MOCK_CONFLICTS
} from '../data/mockData';
import {
  MaintenanceTaskItem,
  TrainScheduleItem,
  AssetItem,
  BlockWindowItem,
  ConflictItem
} from '../types/railblock';
import { fetchAllRailwayData, DashboardSummaryData } from '../api/dataSync';
import { apiClient } from '../api/client';

interface LineContextValue {
  selectedLine: LineId;
  setSelectedLine: (line: LineId) => void;
  tasks: MaintenanceTaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<MaintenanceTaskItem[]>>;
  trains: TrainScheduleItem[];
  assets: AssetItem[];
  blockWindows: BlockWindowItem[];
  conflicts: ConflictItem[];
  setConflicts: React.Dispatch<React.SetStateAction<ConflictItem[]>>;
  dashboardSummary: DashboardSummaryData | null;
  isLiveDbConnected: boolean;
  refreshData: () => Promise<void>;
  addTask: (task: MaintenanceTaskItem) => Promise<void>;
  resolveConflict: (conflictId: string, resolutionId: string) => void;
}

const LineContext = createContext<LineContextValue | undefined>(undefined);

export const LineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLine, setSelectedLine] = useState<LineId>(
    () => (localStorage.getItem('railblock-line') as LineId) || 'all'
  );

  const [tasks, setTasks] = useState<MaintenanceTaskItem[]>(MOCK_TASKS);
  const [trains, setTrains] = useState<TrainScheduleItem[]>(MOCK_TRAINS);
  const [assets, setAssets] = useState<AssetItem[]>(MOCK_ASSETS);
  const [blockWindows, setBlockWindows] = useState<BlockWindowItem[]>(MOCK_BLOCK_WINDOWS);
  const [conflicts, setConflicts] = useState<ConflictItem[]>(MOCK_CONFLICTS);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummaryData | null>(null);
  const [isLiveDbConnected, setIsLiveDbConnected] = useState<boolean>(false);

  const refreshData = useCallback(async () => {
    try {
      const liveData = await fetchAllRailwayData();
      setTasks(liveData.tasks);
      setTrains(liveData.trains);
      setAssets(liveData.assets);
      setBlockWindows(liveData.blockWindows);
      setConflicts(liveData.conflicts);
      setDashboardSummary(liveData.dashboardSummary);
      setIsLiveDbConnected(liveData.isBackendConnected);
    } catch (err) {
      console.warn('[LineContext] Data fetch error:', err);
    }
  }, []);

  // Fetch real database records on initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addTask = async (newTask: MaintenanceTaskItem) => {
    setTasks((prev) => [newTask, ...prev]);

    // Persist to backend database
    try {
      await apiClient.post('/api/tasks', {
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        department: newTask.department,
        asset_id: newTask.asset_id,
        corridor_id: 'CORR-BCT-VR',
        duration_minutes: newTask.duration_minutes,
        criticality: newTask.criticality,
        urgency: newTask.urgency,
        overdue_days: newTask.overdue_days,
        earliest_start: new Date().toISOString(),
        deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
        status: 'PENDING'
      });
    } catch (err) {
      console.log('[LineContext] Task added locally, backend offline:', err);
    }
  };

  const resolveConflict = (conflictId: string, resolutionId: string) => {
    setConflicts((prev) =>
      prev.map((c) =>
        c.id === conflictId
          ? { ...c, status: 'RESOLVED', appliedResolutionId: resolutionId }
          : c
      )
    );
  };

  const update = (line: LineId) => {
    localStorage.setItem('railblock-line', line);
    setSelectedLine(line);
  };

  return (
    <LineContext.Provider
      value={{
        selectedLine,
        setSelectedLine: update,
        tasks,
        setTasks,
        trains,
        assets,
        blockWindows,
        conflicts,
        setConflicts,
        dashboardSummary,
        isLiveDbConnected,
        refreshData,
        addTask,
        resolveConflict
      }}
    >
      {children}
    </LineContext.Provider>
  );
};

export const useLine = () => {
  const ctx = useContext(LineContext);
  if (!ctx) throw new Error('useLine must be used within LineProvider');
  return ctx;
};

/** True if a record's section belongs to the currently selected line. */
export const matchesLine = (line: LineId, section?: string) =>
  line === 'all' || getLineForSection(section)?.id === line;

/** All datasets, pre-filtered to the active line. */
export const useLineData = () => {
  const {
    selectedLine,
    tasks,
    trains,
    assets,
    blockWindows,
    conflicts,
    dashboardSummary,
    isLiveDbConnected,
    refreshData,
    addTask
  } = useLine();

  return useMemo(() => {
    const by = <T extends { section?: string }>(items: T[]) =>
      items.filter((i) => matchesLine(selectedLine, i.section));

    const SECTIONS =
      selectedLine === 'all'
        ? LINES.flatMap((l) => l.sections)
        : LINES.find((l) => l.id === selectedLine)!.sections;

    return {
      SECTIONS,
      MOCK_TASKS: by(tasks),
      MOCK_TRAINS: by(trains),
      MOCK_ASSETS: by(assets),
      MOCK_BLOCK_WINDOWS: by(blockWindows),
      MOCK_CONFLICTS: by(conflicts),
      dashboardSummary,
      isLiveDbConnected,
      refreshData,
      addTask
    };
  }, [selectedLine, tasks, trains, assets, blockWindows, conflicts, dashboardSummary, isLiveDbConnected, refreshData, addTask]);
};
