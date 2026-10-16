import { apiClient } from './client';
import { HealthResponse } from '../types';

export const getHealthStatus = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};

export const getApiV1HealthStatus = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/api/v1/health');
  return response.data;
};
