import axios from "axios";
import api from "@/lib/utils/api";
import { showErrorToast } from "@/lib/utils/toast";

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
): Promise<any> => {
  if (!file || !(file instanceof File)) {
    throw new Error("Invalid file object");
  }

  const formData = new FormData();
  formData.append("file", file, file.name);

  const type = file.type || "application/octet-stream";
  const size = file.size;

  const url = `/media?type=${encodeURIComponent(type)}&size=${size}&accountId=${encodeURIComponent(accountId)}`;

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
): Promise<any> => {
  if (!file || !(file instanceof File)) {
    throw new Error("Invalid file object");
  }

  const formData = new FormData();
  formData.append("file", file, file.name);

  const type = file.type || "application/octet-stream";
  const size = file.size;

  const url = `/media/large?type=${encodeURIComponent(type)}&size=${size}&accountId=${encodeURIComponent(accountId)}`;

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
  const url = `/media/download?fileName=${encodeURIComponent(fileName)}`;

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

export const GetMediaDetails = async (publicId: string): Promise<any> => {
  const cleanPid = publicId ? String(publicId).trim().replace(/ /g, "+") : "";
  const url = `/media/details?pid=${cleanPid}`;

  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const DeleteMedia = async (id: string): Promise<any> => {
  try {
    const response = await api.delete(`/media/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};
