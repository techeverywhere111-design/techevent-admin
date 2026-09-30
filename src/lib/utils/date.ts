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


/** Formats dates as "19th of August, 2026 11:59 pm" throughout the admin app. */
export const formatDateTime = (
  value: string | number | Date | null | undefined,
  fallback = "N/A"
) => {
  if (value === null || value === undefined || value === "") return fallback;

  let parsed: string | number | Date = value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
      parsed = Number(trimmed);
    } else if (trimmed.includes(" ") && !trimmed.includes("T")) {
      parsed = trimmed.replace(" ", "T");
    }
  }

  const date = parsed instanceof Date ? parsed : new Date(parsed);
  if (Number.isNaN(date.getTime())) return fallback;

  const day = date.getDate();
  const month = monthFormatter.format(date);
  const year = date.getFullYear();
  const time = date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();

  return `${day}${getOrdinalSuffix(day)} of ${month}, ${year} ${time}`;
};
