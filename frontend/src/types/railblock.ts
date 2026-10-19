export type Department = 'ENGINEERING' | 'TRACTION_DISTRIBUTION' | 'SIGNAL_TELECOMMUNICATION';

export type TaskStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type ConflictType = 'OVERLAP' | 'TIMETABLE_CLASH' | 'DEADLINE_VIOLATION';
export type ConflictSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';

export type BlockWindowType = 'DAY' | 'NIGHT' | 'MEGA';
export type AssetHealth = 'Good' | 'Degraded' | 'Critical';
export type AssetType = 'Track' | 'OHE' | 'Signal' | 'Point Machine' | 'Cable';
export type PlanStatus = 'Draft' | 'Approved' | 'Archived';

export interface TaskBreakdown {
  criticality: number;
  urgency: number;
  overdue: number;
  operational_impact: number;
}

export interface ActivityLogItem {
  timestamp: string;
  actor: string;
  message: string;
}

export type SectorWorkStatus =
  | 'REQUISITIONED'
  | 'ASSIGNED'
  | 'PERMIT_ISSUED'
  | 'IN_PROGRESS'
  | 'FIT_CERTIFIED';

export interface SectorCrew {
  id: string;
  name: string;
  base: string;
  strength: number;
  department: Department;
  status: 'Available' | 'On-Track' | 'Standby';
}

export interface SectorMachinery {
  id: string;
  name: string;
  type: string;
  department: Department;
  status: 'Ready' | 'Deployed' | 'Maintenance';
}

export interface SectorSupervisor {
  id: string;
  name: string;
  role: string;
  department: Department;
  phone: string;
}

export interface MaintenanceTaskItem {
  id: string;
  rank: number;
  title: string;
  description: string;
  department: Department;
  asset_id: string;
  section: string;
  duration_minutes: number;
  criticality: number; // 1-5
  urgency: number; // 1-5
  overdue_days: number;
  priority_score: number;
  earliest_start: string;
  deadline: string;
  status: TaskStatus;
  required_block_type: string;
  breakdown: TaskBreakdown;
  linked_defects: string[];
  activity_log: ActivityLogItem[];
  assigned_slot?: string;
  assigned_reason?: string;
  // Sector Working System & Assignment Fields
  assigned_crew?: string;
  assigned_equipment?: string;
  supervisor?: string;
  sector_status?: SectorWorkStatus;
  co_requisite_sectors?: Department[];
  safety_protocol?: string;
  speed_restriction?: string;
  power_isolation?: string;
  signal_disconnection?: string;
}

export interface SuggestedResolution {
  id: string;
  title: string;
  impact: string;
  details: string;
  isRecommended?: boolean;
}

export interface ConflictItem {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  title: string;
  description: string;
  involved_tasks: string[];
  section: string;
  time: string;
  timeline_clash: {
    taskA: string;
    taskB?: string;
    train?: string;
    timeSpan: string;
  };
  cause_explanation: string;
  suggested_resolutions: SuggestedResolution[];
  status: 'ACTIVE' | 'RESOLVED';
  appliedResolutionId?: string;
}

export interface BlockWindowItem {
  id: string;
  section: string;
  start_time: string;
  end_time: string;
  date: string;
  type: BlockWindowType;
  capacity_minutes: number;
  utilized_minutes: number;
  allocated_tasks_count: number;
}

export interface TrainScheduleItem {
  train_number: string;
  name: string;
  type: 'Express' | 'Passenger' | 'Freight' | 'Local';
  section: string;
  scheduled_passing: string;
  priority_class: number;
}

export interface AssetItem {
  id: string;
  name: string;
  type: AssetType;
  department: Department;
  section: string;
  km_marker: string;
  health_status: AssetHealth;
  open_defects: number;
  last_maintained: string;
  next_due: string;
  availability_sparkline: number[];
}

export interface UnscheduledTaskInfo {
  task_id: string;
  title: string;
  department: Department;
  reason: string;
  suggested_fix: string;
}

export interface MaintenancePlanInfo {
  id: string;
  name: string;
  version_type: PlanStatus;
  week: string;
  created_at: string;
  scheduled_count: number;
  unscheduled_tasks: UnscheduledTaskInfo[];
}

export interface ComparisonMetric {
  metric: string;
  baseline: string | number;
  optimized: string | number;
  change: string;
  isPositive: boolean;
  deltaNumber?: number;
  unit?: string;
}
