import { z } from "zod";
import api from "@/lib/utils/api";
import { 
  PromoCodeSchema, 
  PromoCodeListResponseSchema, 
  PromoRegistrationLogSchema, 
  PromoRegistrationLogListResponseSchema,
  type PromoCode,
  type PromoRegistrationLog
} from "@/lib/schemas";

export type { PromoCode, PromoRegistrationLog };
export type PromoCodeResponse = z.infer<typeof PromoCodeListResponseSchema>;
export type PromoCodeRegistrationLogsResponse = z.infer<typeof PromoRegistrationLogListResponseSchema>;

export interface CreatePromoCodePayload {
  code: string;
  owner: string;
  discountPercentage: number;
  startTime: string;
  endTime: string;
}

export interface RenewPromoCodePayload {
  discountPercentage: number;
  startTime: string;
  endTime: string;
}

export const GetPromoCodes = async (
  pageNo: number,
  pageSize: number
): Promise<PromoCodeResponse> => {
  const { data } = await api.get("/api/v1/promo-codes", {
    params: { pageNo, pageSize },
  });
  return PromoCodeListResponseSchema.parse(data);
};

export const SearchPromoCodes = async (
  text: string,
  pageNo: number,
  pageSize: number
): Promise<PromoCodeResponse> => {
  const { data } = await api.get(
    "/api/v1/promo-codes/search",
    { params: { text, pageNo, pageSize } }
  );
  return PromoCodeListResponseSchema.parse(data);
};

export const CreatePromoCode = async (
  payload: CreatePromoCodePayload
): Promise<PromoCode> => {
  const { data } = await api.post("/api/v1/promo-codes", payload);
  return PromoCodeSchema.parse(data);
};

export const RenewPromoCode = async (
  promoCodeId: string,
  payload: RenewPromoCodePayload
): Promise<PromoCode> => {
  const { data } = await api.put(
    `/api/v1/promo-codes/${promoCodeId}`,
    payload
  );
  return PromoCodeSchema.parse(data);
};

export const GetPromoCodeRegistrationLogs = async (
  code: string,
  pageNo: number,
  pageSize: number
): Promise<PromoCodeRegistrationLogsResponse> => {
  const { data } = await api.get(
    "/api/v1/promo-codes/logs",
    { params: { code, pageNo, pageSize } }
  );
  return PromoRegistrationLogListResponseSchema.parse(data);
};

export const MarkAsSettled = async (
  registrationLogId: string
): Promise<{ message: string }> => {
  const { data } = await api.get<{ message: string }>(
    `/api/v1/promo-codes/${registrationLogId}/mark-as-settled`
  );
  return data;
};

export const MarkAsNotSettled = async (
  registrationLogId: string
): Promise<{ message: string }> => {
  const { data } = await api.get<{ message: string }>(
    `/api/v1/promo-codes/${registrationLogId}/mark-as-not-settled`
  );
  return data;
};

export const SearchPromoCodeRegistrationLogs = async (
  text: string,
  code: string,
  pageNo: number,
  pageSize: number
): Promise<PromoCodeRegistrationLogsResponse> => {
  const { data } = await api.get(
    "/api/v1/promo-codes/logs/search",
    { params: { text, code, pageNo, pageSize } }
  );
  return PromoRegistrationLogListResponseSchema.parse(data);
};
