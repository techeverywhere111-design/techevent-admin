import api from "../utils/api";
import { PlanSchema, PlanListResponseSchema, type Plan, type PlanListResponse } from "@/lib/schemas";

export type PlanResponse = Plan;
export type PlanFeatures = Plan["features"];

export interface PlanPayload {
  type: string;
  name: string;
  features: PlanFeatures;
  priceNaira: number;
  priceUsd: number;
}

export type DisplayLine = {
  text: string;
  isActive: boolean;
};

function humanizeKey(key: string): string {
  if (key.startsWith("numberOf")) {
    const rest = key.replace(/^numberOf/, "");
    const spaced = rest.replace(/([A-Z])/g, " $1").trim();
    return `Number of ${spaced}`;
  }

  if (key.startsWith("can")) {
    const rest = key.replace(/^can/, "");
    const spaced = rest.replace(/([A-Z])/g, " $1").trim();
    return `${spaced} Enabled`;
  }

  const spaced = key.replace(/([A-Z])/g, " $1").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// eslint-disable-next-line react-refresh/only-export-components
export function convertFeaturesToDisplayList(
  features: Record<string, any>
): DisplayLine[] {
  const result: DisplayLine[] = [];

  const categoryOrder = [
    "meetingFeature",
    "eventFeature",
    "calendarFeature",
    "proposalFeature",
    "accountFeature",
    "pollFeature",
  ];

  const defaultCategories = categoryOrder.concat(
    Object.keys(features || {}).filter((k) => !categoryOrder.includes(k))
  );

  for (const categoryKey of defaultCategories) {
    const category = (features && features[categoryKey]) ?? null;

    const activeLines: DisplayLine[] = [];

    if (category && typeof category === "object") {
      for (const [k, v] of Object.entries(category)) {
        let isActive = false;
        if (typeof v === "number") isActive = v > 0;
        else if (typeof v === "boolean") isActive = v === true;
        else isActive = !!v;

        if (isActive) {
          const label = humanizeKey(k);

          const text = typeof v === "number" ? `${v} ${label}` : label;
          activeLines.push({ text, isActive: true });
        }
      }
    }

    if (activeLines.length > 0) {
      result.push(...activeLines);
    } else {
      const catLabel = categoryKey
        ? categoryKey
          .replace(/Feature$/i, " Feature")
          .replace(/([A-Z])/g, " $1")
          .replace(/\s+/g, " ")
          .trim()
        : "Feature";

      const catLabelCased = catLabel
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      result.push({ text: catLabelCased, isActive: false });
    }
  }

  return result;
}

export const PlanCreate = async (
  payload: PlanPayload
): Promise<PlanResponse> => {
  const { data } = await api.post("/api/v1/plans", payload);
  return PlanSchema.parse(data);
};

export const PlanGet = async (id: string): Promise<PlanResponse> => {
  const { data } = await api.get(`/api/v1/plans/${id}`);
  return PlanSchema.parse(data);
};

export const PlanUpdate = async (
  id: string,
  payload: PlanPayload
): Promise<PlanResponse> => {
  const { data } = await api.put(`/api/v1/plans/${id}`, payload);
  return PlanSchema.parse(data);
};

export const PlanGetList = async (
  pageNo: number,
  pageSize: number
): Promise<PlanListResponse> => {
  const { data } = await api.get("/api/v1/plans", {
    params: { pageNo, pageSize },
  });
  return PlanListResponseSchema.parse(data);
};

export const PlanSearch = async (
  text: string,
  pageNo: number,
  pageSize: number
): Promise<PlanListResponse> => {
  const { data } = await api.get("/api/v1/plans/search", {
    params: { text, pageNo, pageSize },
    headers: { "x-show-error-toast": "true" },
  });
  return PlanListResponseSchema.parse(data);
};

export const PlanActivate = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.get(`/api/v1/plans/${id}/activate`, {
    headers: { "x-show-error-toast": "true" },
  });
  return data;
};

export const PlanDeactivate = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.get(`/api/v1/plans/${id}/deactivate`, {
    headers: { "x-show-error-toast": "true" },
  });
  return data;
};
