import api from "../utils/api";
import { 
  EventCategorySchema, 
  EventCategoryListResponseSchema, 
  type EventCategory 
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
