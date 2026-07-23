const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const getPart = (parts: Intl.DateTimeFormatPart[], type: string) =>
  parts.find((part) => part.type === type)?.value ?? "";

/** Formats dates as "July 23 2026, 11:00AM" throughout the admin app. */
export const formatDateTime = (
  value: string | Date | null | undefined,
  fallback = "N/A"
) => {
  if (!value) return fallback;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  const dateParts = dateFormatter.formatToParts(date);
  const timeParts = timeFormatter.formatToParts(date);

  return `${getPart(dateParts, "month")} ${getPart(dateParts, "day")} ${getPart(dateParts, "year")}, ${getPart(timeParts, "hour")}:${getPart(timeParts, "minute")}${getPart(timeParts, "dayPeriod")}`;
};
