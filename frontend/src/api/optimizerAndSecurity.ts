import { apiClient } from './client';

export interface UIC406SectionCapacity {
  section: string;
  corridor: string;
  headway_minutes: number;
  trains_per_day: number;
  theoretical_capacity_trains: number;
  practical_capacity_trains: number;
  saturation_percent: number;
  usable_headroom_minutes: number;
  max_continuous_block_hours: number;
  status: 'OPTIMAL_CAPACITY' | 'MODERATE_SATURATION' | 'CRITICAL_SATURATION';
  badge_color: string;
  recommendation: string;
}

export interface ParetoOptimizationParams {
  preset: 'BALANCED_PARETO' | 'SAFETY_MAX' | 'PUNCTUALITY_FIRST' | 'FAST_HEURISTIC';
  safety_weight: number;
  punctuality_weight: number;
  crew_cost_weight: number;
  safety_buffer_minutes: number;
  solver_timeout_seconds: number;
}

export interface ParetoOptimizationResult {
  status: string;
  solver_status: string;
  scheduled: any[];
  unscheduled: any[];
  pareto_analysis?: {
    preset: string;
    weights?: {
      safety: number;
      punctuality: number;
      crew_efficiency: number;
    };
    pareto_efficiency_score: number;
    detention_penalty_reduction_pct?: number;
    joint_blocks_bundled?: number;
    estimated_passenger_hours_saved?: number;
    execution_speed?: string;
  };
}

export interface SecuritySealResult {
  task_id: string;
  corridor: string;
  supervisor: string;
  issued_at: string;
  cryptographic_seal: string;
  verification_hash: string;
  is_tamper_evident: boolean;
  status: string;
}

export interface VerifySealResult {
  is_valid: boolean;
  status: string;
  detail: string;
  verified_by: string;
}

// 1. Capacity & Optimization Endpoints
export const fetchCapacityAnalysis = async (section?: string): Promise<{ corridors: UIC406SectionCapacity[] }> => {
  const url = section ? `/api/optimizer/capacity-analysis?section=${encodeURIComponent(section)}` : '/api/optimizer/capacity-analysis';
  const res = await apiClient.get(url);
  return res.data;
};

export const runParetoOptimization = async (params: ParetoOptimizationParams): Promise<ParetoOptimizationResult> => {
  const res = await apiClient.post('/api/optimizer/pareto-solve', params);
  return res.data;
};

export const runFastReschedule = async (): Promise<any> => {
  const res = await apiClient.post('/api/optimizer/fast-reschedule');
  return res.data;
};

// 2. Cryptographic Security & Permit Seals
export const issueSessionToken = async (username: string, role: string) => {
  const res = await apiClient.post('/api/security/token', {
    username,
    role,
    division: 'Mumbai Suburban Division (CR/WR)'
  });
  if (res.data?.access_token) {
    localStorage.setItem('railblock_jwt_token', res.data.access_token);
  }
  return res.data;
};

export const sealWorkPermit = async (taskId: string, corridor: string, supervisor: string): Promise<SecuritySealResult> => {
  const res = await apiClient.post('/api/security/seal-permit', {
    task_id: taskId,
    corridor,
    supervisor
  });
  return res.data;
};

export const verifyWorkPermitSeal = async (
  seal: string,
  taskId: string,
  corridor: string,
  supervisor: string,
  issuedAt: string
): Promise<VerifySealResult> => {
  const res = await apiClient.post('/api/security/verify-seal', {
    cryptographic_seal: seal,
    task_id: taskId,
    corridor,
    supervisor,
    issued_at: issuedAt
  });
  return res.data;
};

export const fetchSecurityStatus = async () => {
  const res = await apiClient.get('/api/security/status');
  return res.data;
};

