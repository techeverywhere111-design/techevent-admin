import { z } from "zod";
import api from "../utils/api";
import {
  EnquiryListResponseSchema,
  EnquirySchema,
  type Enquiry
} from "@/lib/schemas";

export type { Enquiry };
export type EnquiryResponse = z.infer<typeof EnquiryListResponseSchema>;

export const GetEnquiries = async (
  pageNo: number,
  pageSize: number
): Promise<EnquiryResponse> => {
  const { data } = await api.get("/api/v1/enquiries", {
    params: { pageNo, pageSize },
  });
  return EnquiryListResponseSchema.parse(data);
};

export const GetEnquiryById = async (id: string): Promise<Enquiry> => {
  const { data } = await api.get(`/api/v1/enquiries/${id}`);
  return EnquirySchema.parse(data);
};

export const SearchEnquiries = async (
  text: string,
  pageNo: number,
  pageSize: number
): Promise<EnquiryResponse> => {
  const { data } = await api.get("/api/v1/enquiries/search", {
    params: { text, pageNo, pageSize },
  });
  return EnquiryListResponseSchema.parse(data);
};

export const MarkAsTreated = async (id: string): Promise<void> => {
  await api.get(`/api/v1/enquiries/${id}/treated`);
};

export const MarkAsNotTreated = async (id: string): Promise<void> => {
  await api.get(`/api/v1/enquiries/${id}/not-treated`);
};
