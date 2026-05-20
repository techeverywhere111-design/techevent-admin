import api from "../utils/api";
import {
  EventCategorySchema,
  EventCategoryListResponseSchema,
  type EventCategory,
  TotalCountResponseSchema,
  type TotalCountResponse,
  FeatureBreakdownResponseSchema,
  type FeatureBreakdownResponse,
} from "@/lib/schemas";

export type EventCategoryResponse = EventCategory;

export interface EventCategoryPayload {
  name: string;
  description: string;
}

export const CreateEventCategory = async (
  payload: EventCategoryPayload
): Promise<EventCategoryResponse> => {
  const { data } = await api.post("/api/v1/event-categories", payload);
  return EventCategorySchema.parse(data);
};

export const GetEventCategories = async (pageNo: number, pageSize: number) => {
  const { data } = await api.get(`/api/v1/event-categories`, {
    params: { pageNo, pageSize },
  });
  return EventCategoryListResponseSchema.parse(data);
};

export const UpdateEventCategory = async (
  id: string,
  payload: { name: string; description: string }
) => {
  const { data } = await api.put(`/api/v1/event-categories/${id}`, payload);
  return EventCategorySchema.parse(data);
};

export const DeleteEventCategory = async (id: string) => {
  const { data } = await api.delete(`/api/v1/event-categories/${id}`);
  return data;
};

export const SearchEventCategory = async (
  text: string,
  pageNo: number,
  pageSize: number
) => {
  const { data } = await api.get(`/api/v1/event-categories/search`, {
    params: { text, pageNo, pageSize },
  });
  return EventCategoryListResponseSchema.parse(data);
};

export const GetTotalEvents = async (): Promise<TotalCountResponse> => {
  const { data } = await api.get("/api/v1/events/total-events");
  return TotalCountResponseSchema.parse(data);
};

export const GetTotalCreatedEvents = async (
  startTime: string,
  endTime: string
): Promise<TotalCountResponse> => {
  const { data } = await api.get("/api/v1/events/total-created-events", {
    params: { startTime, endTime },
  });
  return TotalCountResponseSchema.parse(data);
};

export const GetEventTypeBreakdown = async (
  startTime: string,
  endTime: string
): Promise<FeatureBreakdownResponse> => {
  const { data } = await api.get("/api/v1/events/physical-vs-hybrid-vs-virtual", {
    params: { startTime, endTime },
  });
  return FeatureBreakdownResponseSchema.parse(data);
};