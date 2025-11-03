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
