import { z } from "zod";
import api from "../utils/api";
import {
  EnquiryListResponseSchema,
  EnquirySchema,
  TopEnquiryCategorySchema,
  type Enquiry
} from "@/lib/schemas";

export type { Enquiry };
export type EnquiryResponse = z.infer<typeof EnquiryListResponseSchema>;

export const GetEnquiries = async (
  pageNo: number,
  pageSize: number,
  category?: string
): Promise<EnquiryResponse> => {
  const params: Record<string, any> = { pageNo, pageSize };
  if (category) params.category = category;
  const { data } = await api.get("/api/v1/enquiries", {
    params,
  });
  return EnquiryListResponseSchema.parse(data);
};

export const GetPendingEnquiries = async (
  pageNo: number,
  pageSize: number,
  category?: string
): Promise<EnquiryResponse> => {
  const params: Record<string, any> = { pageNo, pageSize };
  if (category) params.category = category;
  const { data } = await api.get("/api/v1/enquiries/pending", {
    params,
  });
  return EnquiryListResponseSchema.parse(data);
};

export const GetEnquiryById = async (id: string): Promise<Enquiry> => {
  const { data } = await api.get(`/api/v1/enquiries/${id}`);
  return EnquirySchema.parse(data);
};

export const ENQUIRY_CATEGORIES = [
  "TECHNICAL",
  "INCIDENT",
  "BILLING",
  "CHANGE_REQUEST",
  "APPLICATION_ISSUE",
  "NETWORK",
  "SECURITY",
  "PERFORMANCE",
  "BUSINESS_IMPACT",
  "PRE_REGISTRATION",
  "OTHERS",
] as const;

export const SearchEnquiries = async (
  text: string,
  pageNo: number,
  pageSize: number,
  category?: string
): Promise<EnquiryResponse> => {
  const params: Record<string, any> = { pageNo, pageSize, text: text || "" };
  if (category) params.category = category;
  const { data } = await api.get("/api/v1/enquiries/search", {
    params,
  });
  return EnquiryListResponseSchema.parse(data);
};

export const SearchPendingEnquiries = async (
  text: string,
  pageNo: number,
  pageSize: number,
  category?: string
): Promise<EnquiryResponse> => {
  const params: Record<string, any> = { pageNo, pageSize, text: text || "" };
  if (category) params.category = category;
  const { data } = await api.get("/api/v1/enquiries/pending/search", {
    params,
  });
  return EnquiryListResponseSchema.parse(data);
};

export const MarkAsTreated = async (id: string): Promise<void> => {
  await api.get(`/api/v1/enquiries/${id}/treated`);
};

export const MarkAsNotTreated = async (id: string): Promise<void> => {
  await api.get(`/api/v1/enquiries/${id}/not-treated`);
};

export const GetTopEnquiryCategories = async (
  noOfCategories: number,
  startTime: string,
  endTime: string
) => {
  const { data } = await api.get(
    `/api/v1/enquiries/${noOfCategories}/top-requests`,
    { params: { startTime, endTime } }
  );
  return TopEnquiryCategorySchema.array().parse(data);
};
