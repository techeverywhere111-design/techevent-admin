import api from "@/lib/utils/api";

export interface PromoCode {
  id: string;
  code: string;
  owner: string;
  discountPercentage: number;
  startTime: string;
  endTime: string;
  createdOn: string;
  createdBy: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isPendingUser: boolean;
    roleType: string;
    lastLogin: string;
    createdOn: string;
  };
}

export interface PromoCodeResponse {
  totalPages: number;
  size: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  content: PromoCode[];
}

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

export interface PromoCodeRegistrationLog {
  id: string;
  promoCode: string;
  userEmail: string;
  userPaidAmount: number;
  planAmount: number;
  hasSettled: boolean;
  settledDate: string;
  createdOn: string;
  lastModifiedByUser: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isPendingUser: boolean;
    roleType: string;
    lastLogin: string;
    createdOn: string;
  };
}

export interface PromoCodeRegistrationLogsResponse {
  totalPages: number;
  size: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  content: PromoCodeRegistrationLog[];
}

export const GetPromoCodes = async (
  pageNo: number,
  pageSize: number
): Promise<PromoCodeResponse> => {
  const { data } = await api.get<PromoCodeResponse>("/api/v1/promo-codes", {
    params: { pageNo, pageSize },
  });
  return data;
};

export const SearchPromoCodes = async (
  text: string,
  pageNo: number,
  pageSize: number
): Promise<PromoCodeResponse> => {
  const { data } = await api.get<PromoCodeResponse>(
    "/api/v1/promo-codes/search",
    { params: { text, pageNo, pageSize } }
  );
  return data;
};

export const CreatePromoCode = async (
  payload: CreatePromoCodePayload
): Promise<PromoCode> => {
  const { data } = await api.post<PromoCode>("/api/v1/promo-codes", payload);

  return data;
};

export const RenewPromoCode = async (
  promoCodeId: string,
  payload: RenewPromoCodePayload
): Promise<PromoCode> => {
  const { data } = await api.put<PromoCode>(
    `/api/v1/promo-codes/${promoCodeId}`,
    payload
  );
  return data;
};

export const GetPromoCodeRegistrationLogs = async (
  code: string,
  pageNo: number,
  pageSize: number
): Promise<PromoCodeRegistrationLogsResponse> => {
  const { data } = await api.get<PromoCodeRegistrationLogsResponse>(
    "/api/v1/promo-codes/logs",
    { params: { code, pageNo, pageSize } }
  );
  return data;
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
