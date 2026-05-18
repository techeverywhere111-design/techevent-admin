import api from "../utils/api";
import {
  MeetingDailyCreationResponseSchema,
  type MeetingDailyCreationResponse,
} from "@/lib/schemas";

export const GetClientDailyMeetingCreation = async (
  accountId: string,
  anyTimestamp: string
): Promise<MeetingDailyCreationResponse> => {
  const { data } = await api.get("/api/v1/meetings/client-daily-creation", {
    params: { accountId, anyTimestamp },
  });
  return MeetingDailyCreationResponseSchema.parse(data);
};

export const GetClientDailyEventCreation = async (
  accountId: string,
  anyTimestamp: string
): Promise<MeetingDailyCreationResponse> => {
  const { data } = await api.get("/api/v1/events/client-daily-creation", {
    params: { accountId, anyTimestamp },
  });
  return MeetingDailyCreationResponseSchema.parse(data);
};

