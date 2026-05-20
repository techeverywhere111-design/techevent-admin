import api from "../utils/api";
import {
  FeatureBreakdownResponseSchema,
  type FeatureBreakdownResponse,
} from "@/lib/schemas";

export const GetPlanTypeBreakdown = async (
  startTime: string,
  endTime: string
): Promise<FeatureBreakdownResponse> => {
  const { data } = await api.get("/api/v1/plan-payment-histories/breakdown/plan-type", {
    params: { startTime, endTime },
  });
  return FeatureBreakdownResponseSchema.parse(data);
};

export const GetPlanSubscriptionYearOnYear = async (
  anyTime: string,
  compareTime: string
): Promise<FeatureBreakdownResponse[]> => {
  const { data } = await api.get("/api/v1/plan-payment-histories/breakdown/year-on-year", {
    params: { anyTime, compareTime },
  });
  return FeatureBreakdownResponseSchema.array().parse(data);
};

