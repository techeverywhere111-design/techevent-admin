import axios from "axios";
import api from "@/lib/utils/api";
import { showErrorToast } from "@/lib/utils/toast";

export interface MediaResponse {
  id: string;
  accountId: string;
  name: string;
  displayName: string;
  type: string;
  publicId: string;
  size: number;
  displayUrl: string;
  createdOn: string;
}

export const handleError = (err: any) => {
  console.error("Media error:", err);
  const message =
    err?.response?.data?.message ||
    err?.response?.data?.status ||
    err?.message ||
    "Media operation failed.";
  showErrorToast(message);
};

export const extractMediaUrl = (data: any): string => {
  if (typeof data === "string") return data;
  if (!data) return "";
  if (typeof data.displayUrl === "string") return data.displayUrl;
  if (typeof data.data?.displayUrl === "string") return data.data.displayUrl;
  if (typeof data.url === "string") return data.url;
  if (typeof data.secure_url === "string") return data.secure_url;
  if (typeof data.data?.url === "string") return data.data.url;
  if (typeof data.data?.secure_url === "string") return data.data.secure_url;
  if (typeof data.data === "string") return data.data;
  if (typeof data.fileUrl === "string") return data.fileUrl;
  if (typeof data.mediaUrl === "string") return data.mediaUrl;
  if (typeof data.result === "string") return data.result;
  if (typeof data.result?.url === "string") return data.result.url;
  return "";
};

export const UploadMedia = async (
  file: File,
  accountId: string,
  onProgress?: (percent: number) => void
): Promise<MediaResponse> => {
  if (!file || !(file instanceof File)) {
    throw new Error("Invalid file object");
  }

  const formData = new FormData();
  formData.append("file", file, file.name);

  const type = file.type || "application/octet-stream";
  const size = file.size;

  const url = `/api/v1/media?type=${encodeURIComponent(type)}&size=${size}&accountId=${encodeURIComponent(accountId)}`;

  try {
    const response = await api.post(url, formData, {
      timeout: 120000,
      headers: {
        "Content-Type": "multipart/form-data",
        "x-show-error-toast": "true",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const UploadLargeMedia = async (
  file: File,
  accountId: string,
  onProgress?: (percent: number) => void
): Promise<MediaResponse> => {
  if (!file || !(file instanceof File)) {
    throw new Error("Invalid file object");
  }

  const formData = new FormData();
  formData.append("file", file, file.name);

  const type = file.type || "application/octet-stream";
  const size = file.size;

  const url = `/api/v1/media/large?type=${encodeURIComponent(type)}&size=${size}&accountId=${encodeURIComponent(accountId)}`;

  try {
    const response = await api.post(url, formData, {
      timeout: 300000,
      headers: {
        "Content-Type": "multipart/form-data",
        "x-show-error-toast": "true",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const DownloadMedia = async (
  fileName: string,
  onProgress?: (progressEvent: any) => void,
  signal?: AbortSignal
): Promise<Blob> => {
  const url = `/api/v1/media/download?fileName=${encodeURIComponent(fileName)}`;

  try {
    const response = await api.get(url, {
      responseType: "blob",
      signal: signal,
      onDownloadProgress: (progressEvent) => {
        if (onProgress) {
          onProgress(progressEvent);
        }
      },
    });
    return response.data;
  } catch (error: any) {
    if (
      error.name === "CanceledError" ||
      error.name === "AbortError" ||
      axios.isCancel(error)
    ) {
      throw error;
    }
    handleError(error);
    throw error;
  }
};

export const DownloadMediaUsingDisplayUrl = async (
  displayUrl: string,
  signal?: AbortSignal
): Promise<string> => {
  const url = `/api/v1/media/download/display-url?displayUrl=${encodeURIComponent(displayUrl)}`;

  try {
    const response = await api.get(url, { signal });
    return response.data;
  } catch (error: any) {
    if (
      error.name === "CanceledError" ||
      error.name === "AbortError" ||
      axios.isCancel(error)
    ) {
      throw error;
    }
    handleError(error);
    throw error;
  }
};

export const GetMediaDetails = async (publicId: string): Promise<MediaResponse> => {
  const cleanPid = publicId ? String(publicId).trim().replace(/ /g, "+") : "";
  const url = `/api/v1/media/details?pid=${cleanPid}`;

  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const DeleteMedia = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/api/v1/media/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};
