import api from "../utils/api";

export interface EventCategoryPayload {
  name: string;
  description: string;
}

export interface EventCategoryResponse {
  id: string;
  name: string;
  description: string;
  createdOn: string;
}

export const CreateEventCategory = async (
  payload: EventCategoryPayload
): Promise<EventCategoryResponse> => {
  const { data } = await api.post<EventCategoryResponse>(
    "/api/v1/event-categories",
    payload
  );
  return data;
};

export const GetEventCategories = async (pageNo: number, pageSize: number) => {
  const { data } = await api.get(`/api/v1/event-categories`, {
    params: { pageNo, pageSize },
  });
  return data;
};

export const UpdateEventCategory = async (
  id: string,
  payload: { name: string; description: string }
) => {
  const { data } = await api.put(`/api/v1/event-categories/${id}`, payload);
  return data;
};
