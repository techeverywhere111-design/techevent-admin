import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import type { EventPaymentRequest } from "@/lib/schemas";
import { formatDateTime } from "@/lib/utils/date";

export const exportPayedEventsToExcel = (
  requests: EventPaymentRequest[],
  isSettled: boolean
) => {
  if (requests.length === 0) {
    toast.info("No records to export.");
    return;
  }

  const exportData = requests.map((item) => ({
    "Request ID": item.id,
    "Event Name": item.eventName || "N/A",
    "Beneficiary Name": item.accountName || "N/A",
    "Account Number": item.accountNumber || "N/A",
    Bank: item.bank || "N/A",
    Amount: item.amount,
    Currency: item.currency || "NGN",
    Status: item.isSettled ? "Settled" : "Not Settled",
    "Settled By": item.settledByName || item.settledBy || "N/A",
    "Settled Date": item.isSettled ? formatDateTime(item.updatedOn) : "N/A",
    "Receipt / Note": item.receipt || "N/A",
    "Date | Time": formatDateTime(item.createdOn),
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    isSettled ? "Settled Payouts" : "Not Settled Payouts"
  );
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  saveAs(
    blob,
    `Payed_Events_${isSettled ? "Settled" : "Not_Settled"}_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
};
