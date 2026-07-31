import api from "../utils/api";
import {
  FeatureBreakdownResponseSchema,
  PlanPaymentHistoryListResponseSchema,
  type FeatureBreakdownResponse,
  type PlanPaymentHistoryListResponse,
} from "@/lib/schemas";

export const GetPlanPaymentHistories = async (
  pageNo: number,
  pageSize: number
): Promise<PlanPaymentHistoryListResponse> => {
  const { data } = await api.get("/api/v1/plan-payment-histories", {
    params: { pageNo, pageSize },
  });
  return PlanPaymentHistoryListResponseSchema.parse(data);
};

export const SearchPlanPaymentHistories = async (
  text: string,
  pageNo: number,
  pageSize: number
): Promise<PlanPaymentHistoryListResponse> => {
  const { data } = await api.get("/api/v1/plan-payment-histories/search", {
    params: { text, pageNo, pageSize },
    headers: { "x-show-error-toast": "true" },
  });
  return PlanPaymentHistoryListResponseSchema.parse(data);
};

export const GetPlanTypeBreakdown = async (
  startTime: string,
  endTime: string
): Promise<FeatureBreakdownResponse> => {
  const { data } = await api.get("/api/v1/plan-payment-histories/breakdown/plan-type", {
    params: { startTime, endTime },
    headers: { "x-skip-error-toast": "true" },
  });
  return FeatureBreakdownResponseSchema.parse(data);
};

export const GetPlanSubscriptionYearOnYear = async (
  anyTime: string,
  compareTime: string
): Promise<FeatureBreakdownResponse[]> => {
  const { data } = await api.get("/api/v1/plan-payment-histories/breakdown/year-on-year", {
    params: { anyTime, compareTime },
    headers: { "x-skip-error-toast": "true" },
  });
  return FeatureBreakdownResponseSchema.array().parse(data);
};

