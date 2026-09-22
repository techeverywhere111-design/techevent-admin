import api from "@/lib/utils/api";
import {
  EventPaymentRequestListResponseSchema,
  type EventPaymentRequestListResponse,
} from "@/lib/schemas";

export const GetEventPaymentRequests = async (
  isSettled: boolean,
  pageNo: number,
  pageSize: number
): Promise<EventPaymentRequestListResponse> => {
  const { data } = await api.get("/api/v1/event-payment-requests", {
    params: { isSettled, pageNo, pageSize },
  });
  return EventPaymentRequestListResponseSchema.parse(data);
};

export const GetEventPaymentRequestsByEventId = async (
  eventId: string,
  pageNo: number,
  pageSize: number
): Promise<EventPaymentRequestListResponse> => {
  const { data } = await api.get(`/api/v1/event-payment-requests/${eventId}`, {
    params: { pageNo, pageSize },
  });
  return EventPaymentRequestListResponseSchema.parse(data);
};

export const MarkEventPaymentRequestAsSettled = async (
  id: string,
  text: string
): Promise<{ message: string }> => {
  const { data } = await api.put<{ message: string }>(
    `/api/v1/event-payment-requests/${id}/mark-as-settled`,
    { text },
    { headers: { "x-show-error-toast": "true" } }
  );
  return data;
};
