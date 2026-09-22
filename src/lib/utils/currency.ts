export const getCurrencyCode = (currency?: string | null): string => {
  const normalized = (currency ?? "NGN").toUpperCase();
  if (normalized === "USD") return "USD";
  return "NGN";
};

export const formatCurrency = (
  amount: number | string | null | undefined,
  currency?: string | null
): string => {
  const numericAmount =
    typeof amount === "string"
      ? Number(amount.replace(/,/g, ""))
      : Number(amount);

  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;
  const currencyCode = getCurrencyCode(currency);

  return new Intl.NumberFormat(currencyCode === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "symbol",
    minimumFractionDigits: Number.isInteger(safeAmount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
};
