// export const API_BASE_URL = "https://plutobackend.plutospace.xyz";
export const API_BASE_URL = "https://api.plutospaceevents.com";


export const PLUTO_EVENT_ADMIN_TOKEN = "PLUTO_EVENT_ADMIN_TOKEN";
export const PLUTO_EVENT_ADMIN_USER = "PLUTO_EVENT_ADMIN_USER";

export const COOKIE_CONFIG = {
  expires: 7,
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
  sameSite: "Strict" as const,
  path: "/",
};
