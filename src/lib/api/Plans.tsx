import api from "../utils/api";

export interface PlanPayload {
  type: string;
  name: string;
  features: string[];
  priceNaira: number;
  priceUsd: number;
}

export interface PlanResponse {
  id: string;
  type: string;
  name: string;
  features: string[];
  priceNaira: number;
  priceUsd: number;
}

export const PlanCreate = async (
  payload: PlanPayload
): Promise<PlanResponse> => {
  const { data } = await api.post<PlanResponse>("/api/v1/plans", payload);
  return data;
};

export const PlanGet = async (id: string): Promise<PlanResponse> => {
  const { data } = await api.get<PlanResponse>(`/api/v1/plans/${id}`);
  return data;
};

export const PlanUpdate = async (
  id: string,
  payload: PlanPayload
): Promise<PlanResponse> => {
  const body = { id, ...payload };

  const { data } = await api.put<PlanResponse>("/api/v1/plans", body);
  return data;
};
