export interface DatabaseStatus {
  status: 'connected' | 'disconnected';
  engine: string;
  details?: string | null;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  app_name: string;
  version: string;
  environment: string;
  timestamp: string;
  database: DatabaseStatus;
  services: {
    prioritization_engine: string;
    conflict_detection: string;
    or_tools_solver: string;
    [key: string]: string;
  };
}

export type DepartmentType = 'ENGINEERING' | 'TRD' | 'SIGNAL_TELECOM';
