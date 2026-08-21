const getOrdinalSuffix = (day: number): string => {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
};

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long" });

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const getPart = (parts: Intl.DateTimeFormatPart[], type: string) =>
  parts.find((part) => part.type === type)?.value ?? "";

/** Formats dates as "19th of August, 2026 11:59 pm" throughout the admin app. */
export const formatDateTime = (
  value: string | Date | null | undefined,
  fallback = "N/A"
) => {
  if (!value) return fallback;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  const day = date.getDate();
  const month = monthFormatter.format(date);
  const year = date.getFullYear();
  const timeParts = timeFormatter.formatToParts(date);
  const time = `${getPart(timeParts, "hour")}:${getPart(timeParts, "minute")} ${getPart(timeParts, "dayPeriod").toLowerCase()}`;

  return `${day}${getOrdinalSuffix(day)} of ${month}, ${year} ${time}`;
};
